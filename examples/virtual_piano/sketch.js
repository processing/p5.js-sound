/**
 * Virtual Piano: Example for event-driven sound playback.
 * 
 * This example uses the p5.PolySynth to produce instantaneously,
 * driven by user events.
 */

var polySynth;
var velocity = 0.7; // From 0-1
var baseNote = 72;
var keyOrder = "ASDFGHJKL";
var keyStates = [0, 0, 0, 0, 0, 0, 0, 0, 0];

function setup() {
  createCanvas(720, 400);
  textAlign(CENTER, CENTER);
  strokeWeight(3);
  // Create synth voice
  synth = new p5.PolySynth();
}

function draw() {
  var keyWidth = width / keyStates.length;
  // Draw keys
  for (var i = 0; i < keyStates.length; i++) {
    var keyColor;
    if (keyStates[i] === 1) {
      keyColor = color(255, 220, 120);
    } else {
      keyColor = color(150, 230, 245);
    }
    fill(keyColor);
    stroke(255);
    rect(i * keyWidth, 0, keyWidth, height);
    // Key label
    fill(40);
    noStroke();
    text(keyOrder[i], i * keyWidth + keyWidth / 2, height / 2);
  }
}

function keyPressed() {
  var keyIndex = keyOrder.indexOf(key);
  // Check if valid note key pressed
  if (keyIndex >= 0) {
    // Update key state
    keyStates[keyIndex] = 1;
    // Play synth
    var midiNoteNumber = baseNote + keyIndex; // 0-127; 60 is Middle C (C4)
    var freq = midiToFreq(midiNoteNumber);
    synth.noteAttack(freq, velocity, 0);
  }
}

function keyReleased() {
  var keyIndex = keyOrder.indexOf(key);
  // Check if valid note key pressed
  if (keyIndex >= 0) {
    // Update key state
    keyStates[keyIndex] = 0;
    // Stop synth
    var midiNoteNumber = baseNote + keyIndex; // 0-127; 60 is Middle C (C4)
    var freq = midiToFreq(midiNoteNumber);
    synth.noteRelease(freq, 0);
  }
}

function touchStarted() {
  var keyWidth = width / keyStates.length;
  var keyIndex = floor(mouseX / keyWidth);
  // Update key state
  keyStates[keyIndex] = 1;
  // Play synth
  var midiNoteNumber = baseNote + keyIndex; // 0-127; 60 is Middle C (C4)
  var freq = midiToFreq(midiNoteNumber);
  synth.noteAttack(freq, velocity, 0);
}

function touchEnded() {
  for (var i = 0; i < keyStates.length; i++) {
    keyStates[i] = 0;
  }
  synth.noteRelease();
}
