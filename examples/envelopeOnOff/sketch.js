var triOsc;
var env;

// Times and levels for the ADSR envelope
var attackTime = 0.1;
var attackLevel = .7;
var decayTime = .1;
var sustainTime = 0.1;
var sustainLevel = 0.1;
var releaseTime = .1;
var duration = 1000;
// Set the note trigger
var trigger;

// An index to count up the notes
var note = 0;

function setup(){
  createCanvas(600, 600);
  background(255);

  trigger = millis();

  triOsc = new SawOsc();
  triOsc.amp(0);
  triOsc.start();

  env = new Env(attackTime, attackLevel, decayTime, sustainLevel, sustainTime, releaseTime);
  fill(0);
}

function draw(){
  var size = 10;
  background(255, 255,255,20);
  ellipse( map ( (trigger - millis()) % duration, 1000, 0, 0, width) % width, map ( triOsc.getAmp(), 0, 1, height-size, 0), size, size);
  var f = map (mouseX, 0, width, 40, 1000);
  triOsc.freq(f);
  console.log(mouseX);
}

function mousePressed(){

    // The envelope gets triggered with the oscillator as input and the times and levels we defined earlier
    env.triggerAttack(triOsc);

    // Create the new trigger according to predefined durations and speed it up by deviding by 1.5
    trigger = millis() + duration;
}

function mouseReleased(){
    // The envelope gets triggered with the oscillator as input and the times and levels we defined earlier
    env.triggerRelease(triOsc);

    // Create the new trigger according to predefined durations and speed it up by deviding by 1.5
    // trigger = millis() + duration;
}