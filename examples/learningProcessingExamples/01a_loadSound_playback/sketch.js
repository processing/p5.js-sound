// Adapted from Learning Processing by Daniel Shiffman
// http://www.learningprocessing.com

var song;

function setup() {
  song = loadSound('../../files/lucky_dragons_-_power_melody.mp3');
  createCanvas(640, 360);
  background(255,0,0);
}

function mousePressed() {
  if ( song.isPlaying() ) { // .isPlaying() returns a boolean
    song.stop();
    background(255,0,0);
  } else {
    song.play();
    background(0,255,0);
  }
}
