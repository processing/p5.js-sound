define(function (require) {
  'use strict';
  var p5sound = require('master');

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
   *  @return {Object}    Amplitude Object
   *  @example
   *  <div><code>
   *  var sound, amplitude, cnv;
   *  
   *  function preload(){
   *    sound = loadSound('assets/beat.mp3');
   *  }
   *  function setup() {
   *    cnv = createCanvas(100,100);
   *    amplitude = new p5.Amplitude();
   *
   *    // start / stop the sound when canvas is clicked
   *    cnv.mouseClicked(function() {
   *      if (sound.isPlaying() ){
   *        sound.stop();
   *      } else {
   *        sound.play();
   *      }
   *    });
   *  }
   *  function draw() {
   *    background(0);
   *    fill(255);
   *    var level = amplitude.getLevel();
   *    var size = map(level, 0, 1, 0, 200);
   *    ellipse(width/2, height/2, size, size);
   *  }
   *
   *  </code></div>
   */
  p5.Amplitude = function(smoothing) {

    // Set to 2048 for now. In future iterations, this should be inherited or parsed from p5sound's default
    this.bufferSize = 2048;

    // set audio context
    this.audiocontext = p5sound.audiocontext;
    this.processor = this.audiocontext.createScriptProcessor(this.bufferSize, 2, 1);

    // for connections
    this.input = this.processor;

    this.output = this.audiocontext.createGain();
    // smoothing defaults to 0
    this.smoothing = smoothing || 0;


    // the variables to return
    this.volume = 0;
    this.average = 0;

    this.stereoVol = [0, 0];
    this.stereoAvg = [0, 0];
    this.stereoVolNorm = [0, 0];

    this.volMax = 0.001;
    this.normalize = false;

    this.processor.onaudioprocess = this._audioProcess.bind(this);


    this.processor.connect(this.output);
    this.output.gain.value = 0;

    // this may only be necessary because of a Chrome bug
    this.output.connect(this.audiocontext.destination);

    // connect to p5sound master output by default, unless set by input()
    p5sound.meter.connect(this.processor);

    // add this p5.SoundFile to the soundArray
    p5sound.soundArray.push(this);
  };

  /**
   *  Connects to the p5sound instance (master output) by default.
   *  Optionally, you can pass in a specific source (i.e. a soundfile).
   *
   *  @method setInput
   *  @param {soundObject|undefined} [snd] set the sound source
   *                                       (optional, defaults to
   *                                       master output)
   *  @param {Number|undefined} [smoothing] a range between 0.0 and 1.0
   *                                        to smooth amplitude readings
   *  @example
   *  <div><code>
   *  function preload(){
   *    sound1 = loadSound('assets/beat.mp3');
   *    sound2 = loadSound('assets/drum.mp3');
   *  }
   *  function setup(){
   *    amplitude = new p5.Amplitude();
   *    sound1.play();
   *    sound2.play();
   *    amplitude.setInput(sound2);
   *  }
   *  function draw() {
   *    background(0);
   *    fill(255);
   *    var level = amplitude.getLevel();
   *    var size = map(level, 0, 1, 0, 200);
   *    ellipse(width/2, height/2, size, size);
   *  }
   *  function mouseClicked(){
   *    sound1.stop();
   *    sound2.stop();
   *  }
   *  </code></div>
   */
  p5.Amplitude.prototype.setInput = function(source, smoothing) {

    p5sound.meter.disconnect();

    if (smoothing) {
      this.smoothing = smoothing;
    }

    // connect to the master out of p5s instance if no snd is provided
    if (source == null) {
      console.log('Amplitude input source is not ready! Connecting to master output instead');
      p5sound.meter.connect(this.processor);
    }

    // if it is a p5.Signal
    else if (source instanceof p5.Signal) {
      source.output.connect(this.processor);
    }
    // connect to the sound if it is available
    else if (source) {
      source.connect(this.processor);
      this.processor.disconnect();
      this.processor.connect(this.output);
    }

    // otherwise, connect to the master out of p5s instance (default)
    else {
      p5sound.meter.connect(this.processor);
    }
  };

  p5.Amplitude.prototype.connect = function(unit) {
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

  p5.Amplitude.prototype.disconnect = function(unit) {
    this.output.disconnect();
  };

  // TO DO make this stereo / dependent on # of audio channels
  p5.Amplitude.prototype._audioProcess = function(event) {

    for (var channel = 0; channel < event.inputBuffer.numberOfChannels; channel++) {
      var inputBuffer = event.inputBuffer.getChannelData(channel);
      var bufLength = inputBuffer.length;

      var total = 0;
      var sum = 0;
      var x;

      for (var i = 0; i < bufLength; i++) {
        x = inputBuffer[i];
        if (this.normalize){
          total += Math.max(Math.min(x/this.volMax, 1), -1);
          sum += Math.max(Math.min(x/this.volMax, 1), -1) * Math.max(Math.min(x/this.volMax, 1), -1);
        }
        else {
          total += x;
          sum += x * x;
        }
      }
      var average = total/ bufLength;

      // ... then take the square root of the sum.
      var rms = Math.sqrt(sum / bufLength);

      this.stereoVol[channel] = Math.max(rms, this.stereoVol[channel] * this.smoothing);
      this.stereoAvg[channel] = Math.max(average, this.stereoVol[channel] * this.smoothing);
      this.volMax = Math.max(this.stereoVol[channel], this.volMax);
    }

    // add volume from all channels together
    var self = this;
    var volSum = this.stereoVol.reduce(function(previousValue, currentValue, index) {
      self.stereoVolNorm[index - 1] = Math.max(Math.min(self.stereoVol[index - 1]/self.volMax, 1), 0);
      self.stereoVolNorm[index] = Math.max(Math.min(self.stereoVol[index]/self.volMax, 1), 0);

      return previousValue + currentValue;
    });

    // volume is average of channels
    this.volume = volSum / this.stereoVol.length;

    // normalized value
    this.volNorm = Math.max(Math.min(this.volume/this.volMax, 1), 0);


  };

  /**
   *  Returns a single Amplitude reading at the moment it is called.
   *  For continuous readings, run in the draw loop.
   *
   *  @method getLevel
   *  @param {Number} [channel] Optionally return only channel 0 (left) or 1 (right)
   *  @return {Number}       Amplitude as a number between 0.0 and 1.0
   *  @example
   *  <div><code>
   *  function preload(){
   *    sound = loadSound('assets/beat.mp3');
   *  }
   *  function setup() { 
   *    amplitude = new p5.Amplitude();
   *    sound.play();
   *  }
   *  function draw() {
   *    background(0);
   *    fill(255);
   *    var level = amplitude.getLevel();
   *    var size = map(level, 0, 1, 0, 200);
   *    ellipse(width/2, height/2, size, size);
   *  }
   *  function mouseClicked(){
   *    sound.stop();
   *  }
   *  </code></div>
   */
  p5.Amplitude.prototype.getLevel = function(channel) {
    if (typeof(channel) !== 'undefined') {
      if (this.normalize) {
        return this.stereoVolNorm[channel];
      } else {
        return this.stereoVol[channel];
      }
    }
    else if (this.normalize) {
      return this.volNorm;
    }
    else {
      return this.volume;
    }
  };

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
   * @param {boolean} [boolean] set normalize to true (1) or false (0)
   */
  p5.Amplitude.prototype.toggleNormalize = function(bool) {
    if (typeof(bool) === 'boolean'){
      this.normalize = bool;
    }
    else {
      this.normalize = !this.normalize;
    }
  };

  /**
   *  Smooth Amplitude analysis by averaging with the last analysis 
   *  frame. Off by default.
   *
   *  @method smooth
   *  @param {Number} set smoothing from 0.0 <= 1
   */
  p5.Amplitude.prototype.smooth = function(s) {
    if (s >= 0 && s < 1) {
      this.smoothing = s;
    } else {
      console.log('Error: smoothing must be between 0 and 1');
    }
  };

  p5.Amplitude.prototype.dispose = function() {
    // remove reference from soundArray
    var index = p5sound.soundArray.indexOf(this);
    p5sound.soundArray.splice(index, 1);

    this.input.disconnect();
    this.output.disconnect();

    this.input = this.processor = undefined;
    this.output = undefined;
  };

});