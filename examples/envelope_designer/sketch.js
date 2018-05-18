
var attackTime = 0.001
var attackLevel = 1.0;
var decayTime = 0.2;
var decayLevel = 0.2;
var releaseTime = 0.5;
var releaseLevel = 0;
var sustainTime = 0.5;

var attackTimeInput;
var attackLevelInput;
var decayTimeInput;
var decayLevelInput;
var releaseTimeInput;
var releaseLevelInput;
var sustainTimeInput;

var MAX_TIME = 1;
var MAX_LEVEL = 5;
var drawScale = 100;

var env, osc;

function setup() {
  var cnv = createCanvas(4*MAX_TIME*drawScale, MAX_LEVEL*drawScale);
  cnv.mousePressed(playEnv);

  env = new p5.Env();  
  osc = new p5.Oscillator('triangle');
  osc.amp(env);
  osc.start();
  osc.freq(440);

  attackTimeInput = createSlider(0, MAX_TIME, attackTime, 0);
  attackTimeInput.position(10, 10);
  attackLevelInput = createSlider(0, MAX_LEVEL, attackLevel, 0);
  attackLevelInput.position(10, 40);
  decayTimeInput = createSlider(0, MAX_TIME, decayTime, 0);
  decayTimeInput.position(10, 70);
  decayLevelInput = createSlider(0, MAX_LEVEL, decayLevel, 0);
  decayLevelInput.position(10, 100);
  sustainTimeInput = createSlider(0, MAX_TIME, sustainTime, 0);
  sustainTimeInput.position(10, 120);
  releaseTimeInput = createSlider(0, MAX_TIME, releaseTime, 0);
  releaseTimeInput.position(10, 150);
  releaseLevelInput = createSlider(0, MAX_LEVEL, releaseLevel, 0);
  releaseLevelInput.position(10, 180);
}

function draw() {
  background(255);
  attackTime = attackTimeInput.value();
  attackLevel = attackLevelInput.value();
  decayTime = decayTimeInput.value();
  decayLevel = decayLevelInput.value();
  sustainTime = sustainTimeInput.value();
  releaseTime = releaseTimeInput.value();
  releaseLevel = releaseLevelInput.value();
  drawADSR();

  fill(0);
  textAlign(CENTER);
  text('click to play', width/2, height/2);
}

function drawADSR() {
  fill(130, 200, 255);
  noStroke();
  beginShape();
  vertex(0, height);
  // Attack
  x = attackTime*drawScale;
  y = height - attackLevel*drawScale;
  vertex(x, y);
  // Decay
  x = x + decayTime*drawScale;
  y = height - decayLevel*drawScale;
  vertex(x, y);
  // Sustain
  x = x + sustainTime*drawScale;
  y = y;
  vertex(x, y);
  // Release
  x = x + releaseTime*drawScale;
  y = height - releaseLevel*drawScale;
  vertex(x, y);
  // Forever
  vertex(width, y);
  vertex(width, height);
  endShape();
}

function playEnv() {
  env.set(attackTime, attackLevel, decayTime, decayLevel, releaseTime, releaseLevel);
  env.play(osc, 0, sustainTime);
}