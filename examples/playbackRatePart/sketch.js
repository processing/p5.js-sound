var mySound, myPhrase, myPart;
var pattern = [1,0,0,2,0,2,0,0];
var msg = 'click to play';

function preload() {
  mySound = loadSound('../files/beatbox.mp3');
}

function setup() {
  noStroke();
  fill(255);
  textAlign(CENTER);
  masterVolume(0.1);
  
  myPhrase = new p5.Phrase('bbox', makeSound, pattern);
  myPart = new p5.Part();
  myPart.addPhrase(myPhrase);
  myPart.setBPM(60);
}

function draw() {
  background(0);
  text(msg, width/2, height/2);
}

function makeSound(time, playbackRate) {
  // mySound.rate(playbackRate);
  // mySound.play(time);
  mySound.play(time, playbackRate);

}

function mouseClicked() {
  if (mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height) {
    myPart.start();
    msg = 'playing pattern';
  }
}