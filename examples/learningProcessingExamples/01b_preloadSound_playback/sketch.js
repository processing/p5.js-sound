// loadSound during preload()
// This ensures it will be loaded and ready to play by setup()

var song;

function preload() {
  song = loadSound('../../files/lucky_dragons_-_power_melody.mp3');
}

function setup() {
  createCanvas(720, 200);
  song.loop(); // song is ready to play during setup() because it was loaded during preload
  background(0,255,0);
}

function mousePressed() {
  if ( song.isPlaying() ) { // .isPlaying() returns a boolean
    song.pause(); // .play() will resume from .pause() position
    background(255,0,0);
  } else {
    song.play();
    background(0,255,0);
  }
}