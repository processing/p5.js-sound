// mouseX = playback position
// mouseY = playback rate
// up arrow  increase grain duration
// down arrow decrease grain duration

var source_file; // sound file
var src_length; // hold its duration
var peaks; // an array of peaks for the visual
var pg;

var psynth;
var grainDur = 1; // length of the grain

function preload(){
  source_file = loadSound('../files/Soni_Ventorum_Wind_Quintet_-_08_-_Danzi_Wind_Quintet_Op_67_No_3_In_E-Flat_Major_4_Allegretto.mp3'); // preload the sound
}

function setup() {
  createCanvas(800, 250);
  frameRate(25);

  psynth = new p5.PolySynth(25,GranularVoice);

  src_length = source_file.duration(); // store the sound duration
  peaks = source_file.getPeaks(); // get an array of peaks
  // draw the waveform to an off-screen graphic
  pg = createGraphics(width,height);
  pg.background(180);
  pg.noFill();
  pg.stroke(0);
  for (var i = 0 ; i < peaks.length ; i++){
      var x = map(i,0,peaks.length,0,width);
      var y = map(peaks[i],0,1,0,height);
      pg.line(x,height/2,x,height/2+y);
      pg.line(x,height/2,x,height/2-y);
  }
}

function draw() {
    background(180);

    if (mouseIsPressed){
      var start_play = map(mouseX,0,width,0,src_length); // map mouseX to position in the source
      var pitch = map(mouseY,0,height,1.5,0.5); // map mouseY to the rate the sound will be played
      //console.log(psynth.poly_counter);
      psynth.setADSR(grainDur*2/5,0,0,grainDur*2/5);
      psynth.voices[psynth.poly_counter].playGrain(start_play, pitch,grainDur);
      psynth.play();
    }
     
    image(pg,0,0); // display our waveform representation
    // draw playhead position 
    fill(255,255,180,150);
    noStroke();
    rect(mouseX,0,map(grainDur,0,src_length,0,width),height);

    fill(0);
    text('Grain Duration : ' + grainDur , 5,25);
}

function keyPressed(){
    if (keyCode === DOWN_ARROW){
        grainDur -=0.05;
    }
    else if (keyCode === UP_ARROW){
        grainDur += 0.05;
    }
    grainDur = constrain(grainDur,0.1,25);     
}


function GranularVoice(){

  p5.AudioVoice.call(this);
  
  this.amp = 0.05;

  source_file.connect(this.synthOut);

  this.playGrain = function(start,rate,grainDur){
    source_file.play(0,rate,this.amp,start,grainDur); // we need to play longer than grainDur because of the rate 
  }

  this.setParams = function(params){
   
  }
}
GranularVoice.prototype = Object.create(p5.AudioVoice.prototype); 
GranularVoice.prototype.constructor = GranularVoice;
