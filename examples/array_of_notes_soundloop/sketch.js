var synth;
var sloop;
var beatIndex = 0;
var songIndex = 0;
var song = [ 
  // Note pitch, velocity (between 0-1), start time (s), note duration (s)
  {pitch:'E4', velocity:1, time:0, duration:1},
  {pitch:'D4', velocity:1, time:1, duration:1},
  {pitch:'C4', velocity:1, time:2, duration:1},
  {pitch:'D4', velocity:1, time:3, duration:1},
  {pitch:'E4', velocity:1, time:4, duration:1},
  {pitch:'E4', velocity:1, time:5, duration:1},
  {pitch:'E4', velocity:1, time:6, duration:1},
  // Rest indicated by offset in start time
  {pitch:'D4', velocity:1, time:8, duration:1},
  {pitch:'D4', velocity:1, time:9, duration:1},
  {pitch:'E4', velocity:1, time:10, duration:1},
  {pitch:'D4', velocity:1, time:11, duration:1},
  // Chord indicated by simultaneous note start times
  {pitch:'C4', velocity:1, time:12, duration:2},
  {pitch:'E4', velocity:1, time:12, duration:2},
  {pitch:'G4', velocity:1, time:12, duration:2},
];

function setup() {
  createCanvas(720, 200)
  textAlign(CENTER, CENTER);
  synth = new p5.PolySynth();
  sloop = new p5.SoundLoop(soundLoop, "4n"); // Repeats at every beat (1/4 of a whole note)
  sloop.bpm = 100; // 120 beats per minute
}

function soundLoop(cycleStartTime) {
  var beatSeconds = this._convertNotation('4n'); // 1/4th note = 1 crotchet = beat duration
  // Loop through all notes that start within this beat
  while (songIndex < song.length && song[songIndex].time < beatIndex + 1) {
    note = song[songIndex];
    var offsetFromBeatStart = (note.time - beatIndex) * beatSeconds;
    synth.play(note.pitch, note.velocity, cycleStartTime + offsetFromBeatStart, note.duration*beatSeconds*0.8);
    
    songIndex++;
    if (songIndex >= song.length) {
      this.stop();
    }
  }
  beatIndex++;
}

function draw() {
  background(200);
  // Change beats-per-minute based on mouse speed
  var new_bpm = map(mouseX, 0, width, 60, 200);
  line(mouseX, 0, mouseX, height);
  text(mouseX, height*2/3, new_bpm);
  sloop.bpm = new_bpm;

  if (sloop.isPlaying) {
    text('click to pause', width/2, height/2);
  } else {
	  text('click to play song', width/2, height/2);
  }
}

function touchStarted() {
  if (sloop.isPlaying) {
    sloop.pause();
  } else {
    // Reset counters
    beatIndex = 0;
    songIndex = 0;
    sloop.start();
  }
}