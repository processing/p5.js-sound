/**
 *  Example: Apply a p5.EQ filter to a p5.Noise.
 *  Visualize the sound with FFT.
 *  Use control points to change the spline that shapes the soundwave
 */

var fft, noise, eq;
var eqSize;

var cntrlPts = []; 
var ctrlPtRad, cntrlIndex;
var splineVerts = [];
var pressed; 
var description;

function setup() {
  createCanvas(710, 256);
  //sound wave color
  fill(255, 40, 255);
  ctrlPtRad = 15;
  
  eqSize = 8;
  eq = new p5.EQ(eqSize);


  // Disconnect noiose generator from master output.
  // Then, connect it to the EQ, so that we only hear the EQ'd sound
  noise = new p5.Noise();
  noise.disconnect();
  eq.process(noise);
  noise.start();

  //use an fft to visualize the sound
  fft = new p5.FFT();

  for (var i = 0; i < eqSize; i++) {
    cntrlPts[i] = new CntrlPt(i, (width/(eqSize-1)) * i, height/2);
    eq.bands[i].freq(map(cntrlPts[i].x, 0, width, 50, 22050));
    splineVerts[i] = [cntrlPts[i].x,cntrlPts[i].y];
  }

  description = createDiv("p5.EQ:<br>"+
                "Use the p5.EQ to shape a sound spectrum. The p5.EQ is"+
                "built with Web Audio Biquad Filters (peaking mode) and can<br>"+
                "be set to use 3 or 8 bands.");
}

function draw() {
  background(30);

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


  //When mouse is pressed, move relevant control point
  if (pressed) {cntrlPts[cntrlIndex].move();}

  for (var i = 0; i < cntrlPts.length; i++) {
    cntrlPts[i].display();
    splineVerts[i] = [cntrlPts[i].x, cntrlPts[i].y];
  }

  //Draw a spline to connect control points
  stroke(255,255,255);
  noFill();
  beginShape();
    curveVertex( splineVerts[0][0],splineVerts[0][1])
    for (var i = 0; i < splineVerts.length; i++) {
      curveVertex( splineVerts[i][0],splineVerts[i][1]);
    }
    curveVertex( splineVerts[eqSize-1][0],splineVerts[eqSize-1][1])
  endShape();
}

//Class for each control point
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
    this.x = this.index == 0 || this.index == eqSize - 1  ? this.x : mouseX;
    //eq.modBand(this.index, map(this.y, 0, height, 40, -40), map(this.x, 0, width, 50, 22050));
    eq.bands[this.index].freq( map(this.x, 0, width, 50, 22050));
    eq.bands[this.index].biquad.gain.value = map(this.y, 0, height, 40, -40);
    }
  }

  //Checks to see if mouse is ontop of control point
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
