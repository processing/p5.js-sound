import Effect from './effect';

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
class Compressor extends Effect {
  constructor() {
    super();
    /**
     *
     * The p5.Compressor is built with a <a href="https://www.w3.org/TR/webaudio/#the-dynamicscompressornode-interface"
     *   target="_blank" title="W3 spec for Dynamics Compressor Node">Web Audio Dynamics Compressor Node
     *   </a>
     * @property {AudioNode} compressor
     */

    this.compressor = this.ac.createDynamicsCompressor();

    this.input.connect(this.compressor);
    this.compressor.connect(this.wet);
  }

  /**
   * Performs the same function as .connect, but also accepts
   * optional parameters to set compressor's audioParams
   * @method process
   * @for p5.Compressor
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
  process(src, attack, knee, ratio, threshold, release) {
    src.connect(this.input);
    this.set(attack, knee, ratio, threshold, release);
  }

  /**
   * Set the paramters of a compressor.
   * @method  set
   * @for p5.Compressor
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
  set(attack, knee, ratio, threshold, release) {
    if (typeof attack !== 'undefined') {
      this.attack(attack);
    }
    if (typeof knee !== 'undefined') {
      this.knee(knee);
    }
    if (typeof ratio !== 'undefined') {
      this.ratio(ratio);
    }
    if (typeof threshold !== 'undefined') {
      this.threshold(threshold);
    }
    if (typeof release !== 'undefined') {
      this.release(release);
    }
  }

  /**
   * Get current attack or set value w/ time ramp
   *
   *
   * @method attack
   * @for p5.Compressor
   * @param {Number} [attack] Attack is the amount of time (in seconds) to reduce the gain by 10dB,
   *                          default = .003, range 0 - 1
   * @param {Number} [time]  Assign time value to schedule the change in value
   */
  attack(attack, time) {
    var t = time || 0;
    if (typeof attack === 'number') {
      this.compressor.attack.value = attack;
      this.compressor.attack.cancelScheduledValues(
        this.ac.currentTime + 0.01 + t
      );
      this.compressor.attack.linearRampToValueAtTime(
        attack,
        this.ac.currentTime + 0.02 + t
      );
    } else if (typeof attack !== 'undefined') {
      attack.connect(this.compressor.attack);
    }
    return this.compressor.attack.value;
  }

  /**
   * Get current knee or set value w/ time ramp
   *
   * @method knee
   * @for p5.Compressor
   * @param {Number} [knee] A decibel value representing the range above the
   *                        threshold where the curve smoothly transitions to the "ratio" portion.
   *                        default = 30, range 0 - 40
   * @param {Number} [time]  Assign time value to schedule the change in value
   */
  knee(knee, time) {
    var t = time || 0;
    if (typeof knee === 'number') {
      this.compressor.knee.value = knee;
      this.compressor.knee.cancelScheduledValues(
        this.ac.currentTime + 0.01 + t
      );
      this.compressor.knee.linearRampToValueAtTime(
        knee,
        this.ac.currentTime + 0.02 + t
      );
    } else if (typeof knee !== 'undefined') {
      knee.connect(this.compressor.knee);
    }
    return this.compressor.knee.value;
  }

  /**
   * Get current ratio or set value w/ time ramp
   * @method ratio
   * @for p5.Compressor
   * @param {Number} [ratio]      The amount of dB change in input for a 1 dB change in output
   *                            default = 12, range 1 - 20
   * @param {Number} [time]  Assign time value to schedule the change in value
   */
  ratio(ratio, time) {
    var t = time || 0;
    if (typeof ratio === 'number') {
      this.compressor.ratio.value = ratio;
      this.compressor.ratio.cancelScheduledValues(
        this.ac.currentTime + 0.01 + t
      );
      this.compressor.ratio.linearRampToValueAtTime(
        ratio,
        this.ac.currentTime + 0.02 + t
      );
    } else if (typeof ratio !== 'undefined') {
      ratio.connect(this.compressor.ratio);
    }
    return this.compressor.ratio.value;
  }

  /**
   * Get current threshold or set value w/ time ramp
   * @method threshold
   * @for p5.Compressor
   * @param {Number} threshold  The decibel value above which the compression will start taking effect
   *                            default = -24, range -100 - 0
   * @param {Number} [time]  Assign time value to schedule the change in value
   */
  threshold(threshold, time) {
    var t = time || 0;
    if (typeof threshold === 'number') {
      this.compressor.threshold.value = threshold;
      this.compressor.threshold.cancelScheduledValues(
        this.ac.currentTime + 0.01 + t
      );
      this.compressor.threshold.linearRampToValueAtTime(
        threshold,
        this.ac.currentTime + 0.02 + t
      );
    } else if (typeof threshold !== 'undefined') {
      threshold.connect(this.compressor.threshold);
    }
    return this.compressor.threshold.value;
  }

  /**
   * Get current release or set value w/ time ramp
   * @method release
   * @for p5.Compressor
   * @param {Number} release    The amount of time (in seconds) to increase the gain by 10dB
   *                            default = .25, range 0 - 1
   *
   * @param {Number} [time]  Assign time value to schedule the change in value
   */
  release(release, time) {
    var t = time || 0;
    if (typeof release === 'number') {
      this.compressor.release.value = release;
      this.compressor.release.cancelScheduledValues(
        this.ac.currentTime + 0.01 + t
      );
      this.compressor.release.linearRampToValueAtTime(
        release,
        this.ac.currentTime + 0.02 + t
      );
    } else if (typeof number !== 'undefined') {
      release.connect(this.compressor.release);
    }
    return this.compressor.release.value;
  }

  /**
   * Return the current reduction value
   *
   * @method reduction
   * @for p5.Compressor
   * @return {Number} Value of the amount of gain reduction that is applied to the signal
   */
  reduction() {
    return this.compressor.reduction.value;
  }

  dispose() {
    super.dispose();
    if (this.compressor) {
      this.compressor.disconnect();
      delete this.compressor;
    }
  }
}

export default Compressor;
