define(function (require) {
  'use strict';

  var p5sound = require('master');
  var Add = require('Tone/signal/Add');
  var Mult = require('Tone/signal/Multiply');
  var Scale = require('Tone/signal/Scale');

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

    this.output = p5sound.audiocontext.createGain();;

    this.control =  new p5.Signal();

    this.control.connect(this.output);

    this.connection = null; // store connection

    //array of math operation signal chaining
    this.mathOps = [this.control];

    // oscillator or buffer source to clear on env complete
    // to save resources if/when it is retriggered
    this.sourceToClear = null;

    // set to true if attack is set, then false on release
    this.wasTriggered = false;


    // add to the soundArray so we can dispose of the env later
    p5sound.soundArray.push(this);
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
   *  @param {Number} [dLevel]   Amplitude (In a standard ADSR envelope,
   *                                 decayLevel = sustainLevel)
   *  @param {Number} [sTime]   Time (in seconds)
   *  @param {Number} [sLevel]  Amplitude 0.0 to 1.0
   *  @param {Number} [rTime]   Time (in seconds)
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

  p5.Env.prototype.ctrl = function(unit){
    this.connect(unit);
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

    var currentVal =  this.control.getValue(); 
    this.control.cancelScheduledValues(t);
    this.control.linearRampToValueAtTime(currentVal, t);

    // attack
    this.control.linearRampToValueAtTime(this.aLevel, t + this.aTime);
    // decay to decay level
    this.control.linearRampToValueAtTime(this.dLevel, t + this.aTime + this.dTime);
    // hold sustain level
    this.control.linearRampToValueAtTime(this.sLevel, t + this.aTime + this.dTime + this.sTime);
    // release
    this.control.linearRampToValueAtTime(this.rLevel, t + this.aTime + this.dTime + this.sTime + this.rTime);

    var clearTime = (t + this.aTime + this.dTime + this.sTime + this.rTime); //* 1000;

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

    // we should set current value, but this is not working on Firefox
    var currentVal =  this.control.getValue(); 
    console.log(currentVal);
    this.control.cancelScheduledValues(t);
    this.control.linearRampToValueAtTime(currentVal, t);

    if (unit) {
      if (this.connection !== unit) {
        this.connect(unit);
      }
    }

    this.control.linearRampToValueAtTime(this.aLevel, t + this.aTime);

    // attack
    this.control.linearRampToValueAtTime(this.aLevel, t + this.aTime);
    // decay to sustain level
    this.control.linearRampToValueAtTime(this.dLevel, t + this.aTime + this.dTime);

    this.control.linearRampToValueAtTime(this.sLevel, t + this.aTime + this.dTime + this.sTime);

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
      return;
    }

    var now =  p5sound.audiocontext.currentTime;
    var tFromNow = secondsFromNow || 0;
    var t = now + tFromNow;
    var relTime;

    if (unit) {
      if (this.connection !== unit) {
        this.connect(unit);
      }
    }

    this.control.cancelScheduledValues(t);

    // ideally would get & set currentValue here,
    // but this.control._scalar.gain.value not working in firefox

    // release based on how much time has passed since this.lastAttack
    if ( (t - this.lastAttack) < (this.aTime) ) {
      var a = this.aTime - (t - this.lastAttack);
      this.control.linearRampToValueAtTime(this.aLevel, t + a);
      this.control.linearRampToValueAtTime(this.dLevel, t + a + this.dTime);
      this.control.linearRampToValueAtTime(this.sLevel, t + a + this.dTime + this.sTime);
      this.control.linearRampToValueAtTime(this.rLevel, t + a + this.dTime + this.sTime + this.rTime);
      relTime = t + this.dTime + this.sTime + this.rTime;
    }
    else if ( (t - this.lastAttack) < (this.aTime + this.dTime) ) {
      var d = this.aTime + this.dTime - (now - this.lastAttack);
      this.control.linearRampToValueAtTime(this.dLevel, t + d);
      // this.control.linearRampToValueAtTime(this.sLevel, t + d + this.sTime);
      this.control.linearRampToValueAtTime(this.sLevel, t + d + 0.01);
      this.control.linearRampToValueAtTime(this.rLevel, t + d + 0.01 + this.rTime);
      relTime = t + this.sTime + this.rTime;
    } 
    else if ( (t - this.lastAttack) < (this.aTime + this.dTime + this.sTime) ) {
      var s = this.aTime + this.dTime + this.sTime - (now - this.lastAttack);
      this.control.linearRampToValueAtTime(this.sLevel, t + s);
      this.control.linearRampToValueAtTime(this.rLevel, t + s + this.rTime);
      relTime = t + this.rTime;
    }
    else {
      this.control.linearRampToValueAtTime(this.sLevel, t);
      this.control.linearRampToValueAtTime(this.rLevel, t + this.rTime);
      relTime = t + this.dTime + this.sTime + this.rTime;
    }

    // clear osc / sources
    var clearTime = (t + this.aTime + this.dTime + this.sTime + this.rTime); // * 1000;

    if (this.connection && this.connection.hasOwnProperty('oscillator')) {
      this.sourceToClear = this.connection.oscillator;
      this.sourceToClear.stop(clearTime + .01);
    } else if (this.connect && this.connection.hasOwnProperty('source')){
      this.sourceToClear = this.connection.source;
      this.sourceToClear.stop(clearTime + .01);
    }

    this.wasTriggered = false;
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