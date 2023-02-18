// Adapting Wilm Thoben's Envelope example from the Processing Handbook ex2

/*
This sketch shows how to use envelopes to trigger multiple sources (in this case,noise and oscillator).

Envelopes are pre-defined amplitude  distribution over time.
The sound library provides an ADSR envelope which stands for attack, decay, sustain, release.
The amplitude rises then decays to a sustain level, then decays slowly toward the release value.

      .  
     . . _______
    .            --- 
   .                ---
   A   D  S       R 

*/

var triOsc;
var noise;
var env;
var a;

// Times and levels for the ASR envelope
var attackTime = 0.01;
var attackLevel = 0.7;
var decayTime = 0.3;
var decayLevel = 0.2;
var sustainTime = 0.1;
var sustainLevel = decayLevel;
var releaseTime = 0.5;

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

  outputVolume(0.3);

  triOsc = new p5.TriOsc();
  triOsc.amp(0);
  triOsc.start();

  noise = new p5.Noise();
  noise.setType('brown');
  noise.start();

  env = new p5.Envelope(attackTime, attackLevel, decayTime, decayLevel, sustainTime, sustainLevel, releaseTime);

  // noise.amp(env);
  // triOsc.amp(env);

  env.setInput(noise, triOsc);

  a = new p5.Amplitude();
}

function draw(){
  var size = 10;
  background(20, 20, 20, 70);
  ellipse(map ( (trigger - millis()) % duration, 1000, 0, 0, width), map ( a.getLevel(), 0, .3, height-size, 0), size, size);

  // If the determined trigger moment in time matches up with the computer clock and we if the 
  // sequence of notes hasn't been finished yet the next note gets played.
  if ((millis() > trigger)){
    // midiToFreq transforms the MIDI value into a frequency in Hz which we use to control the triangle oscillator
    triOsc.freq(midiToFreq(midiSequence[note]));

    // The envelope gets triggered with the oscillator as input and the times and levels we defined earlier
    env.play();

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

function mouseClicked() {
  if (mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height) {
    if ( getOutputVolume() == 0) {
      outputVolume(0.3, 0.5);
    } else {
      outputVolume(0, 0.5);
    }
  }
}
