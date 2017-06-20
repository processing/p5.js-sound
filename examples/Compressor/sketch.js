/**
 *  Example: Apply a p5.Compressor filter to a p5.SoundFile.
 *  Visualize the sound with FFT.
 *  Map mouseX to the the filter's cutoff frequency
 *  and mouseY to resonance/width of the a BandPass filter
 */

var soundFile;
var fft;

var description = 'loading';
var p;

var attack, threshold;
var compressor;
var ui = [];

function preload() {
  soundFormats('mp3', 'ogg');
  soundFile = loadSound('../files/beat');
}

function setup() {
  createCanvas(710, 512);
  fill(255, 40, 255);

  // loop the sound file
  // soundFile.loop();


  compressor = new p5.Compressor();

  // Disconnect soundfile from master output.
  // Then, connect it to the filter, so that we only hear the filtered sound
  soundFile.disconnect();
  compressor.process(soundFile);

  fft = new p5.FFT();


  for (var i = 0; i < 5; i++) {
    ui[i] = new Slider(i);
  }

  p = createP(description);
  var p2 = createP('Draw the array returned by FFT.analyze( ). This represents the frequency spectrum, from lowest to highest frequencies.');

}
//attack knee ratio threshold release

function draw() {
  background(255);
 


  // Map mouseX to a the cutoff frequency for our lowpass filter
  //attack = map (mouseX, 0, width, 0, 1);
  // // Map mouseY to resonance/width
  //threshold = map(mouseY, 0, height, -100, 0);
  // // set filter parameters
  //compressor.set(attack, 30, 12, threshold, 0.25);

  // Draw every value in the FFT spectrum analysis where
  // x = lowest (10Hz) to highest (22050Hz) frequencies,
  // h = energy / amplitude at that frequency
  var spectrum = fft.analyze();
  noStroke();
  for (var i = 0; i< spectrum.length; i++){
    var x = map(i, 0, spectrum.length, 0, width);
    var h = -height/2 + map(spectrum[i], 0, 255, height/2, 0);
    rect(x, height/2, width/spectrum.length, h) ;
  }

  for (var i = 0; i < 5; i++) {
    ui[i].move()
    ui[i].display();
  }

  updateDescription();
}

function Slider(i){
  this.bckg = color(30);
  this.sCol = color(255, 40, 255);
  this.x = 137.5*i;
  this.y = 300;
  this.h = 100
  this.cntrl = 300;
  this.ind = i

  this.display = function () {
    fill(this.bckg);
    rect(this.x, this.y, 20, this.h);

    fill(this.sCol);
    rect(this.x, this.cntrl, 20,20);
  }

  this.move = function(){
    if (onSlider(this.x,this.cntrl)){
      this.cntrl = mouseY;
      if (this.cntrl > this.y + this.h-20 ){this.cntrl = this.h + this.y -20;}
      if (this.cntrl < this.y) { this.cntrl = this.y}

    }
    
  }

}

// function mouseClicked(){
  
//   if (onSlider()){

//     ui[onSlider()].move();
//   }

// }

function onSlider(x,y){
  //if (mouseIsPressed) {console.log("hello");}
      // console.log("mouseX " + mouseX);
      // console.log("x" + x +", x+20 " + (x+20));

      // console.log("mouseY " + mouseY);
      // console.log("y" + y +", y+20 " + (y+20));
  if (mouseX > x && mouseX < x + 20 &&
      mouseY > y && mouseY < y + 20 && mouseIsPressed){

    return true;
  } else{
    return false;
  }
}


// Change description text if the song is loading, playing or paused
function updateDescription() {
    description = 'attack = ' + attack + ' knee = ' + compressor.compressor.knee.value + ' ratio= '
        + compressor.compressor.ratio.value + ' threshold= ' + compressor.compressor.threshold.value +
        ' release= '+ compressor.compressor.release.value;
    p.html(description);
}