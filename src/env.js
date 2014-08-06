define(function (require) {
  'use strict';

  var p5sound = require('master');

  /**
   *  <p>Envelopes are pre-defined amplitude distribution over time. 
   *  The p5.Env accepts up to four time/level pairs, where time
   *  determines how long of a ramp before value reaches level.
   *  Typically, envelopes are used to control the output volume
   *  of an object, a series of fades referred to as Attack, Decay,
   *  Sustain and Release (ADSR). But p5.Env can control any
   *  Web Audio Param.</p>
   *  
   *  @class p5.Env
   *  @constructor
   *  @param {Number} attackTime     Time (in seconds) before level
   *                                 reaches attackLevel
   *  @param {Number} attackLevel    Typically an amplitude between
   *                                 0.0 and 1.0
   *  @param {Number} decayTime      Time
   *  @param {Number} [decayLevel]   Amplitude (In a standard ADSR envelope,
   *                                 decayLevel = sustainLevel)
   *  @param {Number} [sustainTime]   Time
   *  @param {Number} [sustainLevel]  Amplitude
   *  @param {Number} [releaseTime]   Time
   *  @param {Number} [releaseLevel]  Amplitude
   *  @example
   *  <div><code>
   *  var aT = 0.1; // attack time
   *  var aL = 0.7; // attack level
   *  var dT = 0.3; // decay time
   *  var dL = 0.1; // decay level
   *  var sT = 0.2; // sustain time
   *  var sL = dL; // sustain level
   *  var rT = 0.5; // release time
   *  // release level defaults to zero
   *
   *  var env;
   *  var triOsc;
   *  
   *  function setup() {
   *    env = new p5.Env(aT, aL, dT, dL, sT, sL, rT);
   *    triOsc = new p5.TriOsc();
   *    triOsc.amp(0);
   *    triOsc.start();
   *    env.play(triOsc);
   *  }
   *  </code></div>
   */
  p5.Env = function(attackTime, attackLevel, decayTime, decayLevel, sustainTime, sustainLevel, releaseTime, releaseLevel){

    /**
     * @property attackTime
     */
    this.attackTime = attackTime;
    /**
     * @property attackLevel
     */
    this.attackLevel = attackLevel;
    /**
     * @property decayTime
     */
    this.decayTime = decayTime || 0;
    /**
     * @property decayLevel
     */
    this.decayLevel = decayLevel || 0;
    /**
     * @property sustainTime
     */
    this.sustainTime = sustainTime || 0;
    /**
     * @property sustainLevel
     */
    this.sustainLevel = sustainLevel || 0;
    /**
     * @property releaseTime
     */
    this.releaseTime = releaseTime || 0;
    /**
     * @property releaseLevel
     */
    this.releaseLevel = releaseLevel || 0;

    this.control = null;
  };

  /**
   *  
   *  @param  {Object} input       A p5Sound object or
   *                                Web Audio Param
   */
  p5.Env.prototype.setInput = function(input){
    // assume we're talking about output gain, unless given a different audio param
    if (input.output !== undefined){
      input = input.output.gain;
    }
    this.control = input;
  };

  /**
   *  Play tells the envelope to start acting on a given input.
   *  If the input is a p5Sound object (i.e. AudioIn, Oscillator,
   *  SoundFile), then Env will control its output volume.
   *  Envelopes can also be used to control any Web Audio Param.
   *
   *  @method  play
   *  @param  {Object} input        A p5Sound object or
   *                                Web Audio Param
   */
  p5.Env.prototype.play = function(input){
    // if no input is given, input is this Envelope's input
    if (!input){
      input = this.control;
    }
    // assume we're talking about output gain, unless given a different audio param
    if (input.output !== undefined){
      input = input.output.gain;
    }
    this.control = input;

    var now =  p5sound.audiocontext.currentTime;
    input.cancelScheduledValues(now);
    input.setValueAtTime(0, now);
    // attack
    input.linearRampToValueAtTime(this.attackLevel, now + this.attackTime);
    // decay to decay level
    input.linearRampToValueAtTime(this.decayLevel, now + this.attackTime + this.decayTime);
    // hold sustain level
    input.linearRampToValueAtTime(this.sustainLevel, now + this.attackTime + this.decayTime + this.sustainTime);
    // release
    input.linearRampToValueAtTime(this.releaseLevel, now + this.attackTime + this.decayTime + this.sustainTime + this.releaseTime);
  };

  /**
   *  Trigger the Attack, Decay, and Sustain of the Envelope.
   *  Similar to holding down a key on a piano, but it will
   *  hold the sustain level until you let go.
   *
   *  @method  triggerAttack
   *  @param  {Object} input p5.Sound Object or Web Audio Param
   */
  p5.Env.prototype.triggerAttack = function(input) {
    var now =  p5sound.audiocontext.currentTime;

    // if no input is given, input is this Envelope's input
    if (!input){
      input = this.control;
    }
    // assume we're talking about output gain, unless given a different audio param
    if (input.output !== undefined){
      input = input.output.gain;
    }
    this.control = input;

    var currentVal =  input.value;
    input.cancelScheduledValues(now);
    input.setValueAtTime(currentVal, now);

    input.linearRampToValueAtTime(this.attackLevel, now + this.attackTime);

    // attack
    input.linearRampToValueAtTime(this.attackLevel, now + this.attackTime);
    // decay to sustain level
    input.linearRampToValueAtTime(this.decayLevel, now + this.attackTime + this.decayTime);
    // hold sustain level
    input.linearRampToValueAtTime(this.sustainLevel, now + this.attackTime + this.decayTime + this.sustainTime);
  };

  /**
   *  Trigger the Release of the Envelope. This is similar to release
   *  the key on a piano and letting the sound fade according to the
   *  release level and release time.
   *
   *  @method  triggerRelease
   *  @param  {Object} input p5.Sound Object or Web Audio Param
   */
  p5.Env.prototype.triggerRelease = function(input) {
    var now =  p5sound.audiocontext.currentTime;

    // if no input is given, input is this Envelope's input
    if (!input){
      input = this.control;
    }
    // assume we're talking about output gain, unless given a different audio param
    if (input.output !== undefined){
      input = input.output.gain;
    }

    if (input.output !== undefined){
      input = input.output.gain;
    }

    var currentVal =  input.value;
    input.cancelScheduledValues(p5sound.audiocontext.currentTime);
    input.setValueAtTime(currentVal, now);

    // release
    input.linearRampToValueAtTime(this.releaseLevel, now + this.releaseTime);
  };

});