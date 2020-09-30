import CustomError from './errorHandler';
import p5sound from './master';
import { midiToFreq, convertToWav, safeBufferSize } from './helpers';
import processorNames from './audioWorklet/processorNames';
import Panner from './panner';

const ac = p5sound.audiocontext;

var _createCounterBuffer = function (buffer) {
  const len = buffer.length;
  const audioBuf = ac.createBuffer(1, buffer.length, ac.sampleRate);
  const arrayBuffer = audioBuf.getChannelData(0);
  for (var index = 0; index < len; index++) {
    arrayBuffer[index] = index;
  }
  return audioBuf;
};

// process peaks
class Peak {
  constructor(amp, i) {
    this.sampleIndex = i;
    this.amplitude = amp;
    this.tempos = [];
    this.intervals = [];
  }
}

// 1. for processPeaks() Function to identify peaks above a threshold
// returns an array of peak indexes as frames (samples) of the original soundfile
function getPeaksAtThreshold(data, threshold) {
  var peaksObj = {};
  var length = data.length;

  for (var i = 0; i < length; i++) {
    if (data[i] > threshold) {
      var amp = data[i];
      var peak = new Peak(amp, i);
      peaksObj[i] = peak;
      // Skip forward ~ 1/8s to get past this peak.
      i += 6000;
    }
    i++;
  }
  return peaksObj;
}

// 2. for processPeaks()
function countIntervalsBetweenNearbyPeaks(peaksObj) {
  var intervalCounts = [];
  var peaksArray = Object.keys(peaksObj).sort();

  for (var index = 0; index < peaksArray.length; index++) {
    // find intervals in comparison to nearby peaks
    for (var i = 0; i < 10; i++) {
      var startPeak = peaksObj[peaksArray[index]];
      var endPeak = peaksObj[peaksArray[index + i]];

      if (startPeak && endPeak) {
        var startPos = startPeak.sampleIndex;
        var endPos = endPeak.sampleIndex;
        var interval = endPos - startPos;

        // add a sample interval to the startPeak in the allPeaks array
        if (interval > 0) {
          startPeak.intervals.push(interval);
        }

        // tally the intervals and return interval counts
        var foundInterval = intervalCounts.some(function (intervalCount) {
          if (intervalCount.interval === interval) {
            intervalCount.count++;
            return intervalCount;
          }
        });

        // store with JSON like formatting
        if (!foundInterval) {
          intervalCounts.push({
            interval: interval,
            count: 1,
          });
        }
      }
    }
  }

  return intervalCounts;
}

// 3. for processPeaks --> find tempo
function groupNeighborsByTempo(intervalCounts, sampleRate) {
  var tempoCounts = [];

  intervalCounts.forEach(function (intervalCount) {
    try {
      // Convert an interval to tempo
      var theoreticalTempo = Math.abs(
        60 / (intervalCount.interval / sampleRate)
      );

      theoreticalTempo = mapTempo(theoreticalTempo);

      var foundTempo = tempoCounts.some(function (tempoCount) {
        if (tempoCount.tempo === theoreticalTempo)
          return (tempoCount.count += intervalCount.count);
      });
      if (!foundTempo) {
        if (isNaN(theoreticalTempo)) {
          return;
        }
        tempoCounts.push({
          tempo: Math.round(theoreticalTempo),
          count: intervalCount.count,
        });
      }
    } catch (e) {
      throw e;
    }
  });

  return tempoCounts;
}

// 4. for processPeaks - get peaks at top tempo
function getPeaksAtTopTempo(peaksObj, tempo, sampleRate, bpmVariance) {
  var peaksAtTopTempo = [];
  var peaksArray = Object.keys(peaksObj).sort();

  // TO DO: filter out peaks that have the tempo and return
  for (var i = 0; i < peaksArray.length; i++) {
    var key = peaksArray[i];
    var peak = peaksObj[key];

    for (var j = 0; j < peak.intervals.length; j++) {
      var intervalBPM = Math.round(
        Math.abs(60 / (peak.intervals[j] / sampleRate))
      );

      intervalBPM = mapTempo(intervalBPM);

      if (Math.abs(intervalBPM - tempo) < bpmVariance) {
        // convert sampleIndex to seconds
        peaksAtTopTempo.push(peak.sampleIndex / sampleRate);
      }
    }
  }

  // filter out peaks that are very close to each other
  peaksAtTopTempo = peaksAtTopTempo.filter(function (peakTime, index, arr) {
    var dif = arr[index + 1] - peakTime;
    if (dif > 0.01) {
      return true;
    }
  });

  return peaksAtTopTempo;
}

// helper function for processPeaks
function mapTempo(theoreticalTempo) {
  // these scenarios create infinite while loop
  if (!isFinite(theoreticalTempo) || theoreticalTempo === 0) {
    return;
  }

  // Adjust the tempo to fit within the 90-180 BPM range
  while (theoreticalTempo < 90) theoreticalTempo *= 2;
  while (theoreticalTempo > 180 && theoreticalTempo > 90) theoreticalTempo /= 2;

  return theoreticalTempo;
}

/*** SCHEDULE EVENTS ***/

// Cue inspired by JavaScript setTimeout, and the
// Tone.js Transport Timeline Event, MIT License Yotam Mann 2015 tonejs.org
class Cue {
  constructor(callback, time, id, val) {
    this.callback = callback;
    this.time = time;
    this.id = id;
    this.val = val;
  }
}

// event handler to remove references to the bufferSourceNode when it is done playing
function _clearOnEnd(e) {
  const thisBufferSourceNode = e.target;
  const soundFile = this;

  // delete this.bufferSourceNode from the sources array when it is done playing:
  thisBufferSourceNode._playing = false;
  thisBufferSourceNode.removeEventListener('ended', soundFile._clearOnEnd);

  // call the onended callback
  soundFile._onended(soundFile);

  // delete bufferSourceNode(s) in soundFile.bufferSourceNodes
  // iterate in reverse order because the index changes by splice
  soundFile.bufferSourceNodes
    .map((_, i) => i)
    .reverse()
    .forEach(function (i) {
      const n = soundFile.bufferSourceNodes[i];

      if (n._playing === false) {
        soundFile.bufferSourceNodes.splice(i, 1);
      }
    });

  if (soundFile.bufferSourceNodes.length === 0) {
    soundFile._playing = false;
  }
}

