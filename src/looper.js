'use strict';

define(function (require){
  var p5sound = require('master');
  var Metro = require('metro');
  var BPM = 60;

  p5.Looper = function(callback, length) {

    //contents of the looper. will be executed after 
    //each iteration of specified length
    this.callback = callback;
    this.length = length;

    this.loopStep = 0;
    this.isPlaying = false;

    this.tatums = 0.0625;
    this.metro = new Metro();
    this.metro._init();
    this.metro.beatLength(0.0625*4);
    this.bpm = BPM;
    this.metro.setBPM(this.bpm);

    p5sound.parts.push(this);
    
    this.iterations;
    this.isLoop = true;
  };




  p5.Looper.prototype.setIterations = function(_iterations) {
    this.iterations = _iterations;

  };

  p5.Looper.prototype.setLength = function(_length) {
    this.length = _length;
    this.metro.resetSync(this);


  };
  p5.Looper.prototype.click = function() {
    console.log(this.loopStep);
    return true;
  }


  p5.Looper.prototype.start = function(time) {

    this.onended = function() {
      this.loopStep = 0;
    };

    if (!this.isPlaying) {
      this.isPlaying = true;
      this.metro.resetSync(this);
      var t = time || 0;
      this.metro.start(t);
    }

  };

  p5.Looper.prototype.pause = function(time) {
    this.isPlaying = false;
    var t = time || 0;
    this.metro.stop();
  };

  p5.Looper.prototype.stop = function(time) {
    this.loopStep = 0;
    this.pause(time);

  };

  p5.Looper.prototype.setBPM = function(tempo, rampTime) {
    this.metro.setBPM(tempo, rampTime);
    this.metro.resetSync(this);
  };

  p5.Looper.prototype.getBPM = function() {
    return this.metro.getBPM();
  };


  return p5.Looper;
});