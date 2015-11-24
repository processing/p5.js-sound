// error handler

function setup() {
  createCanvas(800,200);
  loadSound('http://badURL.mp3', soundReady, soundError);
  loadSound('../badPath.mp3', soundReady, soundError);

  createConvolver('http://badURL.mp3', soundReady, soundError);
  createConvolver('../badPath.mp3', soundReady, soundError);
}

function soundReady(soundFile){
  soundFile.play();
}

// the error has the following properties:
function soundError(e) {
	console.log('New error:');
	console.log('- name: ' + e.name);
	console.log('- message: ' + e.message);
	console.log('- stack: ' + e.stack);
	console.log('- failed path: ' + e.failedPath);
}