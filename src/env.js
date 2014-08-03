define(function (require) {
  'use strict';

  var p5sound = require('master');

  /**
   *  Envelopes are pre-defined amplitude distribution over time. 
   *  Typically, envelopes are used to control the output volume
   *  of an object, like a series of fades. Envelopes can also
   *  control any Web Audio Param.
   *  
   *  @class Env
   *  @constructor
   *  @param {Number} attackTime     Time (in seconds) before level
   *                                 reaches attackLevel
   *  @param {Number} attackLevel    Typically an amplitude between
   *                                 0.0 and 1.0
   *  @param {Number} decayTime      Time (in seconds) before level
   *                                 reaches sustainLevel
   *  @param {Number} [sustainLevel] Typically an amplitude between
   *                                 0.0 and 1.0
   *  @param {Number} [sustainTime]  Time (in seconds) to hold sustain,
   *                                 before release begins
   *  @param {Number} [releaseTime]  Time before level reaches
   *                                 releaseLevel (or 0)
   *  @param {Number} [releaseLevel]  Release level (defaults to 0)
   *  @example
   *  <div><code>
   *  var aT = 0.1; // attack time
   *  var aL = 0.7; // attack level
   *  var dT = 0.3; // decay time
   *  var sT = 0.1; // sustain time
   *  var sL = 0.2; // sustain level
   *  var rT = 0.5; // release time
   *
   *  var env;
   *  var triOsc;
   *  
   *  function setup() {
   *    env = new Env(aT, aL, dT, sT, sL, rT);
   *    triOsc = new TriOsc();
   *    triOsc.amp(0);
   *    triOsc.start();
   *    env.play(triOsc);
   *  }
   *  </code></div>
   */
  p5.prototype.Env = function(attackTime, attackLevel, decayTime, sustainLevel, sustainTime, releaseTime, releaseLevel){

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
  p5.prototype.Env.prototype.setInput = function(input){
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
  p5.prototype.Env.prototype.play = function(input){
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
    // decay to sustain level
    input.linearRampToValueAtTime(this.sustainLevel, now + this.attackTime + this.decayTime);
    // hold sustain level
    input.setValueAtTime(this.sustainLevel, now + this.attackTime + this.decayTime + this.sustainTime);
    // release
    input.linearRampToValueAtTime(this.releaseLevel, now + this.attackTime + this.decayTime + this.sustainTime + this.releaseTime);
  };

  // p5.prototype.Env.prototype.stop = function(input){
  //   // if no input is given, input is this Envelope's input
  //   if (!input){
  //     input = this.control;
  //   }
  //   // assume we're talking about output gain, unless given a different audio param
  //   if (input.output !== undefined){
  //     input = input.output.gain;
  //   }
  //   input.cancelScheduledValues(p5sound.audiocontext.currentTime);
  //   input.setValueAtTime(0, p5sound.audiocontext.currentTime);
  // };

  /**
   *  Trigger the Attack, Decay, and Sustain of the Envelope.
   *  Similar to holding down a key on a piano, but it will
   *  hold the sustain level until you let go.
   *
   *  @method  triggerAttack
   *  @param  {Object} input p5.Sound Object or Web Audio Param
   */
  p5.prototype.Env.prototype.triggerAttack = function(input) {
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
    input.linearRampToValueAtTime(this.sustainLevel, now + this.attackTime + this.decayTime);
    // hold sustain level
    input.setValueAtTime(this.sustainLevel, now + this.attackTime + this.decayTime + this.sustainTime);
  };

  /**
   *  Trigger the Release of the Envelope. This is similar to release
   *  the key on a piano and letting the sound fade according to the
   *  release level and release time.
   *
   *  @method  triggerRelease
   *  @param  {Object} input p5.Sound Object or Web Audio Param
   */
  p5.prototype.Env.prototype.triggerRelease = function(input) {
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