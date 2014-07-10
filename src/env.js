define(function (require) {
  'use strict';

  var p5sound = require('master');

  /**
   *  Envelopes are pre-defined amplitude distribution over time. 
   *  Typically, envelopes are used to control the output volume
   *  of an object. This is the default behavior. However,
   *  Envelopes can also be used to control any Web Audio Param.
   *  
   *  @class Env
   *  @constructor
   *  @param {Number} attackTime     Time (in seconds) before level
   *                                 reaches attackLevel
   *  @param {Number} attackLevel    Typically an amplitude between
   *                                 0.0 and 1.0
   *  @param {Number} decayTime      Time (in seconds) before level
   *                                 reaches sustainLevel
   *  @param {[Number]} sustainLevel Typically an amplitude between
   *                                 0.0 and 1.0
   *  @param {[Number]} sustainTime  Time (in seconds) to hold sustain,
   *                                 before release begins
   *  @param {[Number]} releaseTime  Time before level reaches
   *                                 releaseLevel (or 0)
   *  @param {[Number]} releaseTime  Release level (defaults to 0)
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
     * Time between level = sustainLevel and level = releaseLevel (or 0)
     * @property releaseTime
     */
    this.releaseTime = releaseTime || 0;
    /**
     * Release level defaults to 0 (silence)
     * @property releaseLevel
     */
    this.releaseLevel = releaseLevel || 0;
  };

  /**
   *  Play tells the envelope to start acting on a given input.
   *  If the input is a p5Sound object (i.e. AudioIn, Oscillator,
   *  SoundFile), then Env will control its output volume.
   *  Envelopes can also be used to control any Web Audio Param.
   *
   *  @param  {Object} input        A p5Sound object or
   *                                Web Audio Param
   */
  p5.prototype.Env.prototype.play = function(input){
    // assume we're talking about output gain, unless given a different audio param
    if (input.output !== undefined){
      input = input.output.gain;
    }
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

  p5.prototype.Env.prototype.stop = function(input){
    if (input.output !== undefined){
      input = input.output.gain;
    }
    input.cancelScheduledValues(p5sound.audiocontext.currentTime);
    input.setValueAtTime(0, p5sound.audiocontext.currentTime);
  };

});