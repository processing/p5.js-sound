import p5sound from './master';

/**
 *  <p>FFT (Fast Fourier Transform) is an analysis algorithm that
 *  isolates individual
 *  <a href="https://en.wikipedia.org/wiki/Audio_frequency">
 *  audio frequencies</a> within a waveform.</p>
 *
 *  <p>Once instantiated, a p5.FFT object can return an array based on
 *  two types of analyses: <br> • <code>FFT.waveform()</code> computes
 *  amplitude values along the time domain. The array indices correspond
 *  to samples across a brief moment in time. Each value represents
 *  amplitude of the waveform at that sample of time.<br>
 *  • <code>FFT.analyze() </code> computes amplitude values along the
 *  frequency domain. The array indices correspond to frequencies (i.e.
 *  pitches), from the lowest to the highest that humans can hear. Each
 *  value represents amplitude at that slice of the frequency spectrum.
 *  Use with <code>getEnergy()</code> to measure amplitude at specific
 *  frequencies, or within a range of frequencies. </p>
 *
 *  <p>FFT analyzes a very short snapshot of sound called a sample
 *  buffer. It returns an array of amplitude measurements, referred
 *  to as <code>bins</code>. The array is 1024 bins long by default.
 *  You can change the bin array length, but it must be a power of 2
 *  between 16 and 1024 in order for the FFT algorithm to function
 *  correctly. The actual size of the FFT buffer is twice the
 *  number of bins, so given a standard sample rate, the buffer is
 *  2048/44100 seconds long.</p>
 *
 *
 *  @class p5.FFT
 *  @constructor
 *  @param {Number} [smoothing]   Smooth results of Freq Spectrum.
 *                                0.0 < smoothing < 1.0.
 *                                Defaults to 0.8.
 *  @param {Number} [bins]    Length of resulting array.
 *                            Must be a power of two between
 *                            16 and 1024. Defaults to 1024.
 *  @example
 *  <div><code>
 *  function preload(){
 *    sound = loadSound('assets/Damscray_DancingTiger.mp3');
 *  }
 *
 *  function setup(){
 *    let cnv = createCanvas(100,100);
 *    cnv.mouseClicked(togglePlay);
 *    fft = new p5.FFT();
 *    sound.amp(0.2);
 *  }
 *
 *  function draw(){
 *    background(220);
 *
 *    let spectrum = fft.analyze();
 *    noStroke();
 *    fill(255, 0, 255);
 *    for (let i = 0; i< spectrum.length; i++){
 *      let x = map(i, 0, spectrum.length, 0, width);
 *      let h = -height + map(spectrum[i], 0, 255, height, 0);
 *      rect(x, height, width / spectrum.length, h )
 *    }
 *
 *    let waveform = fft.waveform();
 *    noFill();
 *    beginShape();
 *    stroke(20);
 *    for (let i = 0; i < waveform.length; i++){
 *      let x = map(i, 0, waveform.length, 0, width);
 *      let y = map( waveform[i], -1, 1, 0, height);
 *      vertex(x,y);
 *    }
 *    endShape();
 *
 *    text('tap to play', 20, 20);
 *  }
 *
 *  function togglePlay() {
 *    if (sound.isPlaying()) {
 *      sound.pause();
 *    } else {
 *      sound.loop();
 *    }
 *  }
 *  </code></div>
 */
class FFT {
  constructor(smoothing, bins) {
    this.input = this.analyser = p5sound.audiocontext.createAnalyser();

    Object.defineProperties(this, {
      bins: {
        get: function () {
          return this.analyser.fftSize / 2;
        },
        set: function (b) {
          this.analyser.fftSize = b * 2;
        },
        configurable: true,
        enumerable: true,
      },
      smoothing: {
        get: function () {
          return this.analyser.smoothingTimeConstant;
        },
        set: function (s) {
          this.analyser.smoothingTimeConstant = s;
        },
        configurable: true,
        enumerable: true,
      },
    });

    // set default smoothing and bins
    this.smooth(smoothing);
    this.bins = bins || 1024;

    // default connections to p5sound fftMeter
    p5sound.fftMeter.connect(this.analyser);

    this.freqDomain = new Uint8Array(this.analyser.frequencyBinCount);
    this.timeDomain = new Uint8Array(this.analyser.frequencyBinCount);

    // predefined frequency ranges, these will be tweakable
    this.bass = [20, 140];
    this.lowMid = [140, 400];
    this.mid = [400, 2600];
    this.highMid = [2600, 5200];
    this.treble = [5200, 14000];

    // add this p5.SoundFile to the soundArray
    p5sound.soundArray.push(this);
  }

