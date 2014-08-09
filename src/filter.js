define(function (require) {
  'use strict';

  var p5sound = require('master');

  /**
   *  A p5.Filter uses a Web Audio Biquad Filter to filter
   *  the frequency response of an input source. Inheriting
   *  classes include:<br/>
   *  * <code>p5.LowPass</code> - allows frequencies below
   *  the cutoff frequency to pass through, and attenuates
   *  frequencies above the cutoff.<br/>
   *  * <code>p5.HighPass</code> - the opposite of a lowpass
   *  filter. <br/>
   *  * <code>p5.BandPass</code> -  allows a range of
   *  frequencies to pass through and attenuates the frequencies
   *  below and above this frequency range.<br/>
   *
   *  The <code>.res()</code> method controls either width of the
   *  bandpass, or resonance of the low/highpass cutoff frequency.
   *
   *  @class p5.Filter
   *  @constructor
   *  @param {[String]} type 'lowpass' (default), 'highpass', 'bandpass'
   *  @return {Object} p5.Filter
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
   *  }
   *  </code></div>
   */
  p5.Filter = function(type) {
    this.ac = p5sound.audiocontext;

    this.input = this.ac.createGain();
    this.output = this.ac.createGain();

    this.biquad = this.ac.createBiquadFilter();

    this.input.connect(this.biquad);
    this.biquad.connect(this.output);

    this.connect();
    this.setType(type);
  };

  /**
   *  Filter an audio signal according to a set
   *  of filter parameters.
   *  
   *  @method  process
   *  @param  {Object} Signal  An object that outputs audio
   *  @param {[Number]} freq Frequency in Hz, from 10 to 22050
   *  @param {[Number]} res Resonance/Width of the filter frequency
   *                        from 0.001 to 1000
   */
  p5.Filter.prototype.process = function(src, freq, res) {
    src.connect(this.input);
    this.set(freq, res);
  };

  /**
   *  Set the frequency and the resonance of the filter.
   *
   *  @method  set
   *  @param {Number} freq Frequency in Hz, from 10 to 22050
   *  @param {Number} res  Resonance (Q) from 0.001 to 1000
   */
  p5.Filter.prototype.set = function(freq, res) {
    if (freq) {
      this.freq(freq);
    }
    if (res) {
      this.res(res);
    }
  };

  /**
   *  Set the filter frequency, in Hz, from 10 to 22050 (the range of
   *  human hearing, although in reality most people hear in a narrower
   *  range).
   *
   *  @method  freq
   *  @param  {[Number]} freq Filter Frequency
   *  @return {Number} value  Returns the current frequency value
   */
  p5.Filter.prototype.freq = function(freq) {
    var self = this;
    if (typeof(freq) === 'number'){
      self.biquad.frequency.value = freq;
      self.biquad.frequency.cancelScheduledValues(this.ac.currentTime +.01);
      self.biquad.frequency.setValueAtTime(freq, this.ac.currentTime + .02);
    } else if (freq) {
      freq.connect(this.biquad.frequency);
    }
    return self.biquad.frequency.value;
  };

  /**
   *  Controls either width of a bandpass frequency,
   *  or the resonance of a low/highpass cutoff frequency.
   *
   *  @method  res
   *  @param {Number} res  Resonance/Width of filter freq
   *                       from 0.001 to 1000
   *  @return {Number} value Returns the current res value
   */
  p5.Filter.prototype.res = function(res) {
    var self = this;
    if (typeof(res) == 'number'){
      self.biquad.Q.value = res;
      self.biquad.Q.cancelScheduledValues(self.ac.currentTime + .01);
      self.biquad.Q.setValueAtTime(res, self.ac.currentTime + .02);
    } else if (res) {
      freq.connect(this.biquad.Q);
    }
    return self.biquad.Q.value;
  };

  /**
   *  Set the type of a p5.Filter. Possible types include: 
   *  "lowpass" (default), "highpass", "bandpass", 
   *  "lowshelf", "highshelf", "peaking", "notch",
   *  "allpass". 
   *  
   *  @method  setType
   *  @param {String}
   */
  p5.Filter.prototype.setType = function(t) {
    this.biquad.type = t;
  };

  /**
   *  Set the output level of the filter.
   *  
   *  @method  amp
   *  @param {Number} volume amplitude between 0 and 1.0
   *  @param {Number} [rampTime] create a fade that lasts rampTime 
   *  @param {Number} [timeFromNow] schedule this event to happen
   *                                seconds from now
   */
  p5.Filter.prototype.amp = function(vol, rampTime, tFromNow){
    var rampTime = rampTime || 0;
    var tFromNow = tFromNow || 0;
    var now = p5sound.audiocontext.currentTime;
    var currentVol = this.output.gain.value;
    this.output.gain.cancelScheduledValues(now);
    this.output.gain.linearRampToValueAtTime(currentVol, now + tFromNow + .001);
    this.output.gain.linearRampToValueAtTime(vol, now + tFromNow + rampTime + .001);
  };

  /**
   *  Send output to a p5.sound or web audio object
   *  
   *  @method connect
   *  @param  {Object} unit
   */
  p5.Filter.prototype.connect = function(unit) {
    var u = unit || p5.soundOut.input;
    this.output.connect(u);
  };

  /**
   *  Disconnect all output.
   *  
   *  @method disconnect
   */
  p5.Filter.prototype.disconnect = function() {
    this.output.disconnect();
  };

  /**
   *  Constructor: <code>new p5.LowPass()</code> Filter.
   *  This is the same as creating a p5.Filter and then calling
   *  its method <code>setType('lowpass')</code>.
   *  See p5.Filter for methods.
   *  
   *  @method p5.LowPass
   */
  p5.LowPass = function() {
    p5.Filter.call(this, 'lowpass');
  };
  p5.LowPass.prototype = Object.create(p5.Filter.prototype);

  /**
   *  Constructor: <code>new p5.HighPass()</code> Filter.
   *  This is the same as creating a p5.Filter and then calling
   *  its method <code>setType('highpass')</code>.
   *  See p5.Filter for methods.
   *  
   *  @method p5.HighPass
   */
  p5.HighPass = function() {
    p5.Filter.call(this, 'highpass');
  };
  p5.HighPass.prototype = Object.create(p5.Filter.prototype);

  /**
   *  Constructor: <code>new p5.BandPass()</code> Filter.
   *  This is the same as creating a p5.Filter and then calling
   *  its method <code>setType('bandpass')</code>.
   *  See p5.Filter for methods. 
   *  
   *  @method p5.BandPass
   */
  p5.BandPass = function() {
    p5.Filter.call(this, 'bandpass');
  };
  p5.BandPass.prototype = Object.create(p5.Filter.prototype);

});