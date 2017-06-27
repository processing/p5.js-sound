/**
 *  Example: Apply a p5.EQ filter to a p5.Noise.
 *  Visualize the sound with FFT.
 *  Use control points to change the spline that shapes the soundwave
 */

var fft;



//var eq, Freq, filterRes;
var noise, eq;

var cntrlPts = [];
var splineV = [];
var ctrlPtRad;


var pressed; 

var cntrlIndex;
var eqSize;

var description;

function setup() {
  createCanvas(710, 256);
  //sound wave color
  fill(255, 40, 255);
  ctrlPtRad = 15;


  eqSize = 8;


  eq = new p5.EQ(eqSize);
  console.log(eq.bands[1]);


  // Disconnect soundfile from master output.
  // Then, connect it to the filter, so that we only hear the filtered sound
  noise = new p5.Noise();
  noise.disconnect();
  eq.process(noise);

  noise.start();

  fft = new p5.FFT();


  for (var i = 0; i < eqSize; i++) {
    cntrlPts[i] = new CntrlPt(i, (width/(eqSize-1)) * i, height/2);
    eq.bands[i].frequency.value = map(cntrlPts[i].x, 0, width, 50, 22050);
    splineV[i] = [cntrlPts[i].x,cntrlPts[i].y];
  }
  description = createDiv("p5.EQ:<br>"+
                "Use the p5.EQ to shape a sound spectrum. The p5.EQ is"+
                "built with Web Audio Biquad Filters (peaking mode) and can<br>"+
                "be set to use 3 or 8 bands.");
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


  
  if (pressed) {cntrlPts[cntrlIndex].move();}

  for (var i = 0; i < cntrlPts.length; i++) {
    cntrlPts[i].display();

    splineV[i] = [cntrlPts[i].x,cntrlPts[i].y];
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
  this.index = i;


  this.display = function () {
    fill(this.c);
    ellipse(this.x,this.y,ctrlPtRad,ctrlPtRad);
  }

 
  this.move = function () {

    if (mouseX < 1) { this.x = 1;}
    else if (mouseX > width) {this.x = width -1;}
    else if (mouseY < 1) {this.y = 1;}
    else if (mouseY > height) {this.y = height - 1;}
    else {
      this.y = mouseY;
      this.x = mouseX;
      console.log(this.index);
      eq.modBand(this.index, map(this.y, 0, height, 40, -40), map(this.x, 0, width, 50, 22050));
      console.log(eq.bands[i].gain.value);
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

}





function mousePressed(){
  for (var i = 0; i < cntrlPts.length; i++) {
    if (cntrlPts[i].mouseOver()){ 
      pressed = true; 
      cntrlIndex = i;
      break;
    }

  }

}

function mouseReleased(){
  pressed = false;
}