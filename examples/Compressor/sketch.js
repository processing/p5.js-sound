var fftHeight;
var fftWidth;

var soundFile;
var fft;



var compressor;

//UI Objects
var knobs = [];
var threshCntrl;


//knob info

//colors
var knobBckg;
var knobLine;
var threshLineCol;

//dimensions
var knobRad;
var knobLineLen;


function preload() {
  soundFormats('mp3', 'ogg');
  soundFile = loadSound('../files/beat');
}

function setup() {

  createCanvas(710, 256);


  fftHeight = 0.75*height;
  fftWidth = 0.75*width;
  // loop the sound file
  // soundFile.loop();


  compressor = new p5.Compressor();

  // Disconnect soundfile from master output.
  // Then, connect it to the filter, so that we only hear the filtered sound
  soundFile.disconnect();
  compressor.process(soundFile);

  fft = new p5.FFT();


  soundFile.loop();


  //Create Knobs
  var x = 0.0625*width;
  var y = .25*height;
  knobs[0] = new Knob('ratio');
  knobs[1] = new Knob('attack');
  knobs[2] = new Knob('release');
  for (var i = 0; i < knobs.length; i++) {
    knobs[i].x = x;
    knobs[i].y = y + y*i;
    console.log(knobs[i]);
  }

  knobs[3] = new Knob('wetdry');
  knobs[3].x = width-x;
  knobs[3].y = 3*y;
  console.log(knobs[3]);
  knobRad = .15*height;
  knobLineLen = knobRad/2;


  //create Threshold control
  threshCntrl = new ThreshLine();

  knobBckg = color(150);
  knobLine = color(30);



  threshLineCol = color(30);


}
//attack knee ratio threshold release

function draw() {
  background(255);
 
  


  fill(180);
 //sound wave
  var spectrum = fft.analyze();
  noStroke();
 for (var i = 0; i< spectrum.length; i++){
   var x = map(i, 0, spectrum.length, 0.125*width, fftWidth);
   var h = -fftHeight + map(spectrum[i], 0, 255, fftHeight, 0.125*height);
   rect(x, fftHeight, fftWidth/spectrum.length, h) ;
 }



 for (var i = 0; i < knobs.length; i++) {
   knobs[i].display();
 }
 threshCntrl.display();

}

function ThreshLine() {
  this.x = 0.125*width;
  this.y = 0.15*height;

  this.length = fftWidth;

  this.display = function () {
    stroke(threshLineCol);
    line(this.x,this.y, this.length, this.y)
  };

  this.move = function (newY) {
    this.y = newY;
  };

}

function Knob(type){
  this.type = type;
   this.range = getRange(type);
   this.default = getDefault(type);
   this.current = this.default;
   this.curAngle = getAngle(this.range, this.current);
    this.x;
    this.y;

  this.display = function () {
    noStroke();
    fill(knobBckg);
    ellipse(this.x, this.y, knobRad,knobRad);

    //draw the indicator line from knob center
    translate(this.x,this.y);
    rotate(this.curAngle);
    stroke(knobLine);
    line(0,0,0,knobLineLen);
    rotate(-this.curAngle);
    translate(-this.x,-this.y);

   
    noStroke();
    text(type, this.x - knobLineLen, this.y+knobLineLen, knobRad,knobRad);
    // rectMode(CORNER);
  }

  // this.turn = function () {
  //   this.curAngle = get
  // }


}


function getRange(type){
  return [0,1];
}

function getDefault(type){
  return 0.5;
}
function getAngle(range,current){
  return 90;
}

function mousePressed(){

}
