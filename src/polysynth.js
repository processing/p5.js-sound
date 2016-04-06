define(function (require) {
  'use strict';

  var p5sound = require('master');
  require('sndcore');
  require('polysynth');

  /**
    *  An AudioVoice is used as a single voice for sound synthesis.
    *  The PolySynth class holds an array of AudioVoice, and deals
    *  with voices allocations, with setting notes to be played, and
    *  parameters to be set. 
    *
    *  @class p5.PolySynth
    *  @constructor
    *  @param {Number} [num]    Number of voices used by the polyphonic
    *                           synthetiser.
    *                              
    *  @param {Number} [synthVoice]   A monophonic synth voice inheriting
    *                                 the AudioVoice class.
    *  @example 
    *  <div><code>
    *   var psynthDetune; 
    *   
    *   function setup() {
    *   
    *     frameRate(25);
    *   
    *     // create a polyphonic synth with 15 voices.
    *     // this synth will use the DetuneOsc synth definition below
    *     psynthDetune = new p5.PolySynth(15,DetunedOsc); 
    *     
    *   }
    *   
    *   function draw() {
    *     background(0);
    *     fill(255);  
    *     textAlign(CENTER,CENTER);
    *     text("Click Me !",width/2,height/2);
    *   }
    *   
    *   function mousePressed(){
    *     // play a note when mouse is pressed
    *     var note = int(map(mouseX,0,width,60,84)); // a midi note mapped to x-axis
    *     var length = map(mouseY,0,300,0,5); // a note length parameter mapped to y-axis.
    *   
    *     psynthDetune.setADSR(0.021,0.025,length,0.025);
    *     // set the detune parameters randomely
    *     var d = int(random(1,12));
    *     psynthDetune.setParams({detune: d });
    *     // set the note to be played
    *     psynthDetune.setNote(note);
    *     psynthDetune.play(); // play it !
    *   }
    *   
    *   
    *   // A typical synth class which inherits from AudioVoice class
    *   function DetunedOsc(){
    *   
    *     p5.AudioVoice.call(this);
    *     this.osctype = 'sine';
    *     this.detune = 5;
    *   
    *     this.oscOne = new p5.Oscillator(midiToFreq(this.note),this.osctype); 
    *     this.oscTwo = new p5.Oscillator(midiToFreq(this.note)-this.detune,this.osctype);
    *     this.oscOne.disconnect();
    *     this.oscTwo.disconnect();
    *     this.oscOne.start();
    *     this.oscTwo.start();
    *     this.oscOne.connect(this.synthOut);
    *     this.oscTwo.connect(this.synthOut);
    *   
    *     this.setNote = function(note){
    *         this.oscOne.freq(midiToFreq(note));
    *         this.oscTwo.freq(midiToFreq(note)-this.detune);   
    *     }
    *   
    *     this.setParams = function(params){
    *         this.detune = params.detune;
    *     }
    *   }
    *   
    *   DetunedOsc.prototype = Object.create(p5.AudioVoice.prototype); 
    *   DetunedOsc.prototype.constructor = DetunedOsc;
    *   
    * </code></div>
    **/
p5.PolySynth = function(synthVoice){
  this.voices = {};
  this.synthVoice = synthVoice;

  p5sound.soundArray.push(this);
}

/**
   *  Play a note.
   *  
   *  @method  play
   *  @param  {Number} [note] midi note to play (ranging from 0 to 127 - 60 being a middle C)
   *  @param  {Number} [secondsFromNow]  time from now (in seconds) at which to play
   *  @param  {Number} [sustainTime] time to sustain before releasing the envelope
   */
p5.PolySynth.prototype.play = function (note, secondsFromNow, susTime){    
    if (this.voices[note] != null) {
       this.voices[note].play(note, secondsFromNow, susTime);
     }
     else{
      this.voices[note] = new this.synthVoice();
    }
}


/**
   *  Set values like a traditional
   *  <a href="https://en.wikipedia.org/wiki/Synthesizer#/media/File:ADSR_parameter.svg">
   *  ADSR envelope
   *  </a>.
   *  
   *  It works like other implementation of setADSR in p5.sound but it needs a note parameter
   *  to know which monoSynth should be affected.
   *  
   *  @method  noteADSR
   *  @param {Number} [note]        Midi note on which ADSR should be set.
   *  @param {Number} [attackTime]  Time (in seconds before envelope
   *                                reaches Attack Level
   *  @param {Number} [decayTime]   Time (in seconds) before envelope
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
p5.PolySynth.prototype.noteADSR = function (note,a,d,s,r){
    if (this.voices[note] != null) {
       this.voices[note].setADSR(a,d,s,r);
     }
     else{
      this.voices[note] = new this.synthVoice();
    }
}

/**
   *  Trigger the Attack, and Decay portion of a MonoSynth.
   *  Similar to holding down a key on a piano, but it will
   *  hold the sustain level until you let go. 
   *
   *  @method  noteAttack
   *  @param  {Number} [note]           midi note on which attack should be triggered.
   *  @param  {Number} [secondsFromNow] time from now (in seconds)
   *  
   */  
p5.PolySynth.prototype.noteAttack = function (note, nsecondsFromNow){ 
    if (this.voices[note] != null) {
       this.voices[note].triggerAttack(secondsFromNow);
     }
     else {
      this.voices[note] = new this.synthVoice();
     }
}

/**
   *  Trigger the Release of a MonoSynth. This is similar to releasing
   *  the key on a piano and letting the sound fade according to the
   *  release level and release time.
   *  
   *  @method  noteRelease
   *  @param  {Number} [note]           midi note on which attack should be triggered.
   *  @param  {Number} [secondsFromNow] time to trigger the release
   *  
   */  

p5.PolySynth.prototype.noteRelease = function (secondsFromNow){
    if (this.voices[note] != null) {
       this.voices[note].triggerRelease(secondsFromNow);
       delete this.voices[note];
    }
}



/**
   *  Set cutoms parameters to a specific synth implementation 
   *  with the help of JavaScript Object Notation (JSON).
   *  
   *  @method  setParams
   *  @param   JSON object  
   * 
   *  For instance to set the detune parameter of a synth, call :
   *  setParams({detune: 15 });
   *
   */  
p5.PolySynth.prototype.setParams = function (params){
  for (var i = 0 ; i < this.num_voices ; i++){
    this.voices[i].setParams(params);
  }
}

});
