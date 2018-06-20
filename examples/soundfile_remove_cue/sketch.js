function setup() {
  background(0);
  noStroke();
  fill(255);
  textAlign(CENTER);
  text('click to play', width/2, height/2);

  mySound = loadSound('../files/beat.mp3');
  
  // schedule calls to changeText
  var firstCueId = mySound.addCue(0.50, changeText, "hello" );
  mySound.addCue(1.00, changeText, "p5" );
  var thirdCueId = mySound.addCue(1.50, changeText, "what" );
  mySound.addCue(2.00, changeText, "do" );
  mySound.addCue(2.50, changeText, "you" );
  mySound.addCue(3.00, changeText, "want" );
  mySound.addCue(4.00, changeText, "to" );
  mySound.addCue(5.00, changeText, "make" );
  mySound.addCue(6.00, changeText, "?" );
  
  //remove the first cue
  mySound.removeCue(firstCueId);
  
  //remove the third cue
  mySound.removeCue(thirdCueId);
}

function changeText(val) {
  background(0);
  text(val, width/2, height/2);
}

function mouseClicked() {
  if (mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height) {
    if (mySound.isPlaying() ) {
      mySound.stop();
    } else {
      mySound.play();
    }
  }
}