'use strict';

define(function (require) {

  var Effect = require('effect');

  /*
   * Adapted from [Kevin Ennis on StackOverflow](http://stackoverflow.com/questions/22312841/waveshaper-node-in-webaudio-how-to-emulate-distortion)
   */
  function makeDistortionCurve(amount) {
    var k = typeof amount === 'number' ? amount : 50;
    var numSamples = 44100;
    var curve = new Float32Array(numSamples);
    var deg = Math.PI / 180;
    var i = 0;
    var x;
    for ( ; i < numSamples; ++i ) {
      x = i * 2 / numSamples - 1;
      curve[i] = ( 3 + k ) * x * 20 * deg / ( Math.PI + k * Math.abs(x) );
    }
    return curve;
  }

  /**
   * A Distortion effect created with a Waveshaper Node,
   * with an approach adapted from
   * [Kevin Ennis](http://stackoverflow.com/questions/22312841/waveshaper-node-in-webaudio-how-to-emulate-distortion)
   * 
   * This class extends <a href = "/reference/#/p5.Effect">p5.Effect</a>.  
   * Methods <a href = "/reference/#/p5.Effect/amp">amp()</a>, <a href = "/reference/#/p5.Effect/chain">chain()</a>, 
   * <a href = "/reference/#/p5.Effect/drywet">drywet()</a>, <a href = "/reference/#/p5.Effect/connect">connect()</a>, and 
   * <a href = "/reference/#/p5.Effect/disconnect">disconnect()</a> are available.
   * 
   * @class p5.Distortion
   * @extends p5.Effect
   * @constructor
   * @param {Number} [amount=0.25] Unbounded distortion amount.
   *                                Normal values range from 0-1.
   * @param {String} [oversample='none'] 'none', '2x', or '4x'.
   *
   */
  p5.Distortion = function(amount, oversample) {
    Effect.call(this);

    if (typeof amount === 'undefined') {
      amount = 0.25;
    } if (typeof amount !== 'number') {
      throw new Error('amount must be a number');
    } if (typeof oversample === 'undefined') {
      oversample = '2x';
    } if (typeof oversample !== 'string') {
      throw new Error('oversample must be a String');
    }

    var curveAmount = p5.prototype.map(amount, 0.0, 1.0, 0, 2000);

    /**
     *  The p5.Distortion is built with a
     *  <a href="http://www.w3.org/TR/webaudio/#WaveShaperNode">
     *  Web Audio WaveShaper Node</a>.
     *
     *  @property {AudioNode} WaveShaperNode
     */
    this.waveShaperNode = this.ac.createWaveShaper();

    this.amount = curveAmount;
    this.waveShaperNode.curve = makeDistortionCurve(curveAmount);
    this.waveShaperNode.oversample = oversample;

    this.input.connect(this.waveShaperNode);

    this.waveShaperNode.connect(this.wet);
  };

  p5.Distortion.prototype = Object.create(Effect.prototype);


  /**
   * Process a sound source, optionally specify amount and oversample values.
   *
   * @method process
   * @param {Number} [amount=0.25] Unbounded distortion amount.
   *                                Normal values range from 0-1.
   * @param {String} [oversample='none'] 'none', '2x', or '4x'.
   */
  p5.Distortion.prototype.process = function(src, amount, oversample) {
    src.connect(this.input);
    this.set(amount, oversample);
  };

  /**
   * Set the amount and oversample of the waveshaper distortion.
   *
   * @method set
   * @param {Number} [amount=0.25] Unbounded distortion amount.
   *                                Normal values range from 0-1.
   * @param {String} [oversample='none'] 'none', '2x', or '4x'.
   */
  p5.Distortion.prototype.set = function(amount, oversample) {
    if (amount) {
      var curveAmount = p5.prototype.map(amount, 0.0, 1.0, 0, 2000);
      this.amount = curveAmount;
      this.waveShaperNode.curve = makeDistortionCurve(curveAmount);
    }
    if (oversample) {
      this.waveShaperNode.oversample = oversample;
    }
  };

  /**
   *  Return the distortion amount, typically between 0-1.
   *
   *  @method  getAmount
   *  @return {Number} Unbounded distortion amount.
   *                   Normal values range from 0-1.
   */
  p5.Distortion.prototype.getAmount = function() {
    return this.amount;
  };

  /**
   *  Return the oversampling.
   *
   *  @method getOversample
   *
   *  @return {String} Oversample can either be 'none', '2x', or '4x'.
   */
  p5.Distortion.prototype.getOversample = function() {
    return this.waveShaperNode.oversample;
  };


  p5.Distortion.prototype.dispose = function() {
    Effect.prototype.dispose.apply(this);
    this.waveShaperNode.disconnect();
    this.waveShaperNode = null;
  };
});
