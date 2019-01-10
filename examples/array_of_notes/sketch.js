/**
 * Basic example of playing back a static array of notes.
 * 
 * Note that this implementation does not allow for starting/stopping
 * or dynamically modifying playback once it has started. For a more
 * versatile example of playback, see the SoundLoop version.
 */

var synth;
var songStarted = false;
var song = [
  // Note pitch, velocity (between 0-1), start time (s), note duration (s)
  { pitch: 'E4', velocity: 1, time: 0, duration: 1 },
  { pitch: 'D4', velocity: 1, time: 1, duration: 1 },
  { pitch: 'C4', velocity: 1, time: 2, duration: 1 },
  { pitch: 'D4', velocity: 1, time: 3, duration: 1 },
  { pitch: 'E4', velocity: 1, time: 4, duration: 1 },
  { pitch: 'E4', velocity: 1, time: 5, duration: 1 },
  { pitch: 'E4', velocity: 1, time: 6, duration: 1 },
  // Rest indicated by offset in start time
  { pitch: 'D4', velocity: 1, time: 8, duration: 1 },
  { pitch: 'D4', velocity: 1, time: 9, duration: 1 },
  { pitch: 'E4', velocity: 1, time: 10, duration: 1 },
  { pitch: 'D4', velocity: 1, time: 11, duration: 1 },
  // Chord indicated by simultaneous note start times
  { pitch: 'C4', velocity: 1, time: 12, duration: 2 },
  { pitch: 'E4', velocity: 1, time: 12, duration: 2 },
  { pitch: 'G4', velocity: 1, time: 12, duration: 2 },
];

function setup() {
  textAlign(CENTER, CENTER);
  synth = new p5.PolySynth();
}

function draw() {
  background(255);
  if (songStarted) {
    text('song started', width / 2, height / 2);
  } else {
    text('click to play song', width / 2, height / 2);
  }
}

function touchStarted() {
  if (!songStarted) { // Only play once
    for (var i = 0; i < song.length; i++) {
      note = song[i];
      synth.play(note.pitch, note.velocity, note.time, note.duration);
    }
    songStarted = true;
  }
}