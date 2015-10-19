// Learning Processing
// Daniel Shiffman
// http://www.learningprocessing.com

// Playback Amplitude Analysis

var song;

var analyzer;

function preload() {
  song = loadSound('../../files/lucky_dragons_-_power_melody.mp3');
}

function setup() {
  createCanvas(720, 200);
  song.loop();

  // create a new Amplitude analyzer
  analyzer = new p5.Amplitude();

  // Patch the input to an volume analyzer
  analyzer.setInput(song);
}

function draw() {
  background(255);

  // Get the overall volume (between 0 and 1.0)
  var vol = analyzer.getLevel();
  fill(127);
  stroke(0);

  // Draw an ellipse with size based on volume
  ellipse(width/2, height/2, 10+vol*200, 10+vol*200);
}
