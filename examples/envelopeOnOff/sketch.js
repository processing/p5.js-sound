/**
 *  Example: Create an Envelope (p5.Envelope) to control oscillator amplitude.
 *  Trigger the Attack portion of the envelope when the mouse is clicked.
 *  Trigger the Release when the mouse is released.
 */

var osc;
var env;
var a;

// Times and levels for the ADSR envelope
var attackTime = 0.001;
var attackLevel = 0.6;
var decayTime = 0.1;
var susPercent = 0.2;
var releaseTime = 0.5;
var releaseLevel = 0;

var duration = 1000;
// Set the note trigger
var trigger;

// An index to count up the notes
var note = 0;


function setup(){
  createCanvas(600, 300);
  background(20);
  fill(0,255,0);

  trigger = millis();

  osc = new p5.SinOsc();
  osc.freq(220);
  osc.start();

  env = new p5.Envelope();
  env.setADSR(attackTime, decayTime, susPercent, releaseTime);
  env.setRange(attackLevel, releaseLevel);

  osc.amp(env);
  createP('click mouse to triggerAttack, release mouse to triggerRelease');

  a = new p5.Amplitude();
}

function draw(){
  var size = 10;
  background(20, 20, 20, 70);
  ellipse( map ( (trigger - millis()) % duration, 1000, 0, 0, width) % width, map ( a.getLevel(), 0, .5, height-size, 0), size, size);
}

function mousePressed(){
  env.triggerAttack();
  trigger = millis() + duration;
}

function mouseReleased(){
    env.triggerRelease();
}