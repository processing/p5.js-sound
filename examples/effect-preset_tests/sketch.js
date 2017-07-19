/**
 *  Example: effect
 */

var sound, effect;
var play, pause;
var seconds, decay, reverse;
var wetdry;
var rev;
var desc;

function preload() {
  soundFormats('mp3', 'ogg');
  soundFile = loadSound('../files/Damscray_-_Dancing_Tiger_02');

  // disconnect the default connection
  // so that we only hear the sound via the effect.process
  soundFile.disconnect();


}

function setup() {
  createCanvas(720,100);
  background(0);
  play = createButton('play');
  pause = createButton('pause');
  play.mousePressed(start);
  pause.mousePressed(stop);
  seconds = createSlider(0,10,3,0.1);
  decay = createSlider(0,100,1, 0.1);
  wetdry = createSlider(0,1,1,0.1);
  decay.size(200);
  seconds.size(200);


  seconds.changed(changeSec);
  decay.changed(changeDec)
  wetdry.changed(changeWet);

  reverse = createButton('reverse: true')
  reverse.mouseReleased(changeRev);

  effect = new p5.Delay();

  // sonnects soundFile to effect with a
  // effectTime of 6 seconds, decayRate of 0.2%
  effect.process(soundFile);
  
  desc = createDiv('seconds '+seconds.value() + ' decay ' + decay.value());

  effect.amp(3);

// turn it up!
}


 

function start() {
  soundFile.play();
}

function stop() {
  soundFile.stop();
}
function changeSec(){
  effect.set(seconds.value(),decay.value(),rev);
  desc.html('seconds '+seconds.value() + ' decay ' + decay.value() + ' drywet ' + wetdry.value());
}

function changeDec(){
  effect.set(seconds.value(),decay.value(),rev);
  console.log('decay '+decay.value());
  desc.html('seconds '+seconds.value() + ' decay ' + decay.value() + ' drywet ' + wetdry.value());

}

function changeWet() {
  effect.drywet(wetdry.value());
  desc.html('seconds '+seconds.value() + ' decay ' + decay.value() + ' drywet ' + wetdry.value());

}
function changeRev() {

  rev = !rev;
  effect.set(seconds.value(),decay.value(),rev);

  console.log(rev);
}