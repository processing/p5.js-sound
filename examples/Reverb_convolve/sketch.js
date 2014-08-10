/**
 *  Example: Convolution Reverb
 *
 *  The p5.Convolver can recreate the sound of actual spaces using convolution.
 *  
 *  Toggle between five different buffer sources
 *
 *  Convolution samples Creative Commons BY recordinghopkins, via freesound.org
 *  https://www.freesound.org/people/recordinghopkins/
 */

var sound, env, cVerb, osc;
var currentBuffer = 0;
var p;

function preload() {
  cVerb = createConvolution('../_files/bx-spring.mp3');
  cVerb.addImpulse('../_files/small-plate.mp3');
  cVerb.addImpulse('../_files/large-dark-plate.mp3');
  cVerb.addImpulse('../_files/studio-b.mp3');
  cVerb.addImpulse('../_files/concrete-tunnel.mp3');
  cVerb.addImpulse('../_files/drum.mp3');
  cVerb.addImpulse('../_files/beatbox.mp3');

  sound = loadSound('../_files/Damscray_DancingTiger.mp3');
}

function setup() {
  sound.disconnect();
  cVerb.process(sound);
  p = createP('Convolution Impulse Response: ' + cVerb.impulses[currentBuffer].name);
}

function mousePressed() {
  currentBuffer++;
  if (currentBuffer >= cVerb.impulses.length) {
    currentBuffer = 0;
  }
  cVerb.setImpulse(currentBuffer);
  play();
}

function play() {
  sound.play();
  p.html('Convolution Impulse Response: ' + cVerb.impulses[currentBuffer].name);
}