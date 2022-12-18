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
 * @param {Number} [amount] Unbounded distortion amount.
 *                                Normal values range from 0-1 (defaults to 0.25)
 * @param {String} [oversample] 'none', '2x' (default), or '4x'.
 *  @example
 *  <div><code>
 *  let osc, distortion, fft;
 *
 *  function setup() {
 *    let cnv = createCanvas(100, 100);
 *    fft = new p5.FFT(0, 256);
 *
 *    osc = new p5.TriOsc();
 *    osc.amp(0.3);
 *    osc.freq(375);
 *
 *    distortion = new p5.Distortion();
 *    distortion.process(osc);
 *    cnv.mousePressed(oscStart);
 *  }
 *
 *  function draw() {
 *    background(220);
 *    // set the amount based on mouseX
 *    let amount = constrain(map(mouseX, 0, width, 0, 1), 0, 1);
 *
 *    // multiply the amount to smooth the value
 *    distortion.set(amount * amount);
 *
 *    noStroke();
 *    fill(0);
 *    text('tap to play', 10, 20);
 *    text('amount: ' + amount, 10, 40);
 *
 *    // draw the waveform
 *    var samples = fft.waveform();
 *    drawOscilloscope(samples);
 *  }
 *
 *  //function based on distortion example
 *  function drawOscilloscope(samples) {
 *    var yTranslateScope = 20;
 *    var scopeWidth = width;
 *    var scopeHeight = height;
 *
 *    stroke(0);
 *    strokeWeight(1);
 *    noFill();
 *
 *    beginShape();
 *    for (var sampleIndex in samples) {
 *      var x = map(sampleIndex, 0, samples.length, 0, scopeWidth);
 *      var y = map(samples[sampleIndex], -1, 1, -scopeHeight / 4, scopeHeight / 4);
 *      vertex(x, y + scopeHeight / 2 + yTranslateScope);
 *    }
 *    endShape();
 *  }
 *
 *  function oscStart() {
 *    osc.start();
 *  }
 *
 *  function mouseReleased() {
 *    osc.stop();
 *  }
 *
 *  </code></div>
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
    this.amount = amount;
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
   * @param {Object} src An object that outputs audio
   * @param {Number} [amount] Unbounded distortion amount.
   *                                Normal values range from 0-1.
   * @param {String} [oversample] 'none', '2x', or '4x'.
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
   * @param {Number} [amount] Unbounded distortion amount.
   *                                Normal values range from 0-1.
   * @param {String} [oversample] 'none', '2x', or '4x'.
   */
  set(amount, oversample) {
    if (typeof amount === 'number') {
      var curveAmount = p5.prototype.map(amount, 0.0, 1.0, 0, 2000);
      //this.amount = curveAmount;
      this.amount = amount;
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
