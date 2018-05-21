var attackTime = 0.001
var attackLevel = 1.0;
var decayTime = 0.2;
var decayLevel = 0.2;
var releaseTime = 0.5;
var releaseLevel = 0.0;
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

  attackTimeInput = createLabeledSlider('Attack time', 0, maxTime, attackTime, 20, 15);
  attackLevelInput = createLabeledSlider('Attack level', 0, maxLevel, attackLevel, 20, 40);
  decayTimeInput = createLabeledSlider('Decay time', 0, maxTime, decayTime, 20, 65);
  decayLevelInput = createLabeledSlider('Decay level', 0, maxLevel, decayLevel, 20, 90);
  sustainTimeInput = createLabeledSlider('Sustain time', 0, maxTime, sustainTime, 20, 115);
  releaseTimeInput = createLabeledSlider('Release time', 0, maxTime, releaseTime, 20, 140);
  releaseLevelInput = createLabeledSlider('Release level', 0, maxLevel, 0, 20, 165);
}

function draw() {
  background(30, 100, 155);

  // Update latest values
  attackTime = float(attackTimeInput.value());
  attackLevel = float(attackLevelInput.value());
  decayTime = float(decayTimeInput.value());
  decayLevel = float(decayLevelInput.value());
  sustainTime = float(sustainTimeInput.value());
  releaseTime = float(releaseTimeInput.value());
  releaseLevel = float(releaseLevelInput.value());

  drawADSR();

  // Text
  textAlign(CENTER);
  text('Click anywhere to play', width/2, height/2);
}

function playEnv() {
  env.set(attackTime, attackLevel, decayTime, decayLevel, releaseTime, releaseLevel);
  env.play(osc, 0, sustainTime);
}

function drawADSR() {
  var textPadding = 50;
  var xScale = (width - textPadding) / maxTime / 4;
  var yScale = (height - textPadding) / maxLevel;
  var x, y;

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
  text("Attack", x, y);
  // Decay
  x = x + decayTime*xScale;
  y = height - decayLevel*yScale;
  vertex(x, y);
  text("Decay", x, y);
  // Sustain
  x = x + sustainTime*xScale;
  y = y;
  vertex(x, y);
  text("Sustain", x, y);
  // Release
  x = x + releaseTime*xScale;
  y = height - releaseLevel*yScale;
  text("Sustain", x, y);
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