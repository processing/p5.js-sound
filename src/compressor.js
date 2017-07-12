define(function (require) {
	'use strict';

	var p5sound = require('master');
	var Effect = require('effect');
  var CustomError = require('errorHandler');

  /**
   * Compressor is an audio effect class that performs dynamics compression
   * on an audio input source. This is a very commonly used technique in music
   * and sound production. Compression creates an overall louder, richer, 
   * and fuller sound by lowering the volume of louds and raising that of softs.
   * Compression can be used to avoid clipping (sound distortion due to 
   * peaks in volume) and is especially useful when many sounds are being used 
   * at once. Compression can be used on indivudal sound sources in addition
   * to the master output. This class is built using the 
   * Web Audio Dynamics Compressor Node
   * https://www.w3.org/TR/webaudio/#the-dynamicscompressornode-interface
   *
   * @class p5.Compressor
   * @extends p5.Effect
   * @constructor
   *
   * @example
   * <div><code>
   *
   * </code></div>
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
   *
   * 
   * @param {Number} attack    [default = .003, range 0 - 1]
   * @param {Number} knee      [default = 30, range 0 - 40]
   * @param {Number} ratio     [default = 12, range 1 - 20]
   * @param {Number} threshold [default = -24, range -100 - 0]
   * @param {Number} release   [default = .25, range 0 - 1]
   */
  p5.Compressor.prototype.set = function (attack, knee, 
                                ratio, threshold, release) {

    if (typeof attack !== 'undefined') {this.attack(attack);}
    if (typeof knee !== 'undefined') {this.knee(knee);}
    if (typeof ratio !== 'undefined') {this.ratio(ratio);}
    if (typeof threshold !== 'undefined') {this.threshold(threshold);}
    if (typeof release !== 'undefined') {this.release(release);}
  };


  /**
   * set attack w/ time ramp or get current attack
   * @method attack
   */
  p5.Compressor.prototype.attack = function (attack, time){
    var t = time || 0;
    if (typeof attack == 'number'){
      this.compressor.attack.value = attack;
      this.compressor.attack.cancelScheduledValues(this.ac.currentTime + 0.01 + t);
      this.compressor.attack.linearRampToValueAtTime(attack, this.ac.currentTime + 0.02 + t);
    } else if (typeof attack !== 'undefined') {
        attack.connect(this.compressor.attack);
    }
    return this.compressor.attack.value;
  };


 /**
   * set knee w/ time ramp or get current knee
   * @method knee
   */
  p5.Compressor.prototype.knee = function (knee, time){
    var t = time || 0;
    if (typeof knee == 'number'){
      this.compressor.knee.value = knee;
      this.compressor.knee.cancelScheduledValues(this.ac.currentTime + 0.01 + t);
      this.compressor.knee.linearRampToValueAtTime(knee, this.ac.currentTime + 0.02 + t);
    } else if (typeof knee !== 'undefined') {
        knee.connect(this.compressor.knee);
    }
    return this.compressor.knee.value;
  };


  /**
   * set ratio w/ time ramp or get current ratio
   * @method ratio
   */
  p5.Compressor.prototype.ratio = function (ratio, time){
    var t = time || 0;
    if (typeof ratio == 'number'){
      this.compressor.ratio.value = ratio;
      this.compressor.ratio.cancelScheduledValues(this.ac.currentTime + 0.01 + t);
      this.compressor.ratio.linearRampToValueAtTime(ratio, this.ac.currentTime + 0.02 + t);
    } else if (typeof ratio !== 'undefined') {
        ratio.connect(this.compressor.ratio);
    }
    return this.compressor.ratio.value;
  };


  /**
   * set threshold w/ time ramp or get current threshold
   * @method threshold
   */
  p5.Compressor.prototype.threshold = function (threshold, time){
    var t = time || 0;
    if (typeof threshold == 'number'){
      this.compressor.threshold.value = threshold;
      this.compressor.threshold.cancelScheduledValues(this.ac.currentTime + 0.01 + t);
      this.compressor.threshold.linearRampToValueAtTime(threshold, this.ac.currentTime + 0.02 + t);
    } else if (typeof threshold !== 'undefined') {
        threshold.connect(this.compressor.threshold);
    }
    return this.compressor.threshold.value;
  };


  /**
   * set release w/ time ramp or get current release
   * @method release
   */
  p5.Compressor.prototype.release = function (release, time){
    var t = time || 0;
    if (typeof release == 'number'){
      this.compressor.release.value = release;
      this.compressor.release.cancelScheduledValues(this.ac.currentTime + 0.01 + t);
      this.compressor.release.linearRampToValueAtTime(release, this.ac.currentTime + 0.02 + t);
    } else if (typeof number !== 'undefined') {
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

  return p5.Compressor;
});
