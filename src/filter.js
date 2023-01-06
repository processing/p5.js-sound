import Effect from './effect';

/**
 *  <p>A p5.Filter uses a Web Audio Biquad Filter to filter
 *  the frequency response of an input source. Subclasses
 *  include:</p>
 *  <a href="/reference/#/p5.LowPass"><code>p5.LowPass</code></a>:
 *  Allows frequencies below the cutoff frequency to pass through,
 *  and attenuates frequencies above the cutoff.<br/>
 *  <a href="/reference/#/p5.HighPass"><code>p5.HighPass</code></a>:
 *  The opposite of a lowpass filter. <br/>
 *  <a href="/reference/#/p5.BandPass"><code>p5.BandPass</code></a>:
 *  Allows a range of frequencies to pass through and attenuates
 *  the frequencies below and above this frequency range.<br/>
 *
 *  The <code>.res()</code> method controls either width of the
 *  bandpass, or resonance of the low/highpass cutoff frequency.
 *
 *  This class extends <a href = "/reference/#/p5.Effect">p5.Effect</a>.
 *  Methods <a href = "/reference/#/p5.Effect/amp">amp()</a>, <a href = "/reference/#/p5.Effect/chain">chain()</a>,
 *  <a href = "/reference/#/p5.Effect/drywet">drywet()</a>, <a href = "/reference/#/p5.Effect/connect">connect()</a>, and
 *  <a href = "/reference/#/p5.Effect/disconnect">disconnect()</a> are available.
 *
 *  @class p5.Filter
 *  @extends p5.Effect
 *  @constructor
 *  @param {String} [type] 'lowpass' (default), 'highpass', 'bandpass'
 *  @example
 *  <div><code>
 *  let fft, noise, filter;
 *
 *  function setup() {
 *    let cnv = createCanvas(100,100);
 *    cnv.mousePressed(makeNoise);
 *    fill(255, 0, 255);
 *
 *    filter = new p5.BandPass();
 *    noise = new p5.Noise();
 *    noise.disconnect();
 *    noise.connect(filter);
 *
 *    fft = new p5.FFT();
 *  }
 *
 *  function draw() {
 *    background(220);
 *
 *    // set the BandPass frequency based on mouseX
 *    let freq = map(mouseX, 0, width, 20, 10000);
 *    freq = constrain(freq, 0, 22050);
 *    filter.freq(freq);
 *    // give the filter a narrow band (lower res = wider bandpass)
 *    filter.res(50);
 *
 *    // draw filtered spectrum
 *    let spectrum = fft.analyze();
 *    noStroke();
 *    for (let i = 0; i < spectrum.length; i++) {
 *      let x = map(i, 0, spectrum.length, 0, width);
 *      let h = -height + map(spectrum[i], 0, 255, height, 0);
 *      rect(x, height, width/spectrum.length, h);
 *    }
 *    if (!noise.started) {
 *      text('tap here and drag to change frequency', 10, 20, width - 20);
 *    } else {
 *      text('Frequency: ' + round(freq)+'Hz', 20, 20, width - 20);
 *    }
 *  }
 *
 *  function makeNoise() {
 *    // see also: `userStartAudio()`
 *    noise.start();
 *    noise.amp(0.5, 0.2);
 *  }
 *
 *  function mouseReleased() {
 *    noise.amp(0, 0.2);
 *  }
 *
 *  </code></div>
 */
class Filter extends Effect {
  constructor(type) {
    super();
    //add extend Effect by adding a Biquad Filter

    /**
     *  The p5.Filter is built with a
     *  <a href="http://www.w3.org/TR/webaudio/#BiquadFilterNode">
     *  Web Audio BiquadFilter Node</a>.
     *
     *  @property {DelayNode} biquadFilter
     */

    this.biquad = this.ac.createBiquadFilter();

    this.input.connect(this.biquad);

    this.biquad.connect(this.wet);

    if (type) {
      this.setType(type);
    }

    //Properties useful for the toggle method.
    this._on = true;
    this._untoggledType = this.biquad.type;
  }

  /**
   *  Filter an audio signal according to a set
   *  of filter parameters.
   *
   *  @method  process
   *  @param {Object} src An object that outputs audio
   *  @param {Number} [freq] Frequency in Hz, from 10 to 22050
   *  @param {Number} [res] Resonance/Width of the filter frequency
   *                        from 0.001 to 1000
   */
  process(src, freq, res, time) {
    src.connect(this.input);
    this.set(freq, res, time);
  }

  /**
   *  Set the frequency and the resonance of the filter.
   *
   *  @method  set
   *  @param {Number} [freq] Frequency in Hz, from 10 to 22050
   *  @param {Number} [res]  Resonance (Q) from 0.001 to 1000
   *  @param {Number} [timeFromNow] schedule this event to happen
   *                                seconds from now
   */
  set(freq, res, time) {
    if (freq) {
      this.freq(freq, time);
    }
    if (res) {
      this.res(res, time);
    }
  }

