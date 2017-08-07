/**
 *  Create a sequence using a Part with callbacks that play back soundfiles.
 *  The callback includes parameters (the value at that position in the Phrase array)
 *  as well as time, which should be used to schedule playback with precision.
 *  
 */

var click, beatbox ;
var clickPhrase = [1, 0, 0, 0];
var bboxPhrase = [0, 0, 1, 0, 0, 0, 1, 1];


var looper1, looper2;
var num;

var c,d;
var count1, count2;



function preload() {
  soundFormats('mp3', 'ogg');
  click = loadSound('../files/drum');
  beatbox = loadSound('../files/beatbox');

}

function setup() {
	createCanvas(500,500)
	count1 = 0;
	count2 = 0;
	c = color(50);
	d = color(50);
  // create a part with 8 spaces, where each space represents 1/16th note (default)
  looper1 = new p5.SoundLoop(function(time){
    click.play();
    console.log('looper1 '+this.clock._nextTick);
    }, 1);

  looper2 = new p5.SoundLoop(function(time){
    
	beatbox.play();
	// console.log(this.clock.ticks);
  console.log('looper2 ' + this.clock._nextTick); 
    }, "16n");

  looper1.start();

  // looper1.start();

}



