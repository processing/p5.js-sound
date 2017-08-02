/**
 *  Create a sequence using a Part with callbacks that play back soundfiles.
 *  The callback includes parameters (the value at that position in the Phrase array)
 *  as well as time, which should be used to schedule playback with precision.
 *  
 */

var click, beatbox;
var clickPhrase = [1, 0, 0, 0];
var bboxPhrase = [0, 0, 1, 0, 0, 0, 1, 1];

var synth;
var looper;
var num;

function preload() {
  soundFormats('mp3', 'ogg');
  click = loadSound('../files/drum');
  beatbox = loadSound('../files/beatbox');

}

function setup() {

  num = 0;
  synth = new p5.MonoSynth();

  // create a part with 8 spaces, where each space represents 1/16th note (default)
  looper = new p5.Looper(function(time){
    
  	console.log(time);
    looper.changeInterval(num+=0.5);

    }, 4);

  looper.start();
}
