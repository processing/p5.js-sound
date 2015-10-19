// mouseX = playback position
// mouseY = playback rate
// up arrow  increase grain duration
// down arrow decrease grain duration

var source_file; // sound file

var src_length; // hold its duration

var peaks; // an array of peaks for the visual
var pg;

var voices = []; // an array of voices
var num_voices = 50; 
var poly_counter = 0;

var grainDur = 1; // length of the grain

function preload(){
  source_file = loadSound('../files/Soni_Ventorum_Wind_Quintet_-_08_-_Danzi_Wind_Quintet_Op_67_No_3_In_E-Flat_Major_4_Allegretto.mp3'); // preload the sound
}

function setup() {
  createCanvas(800, 250);

  src_length = source_file.duration(); // store the sound duration
  peaks = source_file.getPeaks(); // get an array of peaks

  // draw the waveform to an off-screen graphic
  pg = createGraphics(width,height);
  pg.background(180);
  pg.translate(0,height/2);
  pg.noFill();
  pg.stroke(0);
  for (var i = 0 ; i < peaks.length ; i++){
        var x = map(i,0,peaks.length,0,width);
        var y = map(peaks[i],0,1,0,height);
          pg.line(x,0,x,y);
          pg.line(x,0,x,-y);
    }

   // build an array of granular voices 
  for (var i = 0 ; i < num_voices; i++){
     var voice = new GranularVoice(source_file,grainDur); // duration half a second per voice
     voices.push(voice); 

   }
}

function draw() {
    background(180);

    if (mouseIsPressed){
      var start_play = map(mouseX,0,width,0,src_length); // map mouseX to position in the source
      var pitch = map(mouseY,0,height,0.5,1.5); // map mouseY to the rate the sound will be played
      // which voice to play
      poly_counter += 1;
      poly_counter = poly_counter%num_voices;
      //play it
      voices[poly_counter].playGrain(start_play,pitch);
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
    var newatt = grainDur*1/5;
    var newrel = grainDur*1/5;

    for (var i = 0 ; i < voices.length ; i++){
      voices[i].setGrainDuration(grainDur);
    }
}


function GranularVoice(src,grLength){
  // load a copy of our source in the main buffer
  this.sound = src;
  this.sound.playMode('sustain'); // we want polyphonic playing
   
  this.amp = 0.5;

  // compute defaut parameters 
  this.attack = 0.049;
  this.release = 0.049;
  this.grainDur = grLength - (this.attack + this.release);
}

GranularVoice.prototype.playGrain = function(start,rate){
  var now = getAudioContext().currentTime; // get the time
  
  // play the grain
  this.sound.play(0,rate,1,start,this.grainDur+1); // we need to play longer than grainDur because of the rate

  // acess the gain node to control it with ramps
  if (this.sound.source) {
    this.sound.source.gain.gain.cancelScheduledValues(now);
    this.sound.source.gain.gain.setValueAtTime(0.0, now); // start at zero
    this.sound.source.gain.gain.linearRampToValueAtTime(this.amp,now + this.attack); // go to amp during attack
    this.sound.source.gain.gain.linearRampToValueAtTime(this.amp, now + (this.attack + this.grainDur) ); // stay during grain duration
    this.sound.source.gain.gain.linearRampToValueAtTime(-0.0,now + (this.attack + this.grainDur  + this.release) ); // fo to zero for release  
  }

}

GranularVoice.prototype.setAmp = function(newamp){
  this.amp = newamp;
}


GranularVoice.prototype.setAttack = function(newattack){
  if(this.grainDur>(newattack+this.release)){
    this.attack = newattack;
  }
  else {
     throw 'new attack value out of range';
  }
}

GranularVoice.prototype.setRelease = function(newrelease){
  if(this.grainDur>(this.attack+newrelease)){
    this.release = newrelease;
  }
  else {
     throw 'new release value out of range';
  }
}
  
GranularVoice.prototype.setGrainDuration = function(newgraindur){
  if(newgraindur > (this.attack+this.release)){
     this.grainDur = newgraindur;
  }
  else {
     throw 'new grain duration out of range';
  }
}
  
