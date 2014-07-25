define(function (require) {
  'use strict';

  var p5sound = require('master');
  require('oscillator');

  /**
   *  Creates a Pulse object, an oscillator that implements
   *  Pulse Width Modulation.
   *  The pulse is created with two oscillators.
   *  Accepts a parameter for frequency, and to set the
   *  width between the pulses.
   *  
   *  Inspired by <a href="
   *  http://www.musicdsp.org/showone.php?id=8">musicdsp.org"</a>
   *
   *  @class Pulse
   *  @constructor
   *  @param {[Number]} freq Frequency in oscillations per second (Hz)
   *  @param {[Number]} w    Width between the pulses (0 to 1.0,
   *                         defaults to 0)
   */
  p5.prototype.Pulse = function(freq, w) {
    p5.prototype.Oscillator.call(this, freq, 'sawtooth');

    // width of PWM, should be betw 0 to 1.0
    this.w = w || 0;

    // create a second oscillator with inverse frequency
    this.osc2 = new SawOsc(freq);

    // create a delay node
    this.dNode = p5sound.audiocontext.createDelay();

    // set delay time based on PWM width
    this.dNode.delayTime.value = map(this.w, 0, 1.0, 0, 1/this.oscillator.frequency.value);
    // disconnect osc2 and connect it to delay, which is connected to output
    this.osc2.disconnect();

    this.osc2.panner.connect(this.dNode);
    this.dNode.connect(this.output);
  };

  p5.prototype.Pulse.prototype = Object.create(p5.prototype.Oscillator.prototype);

  /**
   *  Set the width of a Pulse object (an oscillator that implements
   *  Pulse Width Modulation).
   *
   *  @method  width
   *  @param {[Number]} w    Width between the pulses (0 to 1.0,
   *                         defaults to 0)
   */
  p5.prototype.Pulse.prototype.width = function(w) {
    if (w <= 1.0 && w >= 0.0) {
      this.w = w;
      // set delay time based on PWM width
      this.dNode.delayTime.value = map(this.w, 0, 1.0, 0, 1/this.oscillator.frequency.value);
    }
  };


  p5.prototype.Pulse.prototype.start = function(f, time) {
    var now = p5sound.audiocontext.currentTime;
    var t = time || 0;
    if (!this.started){
      var freq = f || this.f;
      var type = this.oscillator.type;
      // var detune = this.oscillator.frequency.value;
      this.oscillator = p5sound.audiocontext.createOscillator();
      this.oscillator.frequency.setValueAtTime(freq, now);
      this.oscillator.type = type;
      // this.oscillator.detune.value = detune;
      this.oscillator.connect(this.output);
      this.oscillator.start(t + now);

      // set up osc2
      this.osc2.oscillator = p5sound.audiocontext.createOscillator();
      this.osc2.oscillator.frequency.setValueAtTime(freq, now);
      this.osc2.oscillator.type = type;
      this.osc2.start(t + now);
      this.freqNode = [this.oscillator.frequency, this.osc2.oscillator.frequency];

      // if LFO connections depend on these oscillators
      if (this.mods !== undefined && this.mods.frequency !== undefined){
        this.mods.frequency.connect(this.freqNode[0]);
        this.mods.frequency.connect(this.freqNode[1]);
      }
      this.started = true;
      this.osc2.started = true;
    }
  };

  p5.prototype.Pulse.prototype.stop = function(time){
    if (this.started){
      var t = time || 0;
      var now = p5sound.audiocontext.currentTime;
      this.oscillator.stop(t + now);
      this.osc2.oscillator.stop(t + now);
      this.started = false;
      this.osc2.started = false;
    }
  };

  p5.prototype.Pulse.prototype.freq = function(val, rampTime, tFromNow){
    if (typeof(val) === 'number') {
      this.f = val;
      var now = p5sound.audiocontext.currentTime;
      var rampTime = rampTime || 0;
      var tFromNow = tFromNow || 0;
      var currentFreq = this.oscillator.frequency.value;
      this.oscillator.frequency.cancelScheduledValues(now);
      this.oscillator.frequency.setValueAtTime(currentFreq, now + tFromNow);
      this.oscillator.frequency.exponentialRampToValueAtTime(val, tFromNow + rampTime + now);
      this.osc2.oscillator.frequency.cancelScheduledValues(now);
      this.osc2.oscillator.frequency.setValueAtTime(currentFreq, now + tFromNow);
      this.osc2.oscillator.frequency.exponentialRampToValueAtTime(val, tFromNow + rampTime + now);

      // disconnect if frequencies are too low or high, otherwise connect
      // if (val < 20 || val > 20000) {
      //   this.panner.disconnect();
      // } else {
      //   this.connect(this.connection);
      // }

      if (this.freqMod){
        console.log('disconnect freqmod');
        this.freqMod.output.disconnect();
        this.freqMod = null;
      }

    } else if (val.output) {
      val.output.disconnect();
      val.output.connect(this.oscillator.frequency);
      val.output.connect(this.osc2.oscillator.frequency);
      this.freqMod = val;
      console.log('connect freqmod');
    }
  };

});