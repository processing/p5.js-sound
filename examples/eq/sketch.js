/**
 *  Example: Apply a p5.LowPass filter to a p5.SoundFile.
 *  Visualize the sound with FFT.
 *  Map mouseX to the the filter's cutoff frequency
 *  and mouseY to resonance/width of the a BandPass filter
 */

var soundFile;
var fft;

var description = 'loading';
var p;

//var eq, Freq, filterRes;
var noise, eq, gain1,gain2,gain3,gain4;
var circleSize = 15;
//bezier curve variables


var x1=5, y1=128;
var x2=105,y2=128;
var x3=205,y3=128;
var x4=305,y4=128;
var x5=405,y5=128;
var x6=505,y6=128;
var x7=605,y7=128;
var x8=705,y8=128;
// function preload() {
//   soundFormats('mp3', 'ogg');
//   soundFile = loadSound('../files/beat');
// }




function setup() {
  createCanvas(710, 256);
  //sound wave color
  fill(255, 40, 255);

  eq = new p5.EQ();


  // Disconnect soundfile from master output.
  // Then, connect it to the filter, so that we only hear the filtered sound
  noise = new p5.Noise();
  noise.disconnect();
  eq.process(noise);
  noise.amp(0.1);
  noise.start();

  fft = new p5.FFT();

  // update description text
  p = createP(description);
  var p2 = createP('Draw the array returned by FFT.analyze( ). This represents the frequency spectrum, from lowest to highest frequencies.');

}

function draw() {
  background(30);
  strictBoundaries();

  //   gain1 = gain2 = gain3 = gain4 = 0;
  // if (keyIsDown(LEFT_ARROW)){
  //   gain1 = -40;   
  // }

  //   if (keyIsDown(DOWN_ARROW)){
  //   gain2 = -40;
  //   // = map(mouseY, 0, 256, 1, -1); 
  // }
  //   if (keyIsDown(UP_ARROW)){
  //   gain3 = -40;
  // }

  //   if (keyIsDown(RIGHT_ARROW)){
  //   gain4 = -40;
  // }
 


     // eq.setBand(1,"gain",gain1);
     // eq.setBand(2,"gain",gain1);
     // eq.setBand(3,"gain",gain2);
     // eq.setBand(4,"gain",gain2);
     // eq.setBand(5,"gain",gain3);
     // eq.setBand(6,"gain",gain3);
     // eq.setBand(7,"gain",gain4);
     // eq.setBand(8,"gain",gain4);


  // Draw every value in the FFT spectrum analysis where
  // x = lowest (10Hz) to highest (22050Hz) frequencies,
  // h = energy / amplitude at that frequency
  var spectrum = fft.analyze();
  noStroke();
  for (var i = 0; i< spectrum.length; i++){
    var x = map(i, 0, spectrum.length, 0, width);
    var h = -height + map(spectrum[i], 0, 255, height, 0);
    rect(x, height, width/spectrum.length, h) ;
  }

  fill(255,255,255);

  mouseOnHandle(x1,y1) ? (y1=mouseY, makeAdjustment(1,y1)) : true;
  mouseOnHandle(x2,y2) ? (y2=mouseY, makeAdjustment(2,y2)) : true;
  mouseOnHandle(x3,y3) ? (y3=mouseY, makeAdjustment(3,y3)) : true;
  mouseOnHandle(x4,y4) ? (y4=mouseY, makeAdjustment(4,y4)) : true;
  mouseOnHandle(x5,y5) ? (y5=mouseY, makeAdjustment(5,y5)) : true;
  mouseOnHandle(x6,y6) ? (y6=mouseY, makeAdjustment(6,y6)) : true;
  mouseOnHandle(x7,y7) ? (y7=mouseY, makeAdjustment(7,y7)) : true;
  mouseOnHandle(x8,y8) ? (y8=mouseY, makeAdjustment(8,y8)) : true;


  ellipse(x1,y1,circleSize,circleSize);
  ellipse(x2,y2,circleSize,circleSize);
  ellipse(x3,y3,circleSize,circleSize);
  ellipse(x4,y4,circleSize,circleSize);
  ellipse(x5,y5,circleSize,circleSize);
  ellipse(x6,y6,circleSize,circleSize);
  ellipse(x7,y7,circleSize,circleSize);
  ellipse(x8,y8,circleSize,circleSize);

  


  updateDescription();
}

function strictBoundaries(){
  y1<1 ? y1=1 : y1>255 ? y1 = 255 : true;
  y2<1 ? y2=1 : y2>255 ? y2 = 255 : true;
  y3<1 ? y3=1 : y3>255 ? y3 = 255 : true;
  y4<1 ? y4=1 : y4>255 ? y4 = 255 : true;
  y5<1 ? y5=1 : y5>255 ? y5 = 255 : true;
  y6<1 ? y6=1 : y6>255 ? y6 = 255 : true;
  y7<1 ? y7=1 : y1>255 ? y7 = 255 : true;
  y8<1 ? y8=1 : y8>255 ? y8 = 255 : true;


  
}

function makeAdjustment(band,y){
  eq.setBand(band,"gain",map(y,256,0, -40, 40));
}

function mouseOnHandle(x,y){

  if (mouseX > x - circleSize && mouseX < x + circleSize &&
      mouseY > y - circleSize && mouseY < y + circleSize &&
      mouseIsPressed){
    
    return true;
  }
  else
    return false;
}

// Change description text if the song is loading, playing or paused
function updateDescription() {
    description = 'gain1 ' + gain1 + '\ngain2 ' + gain2 + '\ngain3 ' + gain3 + '\ngain4 ' + gain4;
    p.html(description);
}