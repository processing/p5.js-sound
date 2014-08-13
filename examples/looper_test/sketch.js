var l, kick, ding;

function preload() {
  soundFormats('mp3', 'ogg');
  kick = loadSound('../_files/beatbox.mp3');
  ding = loadSound('../_files/drum.mp3');
}

function setup() {
  createCanvas(400, 400);
  background(0);


  l = new p5.Looper(16);
  l.setBPM(80);
  l.addPattern('kick', playKick, [1,0,2,0,1,0.2,5,2,1,0,2,0,1,0.2,5,2]);
  l.addPattern('snare', playSnare, [0,0,1,0,0,1,0,0,0,0,1,0,0,1,0,0]);
  l.addPattern('melody', playMelody, [64,0,0,0,65,0,54,0, 64,0,0,0,65,0,54,0]);
  l.addPattern('bass', playBass, [62,0,0,0,57,0,54,0,60,0,0,0,65,0,54,0]);
  l.addPattern('ding', playDing, [0,0,0,0,0,1,1,1,0,0,0,0,0,1,1,0]);

  l.onStep(fireStep); // set a callback that runs every time through this loop
  l.start();
}

function playKick(r) {
  kick.rate(r);
  kick.play();
}

function playSnare(r) {
  kick.rate(random(.2, r));
  kick.play();
}

function playDing() {
  ding.play();
}

function playMelody(params) {
  var midiNote, duration;
  if (typeof(params) === 'number') {
    midiNote = params;
  } else {
    midiNote = params[0];
    duration = params[1];
  }
  var d = 1;// || duration;
  var f = midiToFreq(midiNote);

  var env = new p5.Env(.01, .9, .2, .2);
  var osc = new p5.Oscillator('triangle');
  osc.start();
  osc.freq(f);
  env.triggerAttack(osc);
}

function fireStep() {
  var x = random(0,1);
  if (x > .65) {
    var bass = new p5.Oscillator('sine');
    bass.freq(midiToFreq( round(random(80, 70) ) ) );
    // bass.amp(0);
    bass.start();

    var lfo = new p5.Oscillator();
    lfo.disconnect();
    lfo.amp(2000);
    lfo.start();
    lfo.freq(.2);
    lfo.connect(bass.freqNode);
    var e = new p5.Env(.1, .7, .2, .2);
    e.play(bass);
  }
}

function playBass(f) {
  var tri = new p5.TriOsc();
  var saw = new p5.SawOsc();
  tri.amp(0);
  saw.amp(0);
  tri.start();
  saw.start();
  tri.freq(midiToFreq(f));
  saw.freq(midiToFreq(f));
  var e = new p5.Env(.01, .9, .2, .1);
  e.play(tri);
  e.play(saw);
}