var fftHeight;
var fftWidth;

var soundFile;
var fft;

var compressor;

//UI Objects
var cntrls = [];
//var threshCntrl;


//knob info

//colors
var knobBckg;
var knobLine;
var threshLineCol;

//dimensions
var knobRad;
var knobLineLen;

var pressed;
var cntrlIndex;

var description;

function preload() {
  soundFormats('mp3', 'ogg');
  soundFile = loadSound('../files/beat');
}

function setup() {



  pressed = false;
  angleMode(DEGREES);

  createCanvas(710, 400);


  fftHeight = 0.75*height;
  fftWidth = 0.8*width;
  // loop the sound file
  // soundFile.loop();


  compressor = new p5.Compressor();

  // Disconnect soundfile from main output.
  // Then, connect it to the filter, so that we only hear the filtered sound
  soundFile.disconnect();
  compressor.process(soundFile);

  // compressor.process(soundFile);

  fft = new p5.FFT();


  soundFile.loop();


  //Create cntrls
  var x = 0.0625*width;
  var y = .25*height;
  cntrls[0] = new Knob('attack');
  cntrls[1] = new Knob('knee');
  cntrls[2] = new Knob('ratio');
  cntrls[3] = new Knob('release');
  cntrls[4] = new Knob('drywet');

  for (var i = 0; i < cntrls.length; i++) {
    cntrls[i].x = x;
    cntrls[i].y = y + y*i;
  }
  for (var i = 3; i < 5; i++) {
    cntrls[i].x = width - x;
    cntrls[i].y = y*(i-1);
  }
  // cntrls[3] = new Knob('release');
  // cntrls[3].x = width-x;
  // cntrls[3].y = 3*y;
  
  knobRad = .15*height;
  knobLineLen = knobRad/2;


  //create Threshold control and 
  //
  cntrls[5] = new ThreshLine('threshold');

  knobBckg = color(150);
  knobLine = color(30);



  threshLineCol = color(30);

  description = createDiv("p5.Compressor: <br>" +
    "Adjust the knobs to control the compressor's " +
    "attack, knee, ratio, release, and wet / dry values " +
    "Move the slider to adjust threshold." +
    "For information on these audioParams, see <br>" +
    "<a href =https://www.w3.org/TR/webaudio/#the-dynamicscompressornode-interface>"+
    "Web Audio Dyanmics Compressor Node Interface</a>");
  description.size(.75*fftWidth, AUTO);
  description.position(width-fftWidth, 1.15*fftHeight);
}
//attack knee ratio threshold release

function draw() {



  background(255);
  fill(180);
 //sound wave
  var spectrum = fft.analyze();
  noStroke();
 for (var i = 0; i< spectrum.length; i++){
   var x = map(i, 0, spectrum.length, 0.2*width, fftWidth);
   var h = -fftHeight + map(spectrum[i], 0, 255, fftHeight, 0.125*height);
   rect(x, fftHeight, fftWidth/spectrum.length, h) ;
 }




 if (pressed) {cntrls[cntrlIndex].change();}

 for (var i = 0; i < cntrls.length; i++) {
  
  cntrls[i].display();

 }
 
 //text(description, width - fftWidth, 1.1*fftHeight);

}

function ThreshLine(type) {
  this.type = type;
  this.x = width - fftWidth;
  this.range = getRange(type);
  this.current = getDefault(type);
  this.y = map(this.current, -100,0,fftHeight, height - fftHeight);

  this.length = fftWidth;

  this.display = function () {
    stroke(threshLineCol);
    line(this.x,this.y, this.length, this.y)
    noStroke();
    text(type, fftWidth - 50, this.y+knobLineLen, knobRad,knobRad);
    text(this.current, fftWidth - 50, this.y + knobLineLen + 10, knobRad, knobRad);

  };

  this.change = function () {
    // this.y = mouseY;
    if (mouseY < height - fftHeight) {this.y = height - fftHeight}
    else if (mouseY > fftHeight) {this.y = fftHeight;}
    else { this.y = mouseY;}
    this.current = map(this.y, fftHeight, height - fftHeight, -100,0);


  };

  this.mouseOver = function () {
    if (mouseX > this.x && mouseX < width - this.x
      && mouseY < this.y + 5 && mouseY > this.y - 5){
      return true;
    } else {
      return false;
    }
  }

}

function Knob(type){
  this.type = type;
  this.range = getRange(type);
  this.default = getDefault(type);
  this.current = this.default;
  this.curAngle = map(this.current, this.range[0], this.range[1],50,320);
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
    text(float(this.current).toFixed(2), this.x - knobLineLen, this.y + knobLineLen + 10, knobRad, knobRad);
  }

  this.mouseOver = function () {
    if (mouseX > this.x - knobLineLen && mouseX < this.x + knobLineLen
      && mouseY < this.y + knobLineLen && mouseY > this.y - knobLineLen){
      return true;
    } else {
      return false;
    }
  }

  this.change = function () {
     translate(this.x, this.y);
     var a = atan2(mouseY - this.y, mouseX - this.x);
     //console.log(a);
     this.curAngle = a - 90;

     if (this.curAngle < 0) {this.curAngle = this.curAngle + 360;}
     if (this.curAngle < 50 ) {this.curAngle = 50;}
     else if (this.curAngle > 320) {this.curAngle = 320;}
     this.current = updateVal(this.range, this.curAngle - 50, cntrlIndex);

     translate(-this.x,-this.y);
  }
}







// -50 -> 90 -> 320


// 0 - 360

// 310 - 230

// map(value, 0, 360, 310, 230)

/**
 * @attack 0 - 1
 * @knee { 0 - 40}
 * ratio 1 -20
 * release 0 -1
 * threshold -100 - 0
 */


function getRange(type){
  switch (type) {
    case "attack":
      return [0,1];
    case "knee":
      return [0,40];
    case "ratio":
      return [1,20];
    case "release":
      return [0,1];
    case "threshold":
      return [-100,0];
    case "drywet":
      return [0,1];
    default:
      return 0;
  }
}

function getDefault(type){
  switch (type) {
    case "attack":
      return .003;
    case "knee":
      return 30;
    case "ratio":
      return 12;
    case "release":
      return 0.25;
    case "threshold":
      return -24;
    case "drywet":
      return compressor.drywet(1);
    default:
      return 0;
  }
}




function updateVal(range, curAngle, cntrlIndex) {
  var newVal = map(curAngle, 0,270,range[0],range[1])
  switch (cntrlIndex) {
    case 0:
      compressor.attack(newVal);
      break;
    case 1:
      compressor.knee(newVal);
      break;
    case 2:
      compressor.ratio(newVal);
      break;
    case 3:
      compressor.release(newVal);
      break;
    case 4:
      compressor.drywet(newVal);
      break;
    case 5:
      compressor.threshold(newVal);
      break;
    default:
      break;
  }
   return newVal;
}

function mousePressed(){
  for (var i = 0; i < cntrls.length; i++) {
    if (cntrls[i].mouseOver()){ 
      pressed = true; 
      cntrlIndex = i;
      break;
    }

  }


}

function mouseReleased(){
  pressed = false;
}
