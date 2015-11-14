var soundFile;

function preload() {
  soundFile = loadSound(['../files/beat.mp3', '../files/beat.ogg']);
}

function setup() {
  soundFile.onended(sayDone);
  soundFile.rate(3);
  soundFile.play();
}

function sayDone(sf) {
  console.log('Done playing: ');
  console.log(sf);
  console.log('Expect the argument to equal the soundfile that just ended playback: ')
  console.log(sf === this);
}

