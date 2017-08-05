'use strict';

define(function (require) {
  var p5sound = require('master');
  var Clock = require('Tone/core/Clock');

  p5.SoundLoop = function(callback, interval, BPM) {

    this.callback = callback;

    //set private variables
    this._interval = interval;

    //musicalTimeMode is true if time is specified as "4n", "8n" ...etc
    this.musicalTimeMode = typeof this._interval === 'number' ? false : true;

    //These variables should only be modified if using musicalTimeMode
    //If these variables are modified when interval is measured in seconds,
    //the interval will become inaccurate. 
    //ex. 8 second interval at 60BPM in 4/4 time will be 8 seconds long
    //8 second interval at 120BPM in 5/4 time will be 3.2 seconds long
    this._timeSignature = 4;
    this._bpm = BPM || 60;

    var self = this;
    this.clock = new Clock({
      'callback' : function(time) {
        var timeFromNow = time - p5sound.audiocontext.currentTime;
        self.callback(timeFromNow);
      },
      'frequency' : this.calcFreq()
    });
  };


  p5.SoundLoop.prototype.start = function(timeFromNow) {
    var t = timeFromNow || 0;
    var now = p5sound.audiocontext.currentTime;
    this.clock.start(now + t);
  };

  p5.SoundLoop.prototype.stop = function(timeFromNow) {
    var t = timeFromNow || 0;
    var now = p5sound.audiocontext.currentTime;
    this.clock.stop(now + t);
  };

  p5.SoundLoop.prototype.pause  = function(time) {
    this.clock.pause(time);
  };

  p5.SoundLoop.prototype._update = function() {
    this.clock.frequency.value = this.calcFreq();
  };

  p5.SoundLoop.prototype.calcFreq = function() {
    if (typeof this._interval === 'number') {
      console.log(this._interval);
      return this._bpm / 60 / this._interval * (this._timeSignature / 4);
    } else if (typeof this._interval === 'string') {
      return this._bpm / 60 / this._convertNotation(this._interval) * (this._timeSignature / 4);
    }
  };

  //TIME NOTATION FUNCS
  p5.SoundLoop.prototype._convertNotation = function(value) {
    var type = value.slice(-1);
    value = Number(value.slice(0,-1));
    switch (type) {
      case 'm':
        return this._measure(value);
      case 'n':
        return this._note(value);
      default:
       //console.warn(something);
    }

  };


  p5.SoundLoop.prototype._measure = function(value) {
    return value * this._timeSignature;
  };

  p5.SoundLoop.prototype._note = function(value) {
    return this._timeSignature / value ;
  };

  // PUBLIC VARIABLES 
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
