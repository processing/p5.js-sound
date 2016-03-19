var psynthDetune, psynthSquare; 
var square = true;

function setup() {

  frameRate(25);

  // create a polyphonic synth with 15 voices.
  // this synth will use the DetuneOsc synth definition below
  psynthDetune = new p5.PolySynth(15,DetuneOsc); 
  // this synth will use the SquareVoice definition below
  psynthSquare = new p5.PolySynth(15,SquareVoice); 
  
}

function draw() {
  background(0);
  fill(255);  
  textAlign(CENTER,CENTER);
  text("Click Me !",width/2,height/2);
}

function mousePressed(){
  // play a note when mouse is pressed
  var note = int(map(mouseX,0,width,60,84)); // a midi note mapped to x-axis
  var length = map(mouseY,0,300,0,5); // a note length parameter mapped to y-axis.
  
  if(square){
    // set the enveloppe with the new note length
  	psynthSquare.setADSR(0.021,0.025,length,0.025);
    // set the note to be played
  	psynthSquare.setNote(note);
    psynthSquare.play(0,0); // play it !
  }
  else {
    psynthDetune.setADSR(0.021,0.025,length,0.025);
    // set the detune parameters randomely
    var d = int(random(1,12));
    psynthDetune.setParams({harmonics: [1,2,4,6] ,
                            osctype: 'square'
                          });
    // set the note to be played
    psynthDetune.setNote(note);
    psynthDetune.play(0,0); // play it !
  }   
}

function keyPressed(){
  square = !square;
}


// A typical synth class which inherits from AudioVoice class
function SquareVoice(){

  p5.MonoSynth.call(this); // inherit from AudioVoice class
  // create a dsp graph
  this.osctype = 'square';
  this.oscillator = new p5.Oscillator(this.note,this.osctype);
  this.oscillator.disconnect();
  this.oscillator.start();
  // connect the dsp graph to the filtered output of the audiovoice
  this.oscillator.connect(this.synthOut);
  // override the set note function
  this.setNote = function(note){
    this.note = note;
    this.oscillator.freq(midiToFreq(note));
  } 
}
// make our new synth available for our sketch
SquareVoice.prototype = Object.create(p5.MonoSynth.prototype);  // browsers support ECMAScript 5 ! warning for compatibility with older browsers
SquareVoice.prototype.constructor = SquareVoice;


// A second one : a little more complex
function DetunedOsc(){

  p5.MonoSynth.call(this);
  this.osctype = 'sine';
  this.detune = 5;

  this.oscOne = new p5.Oscillator(midiToFreq(this.note),this.osctype); 
  this.oscTwo = new p5.Oscillator(midiToFreq(this.note)-this.detune,this.osctype);
  this.oscOne.disconnect();
  this.oscTwo.disconnect();
  this.oscOne.start();
  this.oscTwo.start();

  this.oscOne.connect(this.synthOut);
  this.oscTwo.connect(this.synthOut);

  this.setNote = function(note){
      this.oscOne.freq(midiToFreq(note));
      this.oscTwo.freq(midiToFreq(note)-this.detune);   
  }

  this.setParams = function(params){
      this.detune = params.detune;
  }
}

DetunedOsc.prototype = Object.create(p5.MonoSynth.prototype); 
DetunedOsc.prototype.constructor = DetunedOsc;


/////////////////////////////////////////////////////////////////
function AdditiveSynth(){
  p5.MonoSynth.call(this);

  this.osctype = 'triangle';
  this.harmonics = [1,2,4,6,8];
  this.note = 60;

  this.osc1 = new p5.Oscillator(midiToFreq(this.note),this.osctype); 
  this.osc2 = new p5.Oscillator(midiToFreq(this.note),this.osctype); 
  this.osc3 = new p5.Oscillator(midiToFreq(this.note),this.osctype); 
  this.osc4 = new p5.Oscillator(midiToFreq(this.note),this.osctype); 
  this.osc5 = new p5.Oscillator(midiToFreq(this.note),this.osctype); 

  this.osc1.disconnect(); 
  this.osc2.disconnect(); 
  this.osc3.disconnect(); 
  this.osc4.disconnect(); 
  this.osc5.disconnect(); 

  this.osc1.start(); 
  this.osc2.start(); 
  this.osc3.start(); 
  this.osc4.start(); 
  this.osc5.start(); 

  this.osc1.connect(this.synthOut);
  this.osc2.connect(this.synthOut);
  this.osc3.connect(this.synthOut);
  this.osc4.connect(this.synthOut);
  this.osc5.connect(this.synthOut);

  this.setNote = function(note){
     
      

      this.osc1.freq(midiToFreq(note+this.harmonics[0]*12)); 
      this.osc2.freq(midiToFreq(note+this.harmonics[1]*12)); 
      this.osc3.freq(midiToFreq(note+this.harmonics[2]*12)); 
      this.osc4.freq(midiToFreq(note+this.harmonics[3]*12)); 
      this.osc5.freq(midiToFreq(note+this.harmonics[4]*12)); 
  }

  this.setParams = function(params){
      this.harmonics = params.harmonics;
      this.osctype = params.osctype;
  }

  

}
AdditiveSynth.prototype = Object.create(p5.MonoSynth.prototype); 
AdditiveSynth.prototype.constructor = AdditiveSynth;