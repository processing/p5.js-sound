/**
 *  Trigger an oscillator processed through distortion.
 */

var env; // this is the env
var osc; // this oscillator that will be effected by the distortion
var distortion; // this is the waveshaper distortion effect

var fft;

function setup() {
  createCanvas(windowWidth, windowHeight);
  fft = new p5.FFT(0, 256);


  env = new p5.Envelope();
  env.setADSR(0.01, 0.2, 0.1, 0.3);
  env.setRange(1.0, 0.0);

  osc = new p5.SawOsc(); // connects to main output by default
  osc.start(0);
  osc.freq(220);
  osc.amp(env);
  osc.disconnect(); // Disconnect from output to process through distortion

  // Create a waveshaper distortion with 2x oversampling
  distortion = new p5.Distortion(1, '4x');
  osc.connect(distortion);
}

function draw() {
  var samples = fft.waveform();
  drawOscilloscope(samples);
}

function drawOscilloscope(samples) {
  var yTranslateScope = 50;
  var xTranslateScope = 50;
  var scopeWidth = width / 5;
  var scopeHeight = height / 4;

  fill(177, 177, 177);
  rect(xTranslateScope, yTranslateScope, scopeWidth, scopeHeight);

  stroke(0, 0, 0);
  strokeWeight(0.5);

  beginShape();
  for (var sampleIndex in samples) {
    var x = map(sampleIndex, 0, samples.length, 0, scopeWidth);
    var y = map(samples[sampleIndex], -1, 1, -scopeHeight / 2, scopeHeight / 2);
    vertex(x + xTranslateScope, y + scopeHeight/2 + yTranslateScope);
  }
  endShape();
}

function mousePressed() {
  env.triggerAttack();
}

function mouseReleased() {
  env.triggerRelease();
}
