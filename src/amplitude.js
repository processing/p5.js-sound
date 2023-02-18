import p5sound from './main';
import { safeBufferSize } from './helpers';
import processorNames from './audioWorklet/processorNames';

/**
 *  Amplitude measures volume between 0.0 and 1.0.
 *  Listens to all p5sound by default, or use setInput()
 *  to listen to a specific sound source. Accepts an optional
 *  smoothing value, which defaults to 0.
 *
 *  @class p5.Amplitude
 *  @constructor
 *  @param {Number} [smoothing] between 0.0 and .999 to smooth
 *                             amplitude readings (defaults to 0)
 *  @example
 *  <div><code>
 *  let sound, amplitude;
 *
 *  function preload(){
 *    sound = loadSound('assets/beat.mp3');
 *  }
 *  function setup() {
 *    let cnv = createCanvas(100,100);
 *    cnv.mouseClicked(togglePlay);
 *    amplitude = new p5.Amplitude();
 *  }
 *
 *  function draw() {
 *    background(220);
 *    text('tap to play', 20, 20);
 *
 *    let level = amplitude.getLevel();
 *    let size = map(level, 0, 1, 0, 200);
 *    ellipse(width/2, height/2, size, size);
 *  }
 *
 *  function togglePlay() {
 *    if (sound.isPlaying() ){
 *      sound.pause();
 *    } else {
 *      sound.loop();
 *		amplitude = new p5.Amplitude();
 *		amplitude.setInput(sound);
 *    }
 *  }
 *
 *  </code></div>
 */
class Amplitude {
  constructor(smoothing) {
    // Set to 2048 for now. In future iterations, this should be inherited or parsed from p5sound's default
    this.bufferSize = safeBufferSize(2048);

    // set audio context
    this.audiocontext = p5sound.audiocontext;
    this._workletNode = new AudioWorkletNode(
      this.audiocontext,
      processorNames.amplitudeProcessor,
      {
        outputChannelCount: [1],

        parameterData: { smoothing: smoothing || 0 },
        processorOptions: {
          normalize: false,
          smoothing: smoothing || 0,
          numInputChannels: 2,
          bufferSize: this.bufferSize,
        },
      }
    );

    this._workletNode.port.onmessage = function (event) {
      if (event.data.name === 'amplitude') {
        this.volume = event.data.volume;
        this.volNorm = event.data.volNorm;
        this.stereoVol = event.data.stereoVol;
        this.stereoVolNorm = event.data.stereoVolNorm;
      }
    }.bind(this);

    // for connections
    this.input = this._workletNode;

    this.output = this.audiocontext.createGain();

    // the variables to return
    this.volume = 0;
    this.volNorm = 0;
    this.stereoVol = [0, 0];
    this.stereoVolNorm = [0, 0];

    this.normalize = false;

    this._workletNode.connect(this.output);
    this.output.gain.value = 0;

    // this may only be necessary because of a Chrome bug
    this.output.connect(this.audiocontext.destination);

    // connect to p5sound main output by default, unless set by input()
    p5sound.meter.connect(this._workletNode);

    // add this p5.SoundFile to the soundArray
    p5sound.soundArray.push(this);
  }

  /**
   *  Connects to the p5sound instance (main output) by default.
   *  Optionally, you can pass in a specific source (i.e. a soundfile).
   *
   *  @method setInput
   *  @for p5.Amplitude
   *  @param {soundObject|undefined} [snd] set the sound source
   *                                       (optional, defaults to
   *                                       main output)
   *  @param {Number|undefined} [smoothing] a range between 0.0 and 1.0
   *                                        to smooth amplitude readings
   *  @example
   *  <div><code>
   *  function preload(){
   *    sound1 = loadSound('assets/beat.mp3');
   *    sound2 = loadSound('assets/drum.mp3');
   *  }
   *  function setup(){
   *    cnv = createCanvas(100, 100);
   *    cnv.mouseClicked(toggleSound);
   *
   *    amplitude = new p5.Amplitude();
   *    amplitude.setInput(sound2);
   *  }
   *
   *  function draw() {
   *    background(220);
   *    text('tap to play', 20, 20);
   *
   *    let level = amplitude.getLevel();
   *    let size = map(level, 0, 1, 0, 200);
   *    ellipse(width/2, height/2, size, size);
   *  }
   *
   *  function toggleSound(){
   *    if (sound1.isPlaying() && sound2.isPlaying()) {
   *      sound1.stop();
   *      sound2.stop();
   *    } else {
   *      sound1.play();
   *      sound2.play();
   *    }
   *  }
   *  </code></div>
   */
  setInput(source, smoothing) {
    p5sound.meter.disconnect();

    if (smoothing) {
      this._workletNode.parameters.get('smoothing').value = smoothing;
    }

    // connect to the master out of p5s instance if no snd is provided
    if (source == null) {
      console.log(
        'Amplitude input source is not ready! Connecting to main output instead'
      );
      p5sound.meter.connect(this._workletNode);
    }

    // connect to the sound if it is available
    else if (source) {
      source.connect(this._workletNode);
      this._workletNode.disconnect();
      this._workletNode.connect(this.output);
    }

    // otherwise, connect to the master out of p5s instance (default)
    else {
      p5sound.meter.connect(this._workletNode);
    }
  }