  /**
   *  Set the input source for the FFT analysis. If no source is
   *  provided, FFT will analyze all sound in the sketch.
   *
   *  @method  setInput
   *  @for p5.FFT
   *  @param {Object} [source] p5.sound object (or web audio API source node)
   */
  setInput(source) {
    if (!source) {
      p5sound.fftMeter.connect(this.analyser);
    } else {
      if (source.output) {
        source.output.connect(this.analyser);
      } else if (source.connect) {
        source.connect(this.analyser);
      }
      p5sound.fftMeter.disconnect();
    }
  }

  /**
   *  Returns an array of amplitude values (between -1.0 and +1.0) that represent
   *  a snapshot of amplitude readings in a single buffer. Length will be
   *  equal to bins (defaults to 1024). Can be used to draw the waveform
   *  of a sound.
   *
   *  @method waveform
   *  @for p5.FFT
   *  @param {Number} [bins]    Must be a power of two between
   *                            16 and 1024. Defaults to 1024.
   *  @param {String} [precision] If any value is provided, will return results
   *                              in a Float32 Array which is more precise
   *                              than a regular array.
   *  @return {Array}  Array    Array of amplitude values (-1 to 1)
   *                            over time. Array length = bins.
   *
   */
  waveform() {
    var bins, mode;
    var normalArray = new Array();

    for (var i = 0; i < arguments.length; i++) {
      if (typeof arguments[i] === 'number') {
        bins = arguments[i];
        this.analyser.fftSize = bins * 2;
      }
      if (typeof arguments[i] === 'string') {
        mode = arguments[i];
      }
    }

    // getFloatFrequencyData doesnt work in Safari as of 5/2015
    if (mode && !p5.prototype._isSafari()) {
      timeToFloat(this, this.timeDomain);
      this.analyser.getFloatTimeDomainData(this.timeDomain);
      return this.timeDomain;
    } else {
      timeToInt(this, this.timeDomain);
      this.analyser.getByteTimeDomainData(this.timeDomain);
      for (var j = 0; j < this.timeDomain.length; j++) {
        var scaled = p5.prototype.map(this.timeDomain[j], 0, 255, -1, 1);
        normalArray.push(scaled);
      }
      return normalArray;
    }
  }

  /**
   *  Returns an array of amplitude values (between 0 and 255)
   *  across the frequency spectrum. Length is equal to FFT bins
   *  (1024 by default). The array indices correspond to frequencies
   *  (i.e. pitches), from the lowest to the highest that humans can
   *  hear. Each value represents amplitude at that slice of the
   *  frequency spectrum. Must be called prior to using
   *  <code>getEnergy()</code>.
   *
   *  @method analyze
   *  @for p5.FFT
   *  @param {Number} [bins]    Must be a power of two between
   *                             16 and 1024. Defaults to 1024.
   *  @param {Number} [scale]    If "dB," returns decibel
   *                             float measurements between
   *                             -140 and 0 (max).
   *                             Otherwise returns integers from 0-255.
   *  @return {Array} spectrum    Array of energy (amplitude/volume)
   *                              values across the frequency spectrum.
   *                              Lowest energy (silence) = 0, highest
   *                              possible is 255.
   *  @example
   *  <div><code>
   *  let osc, fft;
   *
   *  function setup(){
   *    let cnv = createCanvas(100,100);
   *    cnv.mousePressed(startSound);
   *    osc = new p5.Oscillator();
   *    osc.amp(0);
   *    fft = new p5.FFT();
   *  }
   *
   *  function draw(){
   *    background(220);
   *
   *    let freq = map(mouseX, 0, windowWidth, 20, 10000);
   *    freq = constrain(freq, 1, 20000);
   *    osc.freq(freq);
   *
   *    let spectrum = fft.analyze();
   *    noStroke();
   *    fill(255, 0, 255);
   *    for (let i = 0; i< spectrum.length; i++){
   *      let x = map(i, 0, spectrum.length, 0, width);
   *      let h = -height + map(spectrum[i], 0, 255, height, 0);
   *      rect(x, height, width / spectrum.length, h );
   *    }
   *
   *    stroke(255);
   *    if (!osc.started) {
   *      text('tap here and drag to change frequency', 10, 20, width - 20);
   *    } else {
   *      text(round(freq)+'Hz', 10, 20);
   *    }
   *  }
   *
   *  function startSound() {
   *    osc.start();
   *    osc.amp(0.5, 0.2);
   *  }
   *
   *  function mouseReleased() {
   *    osc.amp(0, 0.2);
   *  }
   *  </code></div>
   *
   *
   */
  analyze() {
    var mode;

    for (var i = 0; i < arguments.length; i++) {
      if (typeof arguments[i] === 'number') {
        this.bins = arguments[i];
        this.analyser.fftSize = this.bins * 2;
      }
      if (typeof arguments[i] === 'string') {
        mode = arguments[i];
      }
    }

    if (mode && mode.toLowerCase() === 'db') {
      freqToFloat(this);
      this.analyser.getFloatFrequencyData(this.freqDomain);
      return this.freqDomain;
    } else {
      freqToInt(this, this.freqDomain);
      this.analyser.getByteFrequencyData(this.freqDomain);
      var normalArray = Array.apply([], this.freqDomain);

      return normalArray;
    }
  }

