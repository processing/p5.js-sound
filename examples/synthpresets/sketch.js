var monoSynth;
var polySynth;
var note;
var octave = 0;

var keysDown={};

function setup() {
  // monoSynth = new p5.MonoSynth();
  // monoSynth.loadPreset('punchyBass');

 polySynth = new p5.PolySynth(p5.MonoSynth, 4);

}

function keyPressed() {
  //OCTAVEf
  if (keyCode === UP_ARROW) {
  	octave +=12;
  } else if (keyCode === DOWN_ARROW) {
  	octave -=12;
  }
  else {
    polySynth.noteAttack(keyToMidi() + octave);

    if (keysDown[key] === undefined) {
    	keysDown[key] = true; 
    }
  }
} 

function keyReleased() {
	Object.keys(keysDown).forEach(function(key) {
		if(!keyIsDown(key)){
			polySynth.noteRelease(keyToMidi(key) + octave);
      delete keysDown[key];
		}
	});
}


function keyToMidi(keyboard) {
	var thisKey = typeof keyboard ==='undefined' ? key : keyboard
	switch (thisKey) {
		case 'A':
		return 60;

		case 'S':
		return 62;
	
		case 'D':
		return 64;

		case 'F':
		return 65;

		case 'G':
		return 67;

		case 'H':
		return 69;

		case 'J':
		return 71;

		case 'K':
		return 72;

	}

}