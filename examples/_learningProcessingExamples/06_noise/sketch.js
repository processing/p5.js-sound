// Adapted from Learning Processing
// Daniel Shiffman
// http://www.learningprocessing.com

// Example: Make Some Noise

var noise;

function setup() {
  createCanvas(780, 200);
  noise = new p5.Noise(); // other types include 'brown' and 'pink'
  noise.start();
}

function draw() {
  background(0);
  
  var vol = map(mouseX, 0, width, 0, 1);
  noise.amp(vol);
  vol = constrain(vol, 0, 1);
  ellipse(mouseX, 100, 32, 32);
}