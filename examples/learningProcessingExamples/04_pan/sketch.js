// Adapted from Learning Processing
// Daniel Shiffman
// http://www.learningprocessing.com

var song;

function preload() {
  song = loadSound('../../files/Damscray_DancingTiger.mp3');
}

function setup() {
  createCanvas(720, 200); 
  song.loop();
}

function draw() {
  background(200);
  // Map mouseX  to a panning value (between -1.0 and 1.0)
  var panning = map(mouseX, 0., width, -1.0, 1.0);
  panning = constrain(panning, -1.0, 1.0);
  song.pan(panning);
  
  // Draw a circle
  stroke(0);
  fill(51, 100);
  ellipse(mouseX, 100, 48, 48);
}