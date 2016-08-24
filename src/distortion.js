define(function (require) {
  'use strict';

  var p5sound = require('master');


  function makeDistortionCurve(amount) {
    var k = typeof amount === 'number' ? amount : 50,
      n_samples = 44100,
      curve = new Float32Array(n_samples),
      deg = Math.PI / 180,
      i = 0,
      x;
    for ( ; i < n_samples; ++i ) {
      x = i * 2 / n_samples - 1;
      curve[i] = ( 3 + k ) * x * 20 * deg / ( Math.PI + k * Math.abs(x) );
    }
    return curve;
  };

  /**
   * A waveshaper Distortion effect
   *
   * @class p5.Distortion
   * @constructor
   * @param {String} [waveShape='sine'] 'sine', 'triangle', 'sawtooth', or 'square'.
   * @param {String} [oversample='none'] 'none', '2x', or '4x'.
   *
   * @return {Object}   Distortion object
   */
  p5.Distortion = function(waveShape, oversample) {
    this.ac = p5sound.audiocontext;

    this.input = this.ac.createGain();
    this.output = this.ac.createGain();

    /**
     *  The p5.Filter is built with a
     *  <a href="http://www.w3.org/TR/webaudio/#WaveShaperNode">
     *  Web Audio WaveShaper Node</a>.
     *
     *  @property WaveShaperNode
     *  @type {Object}  AudioNode
     */
     this.waveShaper = this.ac.createWaveShaper();

     // TODO: Make some waveshape presets
     this.waveShaper.curve = makeDistortionCurve(400);
     this.waveShaper.oversample = oversample;

     this.input.connect(this.waveShaper);
     this.waveShaper.connect(this.output);

     this.connect();

     if (waveShape) {
       this.setType(waveShape);
     }
     if (oversample) {
       this.setOversample(oversample);
     }

     // add to the soundArray
     p5sound.soundArray.push(this);
  }

  /**
   * Set the waveform type of the waveshaper. Types include:
   * 'sine' (default), 'triangle', 'sawtooh', 'square'.
   *
   * @method setType
   * @param {String}
   */
  /*
  p5.prototype.setType = function(waveShape) {

    this.curve =
  }
  */

  /**
   *  Send output to a p5.sound or web audio object
   *
   *  @method connect
   *  @param  {Object} unit
   */
  p5.Distortion.prototype.connect = function(unit) {
    var u = unit || p5.soundOut.input;
    this.output.connect(u);
  };

  /**
   *  Disconnect all output.
   *
   *  @method disconnect
   */
  p5.Distortion.prototype.disconnect = function() {
    this.output.disconnect();
  };
});
