// Beat Detection with offline context example by @b2renger
// Building off an example by Joe Sullivan : http://tech.beatport.com/2014/web-audio/beat-detection-using-web-audio/
// and this example, too : https://github.com/JMPerez/beats-audio-api


var file ='../_files/Tripping.mp3'

var source_file; // sound file
var src_length; // hold its duration

var pg_beats; // to draw the beat detection on preprocessed song
var pg_tempo; // draw our guessed tempi

function preload(){
    source_file = loadSound(file); // preload the sound
   // clave = loadSound('cl.wav');
}


function setup() {
  createCanvas(windowWidth, 150);
  textAlign(CENTER);

  src_length = source_file.duration();
  source_file.playMode('restart'); 
  println("source duration: " +src_length);

  // prepare our tempo display
  pg_tempo = createGraphics(width,100);
  pg_tempo.background(180);
  pg_tempo.strokeWeight(3);
  pg_tempo.noFill();
  pg_tempo.stroke(255);
  pg_tempo.rect(0,0,width,100);
  pg_tempo.strokeWeight(1);
  //prepare our beats graph display
  pg_beats = createGraphics(width,50);
  pg_beats.background(180);
  pg_beats.strokeWeight(3);
  pg_beats.noFill();
  pg_beats.stroke(255);
  pg_beats.rect(0,0,width,50);
  pg_beats.strokeWeight(1);

  // find beat preprocessing the source file with lowpass
  var beats = source_file.processPeaks(onComplete); // it will draw in pg_beats and pg_tempo

}

function draw() {
  background(225);

  // image(pg_tempo,0,0); // display detected tempi
  // image(pg_beats,0,100); // display filtered beats we found preprocesing with a lp filter
}

function onComplete(data) {
  console.log(data);
}
