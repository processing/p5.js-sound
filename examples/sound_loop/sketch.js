/**
 *  Create a sequence using a Part with callbacks that play back soundfiles.
 *  The callback includes parameters (the value at that position in the Phrase array)
 *  as well as time, which should be used to schedule playback with precision.
 *  
 */

var click, beatbox;
var clickPhrase = [1, 0, 0, 0];
var bboxPhrase = [0, 0, 1, 0, 0, 0, 1, 1];


var looper;
var num;

function preload() {
  soundFormats('mp3', 'ogg');
  click = loadSound('../files/drum');
  beatbox = loadSound('../files/beatbox');

}

function setup() {

  // create a part with 8 spaces, where each space represents 1/16th note (default)
  looper = new p5.SoundLoop(function(time){
    
  	console.log(time);

    }, 4);

  looper.start();
}
