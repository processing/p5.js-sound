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
var x1,x2,x3,x4,x5,x6,x7,x8,y1,y2,y3,y4,y5,y6,y7,y8;

// var x1=5, y1=128;
// var x2=105,y2=128;
// var x3=205,y3=128;
// var x4=305,y4=128;
// var x5=405,y5=128;
// var x6=505,y6=128;
// var x7=605,y7=128;
// var x8=705,y8=128;

var cpts;// = [[x1,y1], [x2,y2], [x3,y3], [x4,y4],[x5,y5], [x6,y6], [x7,y7], [x8,y8]];

var a, b, c, d, e, f, g, h;
var colors;// = [a,b,c,d,e,f,g,h];
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
  
  // a = color(255);
  // b = color('white');
  // c = color('white');
  // d = color('white');
  // e = color('white');
  // f = color('white');
  // g = color('white');
  // h = color('white');

  
  // h = color('blue');



  x1=5, y1=128, x2=105,y2=128, x3=205,y3=128, x4=305,y4=128;
  x5=405,y5=128, x6=505,y6=128, x7=605,y7=128, x8=705,y8=128;


  colors = [color(255),color(255),color(255),color(255),
            color(255),color(255),color(255),color(255)];



}

function draw() {
  cpts = [[x1,y1], [x2,y2], [x3,y3], [x4,y4],[x5,y5], [x6,y6], [x7,y7], [x8,y8]];

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
    var t = -height + map(spectrum[i], 0, 255, height, 0);
    rect(x, height, width/spectrum.length, t) ;
  }

  

  mouseOnHandle(x1,y1) ? (x1=mouseX, y1=mouseY, makeAdjustment(1,y1,x1)) : true;
  mouseOnHandle(x2,y2) ? (x2=mouseX, y2=mouseY, makeAdjustment(2,y2,x2)) : true;
  mouseOnHandle(x3,y3) ? (x3=mouseX, y3=mouseY, makeAdjustment(3,y3,x3)) : true;
  mouseOnHandle(x4,y4) ? (x4=mouseX, y4=mouseY, makeAdjustment(4,y4,x4)) : true;
  mouseOnHandle(x5,y5) ? (x5=mouseX, y5=mouseY, makeAdjustment(5,y5,x5)) : true;
  mouseOnHandle(x6,y6) ? (x6=mouseX, y6=mouseY, makeAdjustment(6,y6,x6)) : true;
  mouseOnHandle(x7,y7) ? (x7=mouseX, y7=mouseY, makeAdjustment(7,y7,x7)) : true;
  mouseOnHandle(x8,y8) ? (x8=mouseX, y8=mouseY, makeAdjustment(8,y8,x8)) : true;

  fill(colors[0]);
  ellipse(x1,y1,circleSize,circleSize);
  fill(colors[1]);
  ellipse(x2,y2,circleSize,circleSize);
  fill(colors[2]);
  ellipse(x3,y3,circleSize,circleSize);
  fill(colors[3]);
  ellipse(x4,y4,circleSize,circleSize);
  fill(colors[4]);
  ellipse(x5,y5,circleSize,circleSize);
  fill(colors[5]);
  ellipse(x6,y6,circleSize,circleSize);
  fill(colors[6]);
  ellipse(x7,y7,circleSize,circleSize);
  fill(colors[7])
  ellipse(x8,y8,circleSize,circleSize);

  stroke(255,0,0);
  noFill();
  beginShape();
    curveVertex(x1,y1);
    curveVertex(x1,y1);
    curveVertex(x2,y2);
    curveVertex(x3,y3);
    curveVertex(x4,y4);
    curveVertex(x5,y5);
    curveVertex(x6,y6);
    curveVertex(x7,y7);
    curveVertex(x8,y8);
    curveVertex(x8,y8);

  endShape();

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


 x1 < 1 ? x1 = 1 : x2 < x1 ? x2 = x1+1 : x3 < x2 ? x3 = x2 : x4 < x3 ? 
    x4 = x3 : x5 < x4 ? x5 = x4 : x6 < x5 ? x6 = x5 : x7 < x6 ? x7 = x6 
    : x8 < x7 ? x8 = x7 : true;
  //x max
  x1 > x2 ? x1 = x2-5 : x2 > x3 ? x2 = x3-1 : x3 > x4 ? x3 = x4-1 : x4 > x5 ? 
    x4 = x5-1 : x5 > x6 ? x5 = x6-1 : x6 > x7 ? x6 = x7-1 : x7 > x8 ? x7 = x8-1 
    : x8 > 709 ? x8 = 709 : true;
}


// function mouseClicked() {

//   for (var i = 0; i < cpts.length; i++) {
//     console.log(mouseOnHandle(105,128));

//     if (mouseOnHandle( cpts[i][0], cpts[i][1]) === 0){
//       eq.toggleBand(i);
//       console.log(eq);
//       eq.bands[i].toggle ? colors[i] = color(0) : colors[i] = color(255);
//     }
//   }

// }

function makeAdjustment(band,y,x){
  eq.setBand(band-1,"mod",map(y,256,0, -40, 40), map(x,0,710,0,22050));
}

function mouseOnHandle(x,y){

  if (mouseX > x - circleSize && mouseX < x + circleSize &&
      mouseY > y - circleSize && mouseY < y + circleSize &&
      mouseIsPressed){
    
    return true;
  } else if (mouseX > x - circleSize && mouseX < x + circleSize &&
      mouseY > y - circleSize && mouseY < y + circleSize){
    return 0;
  }
  else{
    return false;
  }
}

// Change description text if the song is loading, playing or paused
function updateDescription() {
    description = 'gain1 ' + gain1 + '\ngain2 ' + gain2 + '\ngain3 ' + gain3 + '\ngain4 ' + gain4;
    p.html(description);
}