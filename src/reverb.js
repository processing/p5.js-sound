define(function (require) {
  'use strict';

  var p5sound = require('master');

  p5.Reverb = function(path, callback) {
    this.ac = getAudioContext();

    /**
     *  p5.Reverb and p5.ConvolutionReverb are built with a
     *  <a href="http://www.w3.org/TR/webaudio/#ConvolverNode">
     *  Web Audio Convolver Node</a>.
     *  
     *  @property convolver
     *  @type {Object}  Web Audio Convolver Node
     */
    this.convolver = this.ac.createConvolver();

    this.input = this.ac.createGain();
    this.output = this.ac.createGain();

    // otherwise, Safari distorts
    this.input.gain.value = 0.5;

    this.input.connect(this.convolver);
    this.convolver.connect(this.output);

    if (path) {
      this.impulses = [];
      this._loadBuffer(path, callback);
    }
    else {
      // parameters
      this._seconds = 3;
      this._decay = 2;
      this._reverse = false;

      this._buildImpulse();
    }
    this.connect();
  };

  /**
   *  [process description]
   *  @param  {[type]} src     [description]
   *  @param  {[type]} seconds [description]
   *  @param  {[type]} decay   [description]
   *  @param  {[type]} reverse [description]
   *  @return {[type]}         [description]
   */
  p5.Reverb.prototype.process = function(src, seconds, decay, reverse) {
    src.connect(this.input);
    var rebuild = false;
    if (seconds) {
      this._seconds = seconds;
      rebuild = true;
    }
    if (decay) {
      this._decay = decay;
    }
    if (reverse) {
      this._reverse = reverse;
    }
    if (rebuild) {
      this._buildImpulse();
    }
  };

  p5.Reverb.prototype.set = function(seconds, decay, reverse) {
    this._seconds = seconds;
    this._decay = decay;
    this._reverse = reverse;
    this._buildImpulse();
  };

  /**
   *  Set the output level of the delay effect.
   *  
   *  @method  amp
   *  @param  {Number} volume amplitude between 0 and 1.0
   *  @param  {Number} [rampTime] create a fade that lasts rampTime 
   *  @param  {Number} [timeFromNow] schedule this event to happen
   *                                seconds from now
   */
  p5.Reverb.prototype.amp = function(vol, rampTime, tFromNow) {
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
   *  @method  connect
   *  @param  {Object} unit
   */
  p5.Reverb.prototype.connect = function(unit) {
    var u = unit || p5.soundOut.input;
    this.output.connect(u.input ? u.input : u);
  };

  /**
   *  Disconnect all output.
   *  
   *  @method disconnect
   */
  p5.Reverb.prototype.disconnect = function() {
    this.output.disconnect();
  };

  /**
   *  Inspired by Simple Reverb by Jordan Santell
   *  https://github.com/web-audio-components/simple-reverb/blob/master/index.js
   * 
   *  Utility function for building an impulse response
   *  based on the module parameters.
   *
   *  @method  _buildImpulse
   *  @private
   */
  p5.Reverb.prototype._buildImpulse = function() {
    var rate = this.ac.sampleRate;
    var length = rate*this._seconds;
    var decay = this._decay;
    var impulse = this.ac.createBuffer(2, length, rate);
    var impulseL = impulse.getChannelData(0);
    var impulseR = impulse.getChannelData(1);
    var n, i;
    for (i = 0; i < length; i++) {
      n = this.reverse ? length - i : i;
      impulseL[i] = (Math.random() * 2 - 1) * Math.pow(1 - n / length, decay);
      impulseR[i] = (Math.random() * 2 - 1) * Math.pow(1 - n / length, decay);
    }
    this.convolver.buffer = impulse;
  };

  p5.Reverb.prototype._loadBuffer = function(path, callback){
    var request = new XMLHttpRequest();
    request.open('GET', path, true);
    request.responseType = 'arraybuffer';
    // decode asyncrohonously
    var self = this;
    request.onload = function() {
      var ac = p5.prototype.getAudioContext();
      ac.decodeAudioData(request.response, function(buff) {
        var buffer = {};
        var chunks = path.split('/');
        buffer.name = chunks[chunks.length - 1];
        buffer.audioBuffer = buff;
        console.log(self.impulses);
        self.impulses.push(buffer);
        self.convolver.buffer = buffer.audioBuffer;
        if (callback) {
          callback(buffer);
        }
      });
    };
    request.send();
  };


  // CONVOLUTION

  /**
   *  p5.ConvolutionReverb extends p5.Reverb. It can emulate the sound of real
   *  physical spaces through a process called <a href="
   *  https://en.wikipedia.org/wiki/Convolution_reverb#Real_space_simulation">
   *  convolution</a>. 
   *  
   *  Convolution multiplies any audio input by an "impulse response"
   *  to simulate the dispersion of sound over time. The impulse response is
   *  generated from an audio file that you provide. One way to
   *  generate an impulse response is to pop a balloon in a reverberant space
   *  and record the echo. Convolution can also be used to experiment with sound.
   *
   *  Use the method createReverb(path) to instantiate a p5.ConvolutionReverb.
   *  
   *  @param {[type]}   path     [description]
   *  @param {Function} callback [description]
   */
  p5.ConvolutionReverb = function(path, callback) {
    p5.Reverb.call(this, path, callback);
  };

  p5.ConvolutionReverb.prototype = Object.create(p5.Reverb.prototype);

  p5.ConvolutionReverb.prototype.set = null;

  p5.ConvolutionReverb.prototype.process = function(src) {
    src.connect(this.input);
  };

  /**
   *  Buffers is an Array of Objects which contain an AudioBuffer
   *  and a Name that corresponds with the original filename.
   *  
   *  @property impulses
   *  @type {Array} Array of Web Audio Buffers
   */
  p5.ConvolutionReverb.prototype.impulses = [];

  /**
   *  Add an Impulse Response to a convolution reverb
   *  
   *  @param {[type]}   reverb   [description]
   *  @param {[type]}   path     [description]
   *  @param {Function} callback [description]
   */
  p5.ConvolutionReverb.prototype.addImpulse = function(path, callback){
    // if loading locally without a server
    if (window.location.origin.indexOf('file://') > -1) {
      alert('This sketch may require a server to load external files. Please see http://bit.ly/1qcInwS');
    }
    this._loadBuffer(path, callback);
  };

  /**
   *  Clear the impulses
   *
   *  @method  resetImpulse
   *  @param  {[type]}   path     [description]
   *  @param  {Function} callback [description]
   *  @return {[type]}            [description]
   */
  p5.ConvolutionReverb.prototype.resetImpulse = function(path, callback){
    // if loading locally without a server
    if (window.location.origin.indexOf('file://') > -1) {
      alert('This sketch may require a server to load external files. Please see http://bit.ly/1qcInwS');
    }
    this.impulses = [];
    this._loadBuffer(path, callback);
  };

  p5.ConvolutionReverb.prototype.setImpulse = function(id){
    if (typeof(id) === 'number' && id < this.impulses.length) {
      this.convolver.buffer = this.impulses[id].audioBuffer;
    }
    if (typeof(id) === 'string') {
      for (var i = 0; i < this.impulses.length; i++){
        if (this.impulses[i].name === id) {
          this.convolver.buffer = this.impulses[i].audioBuffer;
          break;
        }
      }
    }
  };

  p5.prototype._registerPreloadFunc('createConvolution');

  /**
   *  Load a soundfile and use it as an impulse response
   *  to create a convolution reverb effect.
   *
   *  @method  createConvolution
   *  @param  {String}   path     path to a sound file
   *  @param  {Function} callback [description]
   *  @return {p5.ConvolutionReverb}
   */
  p5.prototype.createConvolution = function(path, callback){
    // if loading locally without a server
    if (window.location.origin.indexOf('file://') > -1) {
      alert('This sketch may require a server to load external files. Please see http://bit.ly/1qcInwS');
    }
    var cReverb = new p5.ConvolutionReverb(path, callback);
    cReverb.impulses = [];
    return cReverb;
  };

});