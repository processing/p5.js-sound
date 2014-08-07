// Adapted from Learning Processing by Daniel Shiffman
// http://www.learningprocessing.com

var song;

function setup() {
  song = loadSound('../../_files/lucky_dragons_-_power_melody.mp3');
  createCanvas(640, 360);
  text('Click mouse to start/stop playback', 20, 20);
}

function mousePressed() {
  if ( song.isPlaying() ) { // .isPlaying() returns a boolean
    song.stop();
  } else {
    song.play();
  }
}