define(function (require) {
	'use strict';

	var p5sound = require('master');
	var Effect = require('effect');
  var CustomError = require('errorHandler');


  /**
   * Built on Web Audio Dynamics Compressor Node
   * https://www.w3.org/TR/webaudio/#the-dynamicscompressornode-interface
   *
   * @class p5.Compressor
   * @return {Object} Compressor Object
   */
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

  /**
   * Set the paramters of the compressor
   * @param {Number} attack    [default = .003, range 0 - 1]
   * @param {Number} knee      [default = 30, range 0 - 40]
   * @param {Number} ratio     [default = 12, range 1 - 20]
   * @param {Number} threshold [default = -24, range -100 - 0]
   * @param {Number} release   [default = .25, range 0 - 1]
   */
  p5.Compressor.prototype.set = function (attack, knee, 
                                ratio, threshold, release) {

    if (attack != 'undefined') {this.attack(attack);}
    if (knee != 'undefined') {this.knee(knee);}
    if (ratio != 'undefined') {this.ratio(ratio);}
    if (threshold != 'undefined') {this.threshold(threshold);}
    if (release != 'undefined') {this.release(release);}
  };



  /**
   * Setter and Getter methdds 
   * @method  {attack} set attack w/ time ramp or get current attack
   * @method  {knee} set knee w/ time ramp or get current knee
   * @method {ratio} set ratio w/ time ramp or get current ratio
   * @method {threshold} set threshold w/ time ramp or get current threshold
   * @method {release} set release w/ time ramp or get current release
   */

  p5.Compressor.prototype.attack = function (attack, time){
    var self = this;
    var t = time || 0;
    if (typeof attack == 'number'){
      self.compressor.attack.value = attack;
      self.compressor.attack.cancelScheduledValues(self.ac.currentTime + 0.01 + t);
      self.compressor.attack.linearRampToValueAtTime(attack, self.ac.currentTime + 0.02 + t);
    } else if (typeof attack != 'undefined') {
        attack.connect(this.compressor.attack);
    }
    return this.compressor.attack.value;
  };


  p5.Compressor.prototype.knee = function (knee, time){
    var self = this;
    var t = time || 0;
    if (typeof knee == 'number'){
      self.compressor.knee.value = knee;
      self.compressor.knee.cancelScheduledValues(self.ac.currentTime + 0.01 + t);
      self.compressor.knee.linearRampToValueAtTime(knee, self.ac.currentTime + 0.02 + t);
    } else if (typeof knee != 'undefined') {
        knee.connect(this.compressor.knee);
    }
    return this.compressor.knee.value;
  };


  p5.Compressor.prototype.ratio = function (ratio, time){
    var self = this;
    var t = time || 0;
    if (typeof ratio == 'number'){
      self.compressor.ratio.value = ratio;
      self.compressor.ratio.cancelScheduledValues(self.ac.currentTime + 0.01 + t);
      self.compressor.ratio.linearRampToValueAtTime(ratio, self.ac.currentTime + 0.02 + t);
    } else if (typeof ratio != 'undefined') {
        ratio.connect(this.compressor.ratio);
    }
    return this.compressor.ratio.value;
  };


  p5.Compressor.prototype.threshold = function (threshold, time){
    var self = this;
    var t = time || 0;
    if (typeof threshold == 'number'){
      self.compressor.threshold.value = threshold;
      self.compressor.threshold.cancelScheduledValues(self.ac.currentTime + 0.01 + t);
      self.compressor.threshold.linearRampToValueAtTime(threshold, self.ac.currentTime + 0.02 + t);
    } else if (typeof threshold != 'undefined') {
        threshold.connect(this.compressor.threshold);
    }
    return this.compressor.threshold.value;
  };


  p5.Compressor.prototype.release = function (release, time){
    var self = this;
    var t = time || 0;
    if (typeof release == 'number'){
      self.compressor.release.value = release;
      self.compressor.release.cancelScheduledValues(self.ac.currentTime + 0.01 + t);
      self.compressor.release.linearRampToValueAtTime(release, self.ac.currentTime + 0.02 + t);
    } else if (typeof number != 'undefined') {
        release.connect(this.compressor.release);
    }
    return this.compressor.release.value;
  };

  /**
   * Return the current reduction value
   * @return {Number} value of the amount of gain reduction that is applied to the signal
   */
  p5.Compressor.prototype.reduction =function() {
    return this.compressor.reduction.value;
  };


	p5.Compressor.prototype.dispose = function() {
		Effect.prototype.dispose.apply(this);

		this.compressor.disconnect();
		this.compressor = undefined;
	};
});
