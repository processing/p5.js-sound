define(function (require) {

  'use strict';

  require('sndcore');
  var p5sound = require('master');

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
   *  @param {String/Array} path   path to a sound file (String). Optionally,
   *                               you may include multiple file formats in
   *                               an array.
   *  @param {Function} [callback]   Name of a function to call once file loads
   *  @return {Object}    p5.SoundFile Object
   *  @example 
   *  <div><code>
   *  function preload() {
   *    mySound = loadSound('assets/drum.mp3');
   *  }
   *
   *  function setup() {
   *    mySound.play();
   *  }
   * 
   * </code></div>
   */
  p5.SoundFile = function(paths, onload, whileLoading) {
    var path = p5.prototype._checkFileFormats(paths);

    // player variables
    this.url = path;

    // array of sources so that they can all be stopped!
    this.sources = [];

    // current source
    this.source = null;

    this.buffer = null;
    this.playbackRate = 1;
    this.gain = 1;

    this.input = p5sound.audiocontext.createGain();
    this.output = p5sound.audiocontext.createGain();

    this.reversed = false;

    // start and end of playback / loop
    this.startTime = 0;
    this.endTime = null;

    // playing - defaults to false
    this.playing = false;

    // paused - defaults to true
    this.paused = null;

    // "restart" would stop playback before retriggering
    this.mode = 'sustain';

    // time that playback was started, in millis
    this.startMillis = null;

    this.amplitude = new p5.Amplitude();
    this.output.connect(this.amplitude.input);

    // stereo panning
    this.panPosition = 0.0;
    this.panner = new p5.Panner(this.output, p5sound.input, 2);

    // it is possible to instantiate a soundfile with no path
    if (this.url) {
      this.load(onload);
    }

    // add this p5.SoundFile to the soundArray
    p5sound.soundArray.push(this);

    if (typeof(whileLoading) === 'function') {
      this.whileLoading = whileLoading;
    } else {
      this.whileLoading = function() {};
    }
  };

  // register preload handling of loadSound
  p5.prototype.registerPreloadMethod('loadSound');

  /**
   *  loadSound() returns a new p5.SoundFile from a specified
   *  path. If called during preload(), the p5.SoundFile will be ready
   *  to play in time for setup() and draw(). If called outside of
   *  preload, the p5.SoundFile will not be ready immediately, so
   *  loadSound accepts a callback as the second parameter. Using a
   *  <a href="https://github.com/lmccart/p5.js/wiki/Local-server">
   *  local server</a> is recommended when loading external files.
   *  
   *  @method loadSound
   *  @param  {String/Array}   path     Path to the sound file, or an array with
   *                                    paths to soundfiles in multiple formats
   *                                    i.e. ['sound.ogg', 'sound.mp3']
   *  @param {Function} [callback]   Name of a function to call once file loads
   *  @param {Function} [callback]   Name of a function to call while file is loading.
   *                                 This function will receive a percentage from 0.0
   *                                 to 1.0.
   *  @return {SoundFile}            Returns a p5.SoundFile
   *  @example 
   *  <div><code>
   *  function preload() {
   *   mySound = loadSound('assets/drum.mp3');
   *  }
   *
   *  function setup() {
   *    mySound.loop();
   *  }
   *  </code></div>
   */
  p5.prototype.loadSound = function(path, callback, whileLoading){
    // if loading locally without a server
    if (window.location.origin.indexOf('file://') > -1) {
      alert('This sketch may require a server to load external files. Please see http://bit.ly/1qcInwS');
    }

    var s = new p5.SoundFile(path, callback, whileLoading);
    return s;
  };

  /**
   * This is a helper function that the p5.SoundFile calls to load
   * itself. Accepts a callback (the name of another function)
   * as an optional parameter.
   *
   * @private
   * @param {Function} [callback]   Name of a function to call once file loads
   */
  p5.SoundFile.prototype.load = function(callback){
    var sf = this;
    var request = new XMLHttpRequest();
    request.addEventListener('progress', function(evt) {
                                          sf._updateProgress(evt);
                                         }, false);
    request.open('GET', this.url, true);
    request.responseType = 'arraybuffer';
    // decode asyncrohonously
    var self = this;
    request.onload = function() {
      var ac = p5.prototype.getAudioContext();
      ac.decodeAudioData(request.response, function(buff) {
        self.buffer = buff;
        self.panner.inputChannels(buff.numberOfChannels);
        if (callback) {
          callback(self);
        }
      });
    };
    request.send();
  };


  p5.SoundFile.prototype._updateProgress = function(evt) {
    if (evt.lengthComputable) {
      var percentComplete = Math.log(evt.loaded / evt.total * 9.9);
      this.whileLoading(percentComplete);
      // ...
    } else {
      console.log('size unknown');
      // Unable to compute progress information since the total size is unknown
    }
  };

  /**
   *  Returns true if the sound file finished loading successfully.
   *  
   *  @method  isLoaded
   *  @return {Boolean} 
   */
  p5.SoundFile.prototype.isLoaded = function() {
    if (this.buffer) {
      return true;
    } else {
      return false;
    }
  };

  /**
   * Play the p5.SoundFile
   *
   * @method play
   * @param {Number} [rate]             (optional) playback rate
   * @param {Number} [amp]              (optional) amplitude (volume)
   *                                     of playback
   * @param {Number} [startTime]        (optional) startTime in seconds
   * @param {Number} [endTime]          (optional) endTime in seconds
   */
  p5.SoundFile.prototype.play = function(rate, amp, startTime, endTime) {
    var now = p5sound.audiocontext.currentTime;
    // TO DO: if already playing, create array of buffers for easy stop()
    if (this.buffer) {

      // handle restart playmode
      if (this.mode === 'restart' && this.buffer && this.source) {
        var now = p5sound.audiocontext.currentTime;
        this.source.stop(now);
      }

      if (startTime) {
        if (startTime >=0 && startTime < this.buffer.duration){
          this.startTime = startTime;
        } else {
          throw 'start time out of range';
        }
      }

      if (endTime) {
        if (endTime >=0 && endTime <= this.buffer.duration){
          this.endTime = endTime;
        } else {
          throw 'end time out of range';
        }
      }
      else {
          this.endTime = this.buffer.duration;
        }

      // make a new source
      this.source = p5sound.audiocontext.createBufferSource();
      this.source.buffer = this.buffer;
      this.source.loop = this.looping;
      if (this.source.loop === true){
        this.source.loopStart = this.startTime;
        this.source.loopEnd = this.endTime;
      }
      this.source.onended = function() {
        // this was causing errors in Safari
        // if (this.isPlaying()) {
        //   this.playing = !this.playing;
        //   var now = p5sound.audiocontext.currentTime;
        //   this.stop(now);
        //  }
       };

      // firefox method of controlling gain without resetting volume
      if (!this.source.gain) {
        this.source.gain = p5sound.audiocontext.createGain();
        this.source.connect(this.source.gain);
        // set local amp if provided, otherwise 1
        var a = amp || 1;
        this.source.gain.gain.setValueAtTime(a, p5sound.audiocontext.currentTime);
        this.source.gain.connect(this.output); 
      }
      // chrome method of controlling gain without resetting volume
      else {
        this.source.gain.value = amp || 1;
        this.source.connect(this.output); 
      }
      this.source.playbackRate.cancelScheduledValues(now);
      rate = rate || Math.abs(this.playbackRate);
      this.source.playbackRate.setValueAtTime(rate, now);

      if (this.paused){
        this.wasUnpaused = true;
      }

      // play the sound
      if (this.paused && this.wasUnpaused){
        this.source.start(0, this.pauseTime, this.endTime);
        // flag for whether to use pauseTime or startTime to get currentTime()
        // this.wasUnpaused = true;
      }
      else {
        this.wasUnpaused = false;
        this.pauseTime = 0;
        this.source.start(0, this.startTime, this.endTime);
      }
      this.startSeconds = now;
      this.playing = true;
      this.paused = false;

      // add the source to sources array
      this.sources.push(this.source);
    }
    // If soundFile hasn't loaded the buffer yet, throw an error
    else {
      throw 'not ready to play file, buffer has yet to load. Try preload()';
    }
  };


  /**
   *  p5.SoundFile has two play modes: <code>restart</code> and
   *  <code>sustain</code>. Play Mode determines what happens to a
   *  p5.SoundFile if it is triggered while in the middle of playback.
   *  In sustain mode, playback will continue simultaneous to the
   *  new playback. In restart mode, play() will stop playback
   *  and start over. Sustain is the default mode. 
   *  
   *  @method  playMode
   *  @param  {String} str 'restart' or 'sustain'
   *  @example
   *  <div><code>
   *  function setup(){
   *    mySound = loadSound('assets/Damscray_DancingTiger.mp3');
   *  }
   *  function mouseClicked() {
   *    mySound.playMode('sustain');
   *    mySound.play();
   *  }
   *  function keyPressed() {
   *    mySound.playMode('restart');
   *    mySound.play();
   *  }
   * 
   * </code></div>
   */
  p5.SoundFile.prototype.playMode = function(str) {
    var s = str.toLowerCase();

    // if restart, stop all other sounds from playing
    if (s === 'restart' && this.buffer && this.source) {
      for (var i = 0; i < this.sources.length - 1; i++){
        var now = p5sound.audiocontext.currentTime;
        this.sources[i].stop(now);
      }
    }

    // set play mode to effect future playback
    if (s === 'restart' || s === 'sustain') {
      this.mode = s;
    } else {
      throw 'Invalid play mode. Must be either "restart" or "sustain"';
    }
  };

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
   *  @example
   *  <div><code>
   *  var soundFile;
   *  
   *  function preload() {
   *    soundFormats('ogg', 'mp3');
   *    soundFile = loadSound('../_files/Damscray_-_Dancing_Tiger_02');
   *  }
   *  function setup() {
   *    background(0, 255, 0);
   *    soundFile.loop();
   *  }
   *  function keyTyped() {
   *    if (key == 'p') {
   *      soundFile.pause();
   *      background(255, 0, 0);
   *    }
   *  }
   *  
   *  function keyReleased() {
   *    if (key == 'p') {
   *      soundFile.play();
   *      background(0, 255, 0);
   *    }
   */
  p5.SoundFile.prototype.pause = function() {
    var keepLoop = this.looping;
    if (this.isPlaying() && this.buffer && this.source) {
      this.pauseTime = this.currentTime();
      var now = p5sound.audiocontext.currentTime;
      this.source.stop(now);
      this.paused = true;
      this.wasUnpaused = false;
      this.playing = false;
      // TO DO: make sure play() still starts from orig start position
    }
  };


  /**
   * Loop the p5.SoundFile. Accepts optional parameters to set the
   * playback rate, playback volume, loopStart, loopEnd.
   *
   * @method loop
   * @param {Number} [rate]             (optional) playback rate
   * @param {Number} [amp]              (optional) playback volume
   * @param {Number} [loopStart]        (optional) startTime in seconds
   * @param {Number} [loopEnd]          (optional) endTime in seconds
   */
  p5.SoundFile.prototype.loop = function(rate, amp, loopStart, loopEnd) {
    this.looping = true;
    this.play(rate, amp, loopStart, loopEnd);
  };

  /**
   * Set a p5.SoundFile's looping flag to true or false. If the sound
   * is currently playing, this change will take effect when it
   * reaches the end of the current playback. 
   * 
   * @param {Boolean} Boolean   set looping to true or false
   */
  p5.SoundFile.prototype.setLoop = function(bool) {
    if (bool === true) {
      this.looping = true;
    }
    else if (bool === false) {
      this.looping = false;
    }
    else {
      throw 'Error: setLoop accepts either true or false';
    }
    if (this.source) {
      this.source.loop = this.looping;
    }
  };

 /**
   * Returns 'true' if a p5.SoundFile is looping, 'false' if not.
   *
   * @return {Boolean}
   */
  p5.SoundFile.prototype.isLooping = function() {
    if (!this.source) {
      return false;
    }
    if (this.looping === true && this.isPlaying() === true) {
      return true;
    }
    return false;
  };

  /**
   *  Returns true if a p5.SoundFile is playing, false if not (i.e.
   *  paused or stopped).
   *
   *  @method isPlaying
   *  @return {Boolean}
   */
  p5.SoundFile.prototype.isPlaying = function() {
    if (this.playing !== null){
      return this.playing;
    } else {
      return false;
    }
  };

  /**
   *  Returns true if a p5.SoundFile is paused, false if not (i.e.
   *  playing or stopped).
   *
   *  @method  isPaused
   *  @return {Boolean}
   */
  p5.SoundFile.prototype.isPaused = function() {
    if (!this.paused) {
      return false;
    }
    return this.paused;
  };

  /**
   * Stop soundfile playback.
   *
   * @method stop
   */
  p5.SoundFile.prototype.stop = function() {
    if (this.mode == 'sustain') {
      this.stopAll();
      this.playing = false;
      this.pauseTime = 0;
      this.wasUnpaused = false;
      this.paused = false;
    }
    else if (this.buffer && this.source) {
      var now = p5sound.audiocontext.currentTime;
      this.source.stop(now);
      this.playing = false;
      this.pauseTime = 0;
      this.wasUnpaused = false;
      this.paused = false;
    }
  };

  /**
   *  Stop playback on all of this soundfile's sources.
   *  @private
   */
  p5.SoundFile.prototype.stopAll = function() {
    if (this.buffer && this.source) {
      for (var i = 0; i < this.sources.length; i++){
        if (this.sources[i] !== null){
          var now = p5sound.audiocontext.currentTime;
          this.sources[i].stop(now);
        }
      }
    }
  };

  /**
   *  Multiply the output volume (amplitude) of a sound file
   *  between 0.0 (silence) and 1.0 (full volume).
   *  1.0 is the maximum amplitude of a digital sound, so multiplying
   *  by greater than 1.0 may cause digital distortion. To
   *  fade, provide a <code>rampTime</code> parameter. For more
   *  complex fades, see the Env class.
   *
   *  @method  setVolume
   *  @param {Number} volume  Volume (amplitude) between 0.0 and 1.0
   *  @param {Number} [rampTime]  Fade for t seconds
   *  @param {Number} [timeFromNow]  Schedule this event to happen at
   *                                 t seconds in the future
   */
  p5.SoundFile.prototype.setVolume = function(vol, rampTime, tFromNow){
    if (typeof(vol) === 'number') {
      var rampTime = rampTime || 0;
      var tFromNow = tFromNow || 0;
      var now = p5sound.audiocontext.currentTime;
      var currentVol = this.output.gain.value;
      this.output.gain.cancelScheduledValues(now);
      this.output.gain.linearRampToValueAtTime(currentVol, now + tFromNow);
      this.output.gain.linearRampToValueAtTime(vol, now + tFromNow + rampTime);
    }
    else if (vol) {
      vol.connect(this.output.gain);
    } else {
      // return the Gain Node
      return this.output.gain;
    }
  };

  // same as setVolume, to match Processing Sound
  p5.SoundFile.prototype.amp = p5.SoundFile.prototype.setVolume;

  // these are the same thing
  p5.SoundFile.prototype.fade = p5.SoundFile.prototype.setVolume;

  p5.SoundFile.prototype.getVolume = function() {
    return this.output.gain.value;
  };

  /**
   * Set the stereo panning of a p5.sound object to
   * a floating point number between -1.0 (left) and 1.0 (right).
   * Default is 0.0 (center).
   *
   * @method pan
   * @param {Number} [panValue]     Set the stereo panner
   * @param  {Number} timeFromNow schedule this event to happen
   *                                seconds from now
   * @example
   * <div><code>
   *
   *  var ball = {};
   *  var soundFile;
   *
   *  function setup() {
   *    soundFormats('ogg', 'mp3');
   *    soundFile = loadSound('assets/beatbox.mp3');
   *  }
   *  
   *  function draw() {
   *    background(0);
   *    ball.x = constrain(mouseX, 0, width);
   *    ellipse(ball.x, height/2, 20, 20)
   *  }
   *  
   *  function mousePressed(){
   *    // map the ball's x location to a panning degree 
   *    // between -1.0 (left) and 1.0 (right)
   *    var panning = map(ball.x, 0., width,-1.0, 1.0);
   *    soundFile.pan(panning);
   *    soundFile.play();
   *  }
   *  </div></code>
   */
  p5.SoundFile.prototype.pan = function(pval, tFromNow) {
    this.panPosition = pval;
    this.panner.pan(pval, tFromNow);
  };

  /**
   * Returns the current stereo pan position (-1.0 to 1.0)
   *
   * @return {Number} Returns the stereo pan setting of the Oscillator
   *                          as a number between -1.0 (left) and 1.0 (right).
   *                          0.0 is center and default.
   */
  p5.SoundFile.prototype.getPan = function() {
    return this.panPosition;
  };

  /**
   *  Set the playback rate of a sound file. Will change the speed and the pitch.
   *  Values less than zero will reverse the audio buffer.
   *
   *  @method rate
   *  @param {Number} [playbackRate]     Set the playback rate. 1.0 is normal,
   *                                     .5 is half-speed, 2.0 is twice as fast.
   *                                     Must be greater than zero.
   *  @example
   *  <div><code>
   *  var song;
   *  
   *  function preload() {
   *    song = loadSound('assets/Damscray_DancingTiger.mp3');
   *  }
   *
   *  function setup() {
   *    song.loop();
   *  }
   *
   *  function draw() {
   *    background(200);
   *    
   *    // Set the rate to a range between 0.1 and 4
   *    // Changing the rate also alters the pitch
   *    var speed = map(mouseY, 0.1, height, 0, 2);
   *    speed = constrain(speed, 0.01, 4);
   *    song.rate(speed);
   *    
   *    // Draw a circle to show what is going on
   *    stroke(0);
   *    fill(51, 100);
   *    ellipse(mouseX, 100, 48, 48);
   *  }
   *  
   * </code>
   * </div>
   *  
   */
  p5.SoundFile.prototype.rate = function(playbackRate) {
    if (this.playbackRate === playbackRate && this.source) {
      if (this.source.playbackRate.value === playbackRate) {
        return;
      }
    }
    this.playbackRate = playbackRate;
    var rate = playbackRate;
    if (this.playbackRate === 0 && this.playing) {
      this.pause();
    }
    if (this.playbackRate < 0 && !this.reversed) {
      var cPos = this.currentTime();
      var cRate = this.source.playbackRate.value;

      this.pause();
      this.reverseBuffer();
      rate = Math.abs(playbackRate);

      var newPos = ( cPos - this.duration() ) / rate;
      this.pauseTime = newPos;
      this.play();
    }
    else if (this.playbackRate > 0 && this.reversed) {
      this.reverseBuffer();
    }
    if (this.source){
      var now = p5sound.audiocontext.currentTime;
      this.source.playbackRate.cancelScheduledValues(now);
      this.source.playbackRate.linearRampToValueAtTime(Math.abs(rate), now);
    }
  };

  p5.SoundFile.prototype.getPlaybackRate = function() {
    return this.playbackRate;
  };

  /**
   * Returns the duration of a sound file in seconds.
   *
   * @method duration
   * @return {Number} The duration of the soundFile in seconds.
   */
  p5.SoundFile.prototype.duration = function() {
    // Return Duration
    if (this.buffer) {
      return this.buffer.duration;
    } else {
      return 0;
    }
  };

  /**
   * Return the current position of the p5.SoundFile playhead, in seconds.
   * Note that if you change the playbackRate while the p5.SoundFile is
   * playing, the results may not be accurate.
   *
   * @method currentTime
   * @return {Number}   currentTime of the soundFile in seconds.
   */
  p5.SoundFile.prototype.currentTime = function() {
    // TO DO --> make reverse() flip these values appropriately ?

    var howLong;
    if (this.isPlaying()) {
      var timeSinceStart = p5sound.audiocontext.currentTime - this.startSeconds + this.startTime + this.pauseTime;
      howLong = ( timeSinceStart * this.playbackRate ) % ( this.duration() * this.playbackRate);
        // howLong = ( (p5sound.audiocontext.currentTime - this.startSeconds + this.startTime) * this.source.playbackRate.value ) % this.duration();
      return howLong;
    }
    else if (this.paused){
      return this.pauseTime;
    }
    else {
      return this.startTime;
    }
  };

  /**
   * Move the playhead of the song to a position, in seconds. Start
   * and Stop time. If none are given, will reset the file to play
   * entire duration from start to finish.
   *
   * @method jump
   * @param {Number} cueTime    cueTime of the soundFile in seconds.
   * @param {Number} endTime    endTime of the soundFile in seconds.
   */
  p5.SoundFile.prototype.jump = function(cueTime, endTime) {
    if (cueTime<0 || cueTime > this.buffer.duration) {
      throw 'jump time out of range';
    }
    if (endTime<cueTime || endTime > this.buffer.duration) {
      throw 'end time out of range';
    }
    this.startTime = cueTime || 0;
    if (endTime) {
      this.endTime = endTime;
    } else {
      this.endTime = this.buffer.duration;
    }

    // this.endTime = endTime || this.buffer.duration;
    if (this.isPlaying()){
      var now = p5sound.audiocontext.currentTime;
      this.stop(now);
      this.play(cueTime, this.endTime);
    }
  };

  /**
    * Return the number of channels in a sound file.
    * For example, Mono = 1, Stereo = 2.
    *
    * @method channels
    * @return {Number} [channels]
    */
  p5.SoundFile.prototype.channels = function() {
    return this.buffer.numberOfChannels;
  };

  /**
    * Return the sample rate of the sound file.
    *
    * @method sampleRate
    * @return {Number} [sampleRate]
    */
  p5.SoundFile.prototype.sampleRate = function() {
    return this.buffer.sampleRate;
  };

  /**
    * Return the number of samples in a sound file.
    * Equal to sampleRate * duration.
    *
    * @method frames
    * @return {Number} [sampleCount]
    */
  p5.SoundFile.prototype.frames = function() {
    return this.buffer.length;
  };

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
   * @params {Number} [length] length is the size of the returned array.
   *                          Larger length results in more precision.
   *                          Defaults to 5*width of the browser window.
   * @returns {Float32Array} Array of peaks.
   */
  p5.SoundFile.prototype.getPeaks = function(length) {
    if (this.buffer) {
      // set length to window's width if no length is provided
      if (!length) {
        length = window.width*5;
      }
      if (this.buffer) {
        var buffer = this.buffer;
        var sampleSize = buffer.length / length;
        var sampleStep = ~~(sampleSize / 10) || 1;
        var channels = buffer.numberOfChannels;
        var peaks = new Float32Array(length);

        for (var c = 0; c < channels; c++) {
          var chan = buffer.getChannelData(c);
          for (var i = 0; i < length; i++) {
            var start = ~~(i*sampleSize);
            var end = ~~(start + sampleSize);
            var max = 0;
            for (var j = start; j < end; j+= sampleStep) {
              var value = chan[j];
              if (value > max) {
                max = value;
              // faster than Math.abs
              } else if (-value > max) {
                max = value;
              }
            }
            if (c === 0 || max > peaks[i]) {
              peaks[i] = max;
            }
          }
        }

        return peaks;
      }
    }
    else {
      throw 'Cannot load peaks yet, buffer is not loaded';
    }
  };

  /**
   *  Reverses the p5.SoundFile's buffer source.
   *  Playback must be handled separately (see example).
   *
   *  @method  reverseBuffer
   *  @example
   *  <div><code>
   *  var drum;
   *  
   *  function preload() {
   *    drum = loadSound('assets/drum.mp3');
   *  }
   *
   *  function setup() {
   *    drum.reverseBuffer();
   *    drum.play();
   *  }
   *  
   * </code>
   * </div>
   */
  p5.SoundFile.prototype.reverseBuffer = function() {
    if (this.buffer) {
      Array.prototype.reverse.call( this.buffer.getChannelData(0) );
      Array.prototype.reverse.call( this.buffer.getChannelData(1) );
    // set reversed flag
    this.reversed = !this.reversed;
    // this.playbackRate = -this.playbackRate;
    } else {
      throw 'SoundFile is not done loading';
    }
  };

  // private function for onended behavior
  p5.SoundFile.prototype._onEnded = function(s) {
    s.onended = function(s){
      var now = p5sound.audiocontext.currentTime;
      s.stop(now);
    };
  };

  p5.SoundFile.prototype.add = function() {
    // TO DO
  };

  p5.SoundFile.prototype.dispose = function() {
    if (this.buffer && this.source) {
      for (var i = 0; i < this.sources.length - 1; i++){
        if (this.sources[i] !== null){
          // this.sources[i].disconnect();
          var now = p5sound.audiocontext.currentTime;
          this.sources[i].stop(now);
          this.sources[i] = null;
        }
      }
    }
    if (this.output){
      this.output.disconnect();
      this.output = null;
    }
    if (this.panner) {
      this.panner.disconnect();
      this.panner = null;
    }
  };

  /**
   * Connects the output of a p5sound object to input of another
   * p5.sound object. For example, you may connect a p5.SoundFile to an
   * FFT or an Effect. If no parameter is given, it will connect to
   * the master output. Most p5sound objects connect to the master
   * output when they are created.
   *
   * @method connect
   * @param {Object} [object] Audio object that accepts an input
   */
  p5.SoundFile.prototype.connect = function(unit) {
    if (!unit) {
       this.panner.connect(p5sound.input);
    }
    else {
      if (unit.hasOwnProperty('input')){
        this.panner.connect(unit.input);
      } else {
        this.panner.connect(unit);
      }
    }
  };

  /**
   * Disconnects the output of this p5sound object.
   *
   * @method disconnect
   */
  p5.SoundFile.prototype.disconnect = function(unit){
    this.panner.disconnect(unit);
  };

  /**
   *  Read the Amplitude (volume level) of a p5.SoundFile. The
   *  p5.SoundFile class contains its own instance of the Amplitude
   *  class to help make it easy to get a SoundFile's volume level.
   *  Accepts an optional smoothing value (0.0 < 1.0).
   *  
   *  @method  getLevel
   *  @param  {Number} [smoothing] Smoothing is 0.0 by default.
   *                               Smooths values based on previous values.
   *  @return {Number}           Volume level (between 0.0 and 1.0)
   */
  p5.SoundFile.prototype.getLevel = function(smoothing) {
    if (smoothing) {
      this.amplitude.smoothing = smoothing;
    }
    return this.amplitude.getLevel();
  };

  /**
   *  Reset the source for this SoundFile to a
   *  new path (URL).
   *
   *  @method  setPath
   *  @param {String}   path     path to audio file
   *  @param {Function} callback Callback
   */
  p5.SoundFile.prototype.setPath = function(p, callback) {
    var path = p5.prototype._checkFileFormats(p);
    this.url = path;
    this.load(callback);
  };

  /**
   *  Replace the current Audio Buffer with a new Buffer.
   *  
   *  @param {Array} buf Array of Float32 Array(s). 2 Float32 Arrays
   *                     will create a stereo source. 1 will create
   *                     a mono source.
   */
  p5.SoundFile.prototype.setBuffer = function(buf){
    var ac = p5sound.audiocontext;
    var newBuffer = ac.createBuffer(2, buf[0].length, ac.sampleRate);
    var numChannels = 0;
    for (var channelNum = 0; channelNum < buf.length; channelNum++){
      var channel = newBuffer.getChannelData(channelNum);
      channel.set(buf[channelNum]);
      numChannels++;
    }
    this.buffer = newBuffer;

    // set numbers of channels on input to the panner
    this.panner.inputChannels(numChannels);
  };

});
