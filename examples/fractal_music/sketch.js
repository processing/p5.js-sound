/**
 *  Example: Fractal Music
 *  Generate a fractal pattern of music using L-Systems. 
 *  We begin with an initial sequence of tokens, and use a programmer-
 *  defined set of rules to generate new tokens. Here, we apply the rules:
 *  + > + -
 *  - > +
 *  to each token in existing sequences to generate new sequences. The 
 *  tokens used here are "+","-" which steer the melody's pitch upward or 
 *  downward. Note durations are selected randomly.
 */

var rules = {
  "+":["+","-"],
  "-":["+"]
};
var seqIndex = 0;
var noteIndex = -1;
var initSeq = ["+","-","+"];
var newTokens = [];
var generatingTokenColor;
var newTokenColor;
var sequences = [initSeq, []];
var fontSize = 20;
var maxNumSequences = 8;
var maxSequenceLength = 25;
var pitch = 60;

function setup() {
  createCanvas(720, 400);
  textAlign(CENTER, CENTER);
  textFont('monospace');
  textSize(fontSize);
  generatingTokenColor = color(200,250,255);
  newTokenColor  = color(240);

  synth = new p5.PolySynth();
  sloop = new p5.SoundLoop(soundLoop, 0.5);

  playPauseButton = createButton('Play/Pause');
  playPauseButton.position(width - 80, height - 20);
  playPauseButton.mousePressed(togglePlayPause);
  stepButton = createButton("Step");
  stepButton.position(10, height - 20);
  stepButton.mousePressed(stepSoundLoop)
}

function soundLoop(cycleStartTime) {
  noteIndex++;
  if (noteIndex >= min(sequences[seqIndex].length, maxSequenceLength)) {
    nextSequence();
  }

  var beatSeconds = 0.5; // Define 1 beat as half a second
  if (sequences[seqIndex][noteIndex] === "+") {
    pitch++;
  } else {
    pitch--;
  }
  var velocity = 0.8;
  var duration = random([beatSeconds, beatSeconds/2, beatSeconds/2, beatSeconds/4]);
  this.interval = duration;
  synth.play(midiToFreq(pitch), velocity, cycleStartTime, duration);

  var token = sequences[seqIndex][noteIndex];
  newTokens = rules[token];
  sequences[seqIndex+1] = sequences[seqIndex+1].concat(newTokens);
  // If the sequence overruns maxSequenceLength, truncate it and proceed to next sequence
  if (sequences[seqIndex+1].length >= maxSequenceLength) {
    sequences[seqIndex+1] = sequences[seqIndex+1].slice(0, maxSequenceLength);
    nextSequence();
  }
}

function draw() {
  background(255);

  highlightNote(seqIndex, noteIndex, generatingTokenColor);
  for (var i=0; i<newTokens.length; i++) {
    highlightNote(seqIndex + 1, sequences[seqIndex + 1].length - 1 - i, newTokenColor);
  }

  textAlign(CENTER, CENTER);
  noStroke();
  for (var i=0; i<sequences.length; i++) {
    fill(255 - 195 * (i+1) / sequences.length);
    if (i == sequences.length - 1) {
      fill(0, 150, 255); // Generated tokens text
    }
    var seq = sequences[i];
    var lineHeight = fontSize + 10;
    text(seq.join(" "), width/2, height*2/3 - lineHeight * (sequences.length - i - 1));
  }

  // Display current pitch
  fill(100);
  text("Pitch: " + pitch, width/2, height-20);
}

function togglePlayPause() {
  // Play/pause
  if (sloop.isPlaying) {
    sloop.pause();
  } else {
    sloop.maxIterations = Infinity;
    sloop.start();
  }
}

function stepSoundLoop() {
  sloop.stop();
  soundLoop(0);
}

function nextSequence() {
  noteIndex = 0;
  seqIndex++;
  sequences.push(rules[sequences[seqIndex][0]]); // Add a new sequence with the first tokens generated
  // If the number of sequences overruns maxNumSequences, remove oldest
  if (sequences.length > maxNumSequences) {
    seqIndex--;
    sequences.shift(); // Removes first element from array
  }
}

function highlightNote(seqInd, noteInd, highlightColor) {
  if (noteInd < 0) return; // Skip if we haven't started
  var seqWidth = (fontSize+4) * sequences[seqInd].length;
  var xOffset = width/2 - seqWidth/2;
  var x = xOffset + seqWidth * noteInd / sequences[seqInd].length;
  var lineHeight = fontSize + 10;
  var y = fontSize + height * 2 / 3 - lineHeight * (sequences.length - seqInd - 0);
  var highlightWidth = fontSize;
  var highlightHeight = fontSize;
  strokeWeight(1);
  stroke(150);
  fill(highlightColor);
  rect(x, y, highlightWidth, highlightHeight);
}