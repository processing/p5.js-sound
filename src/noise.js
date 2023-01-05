import p5sound from './main';
import Oscillator from './oscillator';

// generate noise buffers
const _whiteNoiseBuffer = (function () {
  var bufferSize = 2 * p5sound.audiocontext.sampleRate;
  var whiteBuffer = p5sound.audiocontext.createBuffer(
    1,
    bufferSize,
    p5sound.audiocontext.sampleRate
  );
  var noiseData = whiteBuffer.getChannelData(0);
  for (var i = 0; i < bufferSize; i++) {
    noiseData[i] = Math.random() * 2 - 1;
  }
  whiteBuffer.type = 'white';
  return whiteBuffer;
})();

const _pinkNoiseBuffer = (function () {
  var bufferSize = 2 * p5sound.audiocontext.sampleRate;
  var pinkBuffer = p5sound.audiocontext.createBuffer(
    1,
    bufferSize,
    p5sound.audiocontext.sampleRate
  );
  var noiseData = pinkBuffer.getChannelData(0);
  var b0, b1, b2, b3, b4, b5, b6;
  b0 = b1 = b2 = b3 = b4 = b5 = b6 = 0.0;
  for (var i = 0; i < bufferSize; i++) {
    var white = Math.random() * 2 - 1;
    b0 = 0.99886 * b0 + white * 0.0555179;
    b1 = 0.99332 * b1 + white * 0.0750759;
    b2 = 0.969 * b2 + white * 0.153852;
    b3 = 0.8665 * b3 + white * 0.3104856;
    b4 = 0.55 * b4 + white * 0.5329522;
    b5 = -0.7616 * b5 - white * 0.016898;
    noiseData[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
    noiseData[i] *= 0.11; // (roughly) compensate for gain
    b6 = white * 0.115926;
  }
  pinkBuffer.type = 'pink';
  return pinkBuffer;
})();

const _brownNoiseBuffer = (function () {
  var bufferSize = 2 * p5sound.audiocontext.sampleRate;
  var brownBuffer = p5sound.audiocontext.createBuffer(
    1,
    bufferSize,
    p5sound.audiocontext.sampleRate
  );
  var noiseData = brownBuffer.getChannelData(0);
  var lastOut = 0.0;
  for (var i = 0; i < bufferSize; i++) {
    var white = Math.random() * 2 - 1;
    noiseData[i] = (lastOut + 0.02 * white) / 1.02;
    lastOut = noiseData[i];
    noiseData[i] *= 3.5;
  }
  brownBuffer.type = 'brown';
  return brownBuffer;
})();

/**
 *  Noise is a type of oscillator that generates a buffer with random values.
 *
 *  @class p5.Noise
 *  @extends p5.Oscillator
 *  @constructor
 *  @param {String} type Type of noise can be 'white' (default),
 *                       'brown' or 'pink'.
 *  @example
 *  <div><code>
 *  let noise,fft;
 *  let playing = false;
 *
 *  function setup() {
 *    let cnv = createCanvas(100, 100);
 *    cnv.mousePressed(playNoise);
 *    cnv.mouseReleased(stopNoise);
 *    noStroke();
 *    fill(255,0,255);
 *
 *    // Create a new p5.Noise object
 *    noise = new p5.Noise();
 *    // Create a new p5.FFT object
 *    fft = new p5.FFT();
 *  }
 *
 *  function draw() {
 *    background(220);
 *    // Display the current type of noise or "Tap to play"
 *    textAlign(CENTER, CENTER);
 *    if (playing) {
 *      text('Noise type: '+noise.getType(), width / 2, 20);
 *    } else {
 *      text('Tap to play', width / 2, 20);
 *    }
 *    drawSpectrum();
 *  }
 *
 *  function playNoise() {
 *    noise.start();
 *    playing = true;
 *  }
 *
 *  function stopNoise() {
 *    noise.stop();
 *    playing = false;
 *
 *    // Change the type of noise
 *    if (noise.getType() === 'white') {
 *      noise.setType('pink');
 *    } else if (noise.getType() === 'pink'){
 *      noise.setType('brown');
 *    } else {
 *      noise.setType('white');
 *    }
 *  }
 *
 *  function drawSpectrum() {
 *    // Get and draw the frequency spectrum of the noise
 *    let spectrum = fft.analyze();
 *    beginShape();
 *    vertex(0, height);
 *    for (let i = 0; i < spectrum.length; i++) {
 *      let x = map(i, 0, spectrum.length, 0, width);
 *      let h = map(spectrum[i], 0, 255, height, 0);
 *      vertex(x, h);
 *    }
 *    vertex(width, height);
 *    endShape();
 *  }
 *  </code> </div>
 */
class Noise extends Oscillator {
  constructor(type) {
    super();
    var assignType;
    delete this.f;
    delete this.freq;
    delete this.oscillator;

    if (type === 'brown') {
      assignType = _brownNoiseBuffer;
    } else if (type === 'pink') {
      assignType = _pinkNoiseBuffer;
    } else {
      assignType = _whiteNoiseBuffer;
    }
    this.buffer = assignType;
  }

  /**
   *  Set type of noise to 'white', 'pink' or 'brown'.
   *  White is the default.
   *
   *  @method setType
   *  @param {String} type 'white', 'pink' or 'brown'
   */
  setType(type) {
    switch (type) {
      case 'white':
        this.buffer = _whiteNoiseBuffer;
        break;
      case 'pink':
        this.buffer = _pinkNoiseBuffer;
        break;
      case 'brown':
        this.buffer = _brownNoiseBuffer;
        break;
      default:
        this.buffer = _whiteNoiseBuffer;
    }
    if (this.started) {
      var now = p5sound.audiocontext.currentTime;
      this.stop(now);
      this.start(now + 0.01);
    }
  }

  /**
   *  Returns current type of noise eg. 'white', 'pink' or 'brown'.
   *
   *  @method  getType
   *  @for p5.Noise
   *  @returns {String} type of noise eg. 'white', 'pink' or 'brown'.
   */
  getType() {
    return this.buffer.type;
  }

  /**
   *  Starts playing the noise.
   *
   *  @method  start
   *  @for p5.Noise
   */
  start() {
    if (this.started) {
      this.stop();
    }
    this.noise = p5sound.audiocontext.createBufferSource();
    this.noise.buffer = this.buffer;
    this.noise.loop = true;
    this.noise.connect(this.output);
    var now = p5sound.audiocontext.currentTime;
    this.noise.start(now);
    this.started = true;
  }

  /**
   *  Stops playing the noise.
   *
   *  @method  stop
   *  @for p5.Noise
   */
  stop() {
    var now = p5sound.audiocontext.currentTime;
    if (this.noise) {
      this.noise.stop(now);
      this.started = false;
    }
  }

  /**
   *  Get rid of the Noise object and free up its resources / memory.
   *
   *  @method  dispose
   *  @for p5.Noise
   */
  dispose() {
    var now = p5sound.audiocontext.currentTime;

    // remove reference from soundArray
    var index = p5sound.soundArray.indexOf(this);
    p5sound.soundArray.splice(index, 1);

    if (this.noise) {
      this.noise.disconnect();
      this.stop(now);
    }
    if (this.output) {
      this.output.disconnect();
    }
    if (this.panner) {
      this.panner.disconnect();
    }
    this.output = null;
    this.panner = null;
    this.buffer = null;
    this.noise = null;
  }
}

export default Noise;
