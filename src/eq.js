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
    _eqsize = _eqsize === 3 || _eqsize === 8 ? _eqsize : 3;

    var factor;
    _eqsize == 3 ? factor = Math.pow(2,3) : factor = 2;

    //bands are stored in an array, index 0 - 3 or 0 - 7
    this.bands = [];

    /**
      *  The p5.EQ is built with abstracted p5.Filter objects
      *  To modify any bands, use methods of the p5.Filter API
      *  @type {Object}  Web Audio Delay Node
      *
    */
    var freq, res;
    for (var i = 0; i < _eqsize; i++) {
      if (i === _eqsize - 1) {
        freq = 21000; 
        res = .01;
      } else if (i === 0) {
        freq = 100;
        res = .1;
      } 
      else if (i===1) {
        freq = _eqsize === 3 ? 360 * factor : 360;
        res = 1;
      }else {
        freq = this.bands[i-1].freq() * factor;
        res = 1;
      } 
      this.bands[i] = this._newBand(freq, res);
      if (i>0) {
        this.bands[i-1].biquad.connect(this.bands[i].biquad);
      } else {
        this.input.connect(this.bands[i].biquad);
      }
    }


    // this.bands[0] = this._newBand(0,.1);

    // this.input.connect(this.bands[0].biquad);
    // this.bands[_eqsize-1] = this._newBand(22050, .1);
    // for (var i = 1; i < _eqsize-1; i++) {
    //   this.bands[i] = this._newBand(344 * Math.pow(2, i-1), .1);
    //   this.bands[i-1].biquad.connect(this.bands[i].biquad);
    // }

    this.bands[_eqsize-1].biquad.connect(this.output);
  };
  p5.EQ.prototype = Object.create(Effect.prototype);


  p5.EQ.prototype.process = function (src) {
    src.connect(this.input);
  };

  /**
   * Add a new band. Creates a p5.Filter and strips away everything but 
   * the raw biquad filter
   * @param  {Number} freq 
   * @param  {Number} res  
   * @return {Obect}      [p5.Filter object]
   */
  p5.EQ.prototype._newBand = function(freq, res) {
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
   * This method adds a new band to the EQ's array of bands.
   * By default the method will set the new band to have a 
   * frequency of 20480 and a resonance of .1. These values can be modified
   * after the band is created.
   *
   * @method addBand
   * 
   */
  
  p5.EQ.prototype.addBand = function(freq, res) {
    if(typeof freq!=='number') {freq = 20480;}
    if(typeof res!=='number') {res = 0.1;}

      this.bands.push(this._newBand(freq, res));
    
  }

  p5.EQ.prototype.dispose = function () {
    Effect.prototype.dispose.apply(this);
    
    while (this.bands.length > 0) {
      delete this.bands.pop().biquad.disconnect();
    }
    delete this.bands;
  }

  return p5.EQ;

});
