var polySynth;
var velocity = 0.1; // From 0-1
var baseNote = 72;
var keyOrder = "ASDFGHJKL";
var keyStates = [0,0,0,0,0,0,0,0,0];

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
	for (var i=0; i<keyStates.length; i++) {
		var keyColor;
		if (keyStates[i] === 1) {
			keyColor = color(255,100,100);
		} else {
			keyColor = color(245,225,225);
		}
		fill(keyColor);
    stroke(255);
		rect(i*keyWidth, 0, keyWidth, height);
    // Key label
    fill(40);
    noStroke();
    text(keyOrder[i], i*keyWidth + keyWidth/2, height/2);
	}
}

function keyPressed() {
  keyIndex = keyOrder.indexOf(key);
  // Check if valid note key pressed
  if (keyIndex >= 0) {
    // Update key state
    keyStates[keyIndex] = 1;
    // Play synth
    midiNoteNumber = baseNote + keyIndex; // 0-127; 60 is Middle C (C4)
    freq = midiToFreq(midiNoteNumber);
    synth.noteAttack(freq, velocity, 0);
  }
}

function keyReleased() {
  keyIndex = keyOrder.indexOf(key);
  // Check if valid note key pressed
  if (keyIndex >= 0) {
    // Update key state
    keyStates[keyIndex] = 0;
    // Stop synth
    midiNoteNumber = baseNote + keyIndex; // 0-127; 60 is Middle C (C4)
    freq = midiToFreq(midiNoteNumber);
    synth.noteRelease(freq, 0);
  }
}
