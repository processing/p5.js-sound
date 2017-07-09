/**
 *  Example: Reverb
 */

var sound, reverb;
var play, pause;
var seconds, decay, reverse;
var rev;

function preload() {
  soundFormats('mp3', 'ogg');
  soundFile = loadSound('../files/Damscray_-_Dancing_Tiger_02');

  // disconnect the default connection
  // so that we only hear the sound via the reverb.process
  soundFile.disconnect();


}

function setup() {
  createCanvas(720,100);
  background(0);

  play = createButton('play');
  pause = createButton('pause');
  play.mousePressed(start);
  pause.mousePressed(stop);
  seconds = createSlider(0,10,3);
  decay = createSlider(0,100,1);

  seconds.changed(changeSec);

  reverse = createButton('reverse: true')
  reverse.mouseReleased(changeRev);

  reverb = new p5.Reverb();

  // sonnects soundFile to reverb with a
  // reverbTime of 6 seconds, decayRate of 0.2%
  reverb.process(soundFile);
  

// turn it up!
}

function draw() {
  //reverb.set(seconds.value(), decay.value(), false);
}

// function mousePressed() {
//   soundFile.play();
// }
// 

function start() {
  soundFile.play();
}

function stop() {
  soundFile.stop();
}
function changeSec(){
  reverb.set(seconds.value(),decay.value(),rev);
}

function changeDec(){
  reverb.set(seconds.value(),decay.value(),rev);
}
function changeRev() {

  rev = !rev;
  reverb.set(seconds.value(),decay.value(),rev);

  console.log(rev);
}