/**
 *  Example: Convolution Reverb
 */

var noise, env, reverb, osc;

function preload() {
  reverb = loadReverb('SewardWaterfrontPark.wav');
}

function setup() {
  noise = new p5.Noise('brown');

  // multiply noise volume by 0
  // (keep it quiet until we're ready to make noise!)
  noise.amp(0);

  noise.start();

  // the Env accepts time / value pairs to
  // create a series of timed fades
  env = new p5.Env(.01, 1, .2, .1);

  reverb.process(noise);
}

function draw() {
  background(0);
  stroke(255);
}

function mousePressed() {
  env.play(noise);
}