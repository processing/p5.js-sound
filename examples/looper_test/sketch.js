var melodyA = [60, 64, 67, 72];
var melodyB = [62, 66, 69, 72];
var osc, env;

function setup() {
  // we'll use an osc + env to play notes
  osc = new p5.Oscillator();
  env = new p5.Env(0.02, 0.5, 0.1, 0);
  env.setInput(osc);

  var a = new p5.Part();
  a.addPhrase('melody', playOsc, melodyA);

  var b = new p5.Part();
  b.addPhrase('melody', playOsc, melodyB);

  var c = new p5.Part();
  c.addPhrase('melody', difNote, melodyB);

  var myScore = new p5.Score(a, b);
  setBPM(30);
  myScore.loop();
}

function playOsc(midiNote) {
  var freq = midiToFreq(midiNote);
  env.play(osc);
  osc.freq(freq);

}

function difNote(midiNote) {
  playOsc(midiNote + 9);
}