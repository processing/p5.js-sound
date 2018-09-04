/**
 * Using the SoundLoop to play back an array of notes with dynamic control.
 * 
 * The array of notes uses a note-on and note-off event representation;
 * this separation is necessary so that we can have polyphonic sound
 * and dynamic starting and stopping of notes during playback.
 */

var synth;
var sloop;
var eventIndex = 0;
var beatsPerMinute = 120;
var secondsPerBeat;
var song = [
  // event pitch, velocity (between 0-1), time since previous event (beats), type (1:ON or 0:OFF)
  { pitch: 'E4', velocity: 1, timeSincePrevEvent: 0, type: 1 },
  { pitch: 'E4', velocity: 1, timeSincePrevEvent: 1, type: 0 },
  { pitch: 'D4', velocity: 1, timeSincePrevEvent: 0, type: 1 },
  { pitch: 'D4', velocity: 1, timeSincePrevEvent: 1, type: 0 },
  { pitch: 'C4', velocity: 1, timeSincePrevEvent: 0, type: 1 },
  { pitch: 'C4', velocity: 1, timeSincePrevEvent: 1, type: 0 },
  { pitch: 'D4', velocity: 1, timeSincePrevEvent: 0, type: 1 },
  { pitch: 'D4', velocity: 1, timeSincePrevEvent: 1, type: 0 },
  { pitch: 'E4', velocity: 1, timeSincePrevEvent: 0, type: 1 },
  { pitch: 'E4', velocity: 1, timeSincePrevEvent: 1, type: 0 },
  { pitch: 'E4', velocity: 1, timeSincePrevEvent: 0, type: 1 },
  { pitch: 'E4', velocity: 1, timeSincePrevEvent: 1, type: 0 },
  { pitch: 'E4', velocity: 1, timeSincePrevEvent: 0, type: 1 },
  { pitch: 'E4', velocity: 1, timeSincePrevEvent: 1, type: 0 },
  // Rest
  { pitch: 'D4', velocity: 1, timeSincePrevEvent: 1, type: 1 },
  { pitch: 'D4', velocity: 1, timeSincePrevEvent: 1, type: 0 },
  { pitch: 'D4', velocity: 1, timeSincePrevEvent: 0, type: 1 },
  { pitch: 'D4', velocity: 1, timeSincePrevEvent: 1, type: 0 },
  { pitch: 'E4', velocity: 1, timeSincePrevEvent: 0, type: 1 },
  { pitch: 'E4', velocity: 1, timeSincePrevEvent: 1, type: 0 },
  { pitch: 'D4', velocity: 1, timeSincePrevEvent: 0, type: 1 },
  { pitch: 'D4', velocity: 1, timeSincePrevEvent: 1, type: 0 },
  // Chord indicated by multiple notes being ON at the same time
  { pitch: 'C4', velocity: 1, timeSincePrevEvent: 0, type: 1 },
  { pitch: 'E4', velocity: 1, timeSincePrevEvent: 0, type: 1 },
  { pitch: 'G4', velocity: 1, timeSincePrevEvent: 0, type: 1 },
  { pitch: 'C4', velocity: 1, timeSincePrevEvent: 2, type: 0 },
  { pitch: 'E4', velocity: 1, timeSincePrevEvent: 2, type: 0 },
  { pitch: 'G4', velocity: 1, timeSincePrevEvent: 2, type: 0 },
];

function setup() {
  createCanvas(720, 400);
  synth = new p5.PolySynth();
  sloop = new p5.SoundLoop(soundLoop, 0.1); // Interval doesn't matter; it changes in each loop iteration
}

function soundLoop(cycleStartTime) {
  var event = song[eventIndex];
  if (event.type == 1) {
    synth.noteAttack(event.pitch, event.velocity, cycleStartTime);
  } else {
    synth.noteRelease(event.pitch, cycleStartTime);
  }
  // Prepare for next event
  eventIndex++;
  if (eventIndex >= song.length) {
    this.stop(cycleStartTime);
  } else {
    var nextEvent = song[eventIndex];
    // This cycle will last for the time since previous event of the next event
    secondsPerBeat = 60 / beatsPerMinute;

    var duration = nextEvent.timeSincePrevEvent * secondsPerBeat;
    this.interval = max(duration, 0.01); // Cannot have interval of exactly 0
  }
}

function draw() {
  background(255, 220, 90);
  // Change beats-per-minute based on mouse speed
  beatsPerMinute = map(mouseX, 0, width, 60, 200);
  line(mouseX, 0, mouseX, height);
  textAlign(LEFT, BOTTOM);
  text("BPM: " + nfc(beatsPerMinute, 0), mouseX + 5, height - 10);

  textAlign(CENTER, CENTER);
  if (sloop.isPlaying) {
    text('click to stop song', width / 2, height / 2);
  } else {
    text('click to play song', width / 2, height / 2);
  }
}

function touchStarted() {
  if (sloop.isPlaying) {
    sloop.stop();
    synth.noteRelease(); // Release all notes
  } else {
    // Reset counters
    eventIndex = 0;
    sloop.start();
  }
}