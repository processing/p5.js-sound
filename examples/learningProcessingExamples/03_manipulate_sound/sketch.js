// Adapted from Learning Processing
// Daniel Shiffman
// http://www.learningprocessing.com

// A sound file object
var song;

function preload() {
  // Load a sound file
  song = loadSound('../../files/Damscray_DancingTiger.mp3');
}

function setup() {
  createCanvas(720, 720);

  // Loop the sound forever
  // (well, at least until stop() is called)
  song.loop();
}

function draw() {
  background(200);

  // Set the volume to a range between 0 and 1.0
  var volume = map(mouseX, 0, width, 0, 1);
  volume = constrain(volume, 0, 1);
  song.amp(volume);

  // Set the rate to a range between 0.1 and 4
  // Changing the rate alters the pitch
  var speed = map(mouseY, 0.1, height, 0, 2);
  speed = constrain(speed, 0.01, 4);
  song.rate(speed);

  // Draw some circles to show what is going on
  stroke(0);
  fill(51, 100);
  ellipse(mouseX, 100, 48, 48);
  stroke(0);
  fill(51, 100);
  ellipse(100, mouseY, 48, 48);
}