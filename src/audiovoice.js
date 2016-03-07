define(function (require) {
  'use strict';

  var p5sound = require('master');
  require('sndcore');

     /**
    *  An AudioVoice is used as a single voice for sound synthesis.
    *  This is a class to be used in conjonction with the PolySynth
    *  class. Custom synthetisers should be built inheriting from
    *  this class.
    *
    *  @class p5.AudioVoice
    *  @constructor
    *  @example 
    *  <div><code>
    *   var psynthDetune, psynthSquare; 
    *   var square = true;
    *   
    *   function setup() {
    *   
    *     frameRate(25);
    *   
    *     // create a polyphonic synth with 15 voices.
    *     // this synth will use the DetuneOsc synth definition below
    *     psynthDetune = new p5.PolySynth(15,DetunedOsc); 
    *     // this synth will use the SquareVoice definition below
    *     psynthSquare = new p5.PolySynth(15,SquareVoice); 
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
    *     if(square){
    *       // set the enveloppe with the new note length
    *       psynthSquare.setADSR(0.021,0.025,length,0.025);
    *       // set the note to be played
    *       psynthSquare.setNote(note);
    *       psynthSquare.play(); // play it !
    *     }
    *     else {
    *       psynthDetune.setADSR(0.021,0.025,length,0.025);
    *       // set the detune parameters randomely
    *       var d = int(random(1,12));
    *       psynthDetune.setParams({detune: d });
    *       // set the note to be played
    *       psynthDetune.setNote(note);
    *       psynthDetune.play(); // play it !
    *     }   
    *   }
    *   
    *   function keyPressed(){
    *     square = !square;
    *   }
    *   
    *   
    *   // A typical synth class which inherits from AudioVoice class
    *   function SquareVoice(){
    *   
    *     p5.AudioVoice.call(this); // inherit from AudioVoice class
    *     // create a dsp graph
    *     this.osctype = 'square';
    *     this.oscillator = new p5.Oscillator(this.note,this.osctype);
    *     this.oscillator.disconnect();
    *     this.oscillator.start();
    *     // connect the dsp graph to the filtered output of the audiovoice
    *     this.oscillator.connect(this.filter);
    *     // override the set note function
    *     this.setNote = function(note){
    *       this.note = note;
    *       this.oscillator.freq(midiToFreq(note));
    *     } 
    *   }
    *   // make our new synth available for our sketch
    *   SquareVoice.prototype = Object.create(p5.AudioVoice.prototype);  // browsers support ECMAScript 5 ! warning for compatibility with older browsers
    *   SquareVoice.prototype.constructor = SquareVoice;
    *   
    *   
    *   // A second one : a little more complex
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
    *     this.oscOne.connect(this.filter);
    *     this.oscTwo.connect(this.filter);
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

p5.AudioVoice = function (){

  this.osctype = 'sine';
  this.volume= 0.33;
  this.note = 60;

  this.attack = 0.25;
  this.decay=0.25;
  this.sustain=0.95;
  this.release=0.25;
  this.env = new p5.Env(this.attack,this.volume, this.decay,this.volume,  this.sustain, this.volume,this.release);

  this.filter = new p5.LowPass();
  this.filter.set(22050, 5);
  
  this.env.connect(this.filter);

}


/**
   *  Play the envelopp
   *  
   *  @method  voicePlay
   */  

p5.AudioVoice.prototype.voicePlay = function (){
  this.env.play(this.filter);
}

/**
   *  Trigger the attack
   *  
   *  @method  attackPlay
   */  
p5.AudioVoice.prototype.attackPlay = function (){
  this.env.triggerAttack(this.oscillator);
}

/**
   *  Trigger the release
   *  
   *  @method  releasePlay
   */  

p5.AudioVoice.prototype.releasePlay = function (){
  this.env.triggerRelease(this.oscillator);
}

/**
   *  Set the note to be played.
   *  This method can be overriden when creating custom synth
   *  
   *  @method  setNote
   *  @param  {Number} Midi note to be played (from 0 to 127).
   * 
   */  

p5.AudioVoice.prototype.setNote = function(note){
  this.oscillator.freq(midiToFreq(note));
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

p5.AudioVoice.prototype.setParams = function(params){

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

p5.AudioVoice.prototype.setADSR = function (a,d,s,r){
  this.attack = a;
  this.decay=d;
  this.sustain=s;
  this.release=r;
  this.env = new p5.Env(this.attack, this.decay,  this.sustain, this.release); 
  this.env.play(this.filter);
}

});
