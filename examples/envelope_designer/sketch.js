var attackTime = 0.001
var attackLevel = 1.0;
var decayTime = 0.2;
var sustainTime = 0.5;
var sustainRatio = 0.2;
var releaseTime = 0.5;
var releaseLevel = 0.0;

var attackTimeInput, attackLevelInput;
var decayTimeInput;
var sustainTimeInput, sustainRatioInput;
var releaseTimeInput, releaseLevelInput;

var maxTime = 1;
var maxLevel = 5;

var env, osc;

function setup() {
  var cnv = createCanvas(500, 500);
  cnv.mousePressed(playEnv);

  env = new p5.Envelope();  
  osc = new p5.Oscillator('triangle');
  osc.amp(env);
  osc.start();
  osc.freq(440);

  attackTimeInput = createLabeledSlider('Attack time', 0, maxTime, attackTime, 20, 15);
  attackLevelInput = createLabeledSlider('Attack level', 0, maxLevel, attackLevel, 20, 40);
  decayTimeInput = createLabeledSlider('Decay time', 0, maxTime, decayTime, 20, 65);
  sustainTimeInput = createLabeledSlider('Sustain time', 0, maxTime, sustainTime, 20, 90);
  sustainRatioInput = createLabeledSlider('Sustain ratio', 0, 1, sustainRatio, 20, 115);
  releaseTimeInput = createLabeledSlider('Release time', 0, maxTime, releaseTime, 20, 140);
  releaseLevelInput = createLabeledSlider('Release level', 0, maxLevel, 0, 20, 165);
}

function draw() {
  background(255);

  // Update latest values
  attackTime = float(attackTimeInput.value());
  attackLevel = float(attackLevelInput.value());
  decayTime = float(decayTimeInput.value());
  sustainTime = float(sustainTimeInput.value());
  sustainRatio = float(sustainRatioInput.value());
  releaseTime = float(releaseTimeInput.value());
  releaseLevel = float(releaseLevelInput.value());

  drawADSR();

  // Text
  textAlign(CENTER);
  text('Click anywhere to play', width/2, height/2);
}

function playEnv() {
  env.set(attackTime, attackLevel, decayTime, sustainRatio, releaseTime, releaseLevel);
  env.play(osc, 0, sustainTime);
}

function drawADSR() {
  var textPadding = 50;
  var xScale = (width - textPadding) / maxTime / 4;
  var yScale = (height - textPadding) / maxLevel;
  var x, y;
  var shape_color = color(30, 200, 205);

  fill(shape_color);
  noStroke();
  textAlign(LEFT, BOTTOM);

  beginShape();
  // Start
  vertex(0, height);
  // Attack
  x = attackTime * xScale;
  y = height - attackLevel * yScale;
  vertex(x, y);
  fill(0);
  text("Attack", x, y);
  fill(shape_color);
  // Decay
  x = x + decayTime*xScale;
  y = height - (releaseLevel + sustainRatio * (attackLevel - releaseLevel)) * yScale;
  vertex(x, y);
  fill(0);
  text("Decay", x, y);
  fill(shape_color);
  // Sustain
  x = x + sustainTime * xScale;
  y = y;
  vertex(x, y);
  fill(0);
  text("Sustain", x, y);
  fill(shape_color);
  // Release
  x = x + releaseTime * xScale;
  y = height - releaseLevel * yScale;
  fill(0);
  text("Release", x, y);
  fill(shape_color);
  vertex(x, y);
  // End
  vertex(width, y);
  vertex(width, height);
  endShape();
}

function createLabeledSlider(labelText, minVal, maxVal, initVal, xpos, ypos) {
  var slider = createSlider(minVal, maxVal, initVal, 0); // '0' to use continuous 
  var label = createElement("label", labelText);
  var numInput = createInput(str(initVal), 'number');

  slider.size(width / 2);
  slider.position(xpos, ypos);
  slider.input(() => {
    numInput.value(slider.value());
  });

  numInput.size(width / 8);
  numInput.position(xpos + slider.size().width + 10, ypos);
  numInput.input(() => {
    if (numInput.value() > maxVal) {
      slider.value(maxVal);
    } else if (numInput.value() < minVal) {
      slider.value(minVal);
    } else {
      slider.value(numInput.value());
    }
  });

  label.position(numInput.position().x + numInput.size().width + 10, ypos + 3);
  return numInput;
}