  /**
   *  Returns the amount of energy (volume) at a specific
   *  <a href="https://en.wikipedia.org/wiki/Audio_frequency" target="_blank">
   *  frequency</a>, or the average amount of energy between two
   *  frequencies. Accepts Number(s) corresponding
   *  to frequency (in Hz), or a "string" corresponding to predefined
   *  frequency ranges ("bass", "lowMid", "mid", "highMid", "treble").
   *  Returns a range between 0 (no energy/volume at that frequency) and
   *  255 (maximum energy).
   *  <em>NOTE: analyze() must be called prior to getEnergy(). analyze()
   *  tells the FFT to analyze frequency data, and getEnergy() uses
   *  the results to determine the value at a specific frequency or
   *  range of frequencies.</em></p>
   *
   *  @method  getEnergy
   *  @for p5.FFT
   *  @param  {Number|String} frequency1   Will return a value representing
   *                                energy at this frequency. Alternately,
   *                                the strings "bass", "lowMid" "mid",
   *                                "highMid", and "treble" will return
   *                                predefined frequency ranges.
   *  @param  {Number} [frequency2] If a second frequency is given,
   *                                will return average amount of
   *                                energy that exists between the
   *                                two frequencies.
   *  @return {Number}   Energy   Energy (volume/amplitude) from
   *                              0 and 255.
   *
   */
  getEnergy(frequency1, frequency2) {
    var nyquist = p5sound.audiocontext.sampleRate / 2;

    if (frequency1 === 'bass') {
      frequency1 = this.bass[0];
      frequency2 = this.bass[1];
    } else if (frequency1 === 'lowMid') {
      frequency1 = this.lowMid[0];
      frequency2 = this.lowMid[1];
    } else if (frequency1 === 'mid') {
      frequency1 = this.mid[0];
      frequency2 = this.mid[1];
    } else if (frequency1 === 'highMid') {
      frequency1 = this.highMid[0];
      frequency2 = this.highMid[1];
    } else if (frequency1 === 'treble') {
      frequency1 = this.treble[0];
      frequency2 = this.treble[1];
    }

    if (typeof frequency1 !== 'number') {
      throw 'invalid input for getEnergy()';
    } else if (!frequency2) {
      // if only one parameter:
      var index = Math.round((frequency1 / nyquist) * this.freqDomain.length);
      return this.freqDomain[index];
    } else if (frequency1 && frequency2) {
      // if two parameters:
      // if second is higher than first
      if (frequency1 > frequency2) {
        var swap = frequency2;
        frequency2 = frequency1;
        frequency1 = swap;
      }
      var lowIndex = Math.round(
        (frequency1 / nyquist) * this.freqDomain.length
      );
      var highIndex = Math.round(
        (frequency2 / nyquist) * this.freqDomain.length
      );

      var total = 0;
      var numFrequencies = 0;
      // add up all of the values for the frequencies
      for (var i = lowIndex; i <= highIndex; i++) {
        total += this.freqDomain[i];
        numFrequencies += 1;
      }
      // divide by total number of frequencies
      var toReturn = total / numFrequencies;
      return toReturn;
    } else {
      throw 'invalid input for getEnergy()';
    }
  }

  // compatability with v.012, changed to getEnergy in v.0121. Will be deprecated...
  getFreq(freq1, freq2) {
    console.log('getFreq() is deprecated. Please use getEnergy() instead.');
    var x = this.getEnergy(freq1, freq2);
    return x;
  }

