/**
 *  Example: Granular Sampler
 *
 *  Granular synthesis is based on sampling at a small scale. You extract a small
 *  piece of sound (eg a 'grain') of variable length that you can playback at variable 
 *  speed. Grains can be layered on top of each other creating rich polyphonic textures.
 *  
 *  The mouse position drives the playback position along the X axis, and the playback
 *  rate along the Y axis.
 *
 *  The UP_ARROW and the DOWN_ARROW modify the grain length.
 *
 */

var source; // sound file

var src_length; // hold its duration

var peaks; // an array of peaks for the visual
var pg;

var voices = []; // an array of voices
var num_voices = 40; 
var poly_counter = 0; // keep track of the last active voice
var grainDur = 1;

function preload(){
    source = loadSound('../_files/Damscray_DancingTiger.mp3'); // preload the sound
}

function setup() {
  
  createCanvas(710, 400);
  frameRate(20);

  src_length = source.duration(); // store the sound duration
  peaks = source.getPeaks(windowWidth); // get an array of peaks

  // draw the waveform to an off-screen graphic
  pg = createGraphics(windowWidth,windowHeight);
  pg.background(180);
  pg.translate(0,height/2);
  pg.noFill();
  pg.stroke(0);
  for (var i = 0 ; i < peaks.length ; i++){
        var x = map(i,0,peaks.length,0,windowWidth);
        var y = map(peaks[i],0,1,0,windowHeight);
          pg.line(x,0,x,y);
          pg.line(x,0,x,-y);
    }
    console.log("nb of peaks : "+peaks.length);

  // build an array of granular voices 
 for (var i = 0 ; i < num_voices; i++){
    var voice = new GranularVoice(source,grainDur); // duration half a second per voice
    voices.push(voice); 

  }
  console.log("source duration : " +src_length);
  console.log("num voices : "+voices.length);

}

function draw() {
    background(180);

    var start_play = map(mouseX,0,width,0, src_length   ); // map mouseX to position in the source
    var pitch = map(mouseY,0,height,0.5,1.5); // map mouseY to the rate the sound will be played
    // which voice to play
    poly_counter += 1;
    poly_counter = poly_counter%num_voices;
    // play it
    voices[poly_counter].playGrain(pitch,start_play,grainDur);

    image(pg,0,0); // display our waveform representation
    // draw playhead
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
    grainDur = constrain(grainDur,0.1,1.5);
}


// a granular voice class
function GranularVoice(src,grLength){

    this.sound = src;
    this.sound.playMode('sustain');

    this.amp = 0.05;

    this.grainDur = grLength;

    this.attack = this.grainDur*1/5;
    this.decay = this.grainDur*1/5;
    this.sustain = this.grainDur*2/5;
    this.release = this.grainDur*1/5;

    this.env = new p5.Env(this.attack,this.decay,this.sustain,this.release);

    // apply the enveloppe
    this.sound.amp(this.env);

}

GranularVoice.prototype.playGrain = function(rate,start,grLength){
    this.sound.amp(this.env);
    this.sound.play(0,rate,this.amp,start,grLength); 
    this.env.play(this.sound); // play the enveloppe    
}

GranularVoice.prototype.setGrainDur = function(newGrainDur){
    this.grainDur = newGrainDur;
    this.setAdsr(newGrainDur);
}

GranularVoice.prototype.setAdsr= function(newGrainDur){
    this.attack = newGrainDur*1/5;
    this.decay = newGrainDur*1/5;
    this.sustain = newGrainDur*2/5;
    this.release = newGrainDur*1/5;

    this.env = new p5.Env(this.attack,this.decay,this.sustain,this.release);
    this.sound.amp(this.env);
}