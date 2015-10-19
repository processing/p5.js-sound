// make some noise to float the ellipse
// p5.AudioIn contains its own p5.Amplitude object,
// so you can call getLevel on p5.AudioIn without
// creating a p5.Amplitude.

var input;
var analyzer;

function setup() {
  createCanvas(200, 200);

  // Create an Audio input
  input = new p5.AudioIn();

  // start the Audio Input
  input.start();

  // create a new Amplitude analyzer
  analyzer = new p5.Amplitude();

  // Patch the input to an volume analyzer
  analyzer.setInput(input);
}

function draw() {
  background(200);

  // Get the overall volume (between 0 and 1.0)
  var vol = analyzer.getLevel();
  fill(127);
  stroke(0);

  // Draw an ellipse with height based on volume
  var h = map(vol, 0, 1, height, 0);
  ellipse(width/2, h - 25, 50, 50);
}