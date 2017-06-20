define(function (require) {
  'use strict';

  var p5Sound = require('master');
  var Effect = require('effect');
  /**
   *  A p5.EQ uses a chain of Web Audio Biquad Filters
   *  to modify the spectrum of a sound input source. 
   *
   *  @class p5.EQ
   *  @constructor
   *  @param {[Number]} _eqsize default: 8
   *  @return {Object} p5.EQ
   *  @example
   *  <div><code>
   *  var fft, noise, filter;
   *
   *  function setup() {
   *    fill(255, 40, 255);
   *
   *    filter = new p5.BandPass();
   *
   *    noise = new p5.Noise();
   *    // disconnect unfiltered noise,
   *    // and connect to filter
   *    noise.disconnect();
   *    noise.connect(filter);
   *    noise.start();
   *
   *    fft = new p5.FFT();
   *  }
   *
   *  function draw() {
   *    background(30);
   *
   *    // set the BandPass frequency based on mouseX
   *    var freq = map(mouseX, 0, width, 20, 10000);
   *    filter.freq(freq);
   *    // give the filter a narrow band (lower res = wider bandpass)
   *    filter.res(50);
   *
   *    // draw filtered spectrum
   *    var spectrum = fft.analyze();
   *    noStroke();
   *    for (var i = 0; i < spectrum.length; i++) {
   *      var x = map(i, 0, spectrum.length, 0, width);
   *      var h = -height + map(spectrum[i], 0, 255, height, 0);
   *      rect(x, height, width/spectrum.length, h);
   *    }
   *    
   *    isMouseOverCanvas();
   *  }
   *
   *  function isMouseOverCanvas() {
   *    var mX = mouseX, mY = mouseY;
   *    if (mX > 0 && mX < width && mY < height && mY > 0) {
   *      noise.amp(0.5, 0.2);
   *    } else {
   *      noise.amp(0, 0.2);
   *    }
   *  }
   *  </code></div>
   */


  p5.EQ = function(_eqsize) {

    //default size is 8 band EQ
    _eqsize = _eqsize || 8;

    Effect.call(this);
    
    this.bands = [];

    /**
      *  The p5.EQ is built with
      *  <a href="http://www.w3.org/TR/webaudio/#BiquadFilterNode">
      *  Web Audio BiquadFilter Node</a>.
      *  
      *  @property biquadFilter
      *  @type {Object}  Web Audio Delay Node
      *
      *  @{param} toggle {boolean} On/of switch for band, true == on
    */
    for (var i = 0; i<_eqsize; i++){
      this.bands.push(this.ac.createBiquadFilter());
      this.bands[i].type = 'peaking';
      this.bands[i].frequency.value = i*3150;
      this.bands[i].Q.value = 5;
      this.toggle = true;
      if (i>0){
        this.bands[i-1].connect(this.bands[i]);
      }
    }
    this.input.connect(this.bands[0]);
    this.bands[_eqsize-1].connect(this.output);
  };

  p5.EQ.prototype = Object.create(Effect.prototype);

  p5.EQ.prototype.process = function (src) {
    src.connect(this.input);
  };

  /**
   *  @{method} setBand Make adjustments to individual bands of the EQ
   *
   *  @{param} band {number} Band to be modified
   *  @{param} option {string} Modify function (toggle, mod, type);
   *  @{param} param1 {number} Set the frequency of a band w/ usage: "mod"
   *  @{param} param2 {number} Set the Q value (resonance) of a band w/usage: "mod"
   *  @{param} param1 {string} Set the type of the band filter w/ usage: "type"
   */
  p5.EQ.prototype.setBand = function (band, option, param1, param2) {
    if (option === "toggle") { 
      this.toggleBand(band);
    } else if (option === "mod") { 
      this.modBand(band, param1, param2);
      // console.log("gain");
    } else if (option === "type") { 
      this.bandType(band, param1); 
    } else {
      console.log("error");
    }
  };

  /**
   *  @{method} toggleBand Switch a band on or off
   *
   *  @{param} band {number} Band to be modified
   */
  p5.EQ.prototype.toggleBand = function (band) {

    this.bands[band].toggle = !this.bands[band].toggle;
    console.log(this.bands[band].toggle);
    this.bands[band].toggle ? this.bands[band].type = 'peaking': this.bands[band].type = 'allpass';
  };


  /**
   *  @{method} modBand Change the parameters of a band filter
   *
   *  @{param} band {number} Band to be modified
   *  @{param} vol {number} Gain value, range: -40 to 40
   *  @{param} freq {number} Frequency value, range: 0 to 22050
   */
  p5.EQ.prototype.modBand = function (band, vol, freq) {
    // this.bands[band].biquad.gain.value = vol;
    if (vol) {this.bands[band].gain.value = vol;}

    if (freq) {this.bands[band].frequency.value = freq;}
  };



  /**
   *  @{method} bandType Change the type of a band 
   *
   *  @{param} band {number} Band to be modified
   *  @{param} type {string} Type of filter, accepted inputs 
   *  are those of the Web Audio Node BiquadFilter: 
   *    "lowpass", "highpass", "bandpass", 
   *    "lowshelf", "highshelf", "peaking", "notch",
   *    "allpass". 
   */
  p5.EQ.prototype.bandType = function (band, type) {

    // this.bannds[band].setType(type);
    this.bands[band].type = type;

  };

  p5.EQ.prototype.dispose = function (argument) {
    Effect.prototype.dispose.apply(this);

    for (var i = 0; i<bands.length; i++){
      this.bands[i].disconnect();
      this.bands[i] = undefined;
    }
    delete this.bands;
   
  }

});