  /**
   *  Returns a single Amplitude reading at the moment it is called.
   *  For continuous readings, run in the draw loop.
   *
   *  @method getLevel
   *  @for p5.Amplitude
   *  @param {Number} [channel] Optionally return only channel 0 (left) or 1 (right)
   *  @return {Number}       Amplitude as a number between 0.0 and 1.0
   *  @example
   *  <div><code>
   *  function preload(){
   *    sound = loadSound('assets/beat.mp3');
   *  }
   *
   *  function setup() {
   *    let cnv = createCanvas(100, 100);
   *    cnv.mouseClicked(toggleSound);
   *    amplitude = new p5.Amplitude();
   *  }
   *
   *  function draw() {
   *    background(220, 150);
   *    textAlign(CENTER);
   *    text('tap to play', width/2, 20);
   *
   *    let level = amplitude.getLevel();
   *    let size = map(level, 0, 1, 0, 200);
   *    ellipse(width/2, height/2, size, size);
   *  }
   *
   *  function toggleSound(){
   *    if (sound.isPlaying()) {
   *      sound.stop();
   *    } else {
   *      sound.play();
   *    }
   *  }
   *  </code></div>
   */
  getLevel(channel) {
    if (typeof channel !== 'undefined') {
      if (this.normalize) {
        return this.stereoVolNorm[channel];
      } else {
        return this.stereoVol[channel];
      }
    } else if (this.normalize) {
      return this.volNorm;
    } else {
      return this.volume;
    }
  }

  /**
   * Determines whether the results of Amplitude.process() will be
   * Normalized. To normalize, Amplitude finds the difference the
   * loudest reading it has processed and the maximum amplitude of
   * 1.0. Amplitude adds this difference to all values to produce
   * results that will reliably map between 0.0 and 1.0. However,
   * if a louder moment occurs, the amount that Normalize adds to
   * all the values will change. Accepts an optional boolean parameter
   * (true or false). Normalizing is off by default.
   *
   * @method toggleNormalize
   * @for p5.Amplitude
   * @param {boolean} [boolean] set normalize to true (1) or false (0)
   */
  toggleNormalize(bool) {
    if (typeof bool === 'boolean') {
      this.normalize = bool;
    } else {
      this.normalize = !this.normalize;
    }
    this._workletNode.port.postMessage({
      name: 'toggleNormalize',
      normalize: this.normalize,
    });
  }
  /**
   *  Smooth Amplitude analysis by averaging with the last analysis
   *  frame. Off by default.
   *
   *  @method smooth
   *  @for p5.Amplitude
   *  @param {Number} set smoothing from 0.0 <= 1
   */
  smooth(s) {
    if (s >= 0 && s < 1) {
      this._workletNode.port.postMessage({ name: 'smoothing', smoothing: s });
    } else {
      console.log('Error: smoothing must be between 0 and 1');
    }
  }
  dispose() {
    // remove reference from soundArray
    var index = p5sound.soundArray.indexOf(this);
    p5sound.soundArray.splice(index, 1);

    if (this.input) {
      this.input.disconnect();
      delete this.input;
    }
    if (this.output) {
      this.output.disconnect();
      delete this.output;
    }

    this._workletNode.disconnect();
    delete this._workletNode;
  }
}

export default Amplitude;
