


var psynth;

var ptable_real,ptable_imag;
var real_wave = [];
var imag_wave = []

function preload(){
  ptable_real = loadStrings('Wurlitzer_2_real.txt'); 
  ptable_imag = loadStrings('Wurlitzer_2_imag.txt' ); 
}



function setup() {
  
  createCanvas(800, 300);
  smooth();

  frameRate(25);
  

  psynth = new PolySynth(15,PeriodicWave);

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

    var note = int(map(mouseX,0,width,60,84));
    var length = map(mouseY,0,300,0,5);
  
  	psynth.setAdsr(0.021,0.025,length,0.025);

    //  uncomment for SquareVoice detune parameters
    //var d = int(random(1,12));
    //psynth.setParams({detune: d });

    // uncomment for PeriodicWave
    psynth.setParams({real: real_wave , imag: imag_wave});

  	psynth.setNote(note);
    psynth.play();
    
}


//////////////////////////////////////////////////////////////////////////////
function PeriodicWave(params){
    AudioVoice.call(this);

    this.real = new Float32Array([0,0]) ;
    this.imag = new Float32Array([0,1]);
    
    this.context = getAudioContext();

    this.wt = this.context.createPeriodicWave(this.real,this.imag);

    this.oscillator = this.context.createOscillator();
    this.oscillator.setPeriodicWave(this.wt);

    this.oscillator.disconnect();
    this.oscillator.start();

    this.oscillator.connect(this.filter);

  this.setNote = function(note){
      this.oscillator.frequency.value = midiToFreq(note);      
  }

  this.setParams = function(params){
     // console.log(params.real);
      this.real = new Float32Array(params.real);
      this.imag = new Float32Array(params.imag);
      this.wt = this.context.createPeriodicWave(this.real, this.imag);
      this.oscillator.setPeriodicWave(this. wt);
  }


}

PeriodicWave.prototype = Object.create(AudioVoice.prototype); 
PeriodicWave.prototype.constructor = PeriodicWave;


//////////////////////////////////////////////////////////////////////////////////////////////
// A typical synth class which inherits from AudioVoice class
function SquareVoice(){

  AudioVoice.call(this);

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
SquareVoice.prototype = Object.create(AudioVoice.prototype);  // browsers support ECMAScript 5 ! warning for compatibility with older browsers
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

DetunedOsc.prototype = Object.create(AudioVoice.prototype); 
DetunedOsc.prototype.constructor = DetunedOsc;






////////////////////////////////////////////////////////////////////////////////////////////
// A super AudioVoice class to talk to the PolySynth class
function AudioVoice () {

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

AudioVoice.prototype.voicePlay = function (){
  this.env.play(this.filter);
}

AudioVoice.prototype.attackPlay = function (){
  this.env.triggerAttack(this.oscillator);
}

AudioVoice.prototype.releasePlay = function (){
  this.env.triggerRelease(this.oscillator);
}

AudioVoice.prototype.setNote = function(){

}

AudioVoice.prototype.setParams = function(params){

}


AudioVoice.prototype.setAdsr = function (a,d,s,r){
  this.attack = a;
  this.decay=d;
  this.sustain=s;
  this.release=r;
  this.env = new p5.Env(this.attack, this.decay,  this.sustain, this.release); 
  this.env.play(this.filter);
}



/////////////////////////////////////////////////////////////////////////////
// a class to deal with voices allocations, of notes, parameters etc.
// should be abastracted from the user
function PolySynth(num,synthVoice){
  this.voices = [];
  this.num_voices = num;
  this.poly_counter=0;

  this.allocateVoices(synthVoice);
}

PolySynth.prototype.allocateVoices = function(synthVoice){
  for (var i = 0 ; i < this.num_voices ; i++){
       this.voices.push(new synthVoice());
  }
}

PolySynth.prototype.play = function (){
    this.voices[this.poly_counter].voicePlay();
    this.poly_counter += 1;
    this.poly_counter = this.poly_counter % this.num_voices;
}

PolySynth.prototype.setAdsr = function (a,d,s,r){
  this.voices[this.poly_counter].setAdsr(a,d,s,r);
}

PolySynth.prototype.setNote = function (note){
  this.voices[this.poly_counter].setNote(note);
}

PolySynth.prototype.setParams = function (params){
  this.voices[this.poly_counter].setParams(params);
}



