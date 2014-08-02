define(function (require) {
  'use strict';

  var p5sound = require('master');

  /**
   *  Create an analyser node with optional variables for smoothing, 
   *  fft size, min/max decibels. Decibels are in dBFS (0 is loudest),
   *  and will impact the range of your results.
   *
   *  @class FFT
   *  @constructor
   *  @param {[Number]} smoothing   Smooth results of Freq Spectrum.
   *                                0.0 < smoothing < 1.0.
   *                                Defaults to 0.8.
   *  @param {[Number]} bands    Must be a power of two between
   *                             16 and 1024. Defaults to 1024.
   *  @return {Object}    FFT Object
   */
  p5.prototype.FFT = function(smoothing, bands) {
    var SMOOTHING = smoothing || 0.8;
    var FFT_SIZE = bands*2 || 2048;
    this.analyser = p5sound.audiocontext.createAnalyser();

    // default connections to p5sound master
    p5sound.output.connect(this.analyser);

    this.analyser.smoothingTimeConstant = SMOOTHING;
    this.analyser.fftSize = FFT_SIZE;

    this.freqDomain = new Float32Array(this.analyser.frequencyBinCount);
    this.timeDomain = new Uint8Array(this.analyser.frequencyBinCount);

  };

  /**
   *  Set the input source for the FFT analysis. If no source is
   *  provided, FFT will analyze all sound in the sketch.
   *  
   *  @param {[Object]} source p5.sound object (or web audio API source node)
   *  @param {[Number]} bands  Must be a power of two between 16 and 1024
   */
  p5.prototype.FFT.prototype.setInput = function(source, bands) {
    if (bands) {
      this.analyser.fftSize = bands*2;
      console.log('bands!');
    }
    if (source.output){
      source.output.connect(this.analyser);
    } else {
      source.connect(this.analyser);
    }
  };

  /**
   *  <p>This method tells the FFT to processes the frequency spectrum.</p>
   * 
   *  <p>Returns an array of amplitude values between -140 and 0. The array
   *  starts with the lowest pitched frequencies, and ends with the 
   *  highest.</p>
   *  
   *  <p>Length will be equal to fft bands (default: 1024).</p>
   *
   *  @method analyze
   *  @param {[Number]} bands    Must be a power of two between
   *                             16 and 1024. Defaults to 512.
   *  @return {Float32Array} spectrum    Array of amplitude values across
   *                                   the frequency spectrum.
   *
   */
  p5.prototype.FFT.prototype.analyze = function(bands) {
    if (bands) {
      this.analyser.fftSize = bands*2;
    }
    this.analyser.getFloatFrequencyData(this.freqDomain);
    return this.freqDomain;
  };

  //  p5.prototype.FFT.prototype.processFreq =  p5.prototype.FFT.prototype.analyze;

  /**
   *  Returns an array of amplitude values (between 0-255) that represent
   *  a snapshot of amplitude readings in a single buffer.
   * 
   *  Length will be 1/2 size of FFT buffer (default is 2048 / 1024).
   *
   *  Can be used to draw the waveform of a sound. 
   *  
   *  @method waveform
   *  @return {Uint8Array}      Array of amplitude values (0-255) over time. Length will be 1/2 fftBands.
   *
   */
  p5.prototype.FFT.prototype.waveform = function() {
    this.analyser.getByteTimeDomainData(this.timeDomain);
    return this.timeDomain;
  };

  /**
   *  Smooth FFT analysis by averaging with the last analysis frame.
   *  
   *  @param {Number} smoothing    0.0 < smoothing < 1.0.
   *                               Defaults to 0.8.
   */
  p5.prototype.FFT.prototype.setSmoothing = function(s) {
    this.analyser.smoothingTimeConstant = s;
  };

  /**
   *  <p>Returns the amount of energy (volume) at a specific
   *  frequency, or the average amount of energy between two
   *  given frequencies.</p>
   *
   *  <p>analyze() must be called prior to getFreq().
   *  Analyze() tells the FFT to analyze frequency data, and
   *  getFreq() uses the results determine the value at
   *  a specific frequency or range of frequencies.</p>
   *  
   *  @method  getFreq
   *  @param  {Number} frequency1   Will return a value representing
   *                                energy at this frequency.
   *  @param  {[Number]} frequency2 If a second frequency is given,
   *                                will return average amount of
   *                                energy that exists between the
   *                                two frequencies.
   *  @return {Number}           
   */
  p5.prototype.FFT.prototype.getFreq = function(frequency1, frequency2) {
    var nyquist = p5sound.audiocontext.sampleRate/2;

    if (typeof(frequency1) !== 'number') {
      return null;
    }

    // if only one parameter:
    else if (!frequency2) {
      var index = Math.round(frequency1/nyquist * this.freqDomain.length);
      return this.freqDomain[index];
    }

    // if two parameters:
    else if (frequency1 && frequency2) {
      // if second is higher than first
      if (frequency1 > frequency2) {
        var swap = frequency2;
        frequency2 = frequency1;
        frequency1 = swap;
      }
      var lowIndex = Math.round(frequency1/nyquist * this.freqDomain.length);
      var highIndex = Math.round(frequency2/nyquist * this.freqDomain.length);

      var total = 0;
      var numFrequencies = 0;
      // add up all of the values for the frequencies
      for (var i = lowIndex; i<=highIndex; i++) {
        total += this.freqDomain[i];
        numFrequencies += 1;
      }
      // divide by total number of frequencies
      var toReturn = total/numFrequencies;
      return toReturn;
    }
    else {
      throw 'invalid input for getFreq()';
    }
  };

});