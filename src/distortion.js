import Effect from './effect.js';

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
  for (; i < numSamples; ++i) {
    x = (i * 2) / numSamples - 1;
    curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
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
class Distortion extends Effect {
  constructor(amount, oversample) {
    super();
    if (typeof amount === 'undefined') {
      amount = 0.25;
    }
    if (typeof amount !== 'number') {
      throw new Error('amount must be a number');
    }
    if (typeof oversample === 'undefined') {
      oversample = '2x';
    }
    if (typeof oversample !== 'string') {
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
  }

  /**
   * Process a sound source, optionally specify amount and oversample values.
   *
   * @method process
   * @for p5.Distortion
   * @param {Number} [amount=0.25] Unbounded distortion amount.
   *                                Normal values range from 0-1.
   * @param {String} [oversample='none'] 'none', '2x', or '4x'.
   */
  process(src, amount, oversample) {
    src.connect(this.input);
    this.set(amount, oversample);
  }

  /**
   * Set the amount and oversample of the waveshaper distortion.
   *
   * @method set
   * @for p5.Distortion
   * @param {Number} [amount=0.25] Unbounded distortion amount.
   *                                Normal values range from 0-1.
   * @param {String} [oversample='none'] 'none', '2x', or '4x'.
   */
  set(amount, oversample) {
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
   *  @for p5.Distortion
   *  @return {Number} Unbounded distortion amount.
   *                   Normal values range from 0-1.
   */
  getAmount() {
    return this.amount;
  }

  /**
   *  Return the oversampling.
   *
   *  @method getOversample
   *  @for p5.Distortion
   *  @return {String} Oversample can either be 'none', '2x', or '4x'.
   */
  getOversample() {
    return this.waveShaperNode.oversample;
  }

  dispose() {
    super.dispose();
    if (this.waveShaperNode) {
      this.waveShaperNode.disconnect();
      this.waveShaperNode = null;
    }
  }
}

export default Distortion;
