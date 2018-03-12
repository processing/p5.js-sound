/**
 *  Create a sequence using a Part with callbacks that play back soundfiles.
 *  The callback includes parameters (the value at that position in the Phrase array)
 *  as well as time, which should be used to schedule playback with precision.
 *  
 */

var click, beatbox ;

var looper1, looper2;


function preload() {
  soundFormats('mp3', 'ogg');
  click = loadSound('../files/drum');
  beatbox = loadSound('../files/beatbox');

}

function setup() {

  //Hemiola! 2 loops, playing sounds in a 4 over 3 pattern
  //gradually increase the tempo of both loops
  //
  //the looper's callback is passed the timeFromNow
  //this value should be used as a reference point from 
  //which to schedule sounds 

  looper1 = new p5.SoundLoop(function(timeFromNow){
    click.play(timeFromNow);
    looper1.bpm = looper1.bpm += 0.5;
    }, "8n");

  looper2 = new p5.SoundLoop(function(timeFromNow){  
  	beatbox.play(timeFromNow);
    looper2.bpm = looper1.bpm;
    }, "12n");

  //start the loops together
  looper1.syncedStart(looper2);
}