/**
 *  <p>SoundFile object with a path to a file.</p>
 *
 *  <p>The p5.SoundFile may not be available immediately because
 *  it loads the file information asynchronously.</p>
 *
 *  <p>To do something with the sound as soon as it loads
 *  pass the name of a function as the second parameter.</p>
 *
 *  <p>Only one file path is required. However, audio file formats
 *  (i.e. mp3, ogg, wav and m4a/aac) are not supported by all
 *  web browsers. If you want to ensure compatability, instead of a single
 *  file path, you may include an Array of filepaths, and the browser will
 *  choose a format that works.</p>
 *
 *  @class p5.SoundFile
 *  @constructor
 *  @param {String|Array} path   path to a sound file (String). Optionally,
 *                               you may include multiple file formats in
 *                               an array. Alternately, accepts an object
 *                               from the HTML5 File API, or a p5.File.
 *  @param {Function} [successCallback]   Name of a function to call once file loads
 *  @param {Function} [errorCallback]   Name of a function to call if file fails to
 *                                      load. This function will receive an error or
 *                                     XMLHttpRequest object with information
 *                                     about what went wrong.
 *  @param {Function} [whileLoadingCallback]   Name of a function to call while file
 *                                             is loading. That function will
 *                                             receive progress of the request to
 *                                             load the sound file
 *                                             (between 0 and 1) as its first
 *                                             parameter. This progress
 *                                             does not account for the additional
 *                                             time needed to decode the audio data.
 *
 *  @example
 *  <div><code>
 *  let mySound;
 *  function preload() {
 *    soundFormats('mp3', 'ogg');
 *    mySound = loadSound('assets/doorbell');
 *  }
 *
 *  function setup() {
 *    let cnv = createCanvas(100, 100);
 *    cnv.mousePressed(canvasPressed);
 *    background(220);
 *    text('tap here to play', 10, 20);
 *  }
 *
 *  function canvasPressed() {
 *    // playing a sound file on a user gesture
 *    // is equivalent to `userStartAudio()`
 *    mySound.play();
 *  }
 * </code></div>
 */
class SoundFile {
  constructor(paths, onload, onerror, whileLoading) {
    if (typeof paths !== 'undefined') {
      if (typeof paths === 'string' || typeof paths[0] === 'string') {
        var path = p5.prototype._checkFileFormats(paths);
        this.url = path;
      } else if (typeof paths === 'object') {
        if (
          !(window.File && window.FileReader && window.FileList && window.Blob)
        ) {
          // The File API isn't supported in this browser
          throw 'Unable to load file because the File API is not supported';
        }
      }

      // if type is a p5.File...get the actual file
      if (paths.file) {
        paths = paths.file;
      }

      this.file = paths;
    }

    // private _onended callback, set by the method: onended(callback)
    this._onended = function () {};

    this._looping = false;
    this._playing = false;
    this._paused = false;
    this._pauseTime = 0;

    // cues for scheduling events with addCue() removeCue()
    this._cues = [];
    this._cueIDCounter = 0;

    //  position of the most recently played sample
    this._lastPos = 0;
    this._counterNode = null;
    this._workletNode = null;

    // array of sources so that they can all be stopped!
    this.bufferSourceNodes = [];

    // current source
    this.bufferSourceNode = null;

    this.buffer = null;
    this.playbackRate = 1;

    this.input = p5sound.audiocontext.createGain();
    this.output = p5sound.audiocontext.createGain();

    this.reversed = false;

    // start and end of playback / loop
    this.startTime = 0;
    this.endTime = null;
    this.pauseTime = 0;

    // "restart" would stop playback before retriggering
    this.mode = 'sustain';

    // time that playback was started, in millis
    this.startMillis = null;

    // stereo panning
    this.panPosition = 0.0;
    this.panner = new Panner(this.output, p5sound.input, 2);

    // it is possible to instantiate a soundfile with no path
    if (this.url || this.file) {
      this.load(onload, onerror);
    }

    // add this p5.SoundFile to the soundArray
    p5sound.soundArray.push(this);

    if (typeof whileLoading === 'function') {
      this._whileLoading = whileLoading;
    } else {
      this._whileLoading = function () {};
    }

    this._clearOnEnd = _clearOnEnd.bind(this);

    // same as setVolume, to match Processing Sound
    this.amp = this.setVolume;

    // these are the same thing
    this.fade = this.setVolume;
  }

  /**
   * This is a helper function that the p5.SoundFile calls to load
   * itself. Accepts a callback (the name of another function)
   * as an optional parameter.
   *
   * @private
   * @for p5.SoundFile
   * @param {Function} [successCallback]   Name of a function to call once file loads
   * @param {Function} [errorCallback]   Name of a function to call if there is an error
   */
  load(callback, errorCallback) {
    var self = this;
    var errorTrace = new Error().stack;

    if (this.url !== undefined && this.url !== '') {
      var request = new XMLHttpRequest();
      request.addEventListener(
        'progress',
        function (evt) {
          self._updateProgress(evt);
        },
        false
      );
      request.open('GET', this.url, true);
      request.responseType = 'arraybuffer';

      request.onload = function () {
        if (request.status === 200) {
          // on sucess loading file:
          if (!self.panner) return;
          ac.decodeAudioData(
            request.response,
            // success decoding buffer:
            function (buff) {
              if (!self.panner) return;
              self.buffer = buff;
              self.panner.inputChannels(buff.numberOfChannels);
              if (callback) {
                callback(self);
              }
            },
            // error decoding buffer. "e" is undefined in Chrome 11/22/2015
            function () {
              if (!self.panner) return;
              var err = new CustomError(
                'decodeAudioData',
                errorTrace,
                self.url
              );
              var msg = 'AudioContext error at decodeAudioData for ' + self.url;
              if (errorCallback) {
                err.msg = msg;
                errorCallback(err);
              } else {
                console.error(
                  msg + '\n The error stack trace includes: \n' + err.stack
                );
              }
            }
          );
        }
        // if request status != 200, it failed
        else {
          if (!self.panner) return;
          var err = new CustomError('loadSound', errorTrace, self.url);
          var msg =
            'Unable to load ' +
            self.url +
            '. The request status was: ' +
            request.status +
            ' (' +
            request.statusText +
            ')';

          if (errorCallback) {
            err.message = msg;
            errorCallback(err);
          } else {
            console.error(
              msg + '\n The error stack trace includes: \n' + err.stack
            );
          }
        }
      };

      // if there is another error, aside from 404...
      request.onerror = function () {
        var err = new CustomError('loadSound', errorTrace, self.url);
        var msg =
          'There was no response from the server at ' +
          self.url +
          '. Check the url and internet connectivity.';

        if (errorCallback) {
          err.message = msg;
          errorCallback(err);
        } else {
          console.error(
            msg + '\n The error stack trace includes: \n' + err.stack
          );
        }
      };

      request.send();
    } else if (this.file !== undefined) {
      var reader = new FileReader();
      reader.onload = function () {
        if (!self.panner) return;
        ac.decodeAudioData(reader.result, function (buff) {
          if (!self.panner) return;
          self.buffer = buff;
          self.panner.inputChannels(buff.numberOfChannels);
          if (callback) {
            callback(self);
          }
        });
      };
      reader.onerror = function (e) {
        if (!self.panner) return;
        if (onerror) {
          onerror(e);
        }
      };
      reader.readAsArrayBuffer(this.file);
    }
  }

