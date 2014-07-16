define(function (require) {
  'use strict';

  var p5sound = require('master');

  /**
   * Create an analyser node with optional variables for smoothing, 
   * fft size, min/max decibels. Decibels are in dBFS (0 is loudest),
   * and will impact the range of your results.
   *
   * @class FFT
   * @constructor
   * @param {[Number]} smoothing   Smooth results of Freq Spectrum between 0.01 and .99)]
   * @param {[Number]} fft_size    Must be a power of two between 32 and 2048
   * @return {Object}    FFT Object
   */
  p5.prototype.FFT = function(smoothing, fft_size) {
    var SMOOTHING = smoothing || 0.6;
    var FFT_SIZE = fft_size || 1024;
    this.analyser = p5sound.audiocontext.createAnalyser();

    // default connections to p5sound master
    p5sound.output.connect(this.analyser);

    this.analyser.smoothingTimeConstant = SMOOTHING;
    this.analyser.fftSize = FFT_SIZE;

    this.freqDomain = new Float32Array(this.analyser.frequencyBinCount);
    this.timeDomain = new Uint8Array(this.analyser.frequencyBinCount);

  };

  // change input from default (p5)
  p5.prototype.FFT.prototype.setInput = function(source) {
    source.connect(this.analyser);
    this.analyser.disconnect();
  };

  /**
   *  <p>This method tells the FFT to processes the frequency spectrum.</p>
   * 
   *  <p>Returns an array of amplitude values between -140 and 0. The array
   *  starts with the lowest pitched frequencies, and ends with the 
   *  highest.</p>
   *  
   *  <p>Length will be equal to 1/2 fftSize (default: 1024 / 512).</p>
   *
   *  @method processFreq
   *  @return {Uint8Array} spectrum    Array of amplitude values across
   *                                   the frequency spectrum.
   *
   */
  p5.prototype.FFT.prototype.processFreq = function() {
    this.analyser.getFloatFrequencyData(this.freqDomain);
    return this.freqDomain;
  };


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

  // change smoothing
  p5.prototype.FFT.prototype.setSmoothing = function(s) {
    this.analyser.smoothingTimeConstant = s;
  };

  p5.prototype.FFT.prototype.getSmoothing = function() {
    return this.analyser.smoothingTimeConstant;
  };

  /**
   *  <p>Returns the amount of energy (volume) at a specific
   *  frequency, or the average amount of energy between two
   *  given frequencies.</p>
   *
   *  <p>To get accurate results, processFreq() must be
   *  called prior to getFreq(). This is because procesFreq()
   *  tells the FFT to update its array of frequency data, which
   *  getFreq() uses to determine the value at a specific frequency
   *  or range of frequencies.</p>
   *  
   *  @method  getFreq
   *  @param  {Number} frequency1   Will return a value representing
   *                                energy at this frequency.
   *  @param  {Number} [frequency2] If a second frequency is given,
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