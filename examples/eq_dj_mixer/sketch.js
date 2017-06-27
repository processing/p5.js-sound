

var soundFile1;
var soundFile2;
var fft1;
var fft2;


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



var deckWidth, deckHeight;
var deck1x, deck1y, deck2x, deck2y;

var mixer = [];
var eq = [];


function preload() {
  soundFormats('mp3', 'ogg');
  soundFile1 = loadSound('../files/beat');
  soundFile2 = loadSound('../files/beatbox.mp3');

}


function setup() {

  pressed = false;
  angleMode(DEGREES);

  createCanvas(1080, 680);

  deckWidth = .4*width;
  deckHeight = .3*height;

  deck1x = 0;
  deck2x = 0.6*width;
  deck1y = 0.3*height;
  deck2y = 0.3*height;


 fft1 = new p5.FFT();
 fft2 = new p5.FFT();

 fft1.setInput(soundFile1);
 fft2.setInput(soundFile2);

  soundFile1.loop();
  soundFile2.loop();

  for (var i = 0; i < 3; i++) {
    eq[i] = new Knob("low");
    eq[i].x = 0.45*width;
    eq[i].y = deckHeight + 0.25*deckHeight*(i+1);
  }


  for (var i = 3; i < 6; i++) {
    eq[i] = new Knob("low");
    eq[i].x = width - 0.45*width;
    eq[i].y = deckHeight + 0.25*deckHeight*(i-2);
  }




  knobRad = .1*deckHeight;
  knobLineLen = knobRad/2;


  // //create Threshold control and 
  // //

  knobBckg = color(150);
  knobLine = color(30);





  // description = createDiv("p5.Compressor: <br>" +
  //   "Adjust the knobs to control the compressor's " +
  //   "attack, knee, ratio, release, and wet / dry values " +
  //   "Move the slider to adjust threshold." +
  //   "For information on these audioParams, see <br>" +
  //   "<a href =https://www.w3.org/TR/webaudio/#the-dynamicscompressornode-interface>"+
  //   "Web Audio Dyanmics Compressor Node Interface</a>");
  // description.size(.75*fftWidth, AUTO);
  // description.position(width-fftWidth, 1.15*fftHeight);
}
//attack knee ratio threshold release

function draw() {



  background(50);


  noStroke()
  fill(30);

  rect(deck1x, deck1y, deckWidth, deckHeight);
  rect(deck2x,deck2y, deckWidth, deckHeight);

  var spectrum = fft1.analyze();
  noStroke();

  fill(255);
//deck1

 // for (var i = 0; i< spectrum.length; i++){

 //   var x = map(i, 0, spectrum.length, deck1x, deckWidth);
 //   var h = -deckHeight + map(spectrum[i], 0, 255, deckHeight, deck1y);
 //   rect(x, deckHeight, deckWidth/spectrum.length, h);
 // }

//deck1
 var spectrum = fft1.analyze();
 noStroke();
 for (var i = 0; i< spectrum.length; i++){
   var x = map(i, 0, spectrum.length, 0, deckWidth);
   var h = -deckHeight + map(spectrum[i], 0, 255, deckHeight, 0);
   rect(x, deck1y + deckHeight, deckWidth/spectrum.length, h) ;
 }


 //deck2
 //

  var spectrum = fft2.analyze();
  noStroke();
  for (var i = 0; i< spectrum.length; i++){
    var x = map(i, 0, spectrum.length, deck2x, deck2x+deckWidth);
    var h = -deckHeight + map(spectrum[i], 0, 255, deckHeight, 0);
    rect(x, deck2y + deckHeight, deckWidth/spectrum.length, h) ;
  }


  // if (pressed) {eq[cntrlIndex].change();}

  if (pressed) {eq[cntrlIndex].change();}

  for (var i = 0; i < eq.length; i++) {
    eq[i].display();

    // console.log(eq[1]);
  }
// mixer
// 


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
    // noStroke();
    // text(type, this.x - knobLineLen, this.y+knobLineLen, knobRad,knobRad);
    // text(float(this.current).toFixed(2), this.x - knobLineLen, this.y + knobLineLen + 10, knobRad, knobRad);
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
    // this.current = updateVal(this.range, this.curAngle - 50, cntrlIndex);

     translate(-this.x,-this.y);
  }
}


// function getRange(type){
//   switch (type) {
//     case "attack":
//       return [0,1];
//     case "knee":
//       return [0,40];
//     case "ratio":
//       return [1,20];
//     case "release":
//       return [0,1];
//     case "threshold":
//       return [-100,0];
//     case "drywet":
//       return [0,1];
//     default:
//       return 0;
//   }
// }

// function getDefault(type){
//   switch (type) {
//     case "attack":
//       return .003;
//     case "knee":
//       return 30;
//     case "ratio":
//       return 12;
//     case "release":
//       return 0.25;
//     case "threshold":
//       return -24;
//     case "drywet":
//       return 0.4
//     default:
//       return 0;
//   }
// }



// function updateVal(range, curAngle, cntrlIndex) {
//   var newVal = map(curAngle, 0,270,range[0],range[1])
//   switch (cntrlIndex) {
//     case 0:
//       compressor.attack(newVal);
//       break;
//     case 1:
//       compressor.knee(newVal);
//       break;
//     case 2:
//       compressor.ratio(newVal);
//       break;
//     case 3:
//       compressor.release(newVal);
//       break;
//     case 4:
//       compressor.drywet(newVal);
//       break;
//     case 5:
//       compressor.threshold(newVal);
//       break;
//     default:
//       break;
//   }
//    return newVal;
// }

function mousePressed(){
  for (var i = 0; i < eq.length; i++) {
    if (eq[i].mouseOver()){ 
      pressed = true; 
      cntrlIndex = i;
      break;
    }

  }
}

function mouseReleased(){
  pressed = false;
}
