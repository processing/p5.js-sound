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
   * peaks in volume) and is especially useful when many sounds are played 
   * at once. Compression can be used on indivudal sound sources in addition
   * to the master output.  
   *
   * This class extends <a href = "/reference/#/p5.Effect">p5.Effect</a>.  
   * Methods <a href = "/reference/#/p5.Effect/amp">amp()</a>, <a href = "/reference/#/p5.Effect/chain">chain()</a>, 
   * <a href = "/reference/#/p5.Effect/drywet">drywet()</a>, <a href = "/reference/#/p5.Effect/connect">connect()</a>, and 
   * <a href = "/reference/#/p5.Effect/disconnect">disconnect()</a> are available.
   *
   * @class p5.Compressor
   * @constructor
   * @extends p5.Effect
   *
   * 
   */
	p5.Compressor = function() {
		Effect.call(this);

    /**
     * The p5.Compressor is built with a <a href="https://www.w3.org/TR/webaudio/#the-dynamicscompressornode-interface" 
   *   target="_blank" title="W3 spec for Dynamics Compressor Node">Web Audio Dynamics Compressor Node
   *   </a>
     * @property {WebAudioNode} compressor 
     */
    

		this.compressor = this.ac.createDynamicsCompressor();

    this.input.connect(this.compressor);
    this.compressor.connect(this.wet);
	};

	p5.Compressor.prototype = Object.create(Effect.prototype);


 /**
  * Performs the same function as .connect, but also accepts
  * optional parameters to set compressor's audioParams
  * @method process 
  *
  * @param {Object} src         Sound source to be connected
  * 
  * @param {Number} [attack]     The amount of time (in seconds) to reduce the gain by 10dB,
  *                            default = .003, range 0 - 1
  * @param {Number} [knee]       A decibel value representing the range above the 
  *                            threshold where the curve smoothly transitions to the "ratio" portion.
  *                            default = 30, range 0 - 40
  * @param {Number} [ratio]      The amount of dB change in input for a 1 dB change in output
  *                            default = 12, range 1 - 20
  * @param {Number} [threshold]  The decibel value above which the compression will start taking effect
  *                            default = -24, range -100 - 0
  * @param {Number} [release]    The amount of time (in seconds) to increase the gain by 10dB
  *                            default = .25, range 0 - 1
  */
	p5.Compressor.prototype.process = function(src, _attack, _knee, 
                                      _ratio, _threshold, _release) {
		src.connect(this.input);
		this.set(_attack, _knee, _ratio, _threshold, _release);
	};


  p5.Compressor.prototype.default = {
    "_attack" : .01,
    "_knee" : 0.7,
    "_ratio" : 2,
    "_threshold" : -21.5,
    "_release" : .1,
    "_effectDefault": null
  };

  p5.Compressor.prototype.crudeCompression = {
    "_attack" : .001,
    "_knee" : 0,
    "_ratio" : 12.6,
    "_threshold" : -31.9,
    "_release" : .012,
    "_effectDefault": null
  };

  p5.Compressor.prototype.gentleCompression = {
    "_attack" : .001,
    "_knee" : 12,
    "_ratio" : 1.5,
    "_threshold" : -21.5,
    "_release" : .1,
    "_effectDefault": null
  };


  /**
   * Set the paramters of a compressor. 
   * @method  set
   * @param {Number} attack     The amount of time (in seconds) to reduce the gain by 10dB,
   *                            default = .003, range 0 - 1
   * @param {Number} knee       A decibel value representing the range above the 
   *                            threshold where the curve smoothly transitions to the "ratio" portion.
   *                            default = 30, range 0 - 40
   * @param {Number} ratio      The amount of dB change in input for a 1 dB change in output
   *                            default = 12, range 1 - 20
   * @param {Number} threshold  The decibel value above which the compression will start taking effect
   *                            default = -24, range -100 - 0
   * @param {Number} release    The amount of time (in seconds) to increase the gain by 10dB
   *                            default = .25, range 0 - 1
   */
  p5.Compressor.prototype.set = function (_attack, _knee, 
                                _ratio, _threshold, _release) {

    if (typeof _attack !== 'undefined') {this.attack(_attack);}
    if (typeof _knee !== 'undefined') {this.knee(_knee);}
    if (typeof _ratio !== 'undefined') {this.ratio(_ratio);}
    if (typeof _threshold !== 'undefined') {this.threshold(_threshold);}
    if (typeof _release !== 'undefined') {this.release(_release);}
  };


  /**
   * Get current attack or set value w/ time ramp
   * 
   * 
   * @method attack
   * @param {Number} [attack] Attack is the amount of time (in seconds) to reduce the gain by 10dB,
   *                          default = .003, range 0 - 1
   * @param {Number} [time]  Assign time value to schedule the change in value
   */
  p5.Compressor.prototype.attack = function (_attack, time){
    var t = time || 0;
    if (typeof _attack == 'number'){
      this.compressor.attack.value = _attack;
      this.compressor.attack.cancelScheduledValues(this.ac.currentTime + 0.01 + t);
      this.compressor.attack.linearRampToValueAtTime(_attack, this.ac.currentTime + 0.02 + t);
    } else if (typeof _attack !== 'undefined') {
        _attack.connect(this.compressor.attack);
    }
    return this.compressor.attack.value;
  };


 /**
   * Get current knee or set value w/ time ramp
   * 
   * @method knee
   * @param {Number} [knee] A decibel value representing the range above the 
   *                        threshold where the curve smoothly transitions to the "ratio" portion.
   *                        default = 30, range 0 - 40
   * @param {Number} [time]  Assign time value to schedule the change in value
   */
  p5.Compressor.prototype.knee = function (_knee, time){
    var t = time || 0;
    if (typeof _knee == 'number'){
      this.compressor.knee.value = _knee;
      this.compressor.knee.cancelScheduledValues(this.ac.currentTime + 0.01 + t);
      this.compressor.knee.linearRampToValueAtTime(_knee, this.ac.currentTime + 0.02 + t);
    } else if (typeof _knee !== 'undefined') {
        _knee.connect(this.compressor.knee);
    }
    return this.compressor.knee.value;
  };


  /**
   * Get current ratio or set value w/ time ramp
   * @method ratio
   *
   * @param {Number} [ratio]      The amount of dB change in input for a 1 dB change in output
   *                            default = 12, range 1 - 20 
   * @param {Number} [time]  Assign time value to schedule the change in value
   */
  p5.Compressor.prototype.ratio = function (_ratio, time){
    var t = time || 0;
    if (typeof _ratio == 'number'){
      this.compressor.ratio.value = _ratio;
      this.compressor.ratio.cancelScheduledValues(this.ac.currentTime + 0.01 + t);
      this.compressor.ratio.linearRampToValueAtTime(_ratio, this.ac.currentTime + 0.02 + t);
    } else if (typeof _ratio !== 'undefined') {
        _ratio.connect(this.compressor.ratio);
    }
    return this.compressor.ratio.value;
  };


  /**
   * Get current threshold or set value w/ time ramp
   * @method threshold
   *
   * @param {Number} threshold  The decibel value above which the compression will start taking effect
   *                            default = -24, range -100 - 0
   * @param {Number} [time]  Assign time value to schedule the change in value
   */
  p5.Compressor.prototype.threshold = function (_threshold, time){
    var t = time || 0;
    if (typeof _threshold == 'number'){
      this.compressor.threshold.value = _threshold;
      this.compressor.threshold.cancelScheduledValues(this.ac.currentTime + 0.01 + t);
      this.compressor.threshold.linearRampToValueAtTime(_threshold, this.ac.currentTime + 0.02 + t);
    } else if (typeof _threshold !== 'undefined') {
        _threshold.connect(this.compressor.threshold);
    }
    return this.compressor.threshold.value;
  };


  /**
   * Get current release or set value w/ time ramp
   * @method release
   *
   * @param {Number} release    The amount of time (in seconds) to increase the gain by 10dB
   *                            default = .25, range 0 - 1
   *
   * @param {Number} [time]  Assign time value to schedule the change in value
   */
  p5.Compressor.prototype.release = function (_release, time){
    var t = time || 0;
    if (typeof _release == 'number'){
      this.compressor.release.value = _release;
      this.compressor.release.cancelScheduledValues(this.ac.currentTime + 0.01 + t);
      this.compressor.release.linearRampToValueAtTime(_release, this.ac.currentTime + 0.02 + t);
    } else if (typeof _release !== 'undefined') {
        _release.connect(this.compressor.release);
    }
    return this.compressor.release.value;
  };

  /**
   * Return the current reduction value
   * @return {Number} Value of the amount of gain reduction that is applied to the signal
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