  /**
   *  Set the filter frequency, in Hz, from 10 to 22050 (the range of
   *  human hearing, although in reality most people hear in a narrower
   *  range).
   *
   *  @method  freq
   *  @param  {Number} freq Filter Frequency
   *  @param {Number} [timeFromNow] schedule this event to happen
   *                                seconds from now
   *  @return {Number} value  Returns the current frequency value
   */
  freq(freq, time) {
    var t = time || 0;
    if (freq <= 0) {
      freq = 1;
    }
    if (typeof freq === 'number') {
      this.biquad.frequency.cancelScheduledValues(
        this.ac.currentTime + 0.01 + t
      );
      this.biquad.frequency.exponentialRampToValueAtTime(
        freq,
        this.ac.currentTime + 0.02 + t
      );
    } else if (freq) {
      freq.connect(this.biquad.frequency);
    }
    return this.biquad.frequency.value;
  }

  /**
   *  Controls either width of a bandpass frequency,
   *  or the resonance of a low/highpass cutoff frequency.
   *
   *  @method  res
   *  @param {Number} res  Resonance/Width of filter freq
   *                       from 0.001 to 1000
   *  @param {Number} [timeFromNow] schedule this event to happen
   *                                seconds from now
   *  @return {Number} value Returns the current res value
   */
  res(res, time) {
    var t = time || 0;
    if (typeof res === 'number') {
      this.biquad.Q.value = res;
      this.biquad.Q.cancelScheduledValues(this.ac.currentTime + 0.01 + t);
      this.biquad.Q.linearRampToValueAtTime(
        res,
        this.ac.currentTime + 0.02 + t
      );
    } else if (res) {
      res.connect(this.biquad.Q);
    }
    return this.biquad.Q.value;
  }

  /**
   * Controls the gain attribute of a Biquad Filter.
   * This is distinctly different from .amp() which is inherited from p5.Effect
   * .amp() controls the volume via the output gain node
   * p5.Filter.gain() controls the gain parameter of a Biquad Filter node.
   *
   * @method gain
   * @param  {Number} gain
   * @return {Number} Returns the current or updated gain value
   */
  gain(gain, time) {
    var t = time || 0;
    if (typeof gain === 'number') {
      this.biquad.gain.value = gain;
      this.biquad.gain.cancelScheduledValues(this.ac.currentTime + 0.01 + t);
      this.biquad.gain.linearRampToValueAtTime(
        gain,
        this.ac.currentTime + 0.02 + t
      );
    } else if (gain) {
      gain.connect(this.biquad.gain);
    }
    return this.biquad.gain.value;
  }

  /**
   * Toggle function. Switches between the specified type and allpass
   *
   * @method toggle
   * @return {boolean} [Toggle value]
   */
  toggle() {
    this._on = !this._on;

    if (this._on === true) {
      this.biquad.type = this._untoggledType;
    } else if (this._on === false) {
      this.biquad.type = 'allpass';
    }

    return this._on;
  }

  /**
   *  Set the type of a p5.Filter. Possible types include:
   *  "lowpass" (default), "highpass", "bandpass",
   *  "lowshelf", "highshelf", "peaking", "notch",
   *  "allpass".
   *
   *  @method  setType
   *  @param {String} t
   */
  setType(t) {
    this.biquad.type = t;
    this._untoggledType = this.biquad.type;
  }

  dispose() {
    // remove reference from soundArray
    super.dispose();
    if (this.biquad) {
      this.biquad.disconnect();
      delete this.biquad;
    }
  }
}

/**
 *  Constructor: <code>new p5.LowPass()</code> Filter.
 *  This is the same as creating a p5.Filter and then calling
 *  its method <code>setType('lowpass')</code>.
 *  See p5.Filter for methods.
 *
 *  @class p5.LowPass
 *  @constructor
 *  @extends p5.Filter
 */
class LowPass extends Filter {
  constructor() {
    super('lowpass');
  }
}

/**
 *  Constructor: <code>new p5.HighPass()</code> Filter.
 *  This is the same as creating a p5.Filter and then calling
 *  its method <code>setType('highpass')</code>.
 *  See p5.Filter for methods.
 *
 *  @class p5.HighPass
 *  @constructor
 *  @extends p5.Filter
 */
class HighPass extends Filter {
  constructor() {
    super('highpass');
  }
}

/**
 *  Constructor: <code>new p5.BandPass()</code> Filter.
 *  This is the same as creating a p5.Filter and then calling
 *  its method <code>setType('bandpass')</code>.
 *  See p5.Filter for methods.
 *
 *  @class p5.BandPass
 *  @constructor
 *  @extends p5.Filter
 */
class BandPass extends Filter {
  constructor() {
    super('bandpass');
  }
}
export default Filter;
export { LowPass, HighPass, BandPass };
