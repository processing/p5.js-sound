'use strict';

define(function () {
  /**
   *  <p>PeakDetect works in conjunction with p5.FFT to
   *  look for onsets in some or all of the frequency spectrum.
   *  </p>
   *  <p>
   *  To use p5.PeakDetect, call <code>update</code> in the draw loop
   *  and pass in a p5.FFT object.
   *  </p>
   *  <p>
   *  You can listen for a specific part of the frequency spectrum by
   *  setting the range between <code>freq1</code> and <code>freq2</code>.
   *  </p>
   *
   *  <p><code>threshold</code> is the threshold for detecting a peak,
   *  scaled between 0 and 1. It is logarithmic, so 0.1 is half as loud
   *  as 1.0.</p>
   *
   *  <p>
   *  The update method is meant to be run in the draw loop, and
   *  <b>frames</b> determines how many loops must pass before
   *  another peak can be detected.
   *  For example, if the frameRate() = 60, you could detect the beat of a
   *  120 beat-per-minute song with this equation:
   *  <code> framesPerPeak = 60 / (estimatedBPM / 60 );</code>
   *  </p>
   *
   *  <p>
   *  Based on example contribtued by @b2renger, and a simple beat detection
   *  explanation by <a
   *  href="http://www.airtightinteractive.com/2013/10/making-audio-reactive-visuals/"
   *  target="_blank">Felix Turner</a>.
   *  </p>
   *
   *  @class  p5.PeakDetect
   *  @constructor
   *  @param {Number} [freq1]     lowFrequency - defaults to 20Hz
   *  @param {Number} [freq2]     highFrequency - defaults to 20000 Hz
   *  @param {Number} [threshold] Threshold for detecting a beat between 0 and 1
   *                            scaled logarithmically where 0.1 is 1/2 the loudness
   *                            of 1.0. Defaults to 0.35.
   *  @param {Number} [framesPerPeak]     Defaults to 20.
   *  @example
   *  <div><code>
   *
   *  var cnv, soundFile, fft, peakDetect;
   *  var ellipseWidth = 10;
   *
   *  function setup() {
   *    background(0);
   *    noStroke();
   *    fill(255);
   *    textAlign(CENTER);
   *
   *    soundFile = loadSound('assets/beat.mp3');
   *
   *    // p5.PeakDetect requires a p5.FFT
   *    fft = new p5.FFT();
   *    peakDetect = new p5.PeakDetect();
   *
   *  }
   *
   *  function draw() {
   *    background(0);
   *    text('click to play/pause', width/2, height/2);
   *
   *    // peakDetect accepts an fft post-analysis
   *    fft.analyze();
   *    peakDetect.update(fft);
   *
   *    if ( peakDetect.isDetected ) {
   *      ellipseWidth = 50;
   *    } else {
   *      ellipseWidth *= 0.95;
   *    }
   *
   *    ellipse(width/2, height/2, ellipseWidth, ellipseWidth);
   *  }
   *
   *  // toggle play/stop when canvas is clicked
   *  function mouseClicked() {
   *    if (mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height) {
   *      if (soundFile.isPlaying() ) {
   *        soundFile.stop();
   *      } else {
   *        soundFile.play();
   *      }
   *    }
   *  }
   *  </code></div>
   */
  p5.PeakDetect = function(freq1, freq2, threshold, _framesPerPeak) {
    // framesPerPeak determines how often to look for a beat.
    // If a beat is provided, try to look for a beat based on bpm
    this.framesPerPeak = _framesPerPeak || 20;
    this.framesSinceLastPeak = 0;
    this.decayRate = 0.95;

    this.threshold = threshold || 0.35;
    this.cutoff = 0;

    // how much to increase the cutoff
    // TO DO: document this / figure out how to make it accessible
    this.cutoffMult = 1.5;

    this.energy = 0;
    this.penergy = 0;

    // TO DO: document this property / figure out how to make it accessible
    this.currentValue = 0;

    /**
     *  isDetected is set to true when a peak is detected.
     *
     *  @attribute isDetected
     *  @type {Boolean}
     *  @default  false
     */
    this.isDetected = false;

    this.f1 = freq1 || 40;
    this.f2 = freq2 || 20000;

    // function to call when a peak is detected
    this._onPeak = function() {};
  };


  /**
   *  The update method is run in the draw loop.
   *
   *  Accepts an FFT object. You must call .analyze()
   *  on the FFT object prior to updating the peakDetect
   *  because it relies on a completed FFT analysis.
   *
   *  @method  update
   *  @param  {p5.FFT} fftObject A p5.FFT object
   */
  p5.PeakDetect.prototype.update = function(fftObject) {
    var nrg = this.energy = fftObject.getEnergy(this.f1,this.f2)/255;
    if (nrg > this.cutoff && nrg > this.threshold && nrg-this.penergy > 0) {

      // trigger callback
      this._onPeak();
      this.isDetected = true;

      // debounce
      this.cutoff = nrg * this.cutoffMult;
      this.framesSinceLastPeak = 0;
    } else {
      this.isDetected = false;
      if (this.framesSinceLastPeak <= this.framesPerPeak) {
        this.framesSinceLastPeak++;
      } else {
        this.cutoff *= this.decayRate;
        this.cutoff = Math.max(this.cutoff, this.threshold);
      }
    }

    this.currentValue = nrg;
    this.penergy = nrg;
  };

  /**
   *  onPeak accepts two arguments: a function to call when
   *  a peak is detected. The value of the peak,
   *  between 0.0 and 1.0, is passed to the callback.
   *
   *  @method  onPeak
   *  @param  {Function} callback Name of a function that will
   *                              be called when a peak is
   *                              detected.
   *  @param  {Object}   [val]    Optional value to pass
   *                              into the function when
   *                              a peak is detected.
   *  @example
   *  <div><code>
   *  var cnv, soundFile, fft, peakDetect;
   *  var ellipseWidth = 0;
   *
   *  function setup() {
   *    cnv = createCanvas(100,100);
   *    textAlign(CENTER);
   *
   *    soundFile = loadSound('assets/beat.mp3');
   *    fft = new p5.FFT();
   *    peakDetect = new p5.PeakDetect();
   *
   *    setupSound();
   *
   *    // when a beat is detected, call triggerBeat()
   *    peakDetect.onPeak(triggerBeat);
   *  }
   *
   *  function draw() {
   *    background(0);
   *    fill(255);
   *    text('click to play', width/2, height/2);
   *
   *    fft.analyze();
   *    peakDetect.update(fft);
   *
   *    ellipseWidth *= 0.95;
   *    ellipse(width/2, height/2, ellipseWidth, ellipseWidth);
   *  }
   *
   *  // this function is called by peakDetect.onPeak
   *  function triggerBeat() {
   *    ellipseWidth = 50;
   *  }
   *
   *  // mouseclick starts/stops sound
   *  function setupSound() {
   *    cnv.mouseClicked( function() {
   *      if (soundFile.isPlaying() ) {
   *        soundFile.stop();
   *      } else {
   *        soundFile.play();
   *      }
   *    });
   *  }
   *  </code></div>
   */
  p5.PeakDetect.prototype.onPeak = function(callback, val) {
    var self = this;

    self._onPeak = function() {
      callback(self.energy, val);
    };
  };

});
