var polySynth;
var octave;

var keysDown={};
var colors = {};
var keys = {};
var notes = {};

var compressor;

var description;
function setup() {

 polySynth = new p5.PolySynth(p5.MonoSynth, 8);
 stroke(0);
  for(var i = 0; i<17; i++) {
    if(i!==11 && i!==15){
      colors[i] = [color(255),false];
    }
  }

  keys = {'A':'C0', 'W':'C#0', 'S':'D0', 'E':'Eb0', 'D':'E0', 'F':'F0', 'T':'F#0','G':'G0',
          'Y':'G#0', 'H':'A1', 'U':'Bb1', 'J':'B1', 'K':'C1', 'O':'C#1', 'L':'D1'};
          
  notes = {'C0':0, 'D0':1 , 'E0':2 , 'F0':3, 'G0':4 , 'A1':5 , 'B1':6 , 'C1':7 , 'D1':8,
            'C#0': 9, 'Eb0':10, 'F#0':12, 'G#0':13, 'Bb1':14, 'C#1':16};          
  octave = 3;


  description = createP('p5.PolySynth is a handler class for monophonic extensions '+
                'of the p5.AudioVoice class. Use the computer keyboard to play notes on '+
                'the piano roll. Use UP_ARROW and DOWN_ARROW to change octave');
  polySynth.disconnect();
  compressor = new p5.Compressor();
  polySynth.connect(compressor);


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
  	octave +=1;
  } else if (keyCode === DOWN_ARROW) {
  	octave -=1;
  }
  else if (keyToMidi() && keysDown[key] !== true){
      // var keyToMidi() = keyToMidi();
      var currentOctave = Number(keyToMidi()[keyToMidi().length-1]) + octave;
      var currentKey= keyToMidi().substr(0,keyToMidi().length -1) + currentOctave;

      polySynth.noteAttack(currentKey);
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

		if(!keyIsDown(key.charCodeAt(0))){
     // var keyToMidi() = keyToMidi();

      var currentOctave = Number(keyToMidi()[keyToMidi().length - 1]) + octave;
      currentKey = keyToMidi().substr(0,keyToMidi().length -1) + currentOctave;	
      polySynth.noteRelease(currentKey);

      var index = notes[keyToMidi(keyCodeToLetter(key))];
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

function keyCodeToLetter(code) {

}