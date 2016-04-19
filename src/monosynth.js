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



  this.attack = 0.25;
  this.decay=0.25;
  this.sustain=0.95;
  this.release=0.25;


  this.env = new p5.Env();
  this.env.setADSR(this.attack, this.decay, this.sustain, this.release);
  this.env.setRange(1, 0);
  this.env.setExp(true);

  this.synthOut = new p5.HighPass();
  this.synthOut.set(5, 1);
  
  this.env.setInput(this.synthOut);

  this.synthOut.connect(p5.soundOut);


  this._setNote= function(note){

  }
  p5sound.soundArray.push(this);
}


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

p5.MonoSynth.prototype.play = function (note, secondsFromNow, susTime){
  this._setNote(note);
  this.env.play(this.synthOut, secondsFromNow, susTime);
}

/**
   *  Trigger the Attack, and Decay portion of the Envelope.
   *  Similar to holding down a key on a piano, but it will
   *  hold the sustain level until you let go. 
   *
   *  @param  {Number} secondsFromNow time from now (in seconds)
   *  @method  triggerAttack
   */  
p5.MonoSynth.prototype.triggerAttack = function (secondsFromNow){
  this.env.triggerAttack(this.synthOut,secondsFromNow);
}

/**
   *  Trigger the Release of the Envelope. This is similar to releasing
   *  the key on a piano and letting the sound fade according to the
   *  release level and release time.
   *  
   *  @param  {Number} secondsFromNow time to trigger the release
   *  @method  triggerRelease
   */  

p5.MonoSynth.prototype.triggerRelease = function (secondsFromNow){
  this.env.triggerRelease( this.synthOut,secondsFromNow);
}


/**
   *  Set cutoms parameters to a specific synth implementation.
   *  This method does nothing by default unless you implement
   *  something for it.
   *  For instance if you want to build a complex synthetiser
   *  with one or more filters, effects etc. this is where you
   *  will want to set them.
   *  
   *  @method  setParams
   *  @param   
   * 
   */  

p5.MonoSynth.prototype.setParams = function(params){

}

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
}

});
