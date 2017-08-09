var monoSynth;
var note;

function setup() {
  monoSynth = new p5.MonoSynth();
}

function keyPressed() {
  // pick a random midi note
  var midiVal = round( random(50,72) );
  monoSynth.triggerAttack(keyToMidi(), 1 );
  console.log(key);
  
} 

function keyReleased() {
  monoSynth.triggerRelease();
}


function keyToMidi() {
	switch (key) {
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