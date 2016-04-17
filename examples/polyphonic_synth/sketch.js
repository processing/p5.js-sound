var psynth; 
var keys = {S:60,E:61,D:62,R:63,F:64,G:65,Y:66,H:67,U:68,J:69,I:70,K:71,L:72}

function setup() {
  frameRate(25);
  psynth = new p5.PolySynth(Simple); 
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
  // set the enveloppe with the new note length
  psynth.noteADSR(note,0.21,1,1,5);
  psynth.noteParams(note,{osctype: 'square'});
  // set the note to be played
   psynth.play(note,0.05,0,length); // play it !  
}

function keyPressed(){
  if (keys[key]){
    note = keys[key]
    psynth.noteParams(note,{osctype: 'sine'});
    psynth.noteAttack(note,1);
  }
}

function keyReleased(){
  if (keys[key]){
    note = keys[key]
    psynth.noteRelease(note);
  }  
}


// A typical synth class which inherits from AudioVoice class
function Simple(){

  p5.MonoSynth.call(this); // inherit from AudioVoice class
  // create a dsp graph
  this.osctype = 'sine';
  this.oscillator = new p5.Oscillator(this.note,this.osctype);
  this.oscillator.disconnect();
  this.oscillator.start();
  // connect the dsp graph to the filtered output of the audiovoice
  this.oscillator.connect(this.synthOut);

  this._setNote = function(note){
     this.oscillator.freq( midiToFreq(note) );
  }

  this.setParams = function(params){
    this.osctype = params.osctype;
    this.oscillator.setType(this.osctype);
  }
  
}
// make our new synth available for our sketch
Simple.prototype = Object.create(p5.MonoSynth.prototype);  // browsers support ECMAScript 5 ! warning for compatibility with older browsers
Simple.prototype.constructor = Simple;


/////////////////////////////////////////////////////////////////
function AdditiveSynth(){
  p5.MonoSynth.call(this);

  this.osctype = 'triangle';
  this.harmonics = [1,2,4,6,8];
  this.note = 60;

  this.oscbank =[];
  for (var i = 0 ; i < this.harmonics.length; i++){
    this.oscbank.push(new p5.Oscillator(midiToFreq(this.note),this.osctype) );
  }

  for (var i = 0 ; i < this.harmonics.length ; i++){
    this.oscbank[i].disconnect();
    this.oscbank[i].start();
    this.oscbank[i].connect(this.synthOut);
  }

  this._setNote = function(note){
    for (var i = 0 ; i < this.harmonics.length ; i++){
      this.oscbank[i].freq(midiToFreq(note+this.harmonics[i]*12)); 
    }
  }

  this.setParams = function(params){
    if(params.harmonics != null) this.harmonics = params.harmonics;
    if (params.osctype != null) {
      this.osctype = params.osctype;
      for (var i = 0 ; i < this.harmonics.length ; i++){
        this.oscbank[i].setType(params.osctype);
      }
    }  
  }
}
AdditiveSynth.prototype = Object.create(p5.MonoSynth.prototype); 
AdditiveSynth.prototype.constructor = AdditiveSynth;