  /**
   *  Returns the
   *  <a href="http://en.wikipedia.org/wiki/Spectral_centroid" target="_blank">
   *  spectral centroid</a> of the input signal.
   *  <em>NOTE: analyze() must be called prior to getCentroid(). Analyze()
   *  tells the FFT to analyze frequency data, and getCentroid() uses
   *  the results determine the spectral centroid.</em></p>
   *
   *  @method  getCentroid
   *  @for p5.FFT
   *  @return {Number}   Spectral Centroid Frequency  of the spectral centroid in Hz.
   *
   *
   * @example
   *  <div><code>
   * function setup(){
   *  cnv = createCanvas(100,100);
   *  cnv.mousePressed(userStartAudio);
   *  sound = new p5.AudioIn();
   *  sound.start();
   *  fft = new p5.FFT();
   *  sound.connect(fft);
   *}
   *
   *function draw() {
   *  if (getAudioContext().state !== 'running') {
   *    background(220);
   *    text('tap here and enable mic to begin', 10, 20, width - 20);
   *    return;
   *  }
   *  let centroidplot = 0.0;
   *  let spectralCentroid = 0;
   *
   *  background(0);
   *  stroke(0,255,0);
   *  let spectrum = fft.analyze();
   *  fill(0,255,0); // spectrum is green
   *
   *  //draw the spectrum
   *  for (let i = 0; i < spectrum.length; i++){
   *    let x = map(log(i), 0, log(spectrum.length), 0, width);
   *    let h = map(spectrum[i], 0, 255, 0, height);
   *    let rectangle_width = (log(i+1)-log(i))*(width/log(spectrum.length));
   *    rect(x, height, rectangle_width, -h )
   *  }
   *  let nyquist = 22050;
   *
   *  // get the centroid
   *  spectralCentroid = fft.getCentroid();
   *
   *  // the mean_freq_index calculation is for the display.
   *  let mean_freq_index = spectralCentroid/(nyquist/spectrum.length);
   *
   *  centroidplot = map(log(mean_freq_index), 0, log(spectrum.length), 0, width);
   *
   *  stroke(255,0,0); // the line showing where the centroid is will be red
   *
   *  rect(centroidplot, 0, width / spectrum.length, height)
   *  noStroke();
   *  fill(255,255,255);  // text is white
   *  text('centroid: ', 10, 20);
   *  text(round(spectralCentroid)+' Hz', 10, 40);
   *}
   * </code></div>
   */
  getCentroid() {
    var nyquist = p5sound.audiocontext.sampleRate / 2;
    var cumulative_sum = 0;
    var centroid_normalization = 0;

    for (var i = 0; i < this.freqDomain.length; i++) {
      cumulative_sum += i * this.freqDomain[i];
      centroid_normalization += this.freqDomain[i];
    }

    var mean_freq_index = 0;

    if (centroid_normalization !== 0) {
      mean_freq_index = cumulative_sum / centroid_normalization;
    }

    var spec_centroid_freq =
      mean_freq_index * (nyquist / this.freqDomain.length);
    return spec_centroid_freq;
  }

  /**
   *  Smooth FFT analysis by averaging with the last analysis frame.
   *
   *  @method smooth
   *  @param {Number} smoothing    0.0 < smoothing < 1.0.
   *                               Defaults to 0.8.
   */
  smooth(s) {
    if (typeof s !== 'undefined') {
      this.smoothing = s;
    }
    return this.smoothing;
  }

  dispose() {
    // remove reference from soundArray
    var index = p5sound.soundArray.indexOf(this);
    p5sound.soundArray.splice(index, 1);

    if (this.analyser) {
      this.analyser.disconnect();
      delete this.analyser;
    }
  }

  /**
   *  Returns an array of average amplitude values for a given number
   *  of frequency bands split equally. N defaults to 16.
   *  <em>NOTE: analyze() must be called prior to linAverages(). Analyze()
   *  tells the FFT to analyze frequency data, and linAverages() uses
   *  the results to group them into a smaller set of averages.</em></p>
   *
   *  @method  linAverages
   *  @for p5.FFT
   *  @param  {Number}  N                Number of returned frequency groups
   *  @return {Array}   linearAverages   Array of average amplitude values for each group
   */

  linAverages(_N) {
    var N = _N || 16; // This prevents undefined, null or 0 values of N

    var spectrum = this.freqDomain;
    var spectrumLength = spectrum.length;
    var spectrumStep = Math.floor(spectrumLength / N);

    var linearAverages = new Array(N);
    // Keep a second index for the current average group and place the values accordingly
    // with only one loop in the spectrum data
    var groupIndex = 0;

    for (var specIndex = 0; specIndex < spectrumLength; specIndex++) {
      linearAverages[groupIndex] =
        linearAverages[groupIndex] !== undefined
          ? (linearAverages[groupIndex] + spectrum[specIndex]) / 2
          : spectrum[specIndex];

      // Increase the group index when the last element of the group is processed
      if (specIndex % spectrumStep === spectrumStep - 1) {
        groupIndex++;
      }
    }

    return linearAverages;
  }

