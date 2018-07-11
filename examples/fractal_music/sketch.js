var rules = {
  "A":["A","B"],
  "B":["E","C"],
  "C":["F","G"],
  "D":["D","F"],
  "E":["G"],
  "F":["B","A"],
  "G":["C"]
};
var seqIndex = 0;
var noteIndex = 0;
var initSeq = ["C","E","G"];
var sequences = [initSeq, rules[initSeq[0]]];
var fontSize = 20;
var maxNumSequences = 8;
var maxSequenceLength = 25;

function setup() {
  createCanvas(720, 400);
  textAlign(CENTER, CENTER);
  textFont('monospace');
  textSize(fontSize);
  
  synth = new p5.PolySynth();
  sloop = new p5.SoundLoop(soundLoop, "8n"); // Repeats at every quaver (1/8 of a whole note)
  sloop.bpm = 100; // 100 beats per minute
}

function soundLoop(cycleStartTime) {
  var beatSeconds = 0.5 || this._convertNotation('8n'); // 1/8th note duration
  var pitch = sequences[seqIndex][noteIndex] + "6"; // Octave 6
  var velocity = 0.8;
  synth.play(pitch, velocity, cycleStartTime, beatSeconds*0.8);

  var token = sequences[seqIndex][noteIndex];
  var newTokens = rules[token];
  sequences[seqIndex+1] = sequences[seqIndex+1].concat(newTokens);
  // If the sequence overruns maxSequenceLength, truncate it
  if (sequences[seqIndex+1].length >= maxSequenceLength) {
    sequences[seqIndex+1] = sequences[seqIndex+1].slice(0, maxSequenceLength);
  }

  noteIndex++;
  if (noteIndex >= min(sequences[seqIndex].length, maxSequenceLength)) {
    noteIndex = 0;
    seqIndex++;
    sequences.push(rules[sequences[seqIndex][0]]); // Add a new sequence with the first tokens generated
    // If the number of sequences overruns maxNumSequences, remove oldest
    if (sequences.length > maxNumSequences) {
      sequences.shift(); // Removes first element from array
    }  
  }
}

function draw() {
  background(240);
  highlightNote(seqIndex, noteIndex);

  textAlign(CENTER, CENTER);
  for (var i=0; i<sequences.length; i++) {
    fill(255 - 195 * i / sequences.length);
    if (i == sequences.length - 1) fill(255, 150, 50);
    var seq = sequences[i];
    var lineHeight = fontSize + 10;
    text(seq.join(" "), width/2, height*2/3 - lineHeight * (sequences.length - i - 1));
  }

  textAlign(RIGHT, BOTTOM);
  if (sloop.isPlaying) {
    fill(180);
    text('Pause', width - 10, height - 10);
  } else {
    fill(100);
	  text('Play', width - 10, height - 10);
  }
  textAlign(LEFT, BOTTOM)
  text('Step', 10, height - 10);
}

function touchStarted() {
  if (mouseX > width/2) {
    // Play/pause
    if (sloop.isPlaying) {
      sloop.pause();
    } else {
      sloop.maxIterations = Infinity;
      sloop.start();
    }  
  } else {
    // Step
    stepSoundLoop();
  }
}

function stepSoundLoop() {
  sloop.stop();
  soundLoop(0);
}

function highlightNote(seqInd, noteInd, color) {
  var seqWidth = (fontSize+4) * sequences[seqInd].length;
  var xOffset = width/2 - seqWidth/2;
  var x = xOffset + seqWidth * noteInd / sequences[seqInd].length;
  var lineHeight = fontSize + 10;
  var y = fontSize + height * 2 / 3 - lineHeight * (sequences.length - seqInd - 0);
  var highlightWidth = fontSize;
  var highlightHeight = fontSize;
  noStroke();
  fill(0, 230, 255);
  rect(x, y, highlightWidth, highlightHeight);
}