define(function (require) {
  'use strict';

  var p5Sound = require('master');
  var Effect = require('effect');
  var Filter = require('filter');

  /**
   * p5.EQ is an audio effect that performs the function of a multiband
   * audio equalizer. Equalization is used to adjust the balance of 
   * frequency compoenents of an audio signal. This process is commonly used
   * in sound production and recording to change the waveform before it reaches
   * a sound output device. EQ can also be used as an audio effect to create
   * interesting distortions by filtering out parts of the spectrum. p5.EQ is
   * built using a chain of Web Audio Biquad Filter Nodes and can be
   * instantiated with 3 or 8 bands. Bands can be added or removed from
   * the EQ by directly modifying p5.EQ.bands (the array that stores filters).
   *  
   * @class p5.EQ
   * @constructor
   * @param {Number} [_eqsize] [Constructor will accept 3 or 8, defaults to 3]
   * @return {Object} [p5.EQ object]
   *
   * @example
   * <div><code>
   * 
   * </code></div>
   */
  p5.EQ = function(_eqsize) {
    Effect.call(this);

    //p5.EQ can be of size (3) or (8), defaults to 3
    _eqsize = _eqsize == 3 || _eqsize == 8 ? _eqsize : 3;

    var factor;
    _eqsize == 3 ? factor = Math.pow(2,4) : factor = 2;

    //bands are stored in an array, index 0 - 3 or 0 - 7
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

    var freq, res;
    for (var i = 0; i < _eqsize; i++) {

      if (i == _eqsize - 1) {
        freq = 20480; 
        res = .1;
      } else if (i == 0) {
        freq = 160;
        res = .1;
      } else {
        freq = this.bands[i-1].freq * factor;
        res = .9;
      } 
      this.bands[i] = this.newBand(freq, res);
      if (i>0) {
        this.bands[i-1].biquad.connect(this.bands[i].biquad);
      } else {
        this.input.connect(this.bands[i].biquad);
      }
    }
    //this.input.connect(this.bands[0]);
    this.bands[_eqsize-1].biquad.connect(this.output);
  };
  p5.EQ.prototype = Object.create(Effect.prototype);


  p5.EQ.prototype.process = function (src) {
    src.connect(this.input);
  };


  p5.EQ.prototype.newBand = function(freq, res) {
    var newFilter = new Filter('peaking');
    newFilter.disconnect();
    newFilter.set(freq, res);
    newFilter.biquad.gain.value = 0;
    delete newFilter.input;
    delete newFilter.output;
    delete newFilter._drywet;
    delete newFilter.wet;
    return newFilter;
  }
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
    } else if (option === "type") { 
      this.bandType(band, param1); 
    } else {
      return new Error();
    }
  };

  /**
   *  @{method} toggleBand Switch a band on or off
   *
   *  @{param} band {number} Band to be modified
   */
  p5.EQ.prototype.toggleBand = function (band) {

    this.bands[band].toggle = !this.bands[band].toggle;
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

    if (vol!= null) {this.bands[band].gain.value = vol;}
    if (freq!= null) {this.bands[band].frequency.value = freq;}
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
    this.bands[band].type = type;
  };

  p5.EQ.prototype.dispose = function (argument) {
    Effect.prototype.dispose.apply(this);

    for (var i = 0; i<this.bands.length; i++){
      this.bands[i].disconnect();
      this.bands[i] = undefined;
    }
  }

});
