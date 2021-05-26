/**
 *  Control the level of an envelope
 */

var env; // this is the env
var osc; // this oscillator will modulate the amplitude of the carrier
var freqEnv; // env for frequency

function setup() {
  env = new p5.Envelope();
  env.setADSR(0.01, 0.2, 0.2, 0.3);
  env.setRange(0, 1);

  freqEnv = new p5.Envelope();
  freqEnv.setADSR(0.01, 0.2, 0.2, 0.3);
  freqEnv.setRange(300, 5000);


  osc = new p5.Oscillator(); // connects to main output by default
  osc.start(0);
  osc.freq(220);
  // osc.freq(env.scale(0,1,800,300));
  osc.freq(freqEnv);
  osc.amp(env);
}

function mousePressed() {
  env.triggerAttack();
  freqEnv.triggerAttack();
}

function mouseReleased() {
  env.triggerRelease();
  freqEnv.triggerRelease();
}
