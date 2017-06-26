/**
 *  Example: Apply a p5.EQ filter to a p5.Noise.
 *  Visualize the sound with FFT.
 *  Use control points to change the spline that shapes the soundwave
 */

var fft;



//var eq, Freq, filterRes;
var noise, eq;

var ctrlPts = [];
var splineV = [];
var ctrlPtRad;


var pressed; 

var cntrlIndex;
var eqSize;

function setup() {
  createCanvas(710, 256);
  //sound wave color
  fill(255, 40, 255);
  ctrlPtRad = 15;


  eqSize = 8;


  eq = new p5.EQ(eqSize);


  // Disconnect soundfile from master output.
  // Then, connect it to the filter, so that we only hear the filtered sound
  noise = new p5.Noise();
  noise.disconnect();
  eq.process(noise);
  noise.amp(0.1);
  noise.start();

  fft = new p5.FFT();


  for (var i = 0; i < eqSize; i++) {
    ctrlPts[i] = new CntrlPt(i, (width/(eqSize-1)) * i, height/2);
    splineV[i] = [ctrlPts[i].x,ctrlPts[i].y];
  }

}

function draw() {
  background(30);
  // strictBoundaries();

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


  
  if (pressed) {ctrlPts[cntrlIndex].move();}

  for (var i = 0; i < ctrlPts.length; i++) {
    ctrlPts[i].display();

    splineV[i] = [ctrlPts[i].x,ctrlPts[i].y];
  }

  stroke(255,255,255);
  noFill();
  beginShape();
    curveVertex( splineV[0][0],splineV[0][1])
    for (var i = 0; i < splineV.length; i++) {
      curveVertex( splineV[i][0],splineV[i][1]);
    }
    curveVertex( splineV[7][0],splineV[7][1])
  endShape();
}


function CntrlPt(i,x,y){
  this.c = color(255);

  this.x = x;
  this.y = y;
  this.freq = calcFreq(this.x); 
  this.q = calcQ(this.y);

  this.display = function () {
    fill(this.c);
    ellipse(this.x,this.y,ctrlPtRad,ctrlPtRad);
  }

  // this.move = function () {
  //   if (this.ind == 0 || this.ind == 7){
  //     mouseOnHandle(this.x,this.y) ? (this.y=mouseY, makeAdjustment(this.ind,this.y,this.x)) : true;
  //   } else{
  //     mouseOnHandle(this.x,this.y) ? (this.x=mouseX, this.y=mouseY, makeAdjustment(this.ind,this.y,this.x)) : true;
  //   }

  //   // if (this.y < 1) {this.y = 1;}
  //   // else if (this.y >255) { this.y = 255;}
  //   // else if (this.x < 1) { this.x = 1;}
  //   // else if (this.x > 709) { this.x = 709;} 
  // }
  // 
  // 
  this.move = function () {

    if (mouseX < 1) { this.x = 1;}
    else if (mouseX > width) {this.x = width -1;}
    else if (mouseY < 1) {this.y = 1;}
    else if (mouseY > height) {this.y = height - 1;}
    else {
      this.x = mouseX;
      this.y = mouseY;
    }

  }




  this.mouseOver = function () {
    if (mouseX > this.x - ctrlPtRad && mouseX < this.x + ctrlPtRad
      && mouseY < this.y + ctrlPtRad && mouseY > this.y - ctrlPtRad){
      return true;
    } else {
      return false;
    }
  }


  // this.toggle = function () {
  //   eq.toggleBand(this.ind);
  //   eq.bands[this.ind].toggle ? this.c = color(255) : this.c = color(30);
  // }
}


function calcQ(y) {
  // body...
}

function calcFre(x) {
}

20
75
100
250
750
2500
7500
20000


function mousePressed(){
  for (var i = 0; i < ctrlPts.length; i++) {
    if (ctrlPts[i].mouseOver()){ 
      pressed = true; 
      cntrlIndex = i;
      break;
    }

  }


}

function mouseReleased(){
  pressed = false;
}