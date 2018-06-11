// Adapted from Learning Processing
// Daniel Shiffman
// http://www.learningprocessing.com

// Example: Playing Notes With Envelope

// An Envelope is a series of fades, defined
// as time / value pairs. In this example, the envelope
// will be used to "play" a note by controlling the output
// amplitude of an oscillator.
// 
// HOW THIS WORKS: The p5.Oscillator sends its output through
// an internal Web Audio GainNode (p5.Oscillator.output).
// By default, that node has a constant value of 0.5. It can
// be reset with the osc.amp() method. Or, in this example, an
// Envelope takes control of that node, turning the amplitude
// up and down like a volume knob.

var osc;
var envelope;

var scaleArray = [60, 62, 64, 65, 67, 69, 71, 72];
var note = 0;

function setup() {
  createCanvas(200, 200);
  osc = new p5.SinOsc();

  // Instantiate the envelope with time / value pairs
  envelope = new p5.Envelope(0.01, 0.5, 1, 0.5);

  osc.start();
}

function draw() {
  background(255);
    
  if (frameCount % 60 == 0) {
    var midiValue = scaleArray[note];
    var freqValue = midiToFreq(midiValue);
    osc.freq(freqValue);

    envelope.play(osc);
    note = (note + 1) % scaleArray.length;
  }
}