'use strict';

define(function (require) {
  var p5sound = require('master');
  var Clock = require('Tone/core/Clock');

  p5.SoundLoop = function(callback, interval, BPM) {

    this.callback = callback;
    this._interval = interval;
    this._timeSignature = 4;

    this.bpm = BPM || 60;


    var self = this;
    this.clock = new Clock({
      'callback' : function(time) {
        var timeFromNow = time - p5sound.audiocontext.currentTime;
        self.callback(timeFromNow);
      },
      'frequency' : this.calcFreq(this._interval)
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

  p5.SoundLoop.prototype.setBPM = function (bpm) {
    this.bpm = bpm;
    this.changeInterval(this._interval);
  };

  p5.SoundLoop.prototype.setTimeSignature = function(timeSig) {
    this._timeSignature = timeSig;
    this.changeInterval(this._interval);
  };

  p5.SoundLoop.prototype.changeInterval = function(newInterval) {
    this._interval = newInterval;
    this.clock.frequency.value = this.calcFreq(this._interval);
  };

  p5.SoundLoop.prototype.calcFreq = function(interval) {
    if (typeof interval === 'number') {
      return this.bpm / 60 / interval * (this._timeSignature / 4);
    } else if (typeof interval === 'string') {
      return this.bpm / 60 / this._convertNotation(interval) * this._timeSignature / 4;
    }
  };

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
    return value;
  };

  p5.SoundLoop.prototype._note = function(value) {
    return 1 / value;
  };


  return p5.SoundLoop;

});
