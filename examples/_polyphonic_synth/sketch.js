var psynth;

var ptable_real,ptable_imag;
var real_wave = [];
var imag_wave = []

function preload(){
  ptable_real = loadStrings('Wurlitzer_2_imag.txt'); 
  ptable_imag = loadStrings('Wurlitzer_2_real.txt' ); 
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

  //Uncomment for PeriodicWave
  // psynth.audiovoices.forEach(function(voice){
  //   voice.setParams({real: real_wave , imag: imag_wave});
  // });
  
}




function draw() {
  background(0);
}

function mousePressed(){
    var note = int(map(mouseX,0,width,200,440));
    var length = map(mouseY,0,300,0,5);

    psynth.setADSR(0.021,0.025,length,0.025);
    psynth.play(note,1,0,1);
}


function PeriodicWave(params){
    p5.AudioVoice.call(this);
    this.osc = new p5.Oscillator('sine');
    
    this.real = new Float32Array([0,0]) ;
    this.imag = new Float32Array([0,1]);
    this.wt = this.ac.createPeriodicWave(this.real,this.imag);

    this.osc.disconnect();
    this.osc.start();

    this.env = new p5.Envelope(0.021,0.025,0.025,0.025,0.95,0.33,0.25);
    this.env.disconnect();

    this.filter = new p5.LowPass();
    this.filter.set(22050,5);


    this.env.connect(this.filter);
    this.osc.connect(this.filter);

    this.connect();
    
    this.filter.set(22050,5);


  this.setParams = function(params){
      this.real = new Float32Array(params.real);
      this.imag = new Float32Array(params.imag);
      this.wt = this.ac.createPeriodicWave(this.real, this.imag);
      this.osc.oscillator.setPeriodicWave(this. wt);      
  }

  this.setADSR = function(aTime,aLevel,dTime,dLevel) {
    this.env.set(aTime, aLevel, dTime, dLevel)
  }

  this.play = function(){
    this.env.play(this.filter);

  }

  this.triggerAttack = function(note, velocity, secondsFromNow) {
    var secondsFromNow = secondsFromNow || 0;

    //triggerAttack uses ._setNote to convert a midi string to a frequency if necessary
    var freq = typeof note === 'string' ? this._setNote(note)
      : typeof note === 'number' ? note : 440;
    var vel = velocity || 1;
    // this.env.setRange(this.env.aLevel / velocity,0);
    this._isOn = true;
    this.osc.freq(freq, 0, secondsFromNow);
    this.env.triggerAttack(this.filter, secondsFromNow);
  
  }

  this.triggerRelease = function(secondsFromNow) {
    var secondsFromNow = secondsFromNow || 0;
    this.env.triggerRelease(this.filter,secondsFromNow);
    this._isOn = false;
  }

}

PeriodicWave.prototype = Object.create(p5.AudioVoice.prototype); 
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
// A Detuned synth
function DetunedOsc(){

  p5.MonoSynth.call(this);

  this.osctype = 'sine';
  this.detune = -5;

  this.oscOne = this.oscillator;
  this.oscTwo = new p5.Oscillator();

  this.filter.setType('lowpass');
  this.filter.set(22050,5);

  this.oscOne.disconnect();
  this.oscTwo.disconnect();
  

  this.oscOne.connect(this.filter);
  this.oscTwo.connect(this.filter);


  this.env.setInput(this.oscOne,this.oscTwo);

  this.oscOne.start();
  this.oscTwo.start();


  this.triggerAttack = function(note, velocity, secondsFromNow) {
    this.oscTwo.oscillator.detune.value
    var secondsFromNow = secondsFromNow || 0;
    var freq = typeof note === 'string' ? this._setNote(note)
      : typeof note === 'number' ? note : 440;
    var vel = velocity || 1;

    this._isOn = true;

    this.oscOne.freq(freq, 0, secondsFromNow);
    this.oscTwo.freq(freq + this.detune, 0, secondsFromNow);
    this.env.ramp(this.output, secondsFromNow, this.env.aLevel);
  }
  
}

DetunedOsc.prototype = Object.create(p5.MonoSynth.prototype); 
DetunedOsc.prototype.constructor = DetunedOsc;



function AdditiveSynth(){
  p5.MonoSynth.call(this);

  this.osctype = 'triangle';
  this.harmonics = [1,2,4,6,8];
  this.note = 60;

  this.oscbank =[];
  this.oscillator.dispose();
  delete this.oscillator;
  this.env.disconnect();

  for (var i = 0 ; i < this.harmonics.length; i++){
    this.oscbank.push(new p5.Oscillator());
    this.oscbank[i].setType(this.osctype);
    this.oscbank[i].disconnect();
    this.oscbank[i].connect(this.filter);
    this.env.connect(this.oscbank[i]);
    this.oscbank[i].start();
  }

  this.triggerAttack = function(note, velocity, secondsFromNow) {
    var secondsFromNow = secondsFromNow || 0;
    var freq = typeof note === 'string' ? this._setNote(note)
      : typeof note === 'number' ? note : 440;
    var vel = velocity || 1;

    this._isOn = true;

    for (var i = 0 ; i < this.harmonics.length; i++){
      this.oscbank[i].freq(freq + midiToFreq(this.harmonics[i]*12),0,secondsFromNow);
    }

    this.env.ramp(this.output, secondsFromNow, this.env.aLevel);
  }

}
AdditiveSynth.prototype = Object.create(p5.MonoSynth.prototype); 
AdditiveSynth.prototype.constructor = AdditiveSynth;
