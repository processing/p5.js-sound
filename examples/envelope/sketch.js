// Adapting Wilm Thoben's Envelope example from the Processing Handbook ex2

/*
This sketch shows how to use envelopes and oscillators. Envelopes are pre-defined amplitude 
distribution over time. The sound library provides an ADSR envelope which stands for attack, 
decay, sustain, release. The amplitude rises then decays to a sustain level, then decays slowly 
toward the release value.

      .  
     . . _______
    .            --- 
   .                ---
   A   D  S       R 

*/

var triOsc;
var env;
var a;

// Times and levels for the ASR envelope
var attackTime = 0.001;
var attackLevel = 0.9;
var decayTime = 0.3;
var susPercent = 0.2;
var sustainTime = 0.1;
var releaseTime = 0.5;
var releaseLevel = 0;

var midiSequence = [ 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72 ]; 
var duration = 1000;
// Set the note trigger
var trigger;

// An index to count up the notes
var note = 0;

function setup(){
  createCanvas(600, 400);
  fill(0, 255, 0);

  trigger = millis();

  triOsc = new p5.TriOsc();
  triOsc.amp(0);
  triOsc.start();

  env = new p5.Envelope();
  env.setADSR(attackTime, decayTime, susPercent, releaseTime);
  env.setRange(attackLevel, releaseLevel);

  a = new p5.Amplitude();
}

function draw(){
  var size = 10;
  background(20, 20, 20, 70);
  ellipse(map ( (trigger - millis()) % duration, 1000, 0, 0, width), map ( a.getLevel(), 0, .5, height-size, 0), size, size);

  // If the determined trigger moment in time matches up with the computer clock and we if the 
  // sequence of notes hasn't been finished yet the next note gets played.
  if ((millis() > trigger)){
    // midiToFreq transforms the MIDI value into a frequency in Hz which we use to control the triangle oscillator
    triOsc.freq(midiToFreq(midiSequence[note]));

    // The envelope gets triggered with the oscillator as input and the times and levels we defined earlier
    // play accepts an object to play, time from now, and a sustain time—how long to hold before the release.
    env.play(triOsc, 0, sustainTime);

    // Create the new trigger according to predefined durations and speed it up by deviding by 1.5
    trigger = millis() + duration;
    
    // Advance by one note in the midiSequence;
    note++; 

    // Loop the sequence, notice the jitter
    if(note == 12) {
      note = 0;
    }
  }
}