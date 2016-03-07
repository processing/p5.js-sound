var psynth;

function setup() {
  
  createCanvas(800, 300);
  smooth();

  frameRate(25);
  
  psynth = new p5.PolySynth(15,SquareVoice);
  
}


function draw() {
  background(0);
}

function mousePressed(){

    var note = int(map(mouseX,0,width,60,84));
    var length = map(mouseY,0,300,0,5);
  
  	psynth.setADSR(0.021,0.025,length,0.025);

    //  uncomment for SquareVoice detune parameters
    var d = int(random(1,12));
    psynth.setParams({detune: d });

  	psynth.setNote(note);
    psynth.play();
    
}


//////////////////////////////////////////////////////////////////////////////////////////////
// A typical synth class which inherits from AudioVoice class
function SquareVoice(){

  p5.AudioVoice.call(this); // inherit from AudioVoice class

  this.osctype = 'square';
  this.oscillator = new p5.Oscillator(this.note,this.osctype);
  this.oscillator.disconnect();
  this.oscillator.start();

  this.oscillator.connect(this.filter);

  this.setNote = function(note){
    this.note = note;
    this.oscillator.freq(midiToFreq(note));
  } 
}
SquareVoice.prototype = Object.create(p5.AudioVoice.prototype);  // browsers support ECMAScript 5 ! warning for compatibility with older browsers
SquareVoice.prototype.constructor = SquareVoice;

//////////////////////////////////////////////////////////////////////////////////////////////
// A second one
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
