var attackTime = 0.001
var attackLevel = 1.0;
var decayTime = 0.2;
var decayLevel = 0.2;
var releaseTime = 0.5;
var releaseLevel = 0;
var sustainTime = 0.5;

var attackTimeInput, attackLevelInput;
var decayTimeInput, decayLevelInput;
var releaseTimeInput, releaseLevelInput;
var sustainTimeInput;

var maxTime = 1;
var maxLevel = 5;
var xScale = 100;

var env, osc;

function setup() {
  var cnv = createCanvas(500, 500);
  cnv.mousePressed(playEnv);

  env = new p5.Env();  
  osc = new p5.Oscillator('triangle');
  osc.amp(env);
  osc.start();
  osc.freq(440);

  attackTimeInput = createSlider(0, maxTime, attackTime, 0);
  attackTimeInput.position(20, 15);
  attackLevelInput = createSlider(0, maxLevel, attackLevel, 0);
  attackLevelInput.position(160, 15);
  decayTimeInput = createSlider(0, maxTime, decayTime, 0);
  decayTimeInput.position(20, 45);
  decayLevelInput = createSlider(0, maxLevel, decayLevel, 0);
  decayLevelInput.position(160, 45);
  sustainTimeInput = createSlider(0, maxTime, sustainTime, 0);
  sustainTimeInput.position(20, 75);
  releaseTimeInput = createSlider(0, maxTime, releaseTime, 0);
  releaseTimeInput.position(20, 105);
  releaseLevelInput = createSlider(0, maxLevel, releaseLevel, 0);
  releaseLevelInput.position(160, 105);
}

function draw() {
  background(30, 100, 155);
  attackTime = attackTimeInput.value();
  attackLevel = attackLevelInput.value();
  decayTime = decayTimeInput.value();
  decayLevel = decayLevelInput.value();
  sustainTime = sustainTimeInput.value();
  releaseTime = releaseTimeInput.value();
  releaseLevel = releaseLevelInput.value();
  drawADSR();

  // Text
  textAlign(CENTER);
  text('click to play', width/2, height/2);
}

function playEnv() {
  env.set(attackTime, attackLevel, decayTime, decayLevel, releaseTime, releaseLevel);
  env.play(osc, 0, sustainTime);
}

function drawADSR() {
  var textPadding = 50;
  var xScale = (width - textPadding) / maxTime / 4;
  var yScale = (height - textPadding) / maxLevel;

  fill(130, 200, 255);
  noStroke();
  textAlign(LEFT, BOTTOM);

  beginShape();
  // Start
  vertex(0, height);
  // Attack
  x = attackTime*xScale;
  y = height - attackLevel*yScale;
  vertex(x, y);
  text(`Attack: \n${attackTime.toFixed(3)}s \n${attackLevel.toFixed(3)}`, x, y);
  // Decay
  x = x + decayTime*xScale;
  y = height - decayLevel*yScale;
  vertex(x, y);
  text(`Decay: \n${decayTime.toFixed(3)}s \n${decayLevel.toFixed(3)}`, x, y);
  // Sustain
  x = x + sustainTime*xScale;
  y = y;
  vertex(x, y);
  text(`Sustain: \n${sustainTime.toFixed(3)}s`, x, y);
  // Release
  x = x + releaseTime*xScale;
  y = height - releaseLevel*yScale;
  text(`Release: \n${releaseTime.toFixed(3)}s \n${releaseLevel.toFixed(3)}`, x, y);
  vertex(x, y);
  // End
  vertex(width, y);
  vertex(width, height);
  endShape();
}