// error handler

function setup() {
  createCanvas(800,200);
  soundFile = loadSound('http://files/beatbx.mp3', soundReady, soundError);
  soundFile2 = loadSound('../files/beatbx.mp3', soundReady, soundError);

}

function soundReady(){
  soundFile.play();
}

function soundError(e) {
	console.log(e);
}