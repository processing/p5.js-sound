define(function (require) {
  'use strict';

  var p5sound = require('master');

   // Inspired by Simple Reverb by Jordan Santell
   // https://github.com/web-audio-components/simple-reverb/blob/master/index.js

  p5.Reverb = function(path, callback) {
    this.ac = getAudioContext();

    /**
     *  The p5.Reverb is built with a
     *  <a href="http://www.w3.org/TR/webaudio/#ConvolverNode">
     *  Web Audio Convolver Node</a>.
     *  
     *  @property convolver
     *  @type {Object}  Web Audio Convolver Node
     */
    this.convolver = this.ac.createConvolver();

    this.input = this.ac.createGain();
    this.output = this.ac.createGain();

    this.input.connect(this.convolver);
    this.convolver.connect(this.output);

    if (path) {
      this.load(path, callback);
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
   *  @param {Number} [rampTime] create a fade that lasts rampTime 
   *  @param {Number} [timeFromNow] schedule this event to happen
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

  p5.Reverb.prototype.convolve = function(ir, callback) {
    var self = this;
    loadSound(ir, function(soundfile) {
      self.convolver.buffer = soundfile.buffer;
      if (typeof(callback) !== 'undefined') {
        callback(self);
      }
    });
  };

  p5.prototype._registerPreloadFunc('loadReverb');

  p5.prototype.loadReverb = function(path, callback){
    // if loading locally without a server
    if (window.location.origin.indexOf('file://') > -1) {
      alert('This sketch may require a server to load external files. Please see http://bit.ly/1qcInwS');
    }
    var reverb = new p5.Reverb(path, callback);
    return reverb;
  };

  /**
   * via https://github.com/web-audio-components/simple-reverb/blob/master/index.js
   * Utility function for building an impulse response
   * from the module parameters.
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

  p5.Reverb.prototype.load = function(path, callback){
    var request = new XMLHttpRequest();
    request.open('GET', path, true);
    request.responseType = 'arraybuffer';
    // decode asyncrohonously
    var self = this;
    request.onload = function() {
      var ac = p5.prototype.getAudioContext();
      ac.decodeAudioData(request.response, function(buff) {
        self.convolver.buffer = buff;
        if (callback) {
          callback(self);
        }
      });
    };
    request.send();
  };

});