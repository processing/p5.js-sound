/**
 * Display the average amount of amplitude across a range
 * of frequencies using the p5.FFT class and its methods analyze()
 * and linAverages().
 * 
 * This example divides the frequency spectrum into eleven bands of equal frequency range.
 */

var soundFile;
var fft;

var description = 'loading';
var p;
var barsNumber;

function preload() {
  soundFormats('mp3', 'ogg');
  soundFile = loadSound('../files/lucky_dragons_-_power_melody');
}

function setup() {
  createCanvas(1024, 400); 
  fill(255, 40, 255);
  noStroke();
  textAlign(CENTER);

  fft = new p5.FFT();

  p = createP(description);
  var p2 = createP('Description: Using linAverages() to produce the averages for 11 groups of equal frequency range.');

  barsNumber = 11; // Set this to 11 so it easier to compare with the LogAverages example
}

function draw() {
  background(30,20,30);
  updateDescription();

  fft.analyze(); // analyze before calling fft.linAverages()
  var groupedFrequencies = fft.linAverages(barsNumber);

  // Generate the bars to represent the different frequency averages per group
  for (var i = 0; i < barsNumber; i++){
    noStroke();
    fill((i * 30) % 100 + 50, 195, ((i * 25) + 50) % 255);

    // Rectangle height represents the average value of this frequency range
    var h = -height + map(groupedFrequencies[i], 0, 255, height, 0);
    rect(((i+1) * width / barsNumber) - width/barsNumber, height, width/barsNumber, h);

    fill(255);
    var loFreq = calcFreqFromIndex(i * barsNumber);
    var hiFreq = calcFreqFromIndex((i + 1) * barsNumber);
    text(loFreq.toFixed(0) +'-' 
        + hiFreq.toFixed(0)+' Hz', (i+1) * width / barsNumber - width / barsNumber / 2, 30);
  }
}

// Helper function for drawing the group ranges
function calcFreqFromIndex(index) {
  var nyquist = sampleRate() / 2;
  var indexFrequency = Math.round((index * nyquist) / fft.bins);

  return (indexFrequency);
}

function keyPressed() {
  if (soundFile.isPlaying()){
    soundFile.pause();
  } else {
    soundFile.loop();
  }
}

// Change description text if the song is loading, playing or paused
function updateDescription() {
  if (!soundFile.isPlaying()) {
    description = 'Paused...';
    p.html(description);
  }
  else if (soundFile.isPlaying()){
    description = 'Playing!';
    p.html(description);
  }
  else {
    for (var i = 0; i < frameCount%3; i++ ) {

      // add periods to loading to create a fun loading bar effect
      if (frameCount%4 == 0){
        description += '.';
      }
      if (frameCount%25 == 0) {
        description = 'loading';

      }
    }
    p.html(description);
  }
}