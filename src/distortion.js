define(function (require) {
  'use strict';

  var p5sound = require('master');

  /*
   * Adapted from [Kevin Ennis on StackOverflow](http://stackoverflow.com/questions/22312841/waveshaper-node-in-webaudio-how-to-emulate-distortion)
   */
  function makeDistortionCurve(amount) {
    var k = typeof amount === 'number' ? amount : 50;
    var n_samples = 44100;
    var curve = new Float32Array(n_samples);
    var deg = Math.PI / 180;
    var i = 0;
    var x;
    for ( ; i < n_samples; ++i ) {
      x = i * 2 / n_samples - 1;
      curve[i] = ( 3 + k ) * x * 20 * deg / ( Math.PI + k * Math.abs(x) );
    }
    return curve;
  }

  /**
   * A Distortion effect created with a Waveshaper Node,
   * with an approach adapted from
   * [Kevin Ennis](http://stackoverflow.com/questions/22312841/waveshaper-node-in-webaudio-how-to-emulate-distortion)
   *
   * @class p5.Distortion
   * @constructor
   * @param {Number} [amount=0.25] Unbounded distortion amount.
   *                                Normal values range from 0-1.
   * @param {String} [oversample='none'] 'none', '2x', or '4x'.
   *
   * @return {Object}   Distortion object
   */
  p5.Distortion = function(amount, oversample) {
    if (typeof amount === 'undefined') {
      amount = 0.25;
    } if (typeof amount !== 'number') {
      throw new Error('amount must be a number');
    } if (typeof oversample === 'undefined') {
      oversample = '2x';
    } if (typeof oversample !== 'string') {
      throw new Error('oversample must be a String')
    }

    var curveAmount = p5.prototype.map(amount, 0.0, 1.0, 0, 2000);
    this.ac = p5sound.audiocontext;

    this.input = this.ac.createGain();
    this.output = this.ac.createGain();

    /**
     *  The p5.Distortion is built with a
     *  <a href="http://www.w3.org/TR/webaudio/#WaveShaperNode">
     *  Web Audio WaveShaper Node</a>.
     *
     *  @property WaveShaperNode
     *  @type {Object}  AudioNode
     */
     this.waveShaperNode = this.ac.createWaveShaper();

     this.amount = curveAmount;
     this.waveShaperNode.curve = makeDistortionCurve(curveAmount);
     this.waveShaperNode.oversample = oversample;

     this.input.connect(this.waveShaperNode);
     this.waveShaperNode.connect(this.output);

     this.connect();

     // add to the soundArray
     p5sound.soundArray.push(this);
  }

  p5.Distortion.prototype.process = function(src, amount, oversample) {
    src.connect(this.input);
    this.set(amount, oversample);
  }

  /**
   * Set the amount and oversample of the waveshaper distortion.
   *
   * @method setType
   * @param {Number} [amount=0.25] Unbounded distortion amount.
   *                                Normal values range from 0-1.
   * @param {String} [oversample='none'] 'none', '2x', or '4x'.
   * @param {String}
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
  }

  /**
   *  Return the distortion amount, typically between 0-1.
   *  
   *  @method  getAmount
   *  @return {Number} Unbounded distortion amount.
   *                   Normal values range from 0-1.
   */
  p5.Distortion.prototype.getAmount = function() {
    return this.amount;
  }

  /**
   *  Return the oversampling.
   *  
   *  @return {String} Oversample can either be 'none', '2x', or '4x'.
   */
  p5.Distortion.prototype.getOversample = function() {
    return this.waveShaperNode.oversample;
  }

  /**
   *  Send output to a p5.sound or web audio object
   *
   *  @method connect
   *  @param  {Object} unit
   */
  p5.Distortion.prototype.connect = function(unit) {
    var u = unit || p5.soundOut.input;
    this.output.connect(u);
  };

  /**
   *  Disconnect all output.
   *
   *  @method disconnect
   */
  p5.Distortion.prototype.disconnect = function() {
    this.output.disconnect();
  };

  p5.Distortion.prototype.dispose = function() {
    var index = p5sound.soundArray.indexOf(this);
    p5sound.soundArray.splice(index, 1);

    this.input.disconnect();
    this.waveShaperNode.disconnect();
    this.input = null;
    this.waveShaperNode = null;

    if (typeof this.output !== 'undefined') {
      this.output.disconnect();
      this.output = null;
    }
  }
});
