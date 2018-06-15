/**
 *  Play a random note
 *  every time you press a key
 */

var monoSynth;

function setup() {
  monoSynth = new p5.MonoSynth();

  createCanvas(400, 400);
  text('press to play a random note at a random velocity', 20, 20);
}

function mousePressed() {
  // pick a random midi note
  var midiVal = midiToFreq(round( random(50,72) ));
  monoSynth.triggerAttack(midiVal, random() );
}

function mouseReleased() {
  monoSynth.triggerRelease();
}
