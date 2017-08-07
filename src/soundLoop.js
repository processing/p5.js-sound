'use strict';

define(function (require) {
  var p5sound = require('master');
  var Clock = require('Tone/core/Clock');

  /**
   * SoundLoop
   *
   * @class p5.SoundLoop
   * @constructor
   */
  p5.SoundLoop = function(callback, interval, BPM) {

    this.callback = callback;

    this.musicalTimeMode = typeof this._interval === 'number' ? false : true;
    this._interval = interval;

    //These variables should only be modified if using musicalTimeMode
    //If these variables are modified when interval is measured in seconds,
    //the interval will become inaccurate. 
    //ex. 8 second interval at 60BPM in 4/4 time will be 8 seconds long
    //8 second interval at 120BPM in 5/4 time will be 3.2 seconds long
    this._timeSignature = 4;
    this._bpm = BPM || 60;

    this.isPlaying = false;
    var self = this;
    this.clock = new Clock({
      'callback' : function(time) {
        var timeFromNow = time - p5sound.audiocontext.currentTime;
        if (timeFromNow > 0) {self.callback(timeFromNow);}
      },
      'frequency' : this._calcFreq()
    });
  };

  /**
   * Start the loop
   * @method  start
   * @param  {Number} [timeFromNow] schedule a starting time
   */
  p5.SoundLoop.prototype.start = function(timeFromNow) {
    var t = timeFromNow || 0;
    var now = p5sound.audiocontext.currentTime;
    if (!this.isPlaying) {
      this.clock.start(now + t);
      this.isPlaying = true;
    }
  };

  /**
   * Stop the loop
   * @method  stop
   * @param  {Number} [timeFromNow] schedule a stopping time
   */
  p5.SoundLoop.prototype.stop = function(timeFromNow) {
    var t = timeFromNow || 0;
    var now = p5sound.audiocontext.currentTime;
    if (this.isPlaying) {
      this.clock.stop(now + t);
      this.isPlaying = false;
    }
  };
  /**
   * Start the loop
   * @method pause
   * @param  {Number} [timeFromNow] schedule a pausing time
   */
  p5.SoundLoop.prototype.pause  = function(timeFromNow) {
    var t = timeFromNow || 0;
    if (this.isPlaying) {
      this.clock.pause(t);
      this.isPlaying = false;
    }
  };

  //use synced start to start 2 loops at the same time
  //OR
  //sync the start of one loop with one that is already playing
  //loop.syncedStart(someother loop)
  //
  //
  //loopToStart.syncedStart( loopToSyncWtih );
  //
  /**
   * Synchronize loops. Use this method to start two more more loops in synchronization
   * or to start a loop in synchronization with a loop that is already playing
   * This method will schedule the implicit loop in sync with the explicit master loop
   * i.e. loopToStart.syncedStart(loopToSyncWith)
   * 
   * @method  syncedStart
   * @param  {Object} otherLoop   a p5.SoundLoop to sync with 
   * @param  {Number} [timeFromNow] Start the loops in sync after timeFromNow seconds
   */
  p5.SoundLoop.prototype.syncedStart = function(otherLoop, timeFromNow) {
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
  };



  /**
   * Updates frequency value, reflected in next callback
   * @private
   * @method  _update
   */
  p5.SoundLoop.prototype._update = function() {
    this.clock.frequency.value = this._calcFreq();
  };

  /**
   * Calculate the frequency of the clock's callback based on bpm, interval, and timesignature
   * @private
   * @method  _calcFreq
   * @return {Number} new clock frequency value
   */
  p5.SoundLoop.prototype._calcFreq = function() {
    if (typeof this._interval === 'number') {
      this.musicalTimeMode = false;
      return this._bpm / 60 / this._interval * (this._timeSignature / 4);
    } else if (typeof this._interval === 'string') {
      this.musicalTimeMode = true;
      return this._bpm / 60 / this._convertNotation(this._interval) * (this._timeSignature / 4);
    }
  };

  /**
   * Convert notation from musical time format to seconds
   * Uses <a href = "https://github.com/Tonejs/Tone.js/wiki/Time">Tone.Time</a> convention
   * @private
   * @method _convertNotation
   * @param  {String} value value to be converted
   * @return {Number}       converted value in seconds
   */
  p5.SoundLoop.prototype._convertNotation = function(value) {
    var type = value.slice(-1);
    value = Number(value.slice(0,-1));
    switch (type) {
      case 'm':
        return this._measure(value);
      case 'n':
        return this._note(value);
      default:
        console.warn('Specified interval is not formatted correctly. See Tone.js '+
        'timing reference for more info: https://github.com/Tonejs/Tone.js/wiki/Time');
    }
  };

  /**
   * Helper conversion methods of measure and note
   * @private
   * @method  _measure
   * @method  _note
   */
  p5.SoundLoop.prototype._measure = function(value) {
    return value * this._timeSignature;
  };
  p5.SoundLoop.prototype._note = function(value) {
    return this._timeSignature / value ;
  };


  /**
   * Getters and Setters, setting any paramter will result in a change in the clock's
   * frequency, that will be reflected after the next callback
   * @param {Number} bpm 
   * @param {Number} timeSignature
   * @param {Number/String} interval [description]
   */
  Object.defineProperty(p5.SoundLoop.prototype, 'bpm', {
    get : function() {
      return this._bpm;
    },
    set : function(bpm) {
      if (!this.musicalTimeMode) {
        console.warn('Changing the BPM in "seconds" mode is not advised. '+
                            'This will make the specified time interval inaccurate. '+
                            '8 second interval at 60BPM in 4/4 time will be 8 seconds long ' +
                            '8 second interval at 120BPM in 5/4 time will be 3.2 seconds long. '+
                            'Use musical timing notation ("2n", "4n", "1m"...etc');
      }
      this._bpm = bpm;
      this._update();
    }
  });

  Object.defineProperty(p5.SoundLoop.prototype, 'timeSignature', {
    get : function() {
      return this._timeSignature;
    },
    set : function(timeSig) {
      if (!this.musicalTimeMode) {
        console.warn('Changing the time signature in "seconds" mode is not advised. '+
                      'This will make the specified time interval inaccurate. '+
                      '8 second interval at 60BPM in 4/4 time will be 8 seconds long ' +
                      '8 second interval at 120BPM in 5/4 time will be 3.2 seconds long. '+
                      'Use musical timing notation ("2n", "4n", "1m"...etc');
      }
      this._timeSignature = timeSig;
      this._update();
    }
  });

  Object.defineProperty(p5.SoundLoop.prototype, 'interval', {
    get : function() {
      return this._interval;
    },
    set : function(interval) {
      this._interval = interval;
      this._update();
    }
  });

  return p5.SoundLoop;
});
