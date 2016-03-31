var psynthDetune, psynthSquare; 
var square = true;

function setup() {

  frameRate(25);

  // create a polyphonic synth with 15 voices.
  // this synth will use the DetuneOsc synth definition below
  psynthDetune = new p5.PolySynth(DetunedOsc); 
  // this synth will use the SquareVoice definition below
  psynthSquare = new p5.PolySynth(SquareVoice); 
  
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
  var length = map(mouseY,0,300,0,6); // a note length parameter mapped to y-axis.
  
  if(square){
    // set the enveloppe with the new note length
  	psynthSquare.noteADSR(note,0.21,0.25,1,0.25);
    // set the note to be played
    psynthSquare.play(note,0,length); // play it !
  }
  else {
    psynthDetune.noteADSR(note, 0.21,0.25,1.0,0.25);
    // set the detune parameters randomely
    var d = int(random(1,12));
    psynthDetune.setParams({
                            detune: d ,
                            osctype: 'triangle'
                          });
    // set the note to be played
    psynthDetune.play(note,0,length); // play it !
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

  this.play = function(note, secondsFromNow, susTime){
    this.oscOne.freq( midiToFreq(note-this.detune) );
    this.oscOne.freq( midiToFreq(note) );
    this.env.play(this.synthOut, secondsFromNow, susTime);
  }

  this.setParams = function(params){
      this.detune = params.detune;
      this.osctype = params.osctype;
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

  this.play = function(note, secondsFromNow, susTime){
    this.osc1.freq(midiToFreq(note+this.harmonics[0]*12)); 
    this.osc2.freq(midiToFreq(note+this.harmonics[1]*12)); 
    this.osc3.freq(midiToFreq(note+this.harmonics[2]*12)); 
    this.osc4.freq(midiToFreq(note+this.harmonics[3]*12)); 
    this.osc5.freq(midiToFreq(note+this.harmonics[4]*12)); 
    this.env.play(this.synthOut, secondsFromNow, susTime);
  }

  this.setParams = function(params){
      this.harmonics = params.harmonics;
      this.osctype = params.osctype;
  }
}
AdditiveSynth.prototype = Object.create(p5.MonoSynth.prototype); 
AdditiveSynth.prototype.constructor = AdditiveSynth;