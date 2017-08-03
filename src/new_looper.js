'use strict';

define(function (require){
  var p5sound = require('master');
  var Metro = require('metro');
  var Clock = require('Tone/core/Clock');
  var BPM = 60;

  p5.Looper = function(callback, interval, BPM) {

    this.callback = callback;
    this._interval = interval;
    this._timeSignature = 4;

    this.bpm = BPM || 60;

    this.clock = new Clock({
      "callback" : this.callback,
      "frequency" : this.calcFreq(this._interval)
    })
  };


  p5.Looper.prototype.start = function(timeFromNow) {
    var t = timeFromNow || 0;
    var now = p5sound.audiocontext.currentTime;
    this.clock.start(now + t);
  };

  p5.Looper.prototype.stop = function(timeFromNow) {
    var t = timeFromNow || 0;
    var now = p5sound.audiocontext.currentTime;
    this.clock.stop(now + t);
  };

  p5.Looper.prototype.pause  = function(time) {
    this.clock.pause(time);
  };

  p5.Looper.prototype.setBPM = function (bpm) {
    this.bpm = bpm;
    this.changeInterval(this._interval);
  }

  p5.Looper.prototype.setTimeSignature = function(timeSig) {
    this._timeSignature = timeSig;
    this.changeInterval(this._interval);
  }

  p5.Looper.prototype.changeInterval = function(newInterval){
    this._interval = newInterval;
    this.clock.frequency.value = this.calcFreq(this._interval);
  }

  p5.Looper.prototype.calcFreq = function(interval) {
    if (typeof interval === 'number') {
      return this.bpm / 60 / interval * (this._timeSignature / 4);
    } else if (typeof interval === 'string') {
      return this.bpm / 60 / this._convertNotation(interval) * (this._timeSignature) / 4;
    }
  };

  p5.Looper.prototype._convertNotation = function(value) {
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

  }

  p5.Looper.prototype._measure = function(value) {
    return value;
  } 

  p5.Looper.prototype._note = function(value) {
    return 1 / value;
  } 


  return p5.Looper;
  
});