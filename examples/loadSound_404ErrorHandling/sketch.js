// error handler

function setup() {
  createCanvas(800,200);
  soundFile = loadSound('../files/Damscray_-_hello.mp3', soundReady, soundError);
}

function soundReady(){
  soundFile.loop();
}

function soundError(e) {
	console.log(e);
	text("looks like " + e.responseURL + " doesn't exist", 0, 10);
}