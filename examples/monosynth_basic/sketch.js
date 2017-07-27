/**
 *  Create a sequence using a Part with callbacks that play back soundfiles.
 *  The callback includes parameters (the value at that position in the Phrase array)
 *  as well as time, which should be used to schedule playback with precision.
 *  
 */

var synth;
var c = [1,0,0,0];
var d = [0,1,0,0];
var e = [0,0,1,0];
var f = [0,0,0,1];
var phrase;



var part; // a part we will loop


function setup() {
  // create a part with 8 spaces, where each space represents 1/16th note (default)
  part = new p5.Part(8, 1/16);
  synth = new p5.MonoSynth();

  // add phrases, with a name, a callback, and
  // an array of values that will be passed to the callback if > 0
  // 
  // 
  // 

  part.addPhrase('c', function(){synth.play(60);}, c);
  part.addPhrase('d', function(){synth.play(70);}, d);
  part.addPhrase('e', function(){synth.play(80);}, e);
  part.addPhrase('f', function(){synth.play(90);}, f);

  // set tempo (Beats Per Minute) of the part and tell it to loop
  part.setBPM(40);
  part.loop();
}

function playKick(time, params) {
  synth.play('C4');
}

// draw a ball mapped to current note height
function draw() {
  background(255);
  fill(255, 0, 0);
}

// UI 
var hDiv = 2;
var wDiv = 16;