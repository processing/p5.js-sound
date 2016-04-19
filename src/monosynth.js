define(function (require) {
  'use strict';

  var p5sound = require('master');
  require('sndcore');

     /**
    *  An MonoSynth is used as a single voice for sound synthesis.
    *  This is a class to be used in conjonction with the PolySynth
    *  class. Custom synthetisers should be built inheriting from
    *  this class.
    *
    *  @class p5.MonoSynth
    *  @constructor
    *  
    **/

  p5.MonoSynth = function (){

    this.context = p5sound.audiocontext;
    this.output = this.context.createGain();

    this.attack = 0.02;
    this.decay=0.25;
    this.sustain=0.05;
    this.release=0.35;

    // default voice
    this.oscillator = new p5.Oscillator();
    this.oscillator.start();

    // envelope
    this.env = new p5.Env();
    this.env.setADSR(this.attack, this.decay, this.sustain, this.release);
    this.env.setRange(1, 0);
    this.env.setExp(true);

    // filter
    this.filter = new p5.HighPass();
    this.filter.set(5, 1);

    // oscillator --> env --> filter --> this.output (gain) --> p5.soundOut
    this.env.setInput(this.oscillator);
    this.env.connect(this.filter.input);
    this.filter.connect(this.output);

    // connect to master output by default
    this.output.connect(p5sound.input);

    p5sound.soundArray.push(this);
  };


  /**
   *  Used internally by play() and triggerAttack()
   *  to set the note of this.oscillator to a MIDI value.
   *
   *  Synth creators with more complex setups may have overridden
   *  the oscillator chain with more than one oscillator,
   *  and should override this method accordingly.
   *  
   *  @param   {Number} note           midi value of a note, where 
   *                                   middle c is 60
   *  @param   {Number} [secondsFromNow] (optional) a time (in seconds
   *                                     from now) at which
   *                                     to set the note
   *  @private
   */
  p5.MonoSynth.prototype._setNote = function(note, secondsFromNow){
    var freqVal = p5.prototype.midiToFreq(note);
    var t = secondsFromNow || 0;
    this.oscillator.freq(freqVal, 0, t);
  };

  /**
     *  Play tells the MonoSynth to start playing a note
     *  
     *  @method playNote 
     *  @param  {Number} [note] midi note to play (ranging from 0 to 127 - 60 being a middle C)
     *  @param  {Number} [velocity] velocity of the note to play (ranging from 0 to 1)
     *  @param  {Number} [secondsFromNow]  time from now (in seconds) at which to play
     *  @param  {Number} [sustainTime] time to sustain before releasing the envelope
     *  
     */  

  p5.MonoSynth.prototype.play = function (note, velocity, secondsFromNow, susTime){
    this._setNote(note, secondsFromNow);

    // set range of env (TO DO: allow this to be scheduled in advance)
    var vel = velocity || 1;
    this.env.setRange(vel, 0);

    this.env.play(this.output, secondsFromNow, susTime);
  };

  /**
     *  Trigger the Attack, and Decay portion of the Envelope.
     *  Similar to holding down a key on a piano, but it will
     *  hold the sustain level until you let go. 
     *
     *  @param  {Number} secondsFromNow time from now (in seconds)
     *  @param  {Number} [velocity] velocity of the note to play (ranging from 0 to 1)
     *  @param  {Number} [secondsFromNow]  time from now (in seconds) at which to play
     *  @method  triggerAttack
     */  
  p5.MonoSynth.prototype.triggerAttack = function (note, velocity, secondsFromNow){
    this._setNote(note, secondsFromNow);

    this.env.ramp(this.output, secondsFromNow , vel);
    // this.env.triggerAttack(this.output, secondsFromNow);
  };

  /**
     *  Trigger the Release of the Envelope. This is similar to releasing
     *  the key on a piano and letting the sound fade according to the
     *  release level and release time.
     *  
     *  @param  {Number} secondsFromNow time to trigger the release
     *  @method  triggerRelease
     */  

  p5.MonoSynth.prototype.triggerRelease = function (secondsFromNow){
    this.env.ramp(this.output, secondsFromNow, 0);
    // this.env.triggerRelease(this.output, secondsFromNow);
  };


  /**
     *  Set cutoms parameters to a specific synth implementation.
     *  This method does nothing by default unless you implement
     *  something for it.
     *  For instance if you want to build a complex synthesizer
     *  with one or more filters, effects etc. this is where you
     *  will want to set their values.
     *  
     *  @method  setParams
     *  @param   
     * 
     */  

  p5.MonoSynth.prototype.setParams = function(params){

  };

  /**
     *  Set values like a traditional
     *  <a href="https://en.wikipedia.org/wiki/Synthesizer#/media/File:ADSR_parameter.svg">
     *  ADSR envelope
     *  </a>.
     *  
     *  @method  setADSR
     *  @param {Number} attackTime    Time (in seconds before envelope
     *                                reaches Attack Level
     *  @param {Number} [decayTime]    Time (in seconds) before envelope
     *                                reaches Decay/Sustain Level
     *  @param {Number} [susRatio]    Ratio between attackLevel and releaseLevel, on a scale from 0 to 1,
     *                                where 1.0 = attackLevel, 0.0 = releaseLevel.
     *                                The susRatio determines the decayLevel and the level at which the
     *                                sustain portion of the envelope will sustain.
     *                                For example, if attackLevel is 0.4, releaseLevel is 0,
     *                                and susAmt is 0.5, the decayLevel would be 0.2. If attackLevel is
     *                                increased to 1.0 (using <code>setRange</code>),
     *                                then decayLevel would increase proportionally, to become 0.5.
     *  @param {Number} [releaseTime]   Time in seconds from now (defaults to 0)
     **/

  p5.MonoSynth.prototype.setADSR = function (a,d,s,r){
    this.attack = a;
    this.decay=d;
    this.sustain=s;
    this.release=r;
    this.env.setADSR(this.attack, this.decay,  this.sustain, this.release); 
  };

  /**
   *  Connect to a p5.sound / Web Audio object.
   *
   *  @method  connect
   *  @param  {Object} unit A p5.sound or Web Audio object
   */
  p5.MonoSynth.prototype.connect = function(unit) {
    var u = unit || p5sound.input;
    this.output.connect(u.input ? u.input : u);
  };

  /**
   *  Disconnect all outputs
   *
   *  @method  disconnect
   */
  p5.MonoSynth.prototype.disconnect = function() {
    this.output.disconnect();
  };


  /**
   *  Get rid of the MonoSynth and free up its resources / memory.
   *  
   *  @method  dispose
   */
  p5.MonoSynth.prototype.dispose = function() {
    this.filter.dispose();
    this.env.dispose();

    try {
      this.oscillator.dispose();
    } catch(e) {
      console.error('mono synth default oscillator already disposed')
    }

    this.output.disconnect();
    this.output = undefined;
  };

});
