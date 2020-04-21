// Beat Detection with offline context example by @b2renger
// Building off an example by Joe Sullivan : http://tech.beatport.com/2014/web-audio/beat-detection-using-web-audio/
// and this example, too : https://github.com/JMPerez/beats-audio-api


var source_file; // sound file


function preload(){
  source_file = loadSound('../files/Tripping.mp3'); // preload the sound
}


function setup() {
  createCanvas(windowWidth, 150);
  background(180);

  src_length = source_file.duration();
  source_file.playMode('restart'); 
  console.log("source duration: " + src_length);

  // find beat preprocessing the source file with lowpass
  var beats = source_file.processPeaks(onComplete);
 
}

function draw() {
 
}

function onComplete(data) {
  for (var i = 0; i < data.length; i++) {
    // add a cue to the soundfile with a callback function
    source_file.addCue(data[i], logBeat);

    // draw peaks
    var xpos = map(i,0,src_length,0,width);
    stroke(0);
    line(xpos,0,xpos,height);
  }
 
  source_file.play();
}

function logBeat() {
  console.log('beat!');
}