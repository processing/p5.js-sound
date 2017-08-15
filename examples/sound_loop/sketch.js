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
  
  //the looper's callback is passed the timeFromNow
  //this value should be used as a reference point from 
  //which to schedule sounds 

  looper1 = new p5.SoundLoop(function(timeFromNow){
    click.play(timeFromNow);
    }, 1);

  looper2 = new p5.SoundLoop(function(timeFromNow){  
  	beatbox.play(timeFromNow);
    }, "16n");

  //start the loops together
  looper1.syncedStart(looper2);
}



