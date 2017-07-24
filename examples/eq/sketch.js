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


var soundFile;

function preload() {
  soundFormats('mp3', 'ogg');
  soundFile = loadSound('../files/Soni_Ventorum_Wind_Quintet_-_08_-_Danzi_Wind_Quintet_Op_67_No_3_In_E-Flat_Major_4_Allegretto');
}




function setup() {
  createCanvas(710, 256);
  //sound wave color
  fill(255, 40, 255);
  ctrlPtRad = 15;
  
  eqSize = 8;
  eq = new p5.EQ(eqSize);


  // Disconnect noiose generator from master output.
  // Then, connect it to the EQ, so that we only hear the EQ'd sound
  // noise = new p5.Noise();
  // noise.disconnect();
  // eq.process(noise);
  // noise.start();
  // 
  // 
  soundFile.loop();
  soundFile.disconnect();
  soundFile.connect(eq);

  //use an fft to visualize the sound
  fft = new p5.FFT();


  // var x = map(Math.log(i), 0, Math.log(spectrum.length), 0, width);


  for (var i = 0; i < eqSize; i++) {
    //cntrlPts[i] = new CntrlPt(i, (width/(eqSize-1)) * i, height/2);
    //eq.bands[i].freq(map(cntrlPts[i].x, 0, width, 160, 20480));
    //
    // var x = map(i*eqSize/1024, 0, 1024)
    // 
    // 
    var x = map(eq.bands[i].freq(), eq.bands[0].freq(), eq.bands[7].freq(), Math.log(1), Math.log(1024));



    console.log(x);
    cntrlPts[i] = new CntrlPt(i, 
              //map(x, 0, Math.log(1024), 0, width), height/2);
              i + i*101, height/2);
    



    // eq.bands[i].freq(160*Math.pow(2,i));

    splineVerts[i] = [cntrlPts[i].x,cntrlPts[i].y];
    // console.log(cntrlPts[i].x);
  }



  //eq.bands[0].freq(0);
  // for (var i = 0; i < 7; i++) {
  //   eq.bands[i].freq(344*Math.pow(2,i));
  //   //console.log(eq.bands[i].freq());
  // }


  

  description = createDiv("p5.EQ:<br>"+
                "Use the p5.EQ to shape a sound spectrum. The p5.EQ is "+
                "built with Web Audio Biquad Filters (peaking mode) and can "+
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
    //var x = map(i, 0, spectrum.length, 0, width);
    var x = map(Math.log((i+1)/8), 0, Math.log(spectrum.length/8), 0, width);
    var h = -height + map(spectrum[i], 0, 255, height, 0);

    if (i % 128 === 0 ) {
      fill(255);
    } else {
      fill(255, 40, 255);
    }
    rect(x, height, width/spectrum.length, h) ;

  }


  // Bin.prototype.drawLog = function(i, totalBins, value, prev) {
  //   this.x = map(Math.log(i+2), 0, Math.log(totalBins), 0, width - 200);
  //   var h = map(value, 0, 255, height, 0)- height;
  //   this.width = prev - this.x;
  //   this.value = value;
  //   this.draw(h);
  //   return this.x;
  // }

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
    //this.x = this.index == 0 || this.index == eqSize - 1  ? this.x : mouseX;
    //eq.modBand(this.index, map(this.y, 0, height, 40, -40), map(this.x, 0, width, 50, 22050));
    //eq.bands[this.index].freq( map(this.x, 0, width, 50, 22050));
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
