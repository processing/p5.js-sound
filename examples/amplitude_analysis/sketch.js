/**
 * DEMO:  Use p5.Amplitude (volume) to change the size of an ellipse
 */

var soundFile;
var amplitude;
var bufferSize = 2048; // a value which can be multiple of 2 , eg. 256 , 512 , 1024 , 2048 ..etc

// description text
var description;
var p1;

var smoothing = .01;
var smoothSlider, smoothLabel;
var bufferDropDown, bufferLabel;

function preload() {
  soundFile = loadSound(['../files/beat.mp3', '../files/beat.ogg']);
}

function setup() {
  createCanvas(400, 400); 
  background(0);
  noStroke();
  fill(255);

  soundFile.loop();

  // create a new p5.Amplitude. Optionally, give it a 'smoothing' value betw 0.0 and .999
  amplitude = new p5.Amplitude(smoothing, bufferSize);

  // instruction text
  description = 'Spacebar: pause/unpause the loop. <br>Press "N" to toggle Normalize';
  p1 = createP(description);

  smoothSlider = createSlider(0.0, 99.9, smoothing*100);
  smoothLabel = createP('Smoothing: ' + smoothing);

  bufferDropDown = createSelect();
  bufferLabel = createP('BufferSize: ' + bufferSize);

  bufferDropDown.option('256');
  bufferDropDown.option('512');
  bufferDropDown.option('1024');
  bufferDropDown.option('2048');


}

function draw() {
  background(0);

  // get volume from the amplitude process
  var volume = amplitude.getLevel();

  // print the volume to the canvas. It is a float between 0 and 1.0.
  text('volume: ' + volume, 20, 20);

  // Change size based on volume. First, map to useful values.
  var diameter = map(volume, 0, 1.0, 25, 400);
  ellipse(width/2, height/2, diameter, diameter);

  // instruction text
  description = 'Spacebar: pause/unpause the loop. <br>Press "N" to toggle Normalize. Normalized is '+amplitude.normalize;
  p1.html(description);

  // change smoothing
  smoothing = smoothSlider.value()/100;
  smoothLabel.html('Smoothing: ' + smoothing);
  amplitude.smooth(smoothing);

  //change bufferSize
  bufferSize = bufferDropDown.value();
  bufferLabel.html('BufferSize :' + bufferSize);
  amplitude.setBufferSize(parseInt(bufferSize));

}

// on key pressed...
function keyPressed(e) {

  // spacebar pauses
  if (e.keyCode == 32) {
    if (soundFile.isPlaying()) {
      soundFile.pause();
    } else {
      soundFile.play();
    }
  }

  // 'n' keypress toggles normalize on/off
  if (e.keyCode == 78) {
    amplitude.toggleNormalize();
  }

}

function mouseClicked() {
  if (mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height) {
    if ( getMasterVolume() == 0) {
      masterVolume(0, 1);
    } else {
      masterVolume(0.1),1;
    }
  }
}


