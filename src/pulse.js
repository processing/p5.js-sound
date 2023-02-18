import Signal from 'Tone/signal/Signal';
import Multiply from 'Tone/signal/Multiply';

import p5sound from './main';
import Oscillator, { SawOsc } from './oscillator';

/**
 *  Creates a Pulse object, an oscillator that implements
 *  Pulse Width Modulation.
 *  The pulse is created with two oscillators.
 *  Accepts a parameter for frequency, and to set the
 *  width between the pulses. See <a href="
 *  http://p5js.org/reference/#/p5.Oscillator">
 *  <code>p5.Oscillator</code> for a full list of methods.
 *
 *  @class p5.Pulse
 *  @extends p5.Oscillator
 *  @constructor
 *  @param {Number} [freq] Frequency in oscillations per second (Hz)
 *  @param {Number} [w]    Width between the pulses (0 to 1.0,
 *                         defaults to 0)
 *  @example
 *  <div><code>
 *  let pulse;
 *  function setup() {
 *    let cnv = createCanvas(100, 100);
 *    cnv.mousePressed(startPulse);
 *    background(220);
 *
 *    pulse = new p5.Pulse();
 *    pulse.amp(0.5);
 *    pulse.freq(220);
 *  }
 *  function startPulse() {
 *    pulse.start();
 *    pulse.amp(0.5, 0.02);
 *  }
 *  function mouseReleased() {
 *    pulse.amp(0, 0.2);
 *  }
 *  function draw() {
 *    background(220);
 *    text('tap to play', 5, 20, width - 20);
 *    let w = map(mouseX, 0, width, 0, 1);
 *    w = constrain(w, 0, 1);
 *    pulse.width(w);
 *    text('pulse width: ' + w, 5, height - 20);
 *  }
 *  </code></div>
 */
class Pulse extends Oscillator {
  constructor(freq, w) {
    super(freq, 'sawtooth');

    // width of PWM, should be betw 0 to 1.0
    this.w = w || 0;

    // create a second oscillator with inverse frequency
    this.osc2 = new SawOsc(freq);

    // create a delay node
    this.dNode = p5sound.audiocontext.createDelay();

    // dc offset
    this.dcOffset = createDCOffset();
    this.dcGain = p5sound.audiocontext.createGain();
    this.dcOffset.connect(this.dcGain);
    this.dcGain.connect(this.output);
    // set delay time based on PWM width
    this.f = freq || 440;
    var mW = this.w / this.oscillator.frequency.value;
    this.dNode.delayTime.value = mW;
    this.dcGain.gain.value = 1.7 * (0.5 - this.w);

    // disconnect osc2 and connect it to delay, which is connected to output
    this.osc2.disconnect();
    this.osc2.panner.disconnect();
    this.osc2.amp(-1); // inverted amplitude
    this.osc2.output.connect(this.dNode);
    this.dNode.connect(this.output);

    this.output.gain.value = 1;
    this.output.connect(this.panner);
  }

  /**
   *  Set the width of a Pulse object (an oscillator that implements
   *  Pulse Width Modulation).
   *
   *  @method  width
   *  @param {Number} [width]    Width between the pulses (0 to 1.0,
   *                         defaults to 0)
   */
  width(w) {
    if (typeof w === 'number') {
      if (w <= 1.0 && w >= 0.0) {
        this.w = w;
        // set delay time based on PWM width

        // var mW = map(this.w, 0, 1.0, 0, 1/this.f);
        var mW = this.w / this.oscillator.frequency.value;
        this.dNode.delayTime.value = mW;
      }

      this.dcGain.gain.value = 1.7 * (0.5 - this.w);
    } else {
      w.connect(this.dNode.delayTime);
      let sig = new Signal(-0.5); //repalce it with tones Signals Method
      w.connect(sig);
      let mult1 = new Multiply(-1);
      let mult2 = new Multiply(1.7);
      sig = sig.connect(mult1).connect(mult2);
      sig.connect(this.dcGain.gain);
    }
  }

  start(f, time) {
    var now = p5sound.audiocontext.currentTime;
    var t = time || 0;
    if (!this.started) {
      var freq = f || this.f;
      var type = this.oscillator.type;
      this.oscillator = p5sound.audiocontext.createOscillator();
      this.oscillator.frequency.setValueAtTime(freq, now);
      this.oscillator.type = type;
      this.oscillator.connect(this.output);
      this.oscillator.start(t + now);

      // set up osc2
      this.osc2.oscillator = p5sound.audiocontext.createOscillator();
      this.osc2.oscillator.frequency.setValueAtTime(freq, t + now);
      this.osc2.oscillator.type = type;
      this.osc2.oscillator.connect(this.osc2.output);
      this.osc2.start(t + now);
      this.freqNode = [
        this.oscillator.frequency,
        this.osc2.oscillator.frequency,
      ];

      // start dcOffset, too
      this.dcOffset = createDCOffset();
      this.dcOffset.connect(this.dcGain);
      this.dcOffset.start(t + now);

      // if LFO connections depend on these oscillators
      if (this.mods !== undefined && this.mods.frequency !== undefined) {
        this.mods.frequency.connect(this.freqNode[0]);
        this.mods.frequency.connect(this.freqNode[1]);
      }
      this.started = true;
      this.osc2.started = true;
    }
  }

  stop(time) {
    if (this.started) {
      var t = time || 0;
      var now = p5sound.audiocontext.currentTime;
      this.oscillator.stop(t + now);
      if (this.osc2.oscillator) {
        this.osc2.oscillator.stop(t + now);
      }
      this.dcOffset.stop(t + now);
      this.started = false;
      this.osc2.started = false;
    }
  }

  freq(val, rampTime = 0, tFromNow = 0) {
    if (typeof val === 'number') {
      this.f = val;
      var now = p5sound.audiocontext.currentTime;
      var currentFreq = this.oscillator.frequency.value;
      this.oscillator.frequency.cancelScheduledValues(now);
      this.oscillator.frequency.setValueAtTime(currentFreq, now + tFromNow);
      this.oscillator.frequency.exponentialRampToValueAtTime(
        val,
        tFromNow + rampTime + now
      );
      this.osc2.oscillator.frequency.cancelScheduledValues(now);
      this.osc2.oscillator.frequency.setValueAtTime(
        currentFreq,
        now + tFromNow
      );
      this.osc2.oscillator.frequency.exponentialRampToValueAtTime(
        val,
        tFromNow + rampTime + now
      );

      if (this.freqMod) {
        this.freqMod.output.disconnect();
        this.freqMod = null;
      }
    } else if (val.output) {
      val.output.disconnect();
      val.output.connect(this.oscillator.frequency);
      val.output.connect(this.osc2.oscillator.frequency);
      this.freqMod = val;
    }
  }
}

// inspiration: http://webaudiodemos.appspot.com/oscilloscope/
function createDCOffset() {
  var ac = p5sound.audiocontext;
  var buffer = ac.createBuffer(1, 2048, ac.sampleRate);
  var data = buffer.getChannelData(0);
  for (var i = 0; i < 2048; i++) data[i] = 1.0;
  var bufferSource = ac.createBufferSource();
  bufferSource.buffer = buffer;
  bufferSource.loop = true;
  return bufferSource;
}

export default Pulse;
