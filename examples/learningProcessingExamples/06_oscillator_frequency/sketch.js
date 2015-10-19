// Adapted from Learning Processing
// Daniel Shiffman
// http://www.learningprocessing.com

// Example: Oscillator Frequency

var osc;

function setup() {
  createCanvas(720, 200);

  // Instantiate a Sine Wave Oscillator
  osc = new p5.SinOsc();

  // Tell the Oscillator to start oscillating.
  // We hear the frequency of these oscillators as a pitch.
  osc.start();

  // Oscillator has an output amplitude of 0.5 by default.
  // We can make it louder.
  osc.amp(1);
}

function draw() {
  background(200);
  
  // map the mouseX to set frequency of the between 40 and 880 Hz
  var freq = map(mouseX, 0, width, 40, 880);
  osc.freq(freq);
  ellipse(mouseX, 100, 32, 32);
}