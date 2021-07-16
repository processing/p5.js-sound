import p5sound from './main';
import Clock from 'Tone/core/Clock';

/**
 * SoundLoop
 *
 * @class p5.SoundLoop
 * @constructor
 *
 * @param {Function} callback this function will be called on each iteration of theloop
 * @param {Number|String} [interval] amount of time (if a number) or beats (if a string, following <a href = "https://github.com/Tonejs/Tone.js/wiki/Time">Tone.Time</a> convention) for each iteration of the loop. Defaults to 1 second.
 *
 * @example
 * <div><code>
 *  let synth, soundLoop;
 *  let notePattern = [60, 62, 64, 67, 69, 72];
 *
 *  function setup() {
 *    let cnv = createCanvas(100, 100);
 *    cnv.mousePressed(canvasPressed);
 *    colorMode(HSB);
 *    background(0, 0, 86);
 *    text('tap to start/stop', 10, 20);
 *
 *    //the looper's callback is passed the timeFromNow
 *    //this value should be used as a reference point from
 *    //which to schedule sounds
 *    let intervalInSeconds = 0.2;
 *    soundLoop = new p5.SoundLoop(onSoundLoop, intervalInSeconds);
 *
 *    synth = new p5.MonoSynth();
 * }
 *
 * function canvasPressed() {
 *   // ensure audio is enabled
 *   userStartAudio();
 *
 *   if (soundLoop.isPlaying) {
 *     soundLoop.stop();
 *   } else {
 *     // start the loop
 *     soundLoop.start();
 *   }
 * }
 *
 * function onSoundLoop(timeFromNow) {
 *   let noteIndex = (soundLoop.iterations - 1) % notePattern.length;
 *   let note = midiToFreq(notePattern[noteIndex]);
 *   synth.play(note, 0.5, timeFromNow);
 *   background(noteIndex * 360 / notePattern.length, 50, 100);
 * }
 * </code></div>
 */
class SoundLoop {
  constructor(callback, interval) {
    /**
     * Getters and Setters, setting any paramter will result in a change in the clock's
     * frequency, that will be reflected after the next callback
     * beats per minute (defaults to 60)
     * @property {Number} bpm
     * @for p5.SoundLoop
     */
    Object.defineProperty(this, 'bpm', {
      get: function () {
        return this._bpm;
      },
      set: function (bpm) {
        if (!this.musicalTimeMode) {
          console.warn(
            'Changing the BPM in "seconds" mode has no effect. ' +
              'BPM is only relevant in musicalTimeMode ' +
              'when the interval is specified as a string ' +
              '("2n", "4n", "1m"...etc)'
          );
        }
        this._bpm = bpm;
        this._update();
      },
    });

    /**
     * number of quarter notes in a measure (defaults to 4)
     * @property {Number} timeSignature
     * @for p5.SoundLoop
     */
    Object.defineProperty(this, 'timeSignature', {
      get: function () {
        return this._timeSignature;
      },
      set: function (timeSig) {
        if (!this.musicalTimeMode) {
          console.warn(
            'Changing the timeSignature in "seconds" mode has no effect. ' +
              'BPM is only relevant in musicalTimeMode ' +
              'when the interval is specified as a string ' +
              '("2n", "4n", "1m"...etc)'
          );
        }
        this._timeSignature = timeSig;
        this._update();
      },
    });

    /**
     * length of the loops interval
     * @property {Number|String} interval
     * @for p5.SoundLoop
     */
    Object.defineProperty(this, 'interval', {
      get: function () {
        return this._interval;
      },
      set: function (interval) {
        this.musicalTimeMode = typeof interval === 'number' ? false : true;
        this._interval = interval;
        this._update();
      },
    });

    /**
     * how many times the callback has been called so far
     * @property {Number} iterations
     * @for p5.SoundLoop
     * @readonly
     */
    Object.defineProperty(this, 'iterations', {
      get: function () {
        return this.clock.ticks;
      },
    });

    this.callback = callback;
    /**
     * musicalTimeMode uses <a href = "https://github.com/Tonejs/Tone.js/wiki/Time">Tone.Time</a> convention
     * true if string, false if number
     * @property {Boolean} musicalTimeMode
     */
    this.musicalTimeMode = typeof this._interval === 'number' ? false : true;

    this._interval = interval || 1;

    /**
     * musicalTimeMode variables
     * modify these only when the interval is specified in musicalTime format as a string
     */
    this._timeSignature = 4;
    this._bpm = 60;

    this.isPlaying = false;

    /**
     * Set a limit to the number of loops to play. defaults to Infinity
     * @property {Number} maxIterations
     */
    this.maxIterations = Infinity;
    var self = this;

    this.clock = new Clock({
      callback: function (time) {
        var timeFromNow = time - p5sound.audiocontext.currentTime;
        /**
         * Do not initiate the callback if timeFromNow is < 0
         * This ususually occurs for a few milliseconds when the page
         * is not fully loaded
         *
         * The callback should only be called until maxIterations is reached
         */
        if (
          timeFromNow > 0 &&
          self.iterations <= self.maxIterations &&
          self.callback
        ) {
          self.callback(timeFromNow);
        }
      },
      frequency: this._calcFreq(),
    });
  }

