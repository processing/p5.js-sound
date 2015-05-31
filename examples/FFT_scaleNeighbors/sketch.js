var source, fft;

function setup() {
  createCanvas(windowWidth, windowHeight);
  noFill();

  source = new p5.AudioIn();
  source.start();

  fft = new p5.FFT(0.8, 1024);
  fft.setInput(source);
}

function draw() {
  background(220);
  var spectrum = fft.analyze();
  var newBuffer = [];

  if (source.freq) {
    source.freq(map(mouseX, 0, width, 100, 300));
  }

  var quarterSpectrum = spectrum.length/2;

  beginShape();
  for (var i = 0; i < quarterSpectrum; i++) {
    var point = smoothPoint(spectrum, i);
    newBuffer.push(point);
    var x = map(i, 0, quarterSpectrum, 0, width);
    var y = map(point, 0, 255, height, 0);
    curveVertex(x, y);
  }
  endShape();
}



// average each point with its neighbors
function smoothPoint(spectrum, index) {
  var neighbors = 20;

  var val = 0;

  for (var i = index; i < (index+neighbors); i++) {
    val += spectrum[i];
  }

  // TO DO: scale value logarithmically
  // val *= logScale(index, spectrum.length);

  return val/neighbors;
}


/**
 * Given an index and the total number of entries, return the
 * log-scaled value.
 * 
 * https://github.com/borismus/spectrograph/blob/master/g-spectrograph.js
 * MIT license
 */
function logScale(index, total, opt_base) {
  var base = opt_base || 2;
  var logmax = logBase(total + 1, base);
  var exp = logmax * index / total;
  return Math.round(Math.pow(base, exp) - 1);
}

function logBase(val, base) {
  return Math.log(val) / Math.log(base);
}