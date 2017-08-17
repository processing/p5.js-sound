var polySynth;
var octave;

var keysDown={};
var colors = {};
var keys = {};
var notes = {};

var description;
function setup() {

 polySynth = new p5.PolySynth(p5.MonoSynth, 8);
 stroke(0);
  for(var i = 0; i<17; i++) {
    if(i!==11 && i!==15){
      colors[i] = [color(255),false];
    }
  }

  keys = {'A':60, 'W':61, 'S':62, 'E':63, 'D':64, 'F':65, 'T':66,'G':67,
          'Y':68, 'H':69, 'U':70, 'J':71, 'K':72, 'O':73, 'L':74};
  notes = {60:0, 62:1 , 64:2 , 65:3 , 67:4 , 69:5 , 71:6 , 72:7 , 74:8,
            61: 9, 63:10, 66:12, 68:13, 70:14, 73:16};
  octave = 0;

  description = createP('p5.PolySynth is a handler class for monophonic extensions '+
                'of the p5.AudioVoice class. Use the computer keyboard to play notes on '+
                'the piano roll. Use UP_ARROW and DOWN_ARROW to change octave');
}

function draw() {
  background(255);
  createCanvas(800,600);

  //draw white keys
  for(var i = 0; i<9; i++) {
    fill(colors[i][0]);
    rect(50*i,0,50,230);
  }
  //draw black keys
  for(var i = 9; i<17; i++) {
    if(i!==11 && i!==15){
      fill(colors[i][0]);
      rect(50*(i - 8) - 12.5, 0, 25, 150);
    }
  }
 
}

function keyPressed() {
  //OCTAVEf
  if (keyCode === UP_ARROW) {
  	octave +=12;
  } else if (keyCode === DOWN_ARROW) {
  	octave -=12;
  }
  else if (keyToMidi() && keysDown[key] !== true){
      polySynth.noteAttack(keyToMidi() + octave);
      var index = notes[keyToMidi()];
      colors[index][1] = !colors[index][1];
      colors[index][1] ? colors[index][0] = color(random(255),random(255),random(255)) : colors[index][0] = color(255);
    if (keysDown[key] === undefined) {
    	keysDown[key] = true; 
    }
  }
} 

function keyReleased() {
	Object.keys(keysDown).forEach(function(key) {
		if(!keyIsDown(key)){
			polySynth.noteRelease(keyToMidi(key) + octave);
      var index = notes[keyToMidi(key)];
      colors[index][1] = !colors[index][1];
      colors[index][1] ? colors[index][0] = color(random(255),random(255),random(255)) : colors[index][0] = color(255);
      delete keysDown[key];
		}
	});
}

function keyToMidi(keyboard) {
	var thisKey = typeof keyboard ==='undefined' ? key : keyboard
  return keys[thisKey];
}