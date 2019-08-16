// ====================
// DEMO: pause sound when the user presses a key, resume on release
// ====================
'use strict';

var soundFile;
var audioContextStarted = false;

function preload() {
  // create a SoundFile
  soundFormats('ogg', 'mp3');
  soundFile = loadSound('../files/Damscray_-_Dancing_Tiger_02');
}

function setup() {
  createCanvas(400, 400);
  background(0, 255, 0);

  userStartAudio().then(function() {
    soundFile.loop();
    audioContextStarted = true;
  });

  createP('Press any key to pause. Resume when the key is released')
}

function keyTyped() {
  if (!audioContextStarted) {
    return;
  }
  soundFile.pause();
  background(255, 0, 0);
}

function keyReleased() {
  if (!audioContextStarted) {
    return;
  }
  soundFile.play();
  background(0, 255, 0);
}
