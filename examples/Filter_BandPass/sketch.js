var fft;
var fftBands = 512;

var description = 'loading';
var p;

var noise;
var filter, filterFreq, filterRes;

// This will be an array of amplitude values from lowest to highest frequencies
var frequencySpectrum = [];

function setup() {
  createCanvas(fftBands, 256);
  fill(255, 40, 255);

  filter = new p5.BandPass();

  noise = new p5.Noise();
  // Disconnect soundfile from master output.
  // Then, connect it to the filter, so that we only hear the filtered sound
  noise.disconnect();
  noise.connect(filter);
  noise.amp(1);
  noise.start();

  fft = new p5.FFT();

  // update description text
  p = createP(description);
  var p2 = createP('Draw the array returned by FFT.analyze( ). This represents the frequency spectrum, from lowest to highest frequencies.');

  // set the master volume;
  masterVolume(.5);
}

function draw() {
  background(30);

  // set the LowPass Filter frequency cutoff based on mouse X
  filterFreq = map (mouseX, 0, width, 20, 10000);
  filterRes = map(mouseY, 0, height, 0, 90);
  filter.set(filterFreq, filterRes);

  // update the description if the sound is playing
  updateDescription();

  /** 
   * Analyze the sound.
   * Return array of frequency volumes, from lowest to highest frequencies.
   */
  frequencySpectrum = fft.analyze();

  // Draw every value in the frequencySpectrum array as a rectangle
  noStroke();
  for (var i = 0; i< fftBands; i++){
    var x = map(i, 0, fftBands, 0, width);
    var h = -height + map(frequencySpectrum[i], 0, 255, height, 0);
    rect(x, height, width/fftBands, h) ;
  }
}

// Change description text if the song is loading, playing or paused
function updateDescription() {
    description = 'Playing! Press any key to pause. Filter Frequency = ' + filterFreq + ' Filter Res = ' + filterRes;
    p.html(description);
}