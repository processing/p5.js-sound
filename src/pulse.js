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
    this.dNode = this.p5s.audiocontext.createDelay();

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
    if (this.started){
      this.stop();
    }
    if (!this.started){
      var freq = f || this.f;
      var type = this.oscillator.type;
      // var detune = this.oscillator.frequency.value;
      this.oscillator = this.p5s.audiocontext.createOscillator();
      this.oscillator.frequency.exponentialRampToValueAtTime(freq, this.p5s.audiocontext.currentTime);
      this.oscillator.type = type;
      // this.oscillator.detune.value = detune;
      this.oscillator.connect(this.output);
      this.started = true;
      time = time + this.p5s.audiocontext.currentTime || this.p5s.audiocontext.currentTime;
      this.oscillator.start(time);

      // set up osc2
      this.osc2.oscillator = this.p5s.audiocontext.createOscillator();
      this.osc2.oscillator.frequency.value = freq;
      this.osc2.oscillator.frequency.exponentialRampToValueAtTime(freq, this.p5s.audiocontext.currentTime);
      this.osc2.oscillator.type = type;
      this.osc2.start(time);
      this.freqNode = [this.oscillator.frequency, this.osc2.oscillator.frequency];

      // if LFO connections depend on these oscillators
      if (this.mods !== undefined && this.mods.frequency !== undefined){
        this.mods.frequency.connect(this.freqNode[0]);
        this.mods.frequency.connect(this.freqNode[1]);

      }
    }
  };

  p5.prototype.Pulse.prototype.stop = function(_time){
    if (this.started){
      var time = _time + this.p5s.audiocontext.currentTime;
      var t = time || this.p5s.audiocontext.currentTime;
      this.oscillator.stop(t);
      this.osc2.stop(t);
      this.started = false;
    }
  };

  p5.prototype.Pulse.prototype.freq = function(val, t){
    var rampTime = t || 0;
    this.oscillator.frequency.cancelScheduledValues(this.p5s.audiocontext.currentTime);
    this.osc2.oscillator.frequency.cancelScheduledValues(this.p5s.audiocontext.currentTime);
    this.oscillator.frequency.exponentialRampToValueAtTime(val, rampTime + this.p5s.audiocontext.currentTime);
    this.osc2.oscillator.frequency.exponentialRampToValueAtTime(val, rampTime + this.p5s.audiocontext.currentTime);
  };

});