define(function (require) {
	'use strict';

	var p5sound = require('master');
	var Effect = require('effect');
  var CustomError = require('errorHandler');

	p5.Compressor = function() {
		Effect.call(this);

		this.compressor = this.ac.createDynamicsCompressorNode();
    this.input.connect(this.compressor);
    this.compressor.connect(this.wet);
	};

	p5.Compressor.prototype = Object.create(Effect.prototype);

	p5.Compressor.prototype.process = 
      function(src, attack, knee, ratio, threshold, release) {
		src.connect(this.input);


		this.set(attack, knee, ratio, threshold, release);
	};


  p5.Compressor.prototype.set = function (attack, knee, 
                                ratio, threshold, release) {

    var self = this;
    var errorTrace = new Error().stack;

    0 <= attack <= 1 ? this.attack(attack) : console.error("Attack should be a" +
                                              " float between 0 and 1");
    0 <= knee <= 40 ? this.knee(knee) : console.error("Knee should be a" +
                                              " float between 0 and 40");
    1 <= ratio <= 20 ? this.ratio(ratio) : console.error("ratio should be a" +
                                              " float between 1 and 20");
    0 <= threshold <= 40 ? this.threshold(threshold) : console.error("threshold should be a" +
                                              " float between 0 and 1");
    -100 <= release <= 0 ? this.release(release) : console.error("Release should be a" +
                                              " float between -100 and 0");
  };

  p5.Compressor.prototype.attack = function (attack){
    this.compressor.attack.value = attack;
    return this.compressor.attack.value;
  };

  p5.Compressor.prototype.knee = function (knee){
    this.compressor.knee.value = knee;
    return this.compressor.knee.value;
  };

  p5.Compressor.prototype.ratio = function (ratio){
    this.compressor.ratio.value = ratio;
    return this.compressor.ratio.value;
  };

  p5.Compressor.prototype.threshold = function (threshold){
    this.compressor.threshold.value = threshold;
    return this.compressor.threshold.value;
  };

  p5.Compressor.prototype.release = function (release){
    this.compressor.release.value = release;
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