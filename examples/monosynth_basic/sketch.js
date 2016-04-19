/**
 *  Play a random note
 *  every time you press a key
 */

var monoSynth;

function setup() {
  monoSynth = new p5.MonoSynth();
}

function keyPressed() {
  // pick a random midi note
  var midiVal = round( random(50,72) );
  monoSynth.triggerAttack(midiVal, random() );
}

function keyReleased() {
  monoSynth.triggerRelease();
}