  // TO DO: use this method to create a loading bar that shows progress during file upload/decode.
  _updateProgress(evt) {
    if (evt.lengthComputable) {
      var percentComplete = (evt.loaded / evt.total) * 0.99;
      this._whileLoading(percentComplete, evt);
      // ...
    } else {
      // Unable to compute progress information since the total size is unknown
      this._whileLoading('size unknown');
    }
  }

  /**
   *  Returns true if the sound file finished loading successfully.
   *
   *  @method  isLoaded
   *  @for p5.SoundFile
   *  @return {Boolean}
   */
  isLoaded() {
    if (this.buffer) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * Play the p5.SoundFile
   *
   * @method play
   * @for p5.SoundFile
   * @param {Number} [startTime]            (optional) schedule playback to start (in seconds from now).
   * @param {Number} [rate]             (optional) playback rate
   * @param {Number} [amp]              (optional) amplitude (volume)
   *                                     of playback
   * @param {Number} [cueStart]        (optional) cue start time in seconds
   * @param {Number} [duration]          (optional) duration of playback in seconds
   */
  play(startTime, rate, amp, _cueStart, duration) {
    if (!this.output) {
      console.warn('SoundFile.play() called after dispose');
      return;
    }

    var now = p5sound.audiocontext.currentTime;
    var cueStart, cueEnd;
    var time = startTime || 0;
    if (time < 0) {
      time = 0;
    }

    time = time + now;

    if (typeof rate !== 'undefined') {
      this.rate(rate);
    }

    if (typeof amp !== 'undefined') {
      this.setVolume(amp);
    }

    // TO DO: if already playing, create array of buffers for easy stop()
    if (this.buffer) {
      // reset the pause time (if it was paused)
      this._pauseTime = 0;

      // handle restart playmode
      if (this.mode === 'restart' && this.buffer && this.bufferSourceNode) {
        this.bufferSourceNode.stop(time);
        this._counterNode.stop(time);
      }

      //dont create another instance if already playing
      if (this.mode === 'untildone' && this.isPlaying()) {
        return;
      }
      // make a new source and counter. They are automatically assigned playbackRate and buffer
      this.bufferSourceNode = this._initSourceNode();

      // garbage collect counterNode and create a new one
      delete this._counterNode;
      this._counterNode = this._initCounterNode();

      if (_cueStart) {
        if (_cueStart >= 0 && _cueStart < this.buffer.duration) {
          // this.startTime = cueStart;
          cueStart = _cueStart;
        } else {
          throw 'start time out of range';
        }
      } else {
        cueStart = 0;
      }

      if (duration) {
        // if duration is greater than buffer.duration, just play entire file anyway rather than throw an error
        duration =
          duration <= this.buffer.duration - cueStart
            ? duration
            : this.buffer.duration;
      }

      // if it was paused, play at the pause position
      if (this._paused) {
        this.bufferSourceNode.start(time, this.pauseTime, duration);
        this._counterNode.start(time, this.pauseTime, duration);
      } else {
        this.bufferSourceNode.start(time, cueStart, duration);
        this._counterNode.start(time, cueStart, duration);
      }

      this._playing = true;
      this._paused = false;

      // add source to sources array, which is used in stopAll()
      this.bufferSourceNodes.push(this.bufferSourceNode);
      this.bufferSourceNode._arrayIndex = this.bufferSourceNodes.length - 1;

      this.bufferSourceNode.addEventListener('ended', this._clearOnEnd);
    }
    // If soundFile hasn't loaded the buffer yet, throw an error
    else {
      throw 'not ready to play file, buffer has yet to load. Try preload()';
    }

    // if looping, will restart at original time
    this.bufferSourceNode.loop = this._looping;
    this._counterNode.loop = this._looping;

    if (this._looping === true) {
      cueEnd = duration ? duration : cueStart - 0.000000000000001;
      this.bufferSourceNode.loopStart = cueStart;
      this.bufferSourceNode.loopEnd = cueEnd;
      this._counterNode.loopStart = cueStart;
      this._counterNode.loopEnd = cueEnd;
    }
  }

  /**
   *  p5.SoundFile has two play modes: <code>restart</code> and
   *  <code>sustain</code>. Play Mode determines what happens to a
   *  p5.SoundFile if it is triggered while in the middle of playback.
   *  In sustain mode, playback will continue simultaneous to the
   *  new playback. In restart mode, play() will stop playback
   *  and start over. With untilDone, a sound will play only if it's
   *  not already playing. Sustain is the default mode.
   *
   *  @method  playMode
   *  @for p5.SoundFile
   *  @param  {String} str 'restart' or 'sustain' or 'untilDone'
   *  @example
   *  <div><code>
   *  let mySound;
   *  function preload(){
   *    mySound = loadSound('assets/Damscray_DancingTiger.mp3');
   *  }
   *  function setup() {
   *    let cnv = createCanvas(100, 100);
   *    cnv.mousePressed(canvasPressed);
   *    noFill();
   *    rect(0, height/2, width - 1, height/2 - 1);
   *    rect(0, 0, width - 1, height/2);
   *    textAlign(CENTER, CENTER);
   *    fill(20);
   *    text('restart', width/2, 1 * height/4);
   *    text('sustain', width/2, 3 * height/4);
   *  }
   *  function canvasPressed() {
   *    if (mouseX < height/2) {
   *      mySound.playMode('restart');
   *    } else {
   *      mySound.playMode('sustain');
   *    }
   *    mySound.play();
   *  }
   *
   * </code></div>
   */
  playMode(str) {
    var s = str.toLowerCase();

    // if restart, stop all other sounds from playing
    if (s === 'restart' && this.buffer && this.bufferSourceNode) {
      for (var i = 0; i < this.bufferSourceNodes.length - 1; i++) {
        var now = p5sound.audiocontext.currentTime;
        this.bufferSourceNodes[i].stop(now);
      }
    }

    // set play mode to effect future playback
    if (s === 'restart' || s === 'sustain' || s === 'untildone') {
      this.mode = s;
    } else {
      throw 'Invalid play mode. Must be either "restart" or "sustain"';
    }
  }

  /**
   *  Pauses a file that is currently playing. If the file is not
   *  playing, then nothing will happen.
   *
   *  After pausing, .play() will resume from the paused
   *  position.
   *  If p5.SoundFile had been set to loop before it was paused,
   *  it will continue to loop after it is unpaused with .play().
   *
   *  @method pause
   *  @for p5.SoundFile
   *  @param {Number} [startTime] (optional) schedule event to occur
   *                               seconds from now
   *  @example
   *  <div><code>
   *  let soundFile;
   *  function preload() {
   *    soundFormats('ogg', 'mp3');
   *    soundFile = loadSound('assets/Damscray_-_Dancing_Tiger_02.mp3');
   *  }
   *  function setup() {
   *    let cnv = createCanvas(100, 100);
   *    cnv.mousePressed(canvasPressed);
   *    background(220);
   *    text('tap to play, release to pause', 10, 20, width - 20);
   *  }
   *  function canvasPressed() {
   *    soundFile.loop();
   *    background(0, 200, 50);
   *  }
   *  function mouseReleased() {
   *    soundFile.pause();
   *    background(220);
   *  }
   *  </code>
   *  </div>
   */
  pause(startTime) {
    var now = p5sound.audiocontext.currentTime;
    var time = startTime || 0;
    var pTime = time + now;

    if (this.isPlaying() && this.buffer && this.bufferSourceNode) {
      this._paused = true;
      this._playing = false;

      this.pauseTime = this.currentTime();
      this.bufferSourceNode.stop(pTime);
      this._counterNode.stop(pTime);

      this._pauseTime = this.currentTime();
      // TO DO: make sure play() still starts from orig start position
    } else {
      this._pauseTime = 0;
    }
  }

  /**
   * Loop the p5.SoundFile. Accepts optional parameters to set the
   * playback rate, playback volume, loopStart, loopEnd.
   *
   * @method loop
   * @for p5.SoundFile
   * @param {Number} [startTime] (optional) schedule event to occur
   *                             seconds from now
   * @param {Number} [rate]        (optional) playback rate
   * @param {Number} [amp]         (optional) playback volume
   * @param {Number} [cueLoopStart] (optional) startTime in seconds
   * @param {Number} [duration]  (optional) loop duration in seconds
   * @example
   *  <div><code>
   *  let soundFile;
   *  let loopStart = 0.5;
   *  let loopDuration = 0.2;
   *  function preload() {
   *    soundFormats('ogg', 'mp3');
   *    soundFile = loadSound('assets/Damscray_-_Dancing_Tiger_02.mp3');
   *  }
   *  function setup() {
   *    let cnv = createCanvas(100, 100);
   *    cnv.mousePressed(canvasPressed);
   *    background(220);
   *    text('tap to play, release to pause', 10, 20, width - 20);
   *  }
   *  function canvasPressed() {
   *    soundFile.loop();
   *    background(0, 200, 50);
   *  }
   *  function mouseReleased() {
   *    soundFile.pause();
   *    background(220);
   *  }
   *  </code>
   *  </div>
   */
  loop(startTime, rate, amp, loopStart, duration) {
    this._looping = true;
    this.play(startTime, rate, amp, loopStart, duration);
  }

  /**
   * Set a p5.SoundFile's looping flag to true or false. If the sound
   * is currently playing, this change will take effect when it
   * reaches the end of the current playback.
   *
   * @method setLoop
   * @for p5.SoundFile
   * @param {Boolean} Boolean   set looping to true or false
   */
  setLoop(bool) {
    if (bool === true) {
      this._looping = true;
    } else if (bool === false) {
      this._looping = false;
    } else {
      throw 'Error: setLoop accepts either true or false';
    }
    if (this.bufferSourceNode) {
      this.bufferSourceNode.loop = this._looping;
      this._counterNode.loop = this._looping;
    }
  }

  /**
   * Returns 'true' if a p5.SoundFile is currently looping and playing, 'false' if not.
   *
   * @method isLooping
   * @for p5.SoundFile
   * @return {Boolean}
   */
  isLooping() {
    if (!this.bufferSourceNode) {
      return false;
    }
    if (this._looping === true && this.isPlaying() === true) {
      return true;
    }
    return false;
  }

  /**
   *  Returns true if a p5.SoundFile is playing, false if not (i.e.
   *  paused or stopped).
   *
   *  @method isPlaying
   *  @for p5.SoundFile
   *  @return {Boolean}
   */
  isPlaying() {
    return this._playing;
  }

  /**
   *  Returns true if a p5.SoundFile is paused, false if not (i.e.
   *  playing or stopped).
   *
   *  @method  isPaused
   *  @for p5.SoundFile
   *  @return {Boolean}
   */
  isPaused() {
    return this._paused;
  }

  /**
   * Stop soundfile playback.
   *
   * @method stop
   * @for p5.SoundFile
   * @param {Number} [startTime] (optional) schedule event to occur
   *                             in seconds from now
   */
  stop(timeFromNow) {
    var time = timeFromNow || 0;

    if (this.mode === 'sustain' || this.mode === 'untildone') {
      this.stopAll(time);
      this._playing = false;
      this.pauseTime = 0;
      this._paused = false;
    } else if (this.buffer && this.bufferSourceNode) {
      var now = p5sound.audiocontext.currentTime;
      var t = time || 0;
      this.pauseTime = 0;
      this.bufferSourceNode.stop(now + t);
      this._counterNode.stop(now + t);
      this._playing = false;
      this._paused = false;
    }
  }

  /**
   *  Stop playback on all of this soundfile's sources.
   *  @private
   */
  stopAll(_time) {
    var now = p5sound.audiocontext.currentTime;
    var time = _time || 0;
    if (this.buffer && this.bufferSourceNode) {
      for (var i in this.bufferSourceNodes) {
        const bufferSourceNode = this.bufferSourceNodes[i];
        if (bufferSourceNode) {
          try {
            bufferSourceNode.stop(now + time);
          } catch (e) {
            // this was throwing errors only on Safari
          }
        }
      }
      this._counterNode.stop(now + time);
      this._onended(this);
    }
  }

  getVolume() {
    return this.output.gain.value;
  }

  /**
   * Set the stereo panning of a p5.sound object to
   * a floating point number between -1.0 (left) and 1.0 (right).
   * Default is 0.0 (center).
   *
   * @method pan
   * @for p5.SoundFile
   * @param {Number} [panValue]     Set the stereo panner
   * @param {Number} [timeFromNow]  schedule this event to happen
   *                                 seconds from now
   * @example
   * <div><code>
   *  let ballX = 0;
   *  let soundFile;
   *
   *  function preload() {
   *    soundFormats('ogg', 'mp3');
   *    soundFile = loadSound('assets/beatbox.mp3');
   *  }
   *
   *  function draw() {
   *    let cnv = createCanvas(100, 100);
   *    cnv.mousePressed(canvasPressed);
   *    background(220);
   *    ballX = constrain(mouseX, 0, width);
   *    ellipse(ballX, height/2, 20, 20);
   *  }
   *
   *  function canvasPressed(){
   *    // map the ball's x location to a panning degree
   *    // between -1.0 (left) and 1.0 (right)
   *    let panning = map(ballX, 0., width,-1.0, 1.0);
   *    soundFile.pan(panning);
   *    soundFile.play();
   *  }
   *  </div></code>
   */
  pan(pval, tFromNow) {
    this.panPosition = pval;
    this.panner.pan(pval, tFromNow);
  }

  /**
   * Returns the current stereo pan position (-1.0 to 1.0)
   *
   * @method getPan
   * @for p5.SoundFile
   * @return {Number} Returns the stereo pan setting of the Oscillator
   *                          as a number between -1.0 (left) and 1.0 (right).
   *                          0.0 is center and default.
   */
  getPan() {
    return this.panPosition;
  }

  /**
   *  Set the playback rate of a sound file. Will change the speed and the pitch.
   *  Values less than zero will reverse the audio buffer.
   *
   *  @method rate
   *  @for p5.SoundFile
   *  @param {Number} [playbackRate]     Set the playback rate. 1.0 is normal,
   *                                     .5 is half-speed, 2.0 is twice as fast.
   *                                     Values less than zero play backwards.
   *  @example
   *  <div><code>
   *  let mySound;
   *
   *  function preload() {
   *    mySound = loadSound('assets/Damscray_DancingTiger.mp3');
   *  }
   *
   *  function setup() {
   *    let cnv = createCanvas(100, 100);
   *    cnv.mousePressed(canvasPressed);
   *  }
   *  function canvasPressed() {
   *    mySound.loop();
   *  }
   *  function mouseReleased() {
   *    mySound.pause();
   *  }
   *  function draw() {
   *    background(220);
   *
   *    // Set the rate to a range between 0.1 and 4
   *    // Changing the rate also alters the pitch
   *    let playbackRate = map(mouseY, 0.1, height, 2, 0);
   *    playbackRate = constrain(playbackRate, 0.01, 4);
   *    mySound.rate(playbackRate);
   *
   *    line(0, mouseY, width, mouseY);
   *    text('rate: ' + round(playbackRate * 100) + '%', 10, 20);
   *  }
   *
   * </code>
   * </div>
   *
   */
  rate(playbackRate) {
    var reverse = false;
    if (typeof playbackRate === 'undefined') {
      return this.playbackRate;
    }

    this.playbackRate = playbackRate;

    if (playbackRate === 0) {
      playbackRate = 0.0000000000001;
    } else if (playbackRate < 0 && !this.reversed) {
      playbackRate = Math.abs(playbackRate);
      reverse = true;
    } else if (playbackRate > 0 && this.reversed) {
      reverse = true;
    }

    if (this.bufferSourceNode) {
      var now = p5sound.audiocontext.currentTime;
      this.bufferSourceNode.playbackRate.cancelScheduledValues(now);
      this.bufferSourceNode.playbackRate.linearRampToValueAtTime(
        Math.abs(playbackRate),
        now
      );
      this._counterNode.playbackRate.cancelScheduledValues(now);
      this._counterNode.playbackRate.linearRampToValueAtTime(
        Math.abs(playbackRate),
        now
      );
    }

    if (reverse) {
      this.reverseBuffer();
    }
    return this.playbackRate;
  }

  // TO DO: document this
  setPitch(num) {
    var newPlaybackRate = midiToFreq(num) / midiToFreq(60);
    this.rate(newPlaybackRate);
  }

  getPlaybackRate() {
    return this.playbackRate;
  }

  /**
   *  Multiply the output volume (amplitude) of a sound file
   *  between 0.0 (silence) and 1.0 (full volume).
   *  1.0 is the maximum amplitude of a digital sound, so multiplying
   *  by greater than 1.0 may cause digital distortion. To
   *  fade, provide a <code>rampTime</code> parameter. For more
   *  complex fades, see the Envelope class.
   *
   *  Alternately, you can pass in a signal source such as an
   *  oscillator to modulate the amplitude with an audio signal.
   *
   *  @method  setVolume
   *  @for p5.SoundFile
   *  @param {Number|Object} volume  Volume (amplitude) between 0.0
   *                                     and 1.0 or modulating signal/oscillator
   *  @param {Number} [rampTime]  Fade for t seconds
   *  @param {Number} [timeFromNow]  Schedule this event to happen at
   *                                 t seconds in the future
   */
  setVolume(vol, _rampTime, _tFromNow) {
    if (typeof vol === 'number') {
      var rampTime = _rampTime || 0;
      var tFromNow = _tFromNow || 0;
      var now = p5sound.audiocontext.currentTime;
      var currentVol = this.output.gain.value;
      this.output.gain.cancelScheduledValues(now + tFromNow);
      this.output.gain.linearRampToValueAtTime(currentVol, now + tFromNow);
      this.output.gain.linearRampToValueAtTime(vol, now + tFromNow + rampTime);
    } else if (vol) {
      vol.connect(this.output.gain);
    } else {
      // return the Gain Node
      return this.output.gain;
    }
  }
  /**
   * Returns the duration of a sound file in seconds.
   *
   * @method duration
   * @for p5.SoundFile
   * @return {Number} The duration of the soundFile in seconds.
   */
  duration() {
    // Return Duration
    if (this.buffer) {
      return this.buffer.duration;
    } else {
      return 0;
    }
  }

  /**
   * Return the current position of the p5.SoundFile playhead, in seconds.
   * Time is relative to the normal buffer direction, so if `reverseBuffer`
   * has been called, currentTime will count backwards.
   *
   * @method currentTime
   * @for p5.SoundFile
   * @return {Number}   currentTime of the soundFile in seconds.
   */
  currentTime() {
    return this.reversed
      ? Math.abs(this._lastPos - this.buffer.length) / ac.sampleRate
      : this._lastPos / ac.sampleRate;
  }

  /**
   * Move the playhead of a soundfile that is currently playing to a
   * new position and a new duration, in seconds.
   * If none are given, will reset the file to play entire duration
   * from start to finish. To set the position of a soundfile that is
   * not currently playing, use the `play` or `loop` methods.
   *
   * @method jump
   * @for p5.SoundFile
   * @param {Number} cueTime    cueTime of the soundFile in seconds.
   * @param {Number} duration    duration in seconds.
   */
  jump(cueTime, duration) {
    if (cueTime < 0 || cueTime > this.buffer.duration) {
      throw 'jump time out of range';
    }
    if (duration > this.buffer.duration - cueTime) {
      throw 'end time out of range';
    }

    var cTime = cueTime || 0;
    var dur = duration || undefined;
    if (this.isPlaying()) {
      this.stop(0);
      this.play(0, this.playbackRate, this.output.gain.value, cTime, dur);
    }
  }

  /**
   * Return the number of channels in a sound file.
   * For example, Mono = 1, Stereo = 2.
   *
   * @method channels
   * @for p5.SoundFile
   * @return {Number} [channels]
   */
  channels() {
    return this.buffer.numberOfChannels;
  }

  /**
   * Return the sample rate of the sound file.
   *
   * @method sampleRate
   * @for p5.SoundFile
   * @return {Number} [sampleRate]
   */
  sampleRate() {
    return this.buffer.sampleRate;
  }

  /**
   * Return the number of samples in a sound file.
   * Equal to sampleRate * duration.
   *
   * @method frames
   * @for p5.SoundFile
   * @return {Number} [sampleCount]
   */
  frames() {
    return this.buffer.length;
  }

  /**
   * Returns an array of amplitude peaks in a p5.SoundFile that can be
   * used to draw a static waveform. Scans through the p5.SoundFile's
   * audio buffer to find the greatest amplitudes. Accepts one
   * parameter, 'length', which determines size of the array.
   * Larger arrays result in more precise waveform visualizations.
   *
   * Inspired by Wavesurfer.js.
   *
   * @method  getPeaks
   * @for p5.SoundFile
   * @params {Number} [length] length is the size of the returned array.
   *                          Larger length results in more precision.
   *                          Defaults to 5*width of the browser window.
   * @returns {Float32Array} Array of peaks.
   */
  getPeaks(length) {
    if (this.buffer) {
      // set length to window's width if no length is provided
      if (!length) {
        length = window.width * 5;
      }
      if (this.buffer) {
        var buffer = this.buffer;
        var sampleSize = buffer.length / length;
        var sampleStep = ~~(sampleSize / 10) || 1;
        var channels = buffer.numberOfChannels;
        var peaks = new Float32Array(Math.round(length));

        for (var c = 0; c < channels; c++) {
          var chan = buffer.getChannelData(c);
          for (var i = 0; i < length; i++) {
            var start = ~~(i * sampleSize);
            var end = ~~(start + sampleSize);
            var max = 0;
            for (var j = start; j < end; j += sampleStep) {
              var value = chan[j];
              if (value > max) {
                max = value;
                // faster than Math.abs
              } else if (-value > max) {
                max = value;
              }
            }
            if (c === 0 || Math.abs(max) > peaks[i]) {
              peaks[i] = max;
            }
          }
        }

        return peaks;
      }
    } else {
      throw 'Cannot load peaks yet, buffer is not loaded';
    }
  }

  /**
   *  Reverses the p5.SoundFile's buffer source.
   *  Playback must be handled separately (see example).
   *
   *  @method  reverseBuffer
   *  @for p5.SoundFile
   *  @example
   *  <div><code>
   *  let drum;
   *  function preload() {
   *    drum = loadSound('assets/drum.mp3');
   *  }
   *
   *  function setup() {
   *    let cnv = createCanvas(100, 100);
   *    cnv.mousePressed(canvasPressed);
   *    background(220);
   *    text('tap to play', 20, 20);
   *  }
   *
   *  function canvasPressed() {
   *    drum.stop();
   *    drum.reverseBuffer();
   *    drum.play();
   *  }
   * </code>
   * </div>
   */
  reverseBuffer() {
    if (this.buffer) {
      var currentPos = this._lastPos / ac.sampleRate;
      var curVol = this.getVolume();
      this.setVolume(0, 0.001);

      const numChannels = this.buffer.numberOfChannels;
      for (var i = 0; i < numChannels; i++) {
        this.buffer.getChannelData(i).reverse();
      }
      // set reversed flag
      this.reversed = !this.reversed;

      if (this.isPlaying() && currentPos) {
        this.jump(this.duration() - currentPos);
      }
      this.setVolume(curVol, 0.001);
    } else {
      throw 'SoundFile is not done loading';
    }
  }

  /**
   *  Schedule an event to be called when the soundfile
   *  reaches the end of a buffer. If the soundfile is
   *  playing through once, this will be called when it
   *  ends. If it is looping, it will be called when
   *  stop is called.
   *
   *  @method  onended
   *  @for p5.SoundFile
   *  @param  {Function} callback function to call when the
   *                              soundfile has ended.
   */
  onended(callback) {
    this._onended = callback;
    return this;
  }

  add() {
    // TO DO
  }

  dispose() {
    var now = p5sound.audiocontext.currentTime;

    // remove reference to soundfile
    var index = p5sound.soundArray.indexOf(this);
    p5sound.soundArray.splice(index, 1);

    this.stop(now);
    if (this.buffer && this.bufferSourceNode) {
      for (var i = 0; i < this.bufferSourceNodes.length - 1; i++) {
        if (this.bufferSourceNodes[i] !== null) {
          this.bufferSourceNodes[i].disconnect();
          try {
            this.bufferSourceNodes[i].stop(now);
          } catch (e) {
            console.warn('no buffer source node to dispose');
          }
          this.bufferSourceNodes[i] = null;
        }
      }
      if (this.isPlaying()) {
        try {
          this._counterNode.stop(now);
        } catch (e) {
          console.log(e);
        }
        this._counterNode = null;
      }
    }
    if (this.output) {
      this.output.disconnect();
      this.output = null;
    }
    if (this.panner) {
      this.panner.disconnect();
      this.panner = null;
    }
  }

  /**
   * Connects the output of a p5sound object to input of another
   * p5.sound object. For example, you may connect a p5.SoundFile to an
   * FFT or an Effect. If no parameter is given, it will connect to
   * the master output. Most p5sound objects connect to the master
   * output when they are created.
   *
   * @method connect
   * @for p5.SoundFile
   * @param {Object} [object] Audio object that accepts an input
   */
  connect(unit) {
    if (!unit) {
      this.panner.connect(p5sound.input);
    } else {
      if (unit.hasOwnProperty('input')) {
        this.panner.connect(unit.input);
      } else {
        this.panner.connect(unit);
      }
    }
  }

  /**
   * Disconnects the output of this p5sound object.
   *
   * @method disconnect
   * @for p5.SoundFile
   */
  disconnect() {
    if (this.panner) {
      this.panner.disconnect();
    }
  }

  /**
   */
  getLevel() {
    console.warn(
      'p5.SoundFile.getLevel has been removed from the library. Use p5.Amplitude instead'
    );
  }

  /**
   *  Reset the source for this SoundFile to a
   *  new path (URL).
   *
   *  @method  setPath
   *  @for p5.SoundFile
   *  @param {String}   path     path to audio file
   *  @param {Function} callback Callback
   */
  setPath(p, callback) {
    var path = p5.prototype._checkFileFormats(p);
    this.url = path;
    this.load(callback);
  }

  /**
   *  Replace the current Audio Buffer with a new Buffer.
   *
   *  @method setBuffer
   *  @for p5.SoundFile
   *  @param {Array} buf Array of Float32 Array(s). 2 Float32 Arrays
   *                     will create a stereo source. 1 will create
   *                     a mono source.
   */
  setBuffer(buf) {
    var numChannels = buf.length;
    var size = buf[0].length;
    var newBuffer = ac.createBuffer(numChannels, size, ac.sampleRate);

    if (!(buf[0] instanceof Float32Array)) {
      buf[0] = new Float32Array(buf[0]);
    }

    for (var channelNum = 0; channelNum < numChannels; channelNum++) {
      var channel = newBuffer.getChannelData(channelNum);
      channel.set(buf[channelNum]);
    }

    this.buffer = newBuffer;

    // set numbers of channels on input to the panner
    this.panner.inputChannels(numChannels);
  }

  //////////////////////////////////////////////////
  // script processor node with an empty buffer to help
  // keep a sample-accurate position in playback buffer.
  // Inspired by Chinmay Pendharkar's technique for Sonoport --> http://bit.ly/1HwdCsV
  // Copyright [2015] [Sonoport (Asia) Pte. Ltd.],
  // Licensed under the Apache License http://apache.org/licenses/LICENSE-2.0
  ////////////////////////////////////////////////////////////////////////////////////

  // initialize counterNode, set its initial buffer and playbackRate
  _initCounterNode() {
    var self = this;
    var now = ac.currentTime;
    var cNode = ac.createBufferSource();

    const workletBufferSize = safeBufferSize(256);

    // dispose of worklet node if it already exists
    if (self._workletNode) {
      self._workletNode.disconnect();
      delete self._workletNode;
    }
    self._workletNode = new AudioWorkletNode(
      ac,
      processorNames.soundFileProcessor,
      {
        processorOptions: { bufferSize: workletBufferSize },
      }
    );
    self._workletNode.port.onmessage = (event) => {
      if (event.data.name === 'position') {
        // event.data.position should only be 0 when paused
        if (event.data.position === 0) {
          return;
        }
        this._lastPos = event.data.position;

        // do any callbacks that have been scheduled
        this._onTimeUpdate(self._lastPos);
      }
    };

    // create counter buffer of the same length as self.buffer
    cNode.buffer = _createCounterBuffer(self.buffer);

    cNode.playbackRate.setValueAtTime(self.playbackRate, now);

    cNode.connect(self._workletNode);
    self._workletNode.connect(p5.soundOut._silentNode);

    return cNode;
  }

  // initialize sourceNode, set its initial buffer and playbackRate
  _initSourceNode() {
    var bufferSourceNode = ac.createBufferSource();
    bufferSourceNode.buffer = this.buffer;
    bufferSourceNode.playbackRate.value = this.playbackRate;
    bufferSourceNode.connect(this.output);
    return bufferSourceNode;
  }

  /**
   *  processPeaks returns an array of timestamps where it thinks there is a beat.
   *
   *  This is an asynchronous function that processes the soundfile in an offline audio context,
   *  and sends the results to your callback function.
   *
   *  The process involves running the soundfile through a lowpass filter, and finding all of the
   *  peaks above the initial threshold. If the total number of peaks are below the minimum number of peaks,
   *  it decreases the threshold and re-runs the analysis until either minPeaks or minThreshold are reached.
   *
   *  @method  processPeaks
   *  @for p5.SoundFile
   *  @param  {Function} callback       a function to call once this data is returned
   *  @param  {Number}   [initThreshold] initial threshold defaults to 0.9
   *  @param  {Number}   [minThreshold]   minimum threshold defaults to 0.22
   *  @param  {Number}   [minPeaks]       minimum number of peaks defaults to 200
   *  @return {Array}                  Array of timestamped peaks
   */
  processPeaks(callback, _initThreshold, _minThreshold, _minPeaks) {
    var bufLen = this.buffer.length;
    var sampleRate = this.buffer.sampleRate;
    var buffer = this.buffer;
    var allPeaks = [];

    var initialThreshold = _initThreshold || 0.9,
      threshold = initialThreshold,
      minThreshold = _minThreshold || 0.22,
      minPeaks = _minPeaks || 200;

    // Create offline context
    var offlineContext = new window.OfflineAudioContext(1, bufLen, sampleRate);

    // create buffer source
    var source = offlineContext.createBufferSource();
    source.buffer = buffer;

    // Create filter. TO DO: allow custom setting of filter
    var filter = offlineContext.createBiquadFilter();
    filter.type = 'lowpass';
    source.connect(filter);
    filter.connect(offlineContext.destination);

    // start playing at time:0
    source.start(0);
    offlineContext.startRendering(); // Render the song

    // act on the result
    offlineContext.oncomplete = function (e) {
      if (!self.panner) return;
      var filteredBuffer = e.renderedBuffer;
      var bufferData = filteredBuffer.getChannelData(0);

      // step 1:
      // create Peak instances, add them to array, with strength and sampleIndex
      do {
        allPeaks = getPeaksAtThreshold(bufferData, threshold);
        threshold -= 0.005;
      } while (
        Object.keys(allPeaks).length < minPeaks &&
        threshold >= minThreshold
      );

      // step 2:
      // find intervals for each peak in the sampleIndex, add tempos array
      var intervalCounts = countIntervalsBetweenNearbyPeaks(allPeaks);

      // step 3: find top tempos
      var groups = groupNeighborsByTempo(
        intervalCounts,
        filteredBuffer.sampleRate
      );

      // sort top intervals
      var topTempos = groups
        .sort(function (intA, intB) {
          return intB.count - intA.count;
        })
        .splice(0, 5);

      // set this SoundFile's tempo to the top tempo ??
      this.tempo = topTempos[0].tempo;

      // step 4:
      // new array of peaks at top tempo within a bpmVariance
      var bpmVariance = 5;
      var tempoPeaks = getPeaksAtTopTempo(
        allPeaks,
        topTempos[0].tempo,
        filteredBuffer.sampleRate,
        bpmVariance
      );

      callback(tempoPeaks);
    };
  }

  /**
   *  Schedule events to trigger every time a MediaElement
   *  (audio/video) reaches a playback cue point.
   *
   *  Accepts a callback function, a time (in seconds) at which to trigger
   *  the callback, and an optional parameter for the callback.
   *
   *  Time will be passed as the first parameter to the callback function,
   *  and param will be the second parameter.
   *
   *
   *  @method  addCue
   *  @for p5.SoundFile
   *  @param {Number}   time     Time in seconds, relative to this media
   *                             element's playback. For example, to trigger
   *                             an event every time playback reaches two
   *                             seconds, pass in the number 2. This will be
   *                             passed as the first parameter to
   *                             the callback function.
   *  @param {Function} callback Name of a function that will be
   *                             called at the given time. The callback will
   *                             receive time and (optionally) param as its
   *                             two parameters.
   *  @param {Object} [value]    An object to be passed as the
   *                             second parameter to the
   *                             callback function.
   *  @return {Number} id ID of this cue,
   *                      useful for removeCue(id)
   *  @example
   *  <div><code>
   *  let mySound;
   *  function preload() {
   *    mySound = loadSound('assets/Damscray_DancingTiger.mp3');
   *  }
   *
   *  function setup() {
   *    let cnv = createCanvas(100, 100);
   *    cnv.mousePressed(canvasPressed);
   *    background(220);
   *    text('tap to play', 10, 20);
   *
   *    // schedule calls to changeText
   *    mySound.addCue(0, changeText, "hello" );
   *    mySound.addCue(0.5, changeText, "hello," );
   *    mySound.addCue(1, changeText, "hello, p5!");
   *    mySound.addCue(1.5, changeText, "hello, p5!!");
   *    mySound.addCue(2, changeText, "hello, p5!!!!!");
   *  }
   *
   *  function changeText(val) {
   *    background(220);
   *    text(val, 10, 20);
   *  }
   *
   *  function canvasPressed() {
   *    mySound.play();
   *  }
   *  </code></div>
   */
  addCue(time, callback, val) {
    var id = this._cueIDCounter++;

    var cue = new Cue(callback, time, id, val);
    this._cues.push(cue);

    // if (!this.elt.ontimeupdate) {
    //   this.elt.ontimeupdate = this._onTimeUpdate.bind(this);
    // }

    return id;
  }

  /**
   *  Remove a callback based on its ID. The ID is returned by the
   *  addCue method.
   *
   *  @method removeCue
   *  @for p5.SoundFile
   *  @param  {Number} id ID of the cue, as returned by addCue
   */
  removeCue(id) {
    var cueLength = this._cues.length;
    for (var i = 0; i < cueLength; i++) {
      var cue = this._cues[i];
      if (cue.id === id) {
        this._cues.splice(i, 1);
        break;
      }
    }

    if (this._cues.length === 0) {
      // TO DO: remove callback
      // this.elt.ontimeupdate = null
    }
  }

  /**
   *  Remove all of the callbacks that had originally been scheduled
   *  via the addCue method.
   *
   *  @method  clearCues
   */
  clearCues() {
    this._cues = [];
    // this.elt.ontimeupdate = null;
  }

  // private method that checks for cues to be fired if events
  // have been scheduled using addCue(callback, time).
  _onTimeUpdate(position) {
    var playbackTime = position / this.buffer.sampleRate;
    var cueLength = this._cues.length;

    for (var i = 0; i < cueLength; i++) {
      var cue = this._cues[i];
      var callbackTime = cue.time;
      var val = cue.val;
      var leftLimit = this._prevUpdateTime || 0;
      var rightLimit = playbackTime;
      if (leftLimit <= callbackTime && callbackTime <= rightLimit) {
        // pass the scheduled callbackTime as parameter to the callback
        cue.callback(val);
      }
    }

    this._prevUpdateTime = playbackTime;
  }

  /**
   * Save a p5.SoundFile as a .wav file. The browser will prompt the user
   * to download the file to their device. To upload a file to a server, see
   * <a href="/reference/#/p5.SoundFile/getBlob">getBlob</a>
   *
   * @method save
   * @for p5.SoundFile
   * @param  {String} [fileName]      name of the resulting .wav file.
   * @example
   *  <div><code>
   *  let mySound;
   *  function preload() {
   *    mySound = loadSound('assets/doorbell.mp3');
   *  }
   *  function setup() {
   *    let cnv = createCanvas(100, 100);
   *    cnv.mousePressed(canvasPressed);
   *    background(220);
   *    text('tap to download', 10, 20);
   *  }
   *
   *  function canvasPressed() {
   *    mySound.save('my cool filename');
   *  }
   * </code></div>
   */
  save(fileName) {
    p5.prototype.saveSound(this, fileName, 'wav');
  }

  /**
   * This method is useful for sending a SoundFile to a server. It returns the
   * .wav-encoded audio data as a "<a target="_blank" title="Blob reference at
   * MDN" href="https://developer.mozilla.org/en-US/docs/Web/API/Blob">Blob</a>".
   * A Blob is a file-like data object that can be uploaded to a server
   * with an <a href="/reference/#/p5/httpDo">http</a> request. We'll
   * use the `httpDo` options object to send a POST request with some
   * specific options: we encode the request as `multipart/form-data`,
   * and attach the blob as one of the form values using `FormData`.
   *
   *
   * @method getBlob
   * @for p5.SoundFile
   * @returns {Blob} A file-like data object
   * @example
   *  <div><code>
   *  function preload() {
   *    mySound = loadSound('assets/doorbell.mp3');
   *  }
   *
   *  function setup() {
   *    noCanvas();
   *    let soundBlob = mySound.getBlob();
   *
   *    // Now we can send the blob to a server...
   *    let serverUrl = 'https://jsonplaceholder.typicode.com/posts';
   *    let httpRequestOptions = {
   *      method: 'POST',
   *      body: new FormData().append('soundBlob', soundBlob),
   *      headers: new Headers({
   *        'Content-Type': 'multipart/form-data'
   *      })
   *    };
   *    httpDo(serverUrl, httpRequestOptions);
   *
   *    // We can also create an `ObjectURL` pointing to the Blob
   *    let blobUrl = URL.createObjectURL(soundBlob);
   *
   *    // The `<Audio>` Element accepts Object URL's
   *    createAudio(blobUrl).showControls();
   *
   *    createDiv();
   *
   *    // The ObjectURL exists as long as this tab is open
   *    let input = createInput(blobUrl);
   *    input.attribute('readonly', true);
   *    input.mouseClicked(function() { input.elt.select() });
   *  }
   *
   * </code></div>
   */
  getBlob() {
    const dataView = convertToWav(this.buffer);
    return new Blob([dataView], { type: 'audio/wav' });
  }
}

/**
 *  loadSound() returns a new p5.SoundFile from a specified
 *  path. If called during preload(), the p5.SoundFile will be ready
 *  to play in time for setup() and draw(). If called outside of
 *  preload, the p5.SoundFile will not be ready immediately, so
 *  loadSound accepts a callback as the second parameter. Using a
 *  <a href="https://github.com/processing/p5.js/wiki/Local-server">
 *  local server</a> is recommended when loading external files.
 *
 *  @method loadSound
 *  @for p5
 *  @param  {String|Array}   path     Path to the sound file, or an array with
 *                                    paths to soundfiles in multiple formats
 *                                    i.e. ['sound.ogg', 'sound.mp3'].
 *                                    Alternately, accepts an object: either
 *                                    from the HTML5 File API, or a p5.File.
 *  @param {Function} [successCallback]   Name of a function to call once file loads
 *  @param {Function} [errorCallback]   Name of a function to call if there is
 *                                      an error loading the file.
 *  @param {Function} [whileLoading] Name of a function to call while file is loading.
 *                                 This function will receive the percentage loaded
 *                                 so far, from 0.0 to 1.0.
 *  @return {SoundFile}            Returns a p5.SoundFile
 *  @example
 *  <div><code>
 *  let mySound;
 *  function preload() {
 *    soundFormats('mp3', 'ogg');
 *    mySound = loadSound('assets/doorbell');
 *  }
 *
 *  function setup() {
 *    let cnv = createCanvas(100, 100);
 *    cnv.mousePressed(canvasPressed);
 *    background(220);
 *    text('tap here to play', 10, 20);
 *  }
 *
 *  function canvasPressed() {
 *    // playing a sound file on a user gesture
 *    // is equivalent to `userStartAudio()`
 *    mySound.play();
 *  }
 *  </code></div>
 */
function loadSound(path, callback, onerror, whileLoading) {
  // if loading locally without a server
  if (
    window.location.origin.indexOf('file://') > -1 &&
    window.cordova === 'undefined'
  ) {
    window.alert(
      'This sketch may require a server to load external files. Please see http://bit.ly/1qcInwS'
    );
  }

  var self = this;
  var s = new SoundFile(
    path,
    function () {
      if (typeof callback === 'function') {
        callback.apply(self, arguments);
      }

      if (typeof self._decrementPreload === 'function') {
        self._decrementPreload();
      }
    },
    onerror,
    whileLoading
  );

  return s;
}

export default SoundFile;
export { loadSound };
