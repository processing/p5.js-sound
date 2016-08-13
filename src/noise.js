define(function (require) {
  'use strict';

  var p5sound = require('master');

  /**
   *  Noise is a type of oscillator that generates a buffer with random values.
   *
   *  @class p5.Noise
   *  @constructor
   *  @param {String} type Type of noise can be 'white' (default),
   *                       'brown' or 'pink'.
   *  @return {Object}    Noise Object
   */
  p5.Noise = function(type){
    var assignType;
    p5.Oscillator.call(this);
    delete this.f;
    delete this.freq;
    delete this.oscillator;

    if (type === "brown") {
      assignType = _brownNoise;
    } else if (type === "pink") {
      assignType = _pinkNoise;
    } else {
      assignType = _whiteNoise;
    }
    this.buffer = assignType;    
  };

  p5.Noise.prototype = Object.create(p5.Oscillator.prototype);

  // generate noise buffers
  var _whiteNoise = (function() {
    var bufferSize = 2 * p5sound.audiocontext.sampleRate;
    var whiteBuffer = p5sound.audiocontext.createBuffer(1, bufferSize, p5sound.audiocontext.sampleRate);
    var noiseData = whiteBuffer.getChannelData(0);
    for (var i = 0; i < bufferSize; i++) {
      noiseData[i] = Math.random() * 2 - 1;
    }
    whiteBuffer.type = 'white';
    return whiteBuffer;
  }());

  var _pinkNoise = (function() {
    var bufferSize = 2 * p5sound.audiocontext.sampleRate;
    var pinkBuffer = p5sound.audiocontext.createBuffer(1, bufferSize, p5sound.audiocontext.sampleRate);
    var noiseData = pinkBuffer.getChannelData(0);
    var b0, b1, b2, b3, b4, b5, b6;
    b0 = b1 = b2 = b3 = b4 = b5 = b6 = 0.0;
    for (var i = 0; i < bufferSize; i++) {
      var white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      noiseData[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      noiseData[i] *= 0.11; // (roughly) compensate for gain
      b6 = white * 0.115926;
    }
    pinkBuffer.type = 'pink';
    return pinkBuffer;
  }());

  var _brownNoise = (function() {
    var bufferSize = 2 * p5sound.audiocontext.sampleRate;
    var brownBuffer = p5sound.audiocontext.createBuffer(1, bufferSize, p5sound.audiocontext.sampleRate);
    var noiseData = brownBuffer.getChannelData(0);
    var lastOut = 0.0;
    for (var i = 0; i< bufferSize; i++){
      var white = Math.random() * 2 - 1;
      noiseData[i] = (lastOut + (0.02*white)) / 1.02;
      lastOut = noiseData[i];
      noiseData[i] *= 3.5;
    }
    brownBuffer.type = 'brown';
    return brownBuffer;
  }());

  /**
   *  Set type of noise to 'white', 'pink' or 'brown'.
   *  White is the default.
   *
   *  @method setType
   *  @param {String} [type] 'white', 'pink' or 'brown'
   */
  p5.Noise.prototype.setType = function(type) {
    switch(type){
      case 'white':
        this.buffer = _whiteNoise;
        break;
      case 'pink':
        this.buffer = _pinkNoise;
        break;
      case 'brown':
        this.buffer = _brownNoise;
        break;
      default:
        this.buffer = _whiteNoise;
    }
    if (this.started){
      var now = p5sound.audiocontext.currentTime;
      this.stop(now);
      this.start(now+.01);
    }
  };

  p5.Noise.prototype.getType = function(){
    return this.buffer.type;
  };

  /**
   *  Start the noise
   *
   *  @method start
   */
  p5.Noise.prototype.start = function() {
    if (this.started){
      this.stop();
    }
    this.noise = p5sound.audiocontext.createBufferSource();
    this.noise.buffer = this.buffer;
    this.noise.loop = true;
    this.noise.connect(this.output);
    var now = p5sound.audiocontext.currentTime;
    this.noise.start(now);
    this.started = true;
  };

  /**
   *  Stop the noise.
   *
   *  @method  stop
   */
  p5.Noise.prototype.stop = function() {
    var now = p5sound.audiocontext.currentTime;
    if (this.noise) {
      this.noise.stop(now);
      this.started = false;
    }
  };

  /**
   *  Pan the noise.
   *
   *  @method  pan
   *  @param  {Number} panning Number between -1 (left)
   *                           and 1 (right)
   *  @param  {Number} timeFromNow schedule this event to happen
   *                                seconds from now
   */

  /**
   *  Set the amplitude of the noise between 0 and 1.0. Or,
   *  modulate amplitude with an audio signal such as an oscillator.
   *
   *  @param  {Number|Object} volume amplitude between 0 and 1.0
   *                                     or modulating signal/oscillator
   *  @param {Number} [rampTime] create a fade that lasts rampTime
   *  @param {Number} [timeFromNow] schedule this event to happen
   *                                seconds from now
   */

  /**
   *  Send output to a p5.sound or web audio object
   *
   *  @method  connect
   *  @param  {Object} unit
   */

  /**
   *  Disconnect all output.
   *
   *  @method disconnect
   */

  p5.Noise.prototype.dispose = function(){
    var now = p5sound.audiocontext.currentTime;

    // remove reference from soundArray
    var index = p5sound.soundArray.indexOf(this);
    p5sound.soundArray.splice(index, 1);

    if (this.noise) {
      this.noise.disconnect();
      this.stop(now);
    }
    if (this.output) {
      this.output.disconnect();
    }
    if (this.panner) {
      this.panner.disconnect();
    }
    this.output = null;
    this.panner = null;
    this.buffer = null;
    this.noise = null;
  };

});
