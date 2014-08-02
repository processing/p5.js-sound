define(function (require) {
  'use strict';
  var p5sound = require('master');

  /**
   *  Create an Amplitude object, which measures amplitude (volume)
   *  between 0.0 and 1.0. Accepts an optional smoothing value,
   *  which defaults to 0. Reads global p5sound output by default,
   *  or use setInput() to listen to a specific sound source.
   *
   *  @class Amplitude
   *  @constructor
   *  @param {Number} [smoothing] between 0.0 and .999 to smooth
   *                             amplitude readings (defaults to 0)
   *  @return {Object}    Amplitude Object
   *  @example
   *  <div><code>
   *  function setup() { 
   *    mic = new AudioIn();
   *    mic.on();
   *    amplitude = new Amplitude();
   *    amplitude.setInput(mic);
   *  }
   *  function draw() {
   *    micLevel = amplitude.analyze();
   *    ellipse(width/2, height - micLevel*height, 10, 10);
   *  }
   *  </code></div>
   */
  p5.prototype.Amplitude = function(smoothing) {

    // Set to 2048 for now. In future iterations, this should be inherited or parsed from p5sound's default
    this.bufferSize = 2048;

    // set audio context
    this.audiocontext = p5sound.audiocontext;
    this.processor = this.audiocontext.createScriptProcessor(this.bufferSize);

    // for connections
    this.input = this.processor;

    this.output = this.audiocontext.createGain();
    // smoothing defaults to 0
    this.smoothing = smoothing || 0;


    // the variables to return
    this.volume = 0;
    this.average = 0;
    this.volMax = 0.001;
    this.normalize = false;

    this.processor.onaudioprocess = this.volumeAudioProcess.bind(this);


    this.processor.connect(this.output);
    this.output.gain.value = 0;

    // this may only be necessary because of a Chrome bug
    this.output.connect(this.audiocontext.destination);

    // connect to p5sound master output by default, unless set by input()
    p5sound.meter.connect(this.processor);

  };

  /**
   *  Connects to the p5sound instance (master output) by default.
   *  Optionally, you can pass in a specific source (i.e. a soundfile).
   *
   *  @method setInput
   *  @param {soundObject|undefined} [snd]       set the sound source (optional, defaults to master output)
   *  @param {Number|undefined} [smoothing]      a range between 0.0 and .999 to smooth amplitude readings
   *  @example
   *  <div><code>
   *  function preload(){
   *    soundFile = loadSound('mySound.mp3');
   *  }
   *  function setup(){
   *    amplitude = new Amplitude();
   *    amplitude.setInput(soundFile);
   *  }
   *  </code></div>
   */
  p5.prototype.Amplitude.prototype.setInput = function(source, smoothing) {

    p5sound.meter.disconnect(this.processor);

    if (smoothing) {
      this.smoothing = smoothing;
    }

    // connect to the master out of p5s instance if no snd is provided
    if (source == null) {
      console.log('Amplitude input source is not ready! Connecting to master output instead');
      p5sound.meter.connect(this.processor);
    }

    // connect to the sound if it is available
    else if (source) {
      source.connect(this.processor);
      this.processor.disconnect();
      this.processor.connect(this.output);
      console.log('source connected');
    }

    // otherwise, connect to the master out of p5s instance (default)
    else {
      p5sound.meter.connect(this.processor);
    }
  };

  p5.prototype.Amplitude.prototype.connect = function(unit) {
    if (unit) {
      if (unit.hasOwnProperty('input')) {
        this.output.connect(unit.input);
      } else {
        this.output.connect(unit);
      }
    } else {
      this.output.connect(this.panner.connect(p5sound.input));
    }
  };

  p5.prototype.Amplitude.prototype.disconnect = function(unit) {
    this.output.disconnect();
  };

  // Should this be a private function?
  // TO DO make this stereo / dependent on # of audio channels
  p5.prototype.Amplitude.prototype.volumeAudioProcess = function(event) {
    // return result
    var inputBuffer = event.inputBuffer.getChannelData(0);
    var bufLength = inputBuffer.length;
    var total = 0;
    var sum = 0;
    var x;

    for (var i = 0; i < bufLength; i++) {
      x = inputBuffer[i];
      if (this.normalize){
        total += p5.prototype.constrain(x/this.volMax, -1, 1);
        sum += p5.prototype.constrain(x/this.volMax, -1, 1) * p5.prototype.constrain(x/this.volMax, -1, 1);
      }
      else {
        total += x;
        sum += x * x;
      }
    }

    var average = total/ bufLength;

    // ... then take the square root of the sum.
    var rms = Math.sqrt(sum / bufLength);

    this.volume = Math.max(rms, this.volume*this.smoothing);
    this.volMax=Math.max(this.volume, this.volMax);

    // normalized values
    this.volNorm = p5.prototype.constrain(this.volume/this.volMax, 0, 1);
  };

  /**
   *  Returns a single Amplitude reading at the moment it is called.
   *  For continuous readings, run in the draw loop.
   *
   *  @method getLevel
   *  @return {Number}       Amplitude as a number between 0.0 and 1.0
   *  @example
   *  <div><code>
   *  function setup() { 
   *    amplitude = new Amplitude();
   *  }
   *  function draw() {
   *    volume = amplitude.getLevel();
   *  }
   *  </code></div>
   */
  p5.prototype.Amplitude.prototype.getLevel = function() {
    if (this.normalize) {
      return this.volNorm;
    }
    else {
      return this.volume;
    }
  };

  /**
   * Determines whether the results of Amplitude.process() will be Normalized.
   * To normalize, Amplitude finds the difference the loudest reading it has processed
   * and the maximum amplitude of 1.0. Amplitude adds this difference to all values to produce
   * results that will reliably map between 0.0 and 1.0. 
   * However, if a louder moment occurs, the amount that Normalize adds to all the values will change.
   *
   * Accepts an optional boolean parameter (true or false).
   * Normalizing is off by default.
   *
   * @method toggleNormalize
   * @param {boolean} [boolean] set normalize to true (1) or false (0)
   */
  p5.prototype.Amplitude.prototype.toggleNormalize = function(bool) {
    if (typeof(bool) === 'boolean'){
      this.normalize = bool;
    }
    else {
      this.normalize = !this.normalize;
    }
  };

  /**
   * Determines whether the results of Amplitude.process() will be Smoothed.
   *
   * @method smooth
   * @param {Number} set smoothing from 0.0 <= 1
   */
  p5.prototype.Amplitude.prototype.smooth = function(s) {
    if (s >= 0 && s < 1) {
      this.smoothing = s;
    } else {
      console.log('Error: smoothing must be between 0 and 1');
    }
  };

});