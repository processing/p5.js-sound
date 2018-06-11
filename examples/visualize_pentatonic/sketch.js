var sloop;

var pentatonic = ['A','C','D','E','G'];
var pitch_class_map = {'A':0,'C':1,'D':2,'E':3,'G':4};
var numOctaves = 6;

var currentNote = 'C3';
var noteCount = 0;
var prevNoteCount = 0;

function setup() {
  createCanvas(500,500);
  background(0);

  synth = new p5.PolySynth();
  synth.setADSR(0.01, 0.05, 0.3, 1.0);
  sloop = new p5.SoundLoop(soundLoop, "16n"); // 16th-note-long loop interval
  sloop.bpm = 60;

  button = createButton('Play/Pause');
  button.mousePressed(togglePlayPause);
}

function soundLoop(cycleStartTime) {
  // Pick a random note, note octave based on mouse height
  octave = round(numOctaves * (height - mouseY) / height);
  currentNote = random(pentatonic) + str(octave);
  // Play sound
  semiquaverSeconds = this._convertNotation('16n'); // 16th note = semiquaver duration
  synth.play(currentNote, 0.8, cycleStartTime, semiquaverSeconds);

  noteCount++;
}

function draw() {
  background(0, 25); // 10% opacity gives a visual fade effect

  // Draw if there is a new note
  if (noteCount != prevNoteCount) {
    drawNote(currentNote);
    prevNoteCount = noteCount;
  }
}

function drawNote(noteName) {
  pitch_class = noteName.slice(0,-1);
  octave = Number(noteName.slice(-1));
  pitch_class_pos = pitch_class_map[pitch_class];

  fill(random(255), random(255), random(255));
  ellipse(width/10 + pitch_class_pos*width/5, height - octave*height/numOctaves, 20, 20);
}

function togglePlayPause() {
  if (sloop.isPlaying) {
    sloop.pause();
  } else {
    sloop.start();
  }
}