  /**
   * Start the loop
   * @method  start
   * @for p5.SoundLoop
   * @param  {Number} [timeFromNow] schedule a starting time
   */
  start(timeFromNow) {
    var t = timeFromNow || 0;
    var now = p5sound.audiocontext.currentTime;
    if (!this.isPlaying) {
      this.clock.start(now + t);
      this.isPlaying = true;
    }
  }

  /**
   * Stop the loop
   * @method  stop
   * @for p5.SoundLoop
   * @param  {Number} [timeFromNow] schedule a stopping time
   */
  stop(timeFromNow) {
    var t = timeFromNow || 0;
    var now = p5sound.audiocontext.currentTime;
    if (this.isPlaying) {
      this.clock.stop(now + t);
      this.isPlaying = false;
    }
  }

  /**
   * Pause the loop
   * @method pause
   * @for p5.SoundLoop
   * @param  {Number} [timeFromNow] schedule a pausing time
   */
  pause(timeFromNow) {
    var t = timeFromNow || 0;
    var now = p5sound.audiocontext.currentTime;
    if (this.isPlaying) {
      this.clock.pause(now + t);
      this.isPlaying = false;
    }
  }

  /**
   * Synchronize loops. Use this method to start two or more loops in synchronization
   * or to start a loop in synchronization with a loop that is already playing
   * This method will schedule the implicit loop in sync with the explicit master loop
   * i.e. loopToStart.syncedStart(loopToSyncWith)
   *
   * @method  syncedStart
   * @for p5.SoundLoop
   * @param  {Object} otherLoop   a p5.SoundLoop to sync with
   * @param  {Number} [timeFromNow] Start the loops in sync after timeFromNow seconds
   */
  syncedStart(otherLoop, timeFromNow) {
    var t = timeFromNow || 0;
    var now = p5sound.audiocontext.currentTime;

    if (!otherLoop.isPlaying) {
      otherLoop.clock.start(now + t);
      otherLoop.isPlaying = true;
      this.clock.start(now + t);
      this.isPlaying = true;
    } else if (otherLoop.isPlaying) {
      var time = otherLoop.clock._nextTick - p5sound.audiocontext.currentTime;
      this.clock.start(now + time);
      this.isPlaying = true;
    }
  }
  /**
   * Updates frequency value, reflected in next callback
   * @private
   * @for p5.SoundLoop
   * @method  _update
   */
  _update() {
    this.clock.frequency.value = this._calcFreq();
  }

  /**
   * Calculate the frequency of the clock's callback based on bpm, interval, and timesignature
   * @private
   * @for p5.SoundLoop
   * @method  _calcFreq
   * @return {Number} new clock frequency value
   */
  _calcFreq() {
    //Seconds mode, bpm / timesignature has no effect
    if (typeof this._interval === 'number') {
      this.musicalTimeMode = false;
      return 1 / this._interval;
    }
    //Musical timing mode, calculate interval based bpm, interval,and time signature
    else if (typeof this._interval === 'string') {
      this.musicalTimeMode = true;
      return (
        (this._bpm / 60 / this._convertNotation(this._interval)) *
        (this._timeSignature / 4)
      );
    }
  }

  /**
   * Convert notation from musical time format to seconds
   * Uses <a href = "https://github.com/Tonejs/Tone.js/wiki/Time">Tone.Time</a> convention
   * @private
   * @for p5.SoundLoop
   * @method _convertNotation
   * @param  {String} value value to be converted
   * @return {Number}       converted value in seconds
   */
  _convertNotation(value) {
    var type = value.slice(-1);
    value = Number(value.slice(0, -1));
    switch (type) {
      case 'm':
        return this._measure(value);
      case 'n':
        return this._note(value);
      default:
        console.warn(
          'Specified interval is not formatted correctly. See Tone.js ' +
            'timing reference for more info: https://github.com/Tonejs/Tone.js/wiki/Time'
        );
    }
  }

  /**
   * Helper conversion methods of measure and note
   * @private
   * @for p5.SoundLoop
   * @method  _measure
   */
  _measure(value) {
    return value * this._timeSignature;
  }

  /**
   * @private
   * @method  _note
   * @for p5.SoundLoop
   */
  _note(value) {
    return this._timeSignature / value;
  }
}

export default SoundLoop;
