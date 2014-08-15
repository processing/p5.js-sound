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
   *  @param {Number} [sustainTime]   Time (in seconds)
   *  @param {Number} [sustainLevel]  Amplitude 0.0 to 1.0
   *  @param {Number} [releaseTime]   Time (in seconds)
   *  @param {Number} [releaseLevel]  Amplitude 0.0 to 1.0
   *  @example
   *  <div><code>
   *  var aT = 0.1; // attack time in seconds
   *  var aL = 0.7; // attack level 0.0 to 1.0
   *  var dT = 0.3; // decay time in seconds
   *  var dL = 0.1; // decay level  0.0 to 1.0
   *  var sT = 0.2; // sustain time in seconds
   *  var sL = dL; // sustain level  0.0 to 1.0
   *  var rT = 0.5; // release time in seconds
   *  // release level defaults to zero
   *
   *  var env;
   *  var triOsc;
   *  
   *  function setup() {
   *    env = new p5.Env(aT, aL, dT, dL, sT, sL, rT);
   *    triOsc = new p5.Oscillator('triangle');
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
   *  @param  {Object} input       A p5.sound object or
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
   *  If the input is a p5.sound object (i.e. AudioIn, Oscillator,
   *  SoundFile), then Env will control its output volume.
   *  Envelopes can also be used to control any <a href="
   *  http://docs.webplatform.org/wiki/apis/webaudio/AudioParam">
   *  Web Audio Audio Param.</a>
   *
   *  @method  play
   *  @param  {Object} input        A p5.sound object or
   *                                Web Audio Param
   *  @param  {Number} time time from now (in seconds)
   */
  p5.Env.prototype.play = function(input, timeFromNow){
    var unit = input;
    // if no input is given, input is this Envelope's input
    if (!input){
      input = this.control;
    }
    // assume we're talking about output gain, unless given a different audio param
    if (input.output !== undefined){
      input = input.output.gain;
    }
    this.control = input;

    var now =  p5sound.audiocontext.currentTime + 0.001;
    var tFromNow = timeFromNow || 0;
    var t = now + tFromNow;

   // if unit is an oscillator, set its amp to 0 and start it
    // if (unit.hasOwnProperty('oscillator')){
    //   window.setTimeout(startThing, t - .02)
    // }
    // function startThing() {
    //   if (!unit.started) {
    //     unit.amp(0);
    //     unit.start();
    //   }
    // }

    input.cancelScheduledValues(now);
    input.setValueAtTime(0, now);
    // attack
    input.linearRampToValueAtTime(this.attackLevel, t + this.attackTime);
    // decay to decay level
    input.linearRampToValueAtTime(this.decayLevel, t + this.attackTime + this.decayTime);
    // hold sustain level
    input.linearRampToValueAtTime(this.sustainLevel, t + this.attackTime + this.decayTime + this.sustainTime);
    // release
    input.linearRampToValueAtTime(this.releaseLevel, t + this.attackTime + this.decayTime + this.sustainTime + this.releaseTime);
  };

  /**
   *  Trigger the Attack, Decay, and Sustain of the Envelope.
   *  Similar to holding down a key on a piano, but it will
   *  hold the sustain level until you let go. Input can be
   *  any p5.sound object, or a <a href="
   *  http://docs.webplatform.org/wiki/apis/webaudio/AudioParam">
   *  Web Audio Param</a>.
   *
   *  @method  triggerAttack
   *  @param  {Object} input p5.sound Object or Web Audio Param
   *  @param  {Number} time time from now (in seconds)
   */
  p5.Env.prototype.triggerAttack = function(input, timeFromNow) {
    var unit = input;
    var now =  p5sound.audiocontext.currentTime + 0.001;
    var tFromNow = timeFromNow || 0;
    var t = now + tFromNow;
    this.lastAttack = t;

    // if no input is given, input is this Envelope's input
    if (!input){
      input = this.control;
    }
    // assume we're talking about output gain, unless given a different audio param
    if (input.output !== undefined){
      input = input.output.gain;
    }
    this.control = input;

    // if unit is an oscillator, set its amp to 0 and start it
    // if (unit.hasOwnProperty('oscillator')){
    //   window.setTimeout(startThing, t - .02)
    // }
    // function startThing() {
    //   if (!unit.started) {
    //     unit.amp(0);
    //     unit.start();
    //   }
    // }

    var currentVal =  input.value;
    input.cancelScheduledValues(t);
    input.setValueAtTime(currentVal, t);

    input.linearRampToValueAtTime(this.attackLevel, t + this.attackTime);

    // attack
    input.linearRampToValueAtTime(this.attackLevel, t + this.attackTime);
    // decay to sustain level
    input.linearRampToValueAtTime(this.decayLevel, t + this.attackTime + this.decayTime);
    // hold sustain level
    input.linearRampToValueAtTime(this.sustainLevel, t + this.attackTime + this.decayTime + this.sustainTime);
  };

  /**
   *  Trigger the Release of the Envelope. This is similar to releasing
   *  the key on a piano and letting the sound fade according to the
   *  release level and release time.
   *
   *  @method  triggerRelease
   *  @param  {Object} input p5.sound Object or Web Audio Param
   */
  p5.Env.prototype.triggerRelease = function(input, timeFromNow) {
    var unit = input;
    var now =  p5sound.audiocontext.currentTime + 0.001;

    // calculate additional time of the envelope
    var envTime = this.attackTime + this.decayTime + this.sustainTime - now;

    var tFromNow = timeFromNow || 0;
    var t = now + tFromNow + envTime;

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
    input.cancelScheduledValues(t+ .001);
    input.setValueAtTime(currentVal, t + .001);

    // release
    // input.linearRampToValueAtTime(this.releaseLevel, t + this.releaseTime);
    // var rTime = t + this.releaseTime;
    // window.setTimeout( clearThing, rTime );

    // // if unit is an oscillator, and volume is 0, stop it to save memory
    // function clearThing() {
    //   if (unit.hasOwnProperty('oscillator'))
    //   unit.stop();
    //   console.log('stopped unit')
    // }

  };


});