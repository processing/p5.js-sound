define(function (require) {
	'use strict';

	var p5sound = require('master');
	var Effect = require('effect');
  var CustomError = require('errorHandler');

	p5.Compressor = function() {
		Effect.call(this);

		this.compressor = this.ac.createDynamicsCompressor();
    this.input.connect(this.compressor);
    this.compressor.connect(this.wet);
	};

	p5.Compressor.prototype = Object.create(Effect.prototype);

	p5.Compressor.prototype.process = function(src, attack, knee, 
                                      ratio, threshold, release) {
		src.connect(this.input);
		this.set(attack, knee, ratio, threshold, release);
	};


  p5.Compressor.prototype.set = function (attack, knee, 
                                ratio, threshold, release) {

    if (attack != 'undefined') {this.attack(attack);}
    if (knee != 'undefined') {this.knee(knee);}
    if (ratio != 'undefined') {this.ratio(ratio);}
    if (threshold != 'undefined') {this.threshold(threshold);}
    if (release != 'undefined') {this.release(release);}
  };


  p5.Compressor.prototype.attack = function (attack, time){
    var self = this;
    var t = time || 0;
    if (typeof(attack) == 'number'){
      self.compressor.attack.value = attack;
      self.compressor.attack.value.cancelScheduledValues(self.ac.currentTime + 0.01 + t);
      self.compressor.attack.value.linearRampToValueAtTime(attack, self.ac.currentTime + 0.02 + t);
    } else if (attack) {
        attack.connect(this.compressor.attack);
    }
    return this.compressor.attack.value;
  };


  p5.Compressor.prototype.knee = function (knee, time){
    var self = this;
    var t = time || 0;
    if (typeof(knee) == 'number'){
      self.compressor.knee.value = knee;
      self.compressor.knee.value.cancelScheduledValues(self.ac.currentTime + 0.01 + t);
      self.compressor.knee.value.linearRampToValueAtTime(ratio, self.ac.currentTime + 0.02 + t);
    } else if (knee) {
        knee.connect(this.compressor.knee);
    }
    return this.compressor.knee.value;
  };


  p5.Compressor.prototype.ratio = function (ratio, time){
    var self = this;
    var t = time || 0;
    if (typeof(ratio) == 'number'){
      self.compressor.ratio.value = ratio;
      self.compressor.ratio.value.cancelScheduledValues(self.ac.currentTime + 0.01 + t);
      self.compressor.ratio.value.linearRampToValueAtTime(ratio, self.ac.currentTime + 0.02 + t);
    } else if (ratio) {
        ratio.connect(this.compressor.ratio);
    }
    return this.compressor.ratio.value;
  };


  p5.Compressor.prototype.threshold = function (threshold, time){
    var self = this;
    var t = time || 0;
    if (typeof(threshold) == 'number'){
      self.compressor.threshold.value = threshold;
      self.compressor.threshold.value.cancelScheduledValues(self.ac.currentTime + 0.01 + t);
      self.compressor.threshold.value.linearRampToValueAtTime(threshold, self.ac.currentTime + 0.02 + t);
    } else if (threshold) {
        threshold.connect(this.compressor.threshold);
    }
    return this.compressor.threshold.value;
  };


  p5.Compressor.prototype.release = function (release, time){
    var self = this;
    var t = time || 0;
    if (typeof(release) == 'number'){
      self.compressor.release.value = release;
      self.compressor.release.value.cancelScheduledValues(self.ac.currentTime + 0.01 + t);
      self.compressor.release.value.linearRampToValueAtTime(release, self.ac.currentTime + 0.02 + t);
    } else if (release) {
        release.connect(this.compressor.release);
    }
    return this.compressor.release.value;
  };


  p5.Compressor.prototype.reduction =function() {
    return this.compressor.reduction.value;
  };


	p5.Compressor.prototype.dispose = function() {
		Effect.prototype.dispose.apply(this);

		this.compressor.disconnect();
		this.compressor = undefined;
	};


});