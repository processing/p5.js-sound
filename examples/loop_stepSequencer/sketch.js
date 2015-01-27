/**
 *  Create a sequence using a Part.
 *  Add two Phrases to the part, and tell the part to loop.
 */

var click, beatbox;
var clickPhrase = [1, 0, 0, 0];
var bboxPhrase = [0, 0, 1, 0, 0, 0, 1, 1];


var part; // a part we will loop

function preload() {
  soundFormats('mp3', 'ogg');
  click = loadSound('../_files/drum');
  beatbox = loadSound('../_files/beatbox');

}

function setup() {
  // create a part with 8 spaces, where each space represents 1/16th note (default)
  part = new p5.Part(8, 1/16);

  // add phrases, with a name, a callback, and
  // an array of values that will be passed to the callback if > 0
  part.addPhrase('kick', playKick, clickPhrase);
  part.addPhrase('snare', playSnare, bboxPhrase);

  // // set tempo (Beats Per Minute) of the part and tell it to loop
  part.setBPM(80);
  part.loop();

  ac = getAudioContext();
}

var ac, lastHit = 0;
var greatestGap = 0;
var expectedInterval = 0.1875;

function playKick(params, time) {
  click.rate(params);
  click.play(time);
  var nextHit = ac.currentTime + time;
  var gap = Math.abs(nextHit - lastHit) - expectedInterval;
  greatestGap = Math.max(gap, greatestGap);
  if (gap > 0.01) {console.log(gap)}
  lastHit = nextHit;

}

function playSnare(params, time) {
  beatbox.rate(params);
  beatbox.play(time);
}

// draw a ball mapped to current note height
function draw() {
  background(255);
  fill(255, 0, 0);
}
