var psynth; 

var selType;
var selHarmonics;
var harmonics = [1,3,5,7,9];

function setup() {
  createCanvas(600,300);

  // create a polyphonic synth with 15 voices.
  // this synth will use the DetuneOsc synth definition below
  psynth = new p5.PolySynth(5,AdditiveSynth); 

  // a dom select element to set the type of oscillator for the synth
  selType = createSelect();
  selType.option('sine');
  selType.option('triangle');
  selType.option('sawtooth');
  selType.option('square');

  // another dom element to set presets
  selHarmonics = createSelect();
  selHarmonics.option('harmonics table 1');
  selHarmonics.option('harmonics table 2');
  selHarmonics.option('harmonics table 3');
  selHarmonics.option('harmonics table 4');
  selHarmonics.changed(setHarmonics);

}

function draw() {
  background(0);
  fill(255);  

  // access the draw function of each voice and call it
  for (var i = 0 ; i < psynth.num_voices ; i++){
     psynth.voices[i].draw();
  }
}

function setHarmonics(){
  var val = selHarmonics.value();
  if (val == 'harmonics table 1') harmonics = [1,3,5,7,9];
  else if (val == 'harmonics table 2') harmonics = [2,4,6,8,10];
  else if (val == 'harmonics table 3') harmonics = [0.5,1,2.5,3.5,5];
  else if (val == 'harmonics table 4') harmonics = [0.5,1,3.5,7.33,9.25];
}


function mousePressed(){
  if(mouseX < width && mouseX > 0 && mouseY > 0 && mouseY < height){
    // play a note when mouse is pressed
    var note = int(map(mouseX,0,width,60,84)); // a midi note mapped to x-axis
    var noteLength = map(mouseY,height,0,2,0.05);
  
    psynth.setADSR(0.25,0.25,0.3,0.25);
 
    // set the parameters
    psynth.setParams({
      harmonics:  harmonics,
      osctype: selType.value()
    });

     // set drawing variables
    psynth.voices[psynth.poly_counter].setDrawingParams(mouseX,mouseY);

    // set the note to be played
    psynth.setNote(note);
    
    psynth.play(0.0,noteLength); // play it !

  }
}

/////////////////////////////////////////////////////////////////
function AdditiveSynth(){
  p5.MonoSynth.call(this);

  this.osctype = 'sine';
  this.harmonics = [1,3,5,7,9];
  this.note = 60;

  this.oscbank =[];
  this.amplitude =  new p5.Amplitude();
  this.env.setRange(0.2,0);
 

  for (var i = 0 ; i < this.harmonics.length; i++){
    this.oscbank.push(new p5.Oscillator(midiToFreq(this.note),this.osctype) );
  }

  for (var i = 0 ; i < this.harmonics.length ; i++){
    this.oscbank[i].disconnect();
    this.oscbank[i].start();
    this.oscbank[i].connect(this.synthOut);
  }

  this.amplitude.setInput(this.synthOut);

  this.setNote = function(note){
   for (var i = 0 ; i < this.harmonics.length ; i++){
    this.oscbank[i].freq(midiToFreq(note+this.harmonics[i]*12)); 
   }
  }

  this.setParams = function(params){
    console.log(params);
    if(params.harmonics != null) this.harmonics = params.harmonics;
    if (params.osctype != null) {
      this.osctype = params.osctype;
      for (var i = 0 ; i < this.harmonics.length ; i++){
        this.oscbank[i].setType(params.osctype);
      }
    }  
  } 

  this.x;
  this.y;
  this.radius = 0;

  this.setDrawingParams = function(x,y){
    this.x = x;
    this.y = y;
  }

  this.draw = function(){
    this.radius = this.amplitude.getLevel()*1000;
    fill(255,75,75,200);
    noStroke();
    ellipse(this.x,this.y,this.radius,this.radius);
  }
}
AdditiveSynth.prototype = Object.create(p5.MonoSynth.prototype); 
AdditiveSynth.prototype.constructor = AdditiveSynth;