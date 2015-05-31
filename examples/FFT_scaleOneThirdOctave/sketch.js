var source, fft;

function setup() {
  createCanvas(windowWidth, windowHeight);
  noFill();

  source = new p5.AudioIn();
  source.start();

  fft = new p5.FFT(0.8, 2048);
  fft.setInput(source);
}

function draw() {
  background(220, 220, 220, 20);
  var spectrum = fft.analyze();
  var newBuffer = [];

  if (source.freq) {
    source.freq(map(mouseX, 0, width, 100, 300));
  }

  var scaledSpectrum = divideFFTByOctaves(spectrum, 3);
  var len = scaledSpectrum.length;
  beginShape();
  for (var i = 0; i < len; i++) {
    var point = smoothPoint(scaledSpectrum, i);
    var x = map(i, 0, len, 0, width);
    var y = map(point, 0, 255, height, 0);
    curveVertex(x, y);
  }
  endShape();
}


/**
 *  Divides an fft array into octaves 
 *
 *  @param {Number} [slicesPerOctave] [description]
 *  @return {[type]} [description]
 */
function divideFFTByOctaves(spectrum, n) {
  var scaledSpectrum = [];
  var len = spectrum.length;
  var sRate = sampleRate();
  var nyquist = sRate/2;
  var nthRootOfTwo = Math.pow(2, 1/n);

  // the last N bins get their own 
  var lowestBin = 3;

  var binIndex = len - 1;
  var i = binIndex;

  while (i > lowestBin) {
    var nextBinIndex = round( binIndex/nthRootOfTwo );

    if (nextBinIndex === 1) return;

    var total = 0;
    var numBins = 0;

    // add up all of the values for the frequencies
    for (i = binIndex; i > nextBinIndex; i--) {
      total += spectrum[i];
      numBins++;
    }

    // divide total sum by number of bins
    var energy = total/numBins;
    scaledSpectrum.push(energy);

    // keep the loop going
    binIndex = nextBinIndex;
  }

  scaledSpectrum.reverse();

  // add the lowest bins at the end
  for (var j = 0; j < i; j++) {
    scaledSpectrum.push(spectrum[j]);
  }

  return scaledSpectrum;
}


// average each point with its neighbors
function smoothPoint(spectrum, index) {
  var neighbors = 4;

  var val = 0;

  for (var i = index; i < (index+neighbors); i++) {
    val += spectrum[i];
  }

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