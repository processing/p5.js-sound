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

    // var self = this;
    // var errorTrace = new Error().stack;

    if (attack) {this.attack(attack);}
    if (knee) {this.knee(knee);}
    if (ratio) {this.ratio(ratio);}
    if (threshold) {this.threshold(threshold);}
    if (release) {this.release(release);}
  };

  p5.Compressor.prototype.attack = function (attack){
    if (attack) {this.compressor.attack.value = attack;}
    return this.compressor.attack.value;
  };

  p5.Compressor.prototype.knee = function (knee){
    if (knee) {this.compressor.knee.value = knee;}
    return this.compressor.knee.value;
  };

  p5.Compressor.prototype.ratio = function (ratio){
    if (ratio) {this.compressor.ratio.value = ratio;}
    return this.compressor.ratio.value;
  };

  p5.Compressor.prototype.threshold = function (threshold){
    if (threshold) {this.compressor.threshold.value = threshold;}
    return this.compressor.threshold.value;
  };

  p5.Compressor.prototype.release = function (release){
    if (release) {this.compressor.release.value = release;}
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