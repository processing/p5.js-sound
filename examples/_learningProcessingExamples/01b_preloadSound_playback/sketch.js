// loadSound during preload()
// This ensures it will be loaded and ready to play by setup()

var song;

function preload() {
  song = loadSound('../../_files/lucky_dragons_-_power_melody.mp3');
}

function setup() {
  createCanvas(640, 360);
  text('Click mouse to start/stop playback', 20, 20);

  song.play(); // song is ready to play during setup() because it was loaded during preload
}

function mousePressed() {
  if ( song.isPlaying() ) { // .isPlaying() returns a boolean
    song.stop();
  } else {
    song.play();
  }
}