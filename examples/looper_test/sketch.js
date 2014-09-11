var kick, ding;
var env, osc;
var bass, lfo, envB;

var mySong;

var tri = new p5.TriOsc();
var saw = new p5.SawOsc();
var envC;

function preload() {
  soundFormats('mp3', 'ogg');
  kick = loadSound('../_files/beatbox.mp3');
  ding = loadSound('../_files/drum.mp3');
}

function setup() {
  createCanvas(400, 400);
  background(0);

  env = new p5.Env(.01, .9, .2, .2);
  osc = new p5.Oscillator('triangle');
  bass = new p5.Oscillator('sine');

  envB = new p5.Env(.01, .7, .2, .0);
  lfo = new p5.Oscillator();
  lfo.disconnect();
  lfo.amp(2000);
  lfo.start();
  lfo.freq(.2);

  envC = new p5.Env(.01, .9, .2, .1);
  tri = new p5.TriOsc();
  saw = new p5.SawOsc();


  var a = new p5.Part(16, 1/4);
  a.addPhrase('kick', playKick, [1,0,2,0,1,0.2,5,2,1,0,2,0,1,0.2,5,2]);
  a.addPhrase('snare', playSnare, [0,0,1,0,0,1,0,0,0,0,1,0,0,1,0,0]);
  a.addPhrase('ding', playDing, [0,0,0,0,0,1,1,1,0,0,0,0,0,1,1,0]);


  var b = new p5.Part(16, 1/4);
  b.addPhrase('melody', playMelody, [64,0,0,0,65,0,54,0, 64,0,0,0,65,0,54,0]);
  // b.addPhrase('bass', playBass, [62,0,0,0,57,0,54,0,60,0,0,0,65,0,54,0]);
  b.addPhrase('kick', playKick, [1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0]);

  // a.onStep(fireStep); // set a callback that runs every time through this loop
  // b.onStep(fireStep); // set a callback that runs every time through this loop

  var c = new p5.Part(24, 1/4);
  c.onStep(fireStep); // set a callback that runs every time through this loop

  mySong = new p5.Score(a, b);
  mySong.loop();
  mySong.setBPM(120);
  b.setBPM(300);

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

  // osc.start();
  osc.freq(f);
  envB.triggerAttack(osc);
}

function fireStep(t) {
  var x = random(0,1);
  if (x > .55) {
    bass.freq(midiToFreq( round(random(80, 70) ) ) );
    bass.amp(1);
    envB.play(bass, t);
  }
}

function playBass(f) {
  // tri.amp(0);
  // saw.amp(0);
  // tri.start();
  // saw.start();
  tri.freq(midiToFreq(f));
  saw.freq(midiToFreq(f));
  envC.play(tri);
  envC.play(saw);
}