var psynthDetune, psynthSquare; 
var square = true;

function setup() {

  frameRate(25);

  // create a polyphonic synth with 15 voices.
  // this synth will use the DetuneOsc synth definition below
  psynthDetune = new p5.PolySynth(15,DetunedOsc); 
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
    psynthSquare.play(); // play it !
  }
  else {
    psynthDetune.setADSR(0.021,0.025,length,0.025);
    // set the detune parameters randomely
    var d = int(random(1,12));
    psynthDetune.setParams({detune: d });
    // set the note to be played
    psynthDetune.setNote(note);
    psynthDetune.play(); // play it !
  }   
}

function keyPressed(){
  square = !square;
}


// A typical synth class which inherits from AudioVoice class
function SquareVoice(){

  p5.AudioVoice.call(this); // inherit from AudioVoice class

  // create a dsp graph
  this.osctype = 'square';
  this.oscillator = new p5.Oscillator(this.note,this.osctype);
  this.oscillator.disconnect();
  this.oscillator.start();

  // connect the dsp graph to the filtered output of the audiovoice
  this.oscillator.connect(this.filter);

  // override the set note function
  this.setNote = function(note){
    this.note = note;
    this.oscillator.freq(midiToFreq(note));
  } 
}
// make our new synth available for our sketch
SquareVoice.prototype = Object.create(p5.AudioVoice.prototype);  // browsers support ECMAScript 5 ! warning for compatibility with older browsers
SquareVoice.prototype.constructor = SquareVoice;


// A second one : a little more complex
function DetunedOsc(){

  p5.AudioVoice.call(this);

  this.osctype = 'sine';
  this.detune = 5;

  this.oscOne = new p5.Oscillator(midiToFreq(this.note),this.osctype); 
  this.oscTwo = new p5.Oscillator(midiToFreq(this.note)-this.detune,this.osctype);
  this.oscOne.disconnect();
  this.oscTwo.disconnect();
  this.oscOne.start();
  this.oscTwo.start();

  this.oscOne.connect(this.filter);
  this.oscTwo.connect(this.filter);

  this.setNote = function(note){
      this.oscOne.freq(midiToFreq(note));
      this.oscTwo.freq(midiToFreq(note)-this.detune);   
  }

  this.setParams = function(params){
      this.detune = params.detune;
  }
}

DetunedOsc.prototype = Object.create(p5.AudioVoice.prototype); 
DetunedOsc.prototype.constructor = DetunedOsc;
