/**
 *  Example: Apply a p5.LowPass filter to a p5.SoundFile.
 *  Visualize the sound with FFT.
 *  Map mouseX to the the filter's cutoff frequency
 *  and mouseY to resonance/width of the a BandPass filter
 */

var fft;

var description = 'loading';
var p;

//var eq, Freq, filterRes;
var noise, eq;

var cpts = [];
var splineV = [];
var circleSize;

function setup() {
  createCanvas(710, 256);
  //sound wave color
  fill(255, 40, 255);
  circleSize = 15;
  eq = new p5.EQ(8);


  // Disconnect soundfile from master output.
  // Then, connect it to the filter, so that we only hear the filtered sound
  noise = new p5.Noise();
  noise.disconnect();
  eq.process(noise);
  noise.amp(0.1);
  noise.start();

  fft = new p5.FFT();


  for (var i = 0; i < 8; i++) {
    cpts[i] = new Cpt(i);
    splineV[i] = [cpts[i].x,cpts[i].y];
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

  for (var i = 0; i < cpts.length; i++) {
    cpts[i].display();
    cpts[i].move();
    splineV[i] = [cpts[i].x,cpts[i].y];
  }

  stroke(255,0,0);
  noFill();
  beginShape();
    curveVertex( splineV[0][0],splineV[0][1])
    for (var i = 0; i < splineV.length; i++) {
      curveVertex( splineV[i][0],splineV[i][1]);
    }
    curveVertex( splineV[7][0],splineV[7][1])
  endShape();
}


function Cpt(i){
  this.c = color(255);
  this.x = 100*i+5
  this.y = 128;
  this.ind = i;

  this.display = function () {
    fill(this.c);
    ellipse(this.x,this.y,circleSize,circleSize);
  }

  this.move = function () {
    if (this.ind == 0 || this.ind == 7){
      mouseOnHandle(this.x,this.y) ? (this.y=mouseY, makeAdjustment(this.ind,this.y,this.x)) : true;
    } else{
      mouseOnHandle(this.x,this.y) ? (this.x=mouseX, this.y=mouseY, makeAdjustment(this.ind,this.y,this.x)) : true;
    }

    if (this.y < 1) {this.y = 1;}
    else if (this.y >255) { this.y = 255;}
    else if (this.x < 1) { this.x = 1;}
    else if (this.x > 709) { this.x = 709;} 
  }
  this.toggle = function () {
    eq.toggleBand(this.ind);
    eq.bands[this.ind].toggle ? this.c = color(255) : this.c = color(0);
  }
}



function mouseClicked(){
  //console.log(cpts.length);
  for (var i = 0; i < cpts.length; i++) {
    
    if (mouseX > cpts[i].x - circleSize && mouseX < cpts[i].x + circleSize &&
         mouseY > cpts[i].y - circleSize && mouseY < cpts[i].y + circleSize){
      cpts[i].toggle();
    } 
  }
  
}

function makeAdjustment(band,y,x){
  eq.setBand(band,"mod",map(y,256,0, -40, 40), map(x,0,710,0,22050));
}

function mouseOnHandle(x,y){

  if (mouseX > x - circleSize && mouseX < x + circleSize &&
      mouseY > y - circleSize && mouseY < y + circleSize &&
      mouseIsPressed){
    return true;
  }
  else{
    return false;
  }
}
