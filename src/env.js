define(function (require) {
  'use strict';

  var p5sound = require('master');
  var Add = require('Tone/signal/Add');
  var Mult = require('Tone/signal/Multiply');
  var Scale = require('Tone/signal/Scale');
  var TimelineSignal = require('Tone/signal/TimelineSignal');

  var Tone = require('Tone/core/Tone');
  Tone.setContext( p5sound.audiocontext);

  /**
   *  <p>Envelopes are pre-defined amplitude distribution over time. 
   *  The p5.Env accepts up to four time/level pairs, where time
   *  determines how long of a ramp before value reaches level.
   *  Typically, envelopes are used to control the output volume
   *  of an object, a series of fades referred to as Attack, Decay,
   *  Sustain and Release (ADSR). But p5.Env can control any
   *  Web Audio Param, for example it can be passed to an Oscillator
   *  frequency like osc.freq(env) </p>
   *  
   *  @class p5.Env
   *  @constructor
   *  @param {Number} aTime     Time (in seconds) before level
   *                                 reaches attackLevel
   *  @param {Number} aLevel    Typically an amplitude between
   *                                 0.0 and 1.0
   *  @param {Number} dTime      Time
   *  @param {Number} [dLevel]   Amplitude (In a standard ADSR envelope,
   *                                 decayLevel = sustainLevel)
   *  @param {Number} [sTime]   Time (in seconds)
   *  @param {Number} [sLevel]  Amplitude 0.0 to 1.0
   *  @param {Number} [rTime]   Time (in seconds)
   *  @param {Number} [rLevel]  Amplitude 0.0 to 1.0
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
   *    background(0);
   *    noStroke();
   *    fill(255);
   *    textAlign(CENTER);
   *    text('click to play', width/2, height/2);
   *
   *    env = new p5.Env(aT, aL, dT, dL, sT, sL, rT);
   *    triOsc = new p5.Oscillator('triangle');
   *    triOsc.amp(env); // give the env control of the triOsc's amp
   *    triOsc.start();
   *  }
   *
   *  // mouseClick triggers envelope if over canvas
   *  function mouseClicked() {
   *    // is mouse over canvas?
   *    if (mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height) {
   *      env.play(triOsc);
   *    }
   *  }
   *  </code></div>
   */
  p5.Env = function(t1, l1, t2, l2, t3, l3, t4, l4){
    var now = p5sound.audiocontext.currentTime;

    /**
     * @property attackTime
     */
    this.aTime = t1;
    /**
     * @property attackLevel
     */
    this.aLevel = l1;
    /**
     * @property decayTime
     */
    this.dTime = t2 || 0;
    /**
     * @property decayLevel
     */
    this.dLevel = l2 || 0;
    /**
     * @property sustainTime
     */
    this.sTime = t3 || 0;
    /**
     * @property sustainLevel
     */
    this.sLevel = l3 || 0;
    /**
     * @property releaseTime
     */
    this.rTime = t4 || 0;
    /**
     * @property releaseLevel
     */
    this.rLevel = l4 || 0;

    this.rampHighPercentage = 0.98;

    this.rampLowPercentage = 0.02;

    this.rampAttackTime = 0.01;
    this.rampDecayTime = 0.5;

    this.rampAttackTC = 0.12;
    this.rampDecayTC = 0.12;

    this.output = p5sound.audiocontext.createGain();;

    this.control = new TimelineSignal();

    this.init(); // this makes sure the envelope starts at zero

    this.control.connect(this.output); // connect to the output

    this.connection = null; // store connection

    //array of math operation signal chaining
    this.mathOps = [this.control];

    //whether envelope should be linear or exponential curve
    this.isExponential = false;

    // oscillator or buffer source to clear on env complete
    // to save resources if/when it is retriggered
    this.sourceToClear = null;

    // set to true if attack is set, then false on release
    this.wasTriggered = false;


    // add to the soundArray so we can dispose of the env later
    p5sound.soundArray.push(this);
  };

  // this init function just smooths the starting value to zero and gives a start point for the timeline
  // - it was necessary to remove glitches at the beginning.
  p5.Env.prototype.init = function () {
    var now = p5sound.audiocontext.currentTime;
    var t = now;
    this.control.setTargetAtTime(0.00001, t, .001);
    //also, compute the correct time constants
    this.setRampAD(this.rampAttackTime, this.rampDecayTime)
  };

  /**
   *  Reset the envelope with a series of time/value pairs.
   *
   *  @method  set
   *  @param {Number} aTime     Time (in seconds) before level
   *                                 reaches attackLevel
   *  @param {Number} aLevel    Typically an amplitude between
   *                                 0.0 and 1.0
   *  @param {Number} dTime      Time
   *  @param {Number} [sLevel]   Amplitude (In a standard ADSR envelope,
   *                                 decayLevel = sustainLevel)
   *  @param {Number} [rTime]   Release Time (in seconds)
   *  @param {Number} [rLevel]  Amplitude 0.0 to 1.0
   */
  p5.Env.prototype.set = function(t1, l1, t2, l2, t3, l3, t4, l4){
    this.aTime = t1;
    this.aLevel = l1;
    this.dTime = t2 || 0;
    this.dLevel = l2 || 0;
    this.sTime = t3 || 0;
    this.sLevel = l3 || 0;
    this.rTime = t4 || 0;
    this.rLevel = l4 || 0;
  };

  /**
   *  Set values like a traditional
   *  <a href="https://en.wikipedia.org/wiki/Synthesizer#/media/File:ADSR_parameter.svg">
   *  ADSR envelope
   *  </a>.
   *  
   *  @method  setADSR
   *  @param {Number} attackTime    in seconds from now 
   *  @param {Number} attackVal     value
   *  @param {Number} [decayTime]    in seconds from now  (defaults to 0)
   *  @param {Number} [sustainVal]    value (defaults to 0)
   *  @param {Number} [releaseTime]   in seconds from now (defaults to 0)
   *  @param {Number} [releaseVal]    value (defaults to 0)
   */
  p5.Env.prototype.setADSR = function(t1, l1, t2, l2, t3, l3){
    this.aTime = t1;
    this.aLevel = l1;
    this.dTime = t2 || 0;
    this.dLevel = l2 || 0;
    this.sTime = 0;
    this.sLevel = l2 || 0;
    this.rTime = t3 || 0;
    this.rLevel = l3 || 0;
  };

  /**
   *  Set the <a href="https://en.wikipedia.org/wiki/RC_time_constant">
   *  time constants</a> for simple exponential ramps.
   *  The larger the time constant value, the slower the
   *  transition will be.
   *
   *  @method  setRampAD
   *  @param {Number} attackTimeConstant  attack time constant
   *  @param {Number} decayTimeConstant   decay time constant
   */
  p5.Env.prototype.setRampAD = function(t1, t2){
    this.rampAttackTime = this.checkExpInput(t1);
    this.rampDecayTime = this.checkExpInput(t2);
    var TCDenominator = 1.0;
    /// Aatish Bhatia's calculation for time constant for rise(to adjust 1/1-e calculation to any percentage)
    TCDenominator = Math.log(1.0 / (this.checkExpInput(1.0 - this.rampHighPercentage)));
    this.rampAttackTC = (t1 / this.checkExpInput(TCDenominator));
    TCDenominator = Math.log(1.0 / this.rampLowPercentage);
    this.rampDecayTC = (t2 / this.checkExpInput(TCDenominator));
  };

  p5.Env.prototype.setRampPercentages = function(p1, p2){
    //set the percentages that the simple exponential ramps go to
    this.rampHighPercentage = this.checkExpInput(p1);
    this.rampLowPercentage = this.checkExpInput(p2);
    var TCDenominator = 1.0;
    //now re-compute the time constants based on those percentages
    /// Aatish Bhatia's calculation for time constant for rise(to adjust 1/1-e calculation to any percentage)
    TCDenominator = Math.log(1.0 / (this.checkExpInput(1.0 - this.rampHighPercentage)));
    this.rampAttackTC = (this.rampAttackTime / this.checkExpInput(TCDenominator));
    TCDenominator = Math.log(1.0 / this.rampLowPercentage);
    this.rampDecayTC = (this.rampDecayTime / this.checkExpInput(TCDenominator));
  };


  /**
   *  Assign a parameter to be controlled by this envelope.
   *  If a p5.Sound object is given, then the p5.Env will control its
   *  output gain. If multiple inputs are provided, the env will
   *  control all of them.
   *  
   *  @method  setInput
   *  @param  {Object} unit         A p5.sound object or
   *                                Web Audio Param.
   */
  p5.Env.prototype.setInput = function(unit){
    for (var i = 0; i<arguments.length; i++) {
      this.connect(arguments[i]);
    }
  };

  /**
   *  Set whether the envelope ramp is linear (default) or exponential.
   *  Exponential ramps can be useful because we perceive amplitude
   *  and frequency logarithmically.
   *  
   *  @method  setExp
   *  @param {Boolean} isExp true is exponential, false is linear
   */
  p5.Env.prototype.setExp = function(isExp){
    this.isExponential = isExp;
  };

  //helper method to protect against zero values being sent to exponential functions
  p5.Env.prototype.checkExpInput = function(value) {
    if (value <= 0)
    {
      value = 0.0001;
    }
    return value;
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
   *  @param  {Object} unit         A p5.sound object or
   *                                Web Audio Param.
   *  @param  {Number} secondsFromNow time from now (in seconds)
   */
  p5.Env.prototype.play = function(unit, secondsFromNow){
    var now =  p5sound.audiocontext.currentTime;
    var tFromNow = secondsFromNow || 0;
    var t = now + tFromNow;

    if (unit) {
      if (this.connection !== unit) {
        this.connect(unit);
      }
    }

    this.triggerAttack(unit, secondsFromNow);

    this.triggerRelease(unit, secondsFromNow + this.aTime + this.dTime + this.sTime);

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
   *  @param  {Object} unit p5.sound Object or Web Audio Param
   *  @param  {Number} secondsFromNow time from now (in seconds)
   */
  p5.Env.prototype.triggerAttack = function(unit, secondsFromNow) {
    var now =  p5sound.audiocontext.currentTime;
    var tFromNow = secondsFromNow || 0;
    var t = now + tFromNow;
    this.lastAttack = t;
    this.wasTriggered = true;

    if (unit) {
      if (this.connection !== unit) {
        this.connect(unit);
      }
    }

    // get and set value (with linear ramp) to anchor automation
    var valToSet = this.control.getValueAtTime(t);
    this.control.cancelScheduledValues(t); // not sure if this is necessary
    if (this.isExponential == true)
    {
      this.control.exponentialRampToValueAtTime(this.checkExpInput(valToSet), t);
    }
    else
    {
      this.control.linearRampToValueAtTime(valToSet, t);
    }

    // after each ramp completes, cancel scheduled values
    // (so they can be overridden in case env has been re-triggered)
    // then, set current value (with linearRamp to avoid click)
    // then, schedule the next automation...

    // attack
    t += this.aTime;
    if (this.isExponential == true)
    {
      this.control.exponentialRampToValueAtTime(this.checkExpInput(this.aLevel), t);
      valToSet = this.checkExpInput(this.control.getValueAtTime(t));
      this.control.cancelScheduledValues(t);
      this.control.exponentialRampToValueAtTime(valToSet, t);
    }
    else
    {
      this.control.linearRampToValueAtTime(this.aLevel, t);
      valToSet = this.control.getValueAtTime(t);
      this.control.cancelScheduledValues(t);
      this.control.linearRampToValueAtTime(valToSet, t);
    }

    // decay to decay level (if using ADSR, then decay level == sustain level)
    t += this.dTime;
    if (this.isExponential == true)
    {
      this.control.exponentialRampToValueAtTime(this.checkExpInput(this.dLevel), t);
      valToSet = this.checkExpInput(this.control.getValueAtTime(t));
      this.control.cancelScheduledValues(t);
      this.control.exponentialRampToValueAtTime(valToSet, t);
    }
    else
    {
      this.control.linearRampToValueAtTime(this.dLevel, t);
      valToSet = this.control.getValueAtTime(t);
      this.control.cancelScheduledValues(t);
      this.control.linearRampToValueAtTime(valToSet, t);
    }

    // move to sustain level and hold for sustain time (if using ADSR, sustain time is set to 0 and sustain level is set to decay level)
    t += this.sTime;
    if (this.isExponential == true)
    {
      this.control.exponentialRampToValueAtTime(this.checkExpInput(this.sLevel), t);
      valToSet = this.checkExpInput(this.control.getValueAtTime(t));
      this.control.cancelScheduledValues(t);
      this.control.exponentialRampToValueAtTime(valToSet, t);
    }
    else
    {
      this.control.linearRampToValueAtTime(this.sLevel, t);
      valToSet = this.control.getValueAtTime(t);
      this.control.cancelScheduledValues(t);
      this.control.linearRampToValueAtTime(valToSet, t);
    }
  };

  /**
   *  Trigger the Release of the Envelope. This is similar to releasing
   *  the key on a piano and letting the sound fade according to the
   *  release level and release time.
   *
   *  @method  triggerRelease
   *  @param  {Object} unit p5.sound Object or Web Audio Param
   *  @param  {Number} secondsFromNow time to trigger the release
   */
  p5.Env.prototype.triggerRelease = function(unit, secondsFromNow) {

    // only trigger a release if an attack was triggered
    if (!this.wasTriggered) {
      // this currently causes a bit of trouble:
      // if a later release has been scheduled (via the play function)
      // a new earlier release won't interrupt it, because 
      // this.wasTriggered has already been set to false.
      // If we want new earlier releases to override, then we need to 
      // keep track of the last release time, and if the new release time is 
      // earlier, then use it.
      return;
    }

    var now =  p5sound.audiocontext.currentTime;
    var tFromNow = secondsFromNow || 0;
    var t = now + tFromNow;

    if (unit) {
      if (this.connection !== unit) {
        this.connect(unit);
      }
    }

    // get and set value (with linear or exponential ramp) to anchor automation
    var valToSet = this.control.getValueAtTime(t);
    this.control.cancelScheduledValues(t); // not sure if this is necessary
    if (this.isExponential == true)
    {
      this.control.exponentialRampToValueAtTime(this.checkExpInput(valToSet), t);
    }
    else
    {
      this.control.linearRampToValueAtTime(valToSet, t);
    }
    
    // release
    t += this.rTime;

    if (this.isExponential == true)
    {
      this.control.exponentialRampToValueAtTime(this.checkExpInput(this.rLevel), t);
      valToSet = this.checkExpInput(this.control.getValueAtTime(t));
      this.control.cancelScheduledValues(t);
      this.control.exponentialRampToValueAtTime(valToSet, t);
    }
    else
    {
      this.control.linearRampToValueAtTime(this.rLevel, t);
      valToSet = this.control.getValueAtTime(t);
      this.control.cancelScheduledValues(t);
      this.control.linearRampToValueAtTime(valToSet, t);
    }

    this.wasTriggered = false;
  };

  /**
   *  Exponentially ramp to a value using time constants.
   *  If the value is higher than current value, it uses attackTime,
   *  while a decrease uses decayTime.
   *
   *  @method  ramp
   *  @param  {Object} unit           p5.sound Object or Web Audio Param
   *  @param  {Number} secondsFromNow When to trigger the ramp
   *  @param  {Number} v              Target value
   *  @param  {Number} [v2]           Second target value (optional)
   */
  p5.Env.prototype.ramp = function(unit, secondsFromNow, v1, v2) {

    var now =  p5sound.audiocontext.currentTime;
    var tFromNow = secondsFromNow || 0;
    var t = now + tFromNow;
    var destination1 = this.checkExpInput(v1);
    var destination2 = typeof(v2) !== 'undefined' ? this.checkExpInput(v2) : undefined;

    // connect env to unit if not already connected
    if (unit) {
      if (this.connection !== unit) {
        this.connect(unit);
      }
    }

    //get current value
    var currentVal = this.checkExpInput(this.control.getValueAtTime(t));
    this.control.cancelScheduledValues(t); 

    //if it's going up
    if (destination1 > currentVal) {
      this.control.setTargetAtTime(destination1, t, this.rampAttackTC);
      t += this.rampAttackTime;
    }
    
    //if it's going down
    else if (destination1 < currentVal) {
      this.control.setTargetAtTime(destination1, t, this.rampDecayTC);
      t += this.rampDecayTime;
    }

    // Now the second part of envelope begins
    if (destination2 === undefined) return;

    //if it's going up
    if (destination2 > destination1) {
      this.control.setTargetAtTime(destination2, t, this.rampAttackTC);
    }
    
    //if it's going down
    else if (destination2 < destination1) {
      this.control.setTargetAtTime(destination2, t, this.rampDecayTC);
    }
  };


  p5.Env.prototype.connect = function(unit){
    this.connection = unit;

    // assume we're talking about output gain
    // unless given a different audio param
    if (unit instanceof p5.Oscillator ||
        unit instanceof p5.SoundFile ||
        unit instanceof p5.AudioIn ||
        unit instanceof p5.Reverb ||
        unit instanceof p5.Noise ||
        unit instanceof p5.Filter ||
        unit instanceof p5.Delay
    ){
      unit = unit.output.gain;
    }
    if (unit instanceof AudioParam){
      //set the initial value
      unit.setValueAtTime(0, p5sound.audiocontext.currentTime);
    }
    if (unit instanceof p5.Signal){
      unit.setValue(0);
    }
    this.output.connect(unit);
  };

  p5.Env.prototype.disconnect = function(unit){
    this.output.disconnect();
  };



  // Signal Math

  /**
   *  Add a value to the p5.Oscillator's output amplitude,
   *  and return the oscillator. Calling this method
   *  again will override the initial add() with new values.
   *  
   *  @method  add
   *  @param {Number} number Constant number to add
   *  @return {p5.Env} Envelope Returns this envelope
   *                                     with scaled output
   */
  p5.Env.prototype.add = function(num) {
    var add = new Add(num);
    var thisChain = this.mathOps.length;
    var nextChain = this.output;
    return p5.prototype._mathChain(this, add, thisChain, nextChain, Add);
  };

  /**
   *  Multiply the p5.Env's output amplitude
   *  by a fixed value. Calling this method
   *  again will override the initial mult() with new values.
   *  
   *  @method  mult
   *  @param {Number} number Constant number to multiply
   *  @return {p5.Env} Envelope Returns this envelope
   *                                     with scaled output
   */
  p5.Env.prototype.mult = function(num) {
    var mult = new Mult(num);
    var thisChain = this.mathOps.length;
    var nextChain = this.output;
    return p5.prototype._mathChain(this, mult, thisChain, nextChain, Mult);
  };

  /**
   *  Scale this envelope's amplitude values to a given
   *  range, and return the envelope. Calling this method
   *  again will override the initial scale() with new values.
   *  
   *  @method  scale
   *  @param  {Number} inMin  input range minumum
   *  @param  {Number} inMax  input range maximum
   *  @param  {Number} outMin input range minumum
   *  @param  {Number} outMax input range maximum
   *  @return {p5.Env} Envelope Returns this envelope
   *                                     with scaled output
   */
  p5.Env.prototype.scale = function(inMin, inMax, outMin, outMax) {
    var scale = new Scale(inMin, inMax, outMin, outMax);
    var thisChain = this.mathOps.length;
    var nextChain = this.output;
    return p5.prototype._mathChain(this, scale, thisChain, nextChain, Scale);
  };


  // get rid of the oscillator
  p5.Env.prototype.dispose = function() {
    // remove reference from soundArray
    var index = p5sound.soundArray.indexOf(this);
    p5sound.soundArray.splice(index, 1);

    var now = p5sound.audiocontext.currentTime;
    this.disconnect();
    try{
      this.control.dispose();
      this.control = null;
    } catch(e) {}
    for (var i = 1; i < this.mathOps.length; i++) {
      mathOps[i].dispose();
    }
  };

});