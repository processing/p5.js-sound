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

    // add to the soundArray so we can dispose of the osc later
    p5sound.soundArray.push(this);
  };

  /**
   *  Start an oscillator. Accepts an optional parameter to
   *  determine how long (in seconds from now) until the
   *  oscillator starts.
   *
   *  @method  start
   *  @param  {[Number]} frequency frequency in Hz.
   *  @param  {[Number]} time startTime in seconds from now.
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
      time = time || p5sound.audiocontext.currentTime;
      this.oscillator.start(time);
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
      var t = time || p5sound.audiocontext.currentTime;
      this.oscillator.stop(t);
      this.started = false;
    }
  };

  /**
   *  Set amplitude (volume) of an oscillator between 0 and 1.0
   *
   *  @method  amp
   *  @param  {Number} vol between 0 and 1.0
   *  @param {Number} [time] ramp time (optional)
   */
  p5.prototype.Oscillator.prototype.amp = function(vol, t){
    if (t) {
      var rampTime = t || 0;
      var currentVol = this.output.gain.value;
      this.output.gain.cancelScheduledValues(p5sound.audiocontext.currentTime);
      this.output.gain.setValueAtTime(currentVol, p5sound.audiocontext.currentTime);
      this.output.gain.linearRampToValueAtTime(vol, rampTime + p5sound.audiocontext.currentTime);
    } else {
      this.output.gain.cancelScheduledValues(p5sound.audiocontext.currentTime);
      this.output.gain.setValueAtTime(vol, p5sound.audiocontext.currentTime);
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
   *  @param  {Number} [Time] Ramp time in seconds
   *  @example
   *  <div><code>
   *  var osc = new Oscillator(300);
   *  osc.start();
   *  osc.freq(40, 10);
   *  </code></div>
   */
  p5.prototype.Oscillator.prototype.freq = function(val, t){
    this.f = val;
    if (t) {
      var rampTime = t || 0;
      var currentFreq = this.oscillator.frequency.value;
      this.oscillator.frequency.cancelScheduledValues(p5sound.audiocontext.currentTime);
      this.oscillator.frequency.setValueAtTime(currentFreq, p5sound.audiocontext.currentTime);
      this.oscillator.frequency.exponentialRampToValueAtTime(val, rampTime + p5sound.audiocontext.currentTime);
    } else {
      this.oscillator.frequency.cancelScheduledValues(p5sound.audiocontext.currentTime);
      this.oscillator.frequency.setValueAtTime(val, p5sound.audiocontext.currentTime);
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
      }
    else {
      this.panner.connect(unit);
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