/* eslint-disable strict */
let mypart, score, cnv, tick;

function preload() {
  tick = loadSound('../files/tick.mp3');
}

function setup() {
  cnv = createCanvas(400, 400);
  textAlign(CENTER);
  cnv.mousePressed(playOneTime);
  cnv.doubleClicked(playMeTwice);

  mypart = new p5.Part(4, 1/4);

  tick.pattern = [1, 2, 3, 4];
  tick.phrase = new p5.Phrase('metro', playTick, tick.pattern );
  mypart.addPhrase(tick.phrase);
}

function playMeTwice() {
  userStartAudio();
  score = new p5.Score(mypart, mypart);
  score.setBPM(55);
  score.start();
}

function playOneTime() {
  userStartAudio();
  score = new p5.Score(mypart);
  score.setBPM(55);
  score.start();
}

function draw() {
  background(33);
  textSize(32);
  fill(255);
  text('click to play once', width/2, height/2-25);
  text('double-click to play twice', width/2, height/2+25);
}

function playMyPart() {
  userStartAudio();
  score.start();
}

function playTick(time) {
  tick.play(time);
}

