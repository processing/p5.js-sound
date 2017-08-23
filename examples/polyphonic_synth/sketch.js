var psynth;

var ptable_real,ptable_imag;
var real_wave = [];
var imag_wave = []

function preload(){
  ptable_real = loadStrings('../polyphonic_synth/TwelveStringGuitar_real.txt'); 
  ptable_imag = loadStrings('../polyphonic_synth/TwelveStringGuitar_imag.txt' ); 
}



function setup() {
  
  createCanvas(800, 300);
  smooth();

  frameRate(25);
  

  // psynth = new PolySynth(15,PeriodicWave);
  psynth = new p5.PolySynth(PeriodicWave, 8);

  for (var i = 0 ; i < 2048 ; i++) {
    real_wave[i] = float(ptable_real[i]);
  }
  for (var i = 0 ; i < 2048 ; i++) {
    imag_wave[i] = float(ptable_imag[i]);
  }

  
}




function draw() {
  background(0);
}

function mousePressed(){

    var note = int(map(mouseX,0,width,200,440));
    var length = map(mouseY,0,300,0,5);



    psynth.play(note,1,0,length);
    psynth.noteADSR(note, 0.021,0.025,length,0.025);

    var index = psynth.notes[note].getValueAtTime();
    psynth.audiovoices[index].setParams({real: real_wave , imag: imag_wave});

    //  uncomment for SquareVoice detune parameters
    //var d = int(random(1,12));
    //psynth.setParams({detune: d });

    // uncomment for PeriodicWave
    //psynth.setParams({real: real_wave , imag: imag_wave});
    
    
}


//////////////////////////////////////////////////////////////////////////////
function PeriodicWave(params){
    p5.MonoSynth.call(this);

    this.real = new Float32Array([0,0]) ;
    this.imag = new Float32Array([0,1]);

    this.wt = this.ac.createPeriodicWave(this.real,this.imag);

    // this.oscillator = this.context.createOscillator();
    this.oscillator.oscillator.setPeriodicWave(this.wt);
    this.filter.setType('lowpass');
    this.filter.set(22050,5);

    this.env.connect(this.filter);

  this.setParams = function(params){
      this.real = new Float32Array(params.real);
      this.imag = new Float32Array(params.imag);
      this.wt = this.ac.createPeriodicWave(this.real, this.imag);
      this.oscillator.oscillator.setPeriodicWave(this. wt);
  }
  this.setADSR = function(a,d,s,r) {
      this.attack = a;
      this.decay=d;
      this.sustain=s;
      this.release=r;
      this.volume = 1
     this.env.set(this.attack, this.volume, this.decay, this.volume, this.release, this.volume); 
      // this.env.set(this.attack, this.decay,  this.sustain, this.release); 
      this.env.play(this.filter);

  }

}

PeriodicWave.prototype = Object.create(p5.MonoSynth.prototype); 
PeriodicWave.prototype.constructor = PeriodicWave;


//////////////////////////////////////////////////////////////////////////////////////////////
// A typical synth class which inherits from AudioVoice class
function SquareVoice(){

  p5.MonoSynth.call(this);

  this.oscillator.setType('square');
}
SquareVoice.prototype = Object.create(p5.MonoSynth.prototype);  // browsers support ECMAScript 5 ! warning for compatibility with older browsers
SquareVoice.prototype.constructor = SquareVoice;

//////////////////////////////////////////////////////////////////////////////////////////////
// A second one
function DetunedOsc(){

  AudioVoice.call(this);

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