  /**
   *  Returns an array of average amplitude values of the spectrum, for a given
   *  set of <a href="https://en.wikipedia.org/wiki/Octave_band" target="_blank">
   *  Octave Bands</a>
   *  <em>NOTE: analyze() must be called prior to logAverages(). Analyze()
   *  tells the FFT to analyze frequency data, and logAverages() uses
   *  the results to group them into a smaller set of averages.</em></p>
   *
   *  @method  logAverages
   *  @for p5.FFT
   *  @param  {Array}   octaveBands    Array of Octave Bands objects for grouping
   *  @return {Array}   logAverages    Array of average amplitude values for each group
   */
  logAverages(octaveBands) {
    var nyquist = p5sound.audiocontext.sampleRate / 2;
    var spectrum = this.freqDomain;
    var spectrumLength = spectrum.length;

    var logAverages = new Array(octaveBands.length);
    // Keep a second index for the current average group and place the values accordingly
    // With only one loop in the spectrum data
    var octaveIndex = 0;

    for (var specIndex = 0; specIndex < spectrumLength; specIndex++) {
      var specIndexFrequency = Math.round(
        (specIndex * nyquist) / this.freqDomain.length
      );

      // Increase the group index if the current frequency exceeds the limits of the band
      if (specIndexFrequency > octaveBands[octaveIndex].hi) {
        octaveIndex++;
      }

      logAverages[octaveIndex] =
        logAverages[octaveIndex] !== undefined
          ? (logAverages[octaveIndex] + spectrum[specIndex]) / 2
          : spectrum[specIndex];
    }

    return logAverages;
  }

  /**
   *  Calculates and Returns the 1/N
   *  <a href="https://en.wikipedia.org/wiki/Octave_band" target="_blank">Octave Bands</a>
   *  N defaults to 3 and minimum central frequency to 15.625Hz.
   *  (1/3 Octave Bands ~= 31 Frequency Bands)
   *  Setting fCtr0 to a central value of a higher octave will ignore the lower bands
   *  and produce less frequency groups.
   *
   *  @method   getOctaveBands
   *  @for p5.FFT
   *  @param  {Number}  N             Specifies the 1/N type of generated octave bands
   *  @param  {Number}  fCtr0         Minimum central frequency for the lowest band
   *  @return {Array}   octaveBands   Array of octave band objects with their bounds
   */
  getOctaveBands(_N, _fCtr0) {
    var N = _N || 3; // Default to 1/3 Octave Bands
    var fCtr0 = _fCtr0 || 15.625; // Minimum central frequency, defaults to 15.625Hz

    var octaveBands = [];
    var lastFrequencyBand = {
      lo: fCtr0 / Math.pow(2, 1 / (2 * N)),
      ctr: fCtr0,
      hi: fCtr0 * Math.pow(2, 1 / (2 * N)),
    };
    octaveBands.push(lastFrequencyBand);

    var nyquist = p5sound.audiocontext.sampleRate / 2;
    while (lastFrequencyBand.hi < nyquist) {
      var newFrequencyBand = {};
      newFrequencyBand.lo = lastFrequencyBand.hi;
      newFrequencyBand.ctr = lastFrequencyBand.ctr * Math.pow(2, 1 / N);
      newFrequencyBand.hi = newFrequencyBand.ctr * Math.pow(2, 1 / (2 * N));

      octaveBands.push(newFrequencyBand);
      lastFrequencyBand = newFrequencyBand;
    }

    return octaveBands;
  }
}

// helper methods to convert type from float (dB) to int (0-255)
function freqToFloat(fft) {
  if (fft.freqDomain instanceof Float32Array === false) {
    fft.freqDomain = new Float32Array(fft.analyser.frequencyBinCount);
  }
}
function freqToInt(fft) {
  if (fft.freqDomain instanceof Uint8Array === false) {
    fft.freqDomain = new Uint8Array(fft.analyser.frequencyBinCount);
  }
}
function timeToFloat(fft) {
  if (fft.timeDomain instanceof Float32Array === false) {
    fft.timeDomain = new Float32Array(fft.analyser.frequencyBinCount);
  }
}
function timeToInt(fft) {
  if (fft.timeDomain instanceof Uint8Array === false) {
    fft.timeDomain = new Uint8Array(fft.analyser.frequencyBinCount);
  }
}

export default FFT;
