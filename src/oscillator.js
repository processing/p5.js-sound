define(function (require) {
  'use strict';

  var p5sound = require('master');

  /**
   *  <p>Creates a signal that oscillates between -1.0 and 1.0.
   *  By default, the oscillation takes the form of a sinusoidal
   *  shape ('sine'). Additional types include 'triangle',
   *  'sawtooth' and 'square'. The frequency defaults to
   *  440 oscillations per second (440Hz, equal to the pitch of an
   *  'A' note).</p> 
   *
   *  <p>Set the type of oscillation  setType(), or by creating a
   *  specific oscillator.</p> For example:
   *  <code>new SinOsc(freq)</code>
   *  <code>new TriOsc(freq)</code>
   *  <code>new SqrOsc(freq)</code>
   *  <code>new SawOsc(freq)</code>.
   *  </p>
   *  
   *  @class Oscillator
   *  @constructor
   *  @param {[Number]} freq frequency defaults to 440Hz
   *  @param {[String]} type type of oscillator. Options:
   *                         'sine' (default), 'triangle',
   *                         'sawtooth', 'square'
   */
  p5.prototype.Oscillator = function(freq, type){
    this.started = false;
    p5sound = p5sound;

    // components
    this.oscillator = p5sound.audiocontext.createOscillator();
    this.f = freq || 440; // frequency
    this.oscillator.frequency.value = this.f;
    this.oscillator.type = type || 'sine';
    var o = this.oscillator;

    // connections
    this.input = p5sound.audiocontext.createGain();
    this.output = p5sound.audiocontext.createGain();

    // param nodes for modulation
    // this.freqNode = o.frequency;
    this.ampNode = this.output.gain;
    this.freqNode = this.oscillator.frequency;

    // set default output gain
    this.output.gain.value = 0.5;

    // sterep panning
    this.panPosition = 0.0;
    this.panner = p5sound.audiocontext.createPanner();
    this.panner.panningModel = 'equalpower';
    this.panner.distanceModel = 'linear';
    this.panner.setPosition(0,0,0);

    // connect to p5sound by default
    this.oscillator.connect(this.output);
    this.output.connect(this.panner);
    this.panner.connect(p5sound.input);
    this.connection = p5sound.input;

    // add to the soundArray so we can dispose of the osc later
    p5sound.soundArray.push(this);
  };

  /**
   *  Start an oscillator. Accepts an optional parameter to
   *  determine how long (in seconds from now) until the
   *  oscillator starts.
   *
   *  @method  start
   *  @param  {[Number]} time startTime in seconds from now.
   *  @param  {[Number]} frequency frequency in Hz.
   */
  p5.prototype.Oscillator.prototype.start = function(f, time) {
    if (this.started){
      this.stop();
    }
    if (!this.started){
      var freq = f || this.f;
      var type = this.oscillator.type;
      // var detune = this.oscillator.frequency.value;
      this.oscillator = p5sound.audiocontext.createOscillator();
      this.oscillator.frequency.exponentialRampToValueAtTime(Math.abs(freq), p5sound.audiocontext.currentTime);
      this.oscillator.type = type;
      // this.oscillator.detune.value = detune;
      this.oscillator.connect(this.output);
      this.started = true;
      time = time || 0;
      this.oscillator.start(time + p5sound.audiocontext.currentTime);
      this.freqNode = this.oscillator.frequency;

      // if LFO connections depend on this oscillator
      if (this.mods !== undefined && this.mods.frequency !== undefined){
        this.mods.frequency.connect(this.freqNode);
      }
    }
  };

  /**
   *  Stop an oscillator. Accepts an optional parameter
   *  to determine how long (in seconds from now) until the
   *  oscillator stops.
   *
   *  @method  stop
   *  @param  {[Number]} time, in seconds from now.
   */
  p5.prototype.Oscillator.prototype.stop = function(time){
    if (this.started){
      var t = time || 0;
      var now = p5sound.audiocontext.currentTime;
      this.oscillator.stop(t + now);
      this.started = false;
    }
  };

  /**
   *  Set amplitude (volume) of an oscillator between 0 and 1.0
   *
   *  @method  amp
   *  @param  {Number} vol between 0 and 1.0
   *  @param {Number} [time] schedule this event to happen seconds
   *                         from now (optional)
   */
  p5.prototype.Oscillator.prototype.amp = function(vol, time){
    if (typeof(vol) === 'number') {
      var t = time || 0;
      var now = p5sound.audiocontext.currentTime;
      var currentVol = this.output.gain.value;
      this.output.gain.cancelScheduledValues(now);
      this.output.gain.setValueAtTime(vol, t + now);

      // disconnect any oscillators that were modulating this param
      if (this.ampMod){

        this.ampMod.output.disconnect();
        this.ampMod = null;
      }

    }
    else if (vol.output) {
      vol.output.disconnect();
      vol.output.connect(this.output.gain);

      // keep track of any oscillators that were modulating this param
      this.ampMod = vol;
    }
  };

  /**
   *  Fade to a certain volume starting now, and ending at rampTime
   *
   *  @param  {Number} vol      volume between 0.0 and 1.0
   *  @param  {Number} rampTime duration of the fade (in seconds)
   */
  p5.prototype.Oscillator.prototype.fade = function(vol, rampTime){
    var t = rampTime || 0;
    var now = p5sound.audiocontext.currentTime;
    if (typeof(vol) === 'number') {
      var currentVol = this.output.gain.value;
      this.output.gain.cancelScheduledValues(now);
      this.output.gain.setValueAtTime(currentVol, now);
      this.output.gain.linearRampToValueAtTime(vol, t + now);
    }
  };

  p5.prototype.Oscillator.prototype.getAmp = function(){
    return this.output.gain.value;
  };

  /**
   *  Set frequency of an oscillator.
   *
   *  @method  freq
   *  @param  {Number} Frequency Frequency in Hz
   *  @param  {[Number]} [rampTime] Ramp time (in seconds)
   *  @param  {[Number]} [TimeFromNow] Schedule this event to happen
   *                                   at x seconds from now
   *  @example
   *  <div><code>
   *  var osc = new Oscillator(300);
   *  osc.start();
   *  osc.freq(40, 10);
   *  </code></div>
   */
  p5.prototype.Oscillator.prototype.freq = function(val, rampTime, tFromNow){
    if (typeof(val) === 'number') {
      this.f = val;
      var now = p5sound.audiocontext.currentTime;
      var rampTime = rampTime || 0;
      var tFromNow = tFromNow || 0;
      var currentFreq = this.oscillator.frequency.value;
      this.oscillator.frequency.cancelScheduledValues(now);
      this.oscillator.frequency.setValueAtTime(currentFreq, now + tFromNow);
      this.oscillator.frequency.exponentialRampToValueAtTime(val, tFromNow + rampTime + now);

      // disconnect if frequencies are too low or high, otherwise connect
      // if (val < 20 || val > 20000) {
      //   this.panner.disconnect();
      // } else {
      //   this.connect(this.connection);
      // }

      if (this.freqMod){
        this.freqMod.output.disconnect();
        this.freqMod = null;
      }

    } else if (val.output) {
      val.output.disconnect();
      val.output.connect(this.oscillator.frequency);

      // keep track of what is modulating this param
      this.freqMod = val;
    }
  };

  p5.prototype.Oscillator.prototype.getFreq = function(){
    return this.oscillator.frequency.value;
  };

  p5.prototype.Oscillator.prototype.setType = function(type){
    this.oscillator.type = type;
  };

  p5.prototype.Oscillator.prototype.getType = function(){
    return this.oscillator.type;
  };

  p5.prototype.Oscillator.prototype.connect = function(unit){
    if (!unit) {
       this.panner.connect(p5sound.input);
    }
    else if (unit.hasOwnProperty('input')){
      this.panner.connect(unit.input);
      this.connection = unit.input;
      }
    else {
      this.panner.connect(unit);
      this.connection = unit;
    }
  };


  p5.prototype.Oscillator.prototype.disconnect = function(unit){
    this.panner.disconnect(unit);
  };


  p5.prototype.Oscillator.prototype.pan = function(pval) {
    if (!pval) {
      pval = 0;
    }
      this.panPosition = pval;
      pval = pval * 90.0;
      var xDeg = parseInt(pval);
      var zDeg = xDeg + 90;
      if (zDeg > 90) {
        zDeg = 180 - zDeg;
      }
      var x = Math.sin(xDeg * (Math.PI / 180));
      var z = Math.sin(zDeg * (Math.PI / 180));
      this.panner.setPosition(x, 0, z);
  };

  p5.prototype.Oscillator.prototype.getPan = function() {
    return this.panPosition;
  };

  // get rid of the oscillator
  p5.prototype.Oscillator.prototype.dispose = function() {
    if (this.oscillator){
      this.stop();
      this.disconnect();
      this.oscillator.disconnect();
      this.panner = null;
      this.oscillator = null;
    }
    // if it is a Pulse
    if (this.osc2) {
      this.osc2.dispose();
    }
  };

  /**
   *  Modulate any audio param.
   *
   *  @method  mod
   *  @param  {Object} oscillator The param to modulate
   */
  p5.prototype.Oscillator.prototype.mod = function(unit){
    unit.cancelScheduledValues(p5sound.audiocontext.currentTime);
    this.output.connect(unit);
  };

  /**
   *  Set the phase of an oscillator between 0.0 and 1.0
   *  
   *  @param  {Number} phase float between 0.0 and 1.0
   */
  p5.prototype.Oscillator.prototype.phase = function(p){
    if (!this.dNode) {
      // create a delay node
      this.dNode = p5sound.audiocontext.createDelay();
      // put the delay node in between output and panner
      this.output.disconnect();
      this.output.connect(this.dNode);
      this.dNode.connect(this.panner);
    }
    // set delay time based on PWM width
    var now = p5sound.audiocontext.currentTime;
    this.dNode.delayTime.linearRampToValueAtTime( map(p, 0, 1.0, 0, 1/this.oscillator.frequency.value), now);
  };

  // Extending
  p5.prototype.SinOsc = function(freq) {
    p5.prototype.Oscillator.call(this, freq, 'sine');
  };

  p5.prototype.SinOsc.prototype = Object.create(p5.prototype.Oscillator.prototype);

  p5.prototype.TriOsc = function(freq) {
    p5.prototype.Oscillator.call(this, freq, 'triangle');
  };

  p5.prototype.TriOsc.prototype = Object.create(p5.prototype.Oscillator.prototype);

  p5.prototype.SawOsc = function(freq) {
    p5.prototype.Oscillator.call(this, freq, 'sawtooth');
  };

  p5.prototype.SawOsc.prototype = Object.create(p5.prototype.Oscillator.prototype);

  p5.prototype.SqrOsc = function(freq) {
    p5.prototype.Oscillator.call(this, freq, 'square');
  };

  p5.prototype.SqrOsc.prototype = Object.create(p5.prototype.Oscillator.prototype);

});