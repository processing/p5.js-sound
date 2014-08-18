define(function (require) {
  'use strict';

  // inspiration for Signal: Tone.js 
  // https://github.com/TONEnoTONE/Tone.js/blob/master/Tone/signal/Signal.js

  var p5sound = require('master');

  var ac = p5sound.audiocontext;
  var generator = ac.createOscillator();
  var constant = ac.createWaveShaper();

  // generate the waveshaper table which outputs 1 for any input value
  (function() {
    var len = 8;
    var curve = new Float32Array(len);
    for (var i = 0; i < len; i++){
      // all inputs produce the output value of 1
      curve[i] = 1;
    }
    // assign constant waveshaper curve
    constant.curve = curve;
  })();

  generator.connect(constant);
  generator.start(0);
  generator.connect(p5.soundOut._silentNode); // noGC

  /**
   *  <p>p5.Signal is a constant audio-rate signal used by p5.Oscillator
   *  and p5.Envelope for modulation math.</p>
   *
   *  <p>This is necessary because Web Audio is processed on a seprate clock.
   *  For example, the p5 draw loop runs about 60 times per second. But
   *  the audio clock must process samples 44100 times per second. If we
   *  want to add a value to each of those samples, we can't do it in the
   *  draw loop, but we can do it by adding a constant-rate audio signal.</p.
   *  
   *  <p>This class and its children (<b>p5.SignalAdd</b>,
   *  <b>p5.SignalMultiply</b>, <b>p5.SignalScale</b>) mostly function
   *  behind the scenes in p5.sound.
   *  If you want to work directly with audio signals for modular
   *  synthesis, check out the source of this idea,
   *  <a href='http://bit.ly/1oIoEng' target=_'blank'>tone.js.</a></p>
   *
   *  @class  p5.Signal
   *  @constructor
   *  @example
   *  <div><code>
   *  function setup() {
   *    carrier = new p5.Oscillator('sine');
   *    carrier.amp(1); // set amplitude
   *    carrier.freq(220); // set frequency
   *    carrier.start(); // start oscillating
   *    
   *    modulator = new p5.Oscillator('sawtooth');
   *    modulator.disconnect();
   *    modulator.amp(1);
   *    modulator.freq(4);
   *    modulator.start();
   *
   *    // modulator's default amplitude range is -1 to 1.
   *    // Multiply it by -200, so the range is -200 to 200
   *    // then add 220 so the range is 20 to 420
   *    carrier.freq( modulator.mult(-200).add(220) );
   *  }
   *  </code></div>
   */
  p5.Signal = function(value) {
    // scales the constant output to desired output
    this.scalar = ac.createGain();
    this.scalar.gain.maxValue = 10000;
    this.scalar.gain.minValue = -10000;
    this.input = ac.createGain();
    this.input.gain.maxValue = 10000;
    this.input.gain.minValue = -10000;
    this.output = ac.createGain();
    this.output.gain.maxValue = 10000;
    this.output.gain.minValue = -10000;

    // the ratio of this value to the control signal
    this._syncRatio = 1;

    // connect the constant output to the scalar
    constant.connect(this.scalar);
    this.scalar.connect(this.output);

    // signal passes through
    this.input.connect(this.output);

    var value = value || 0;
    this.setValue(value);
  };

  /**
   *  Get the Signal Value. This is not currently working
   *  because of browser issues so it is not in the docs.
   *
   *  @return {Number} Signal value
   */
  p5.Signal.prototype.getValue = function() {
    return this.scalar.gain.value;
  }

  /**
   *  Set the value of a signal.
   *  
   *  @param {Number} value
   */
  p5.Signal.prototype.setValue = function(value) {
    if (typeof(value) === 'number') {
      if (this._syncRatio === 0){
        value = 0;
      } else {
        value *= this._syncRatio;
      }
      // this.scalar.gain.value = value;
      this.scalar.gain.setValueAtTime(value, ac.currentTime);
    } else {
      value.connect(this._syncRatio);
    }
  };

  /**
   *  setValueAtTime is similar to the Web Audio API AudioParam
   *  method of the same name.
   *  
   *  @param {Number} value Signal value
   *  @param {Number} time  time, in seconds from now
   */
  p5.Signal.prototype.setValueAtTime = function(value, time) {
    value *= this._syncRatio;
    var t = time || 0;
    this.scalar.gain.setValueAtTime(value, t);
  };

  p5.Signal.prototype.setCurrentValueNow = function(){
    var now = ac.currentTime;
    var currentVal = this.getValue();
    this.cancelScheduledValues(now);
    this.scalar.gain.linearRampToValueAtTime(currentVal, now);
    return currentVal;
  };

  p5.Signal.prototype.cancelScheduledValues = function(time) {
    var t = time || 0;
    this.scalar.gain.cancelScheduledValues(t);
  };

  p5.Signal.prototype.linearRampToValueAtTime = function(value, endTime) {
    var t = endTime || 0;
    value *= this._syncRatio;
    this.scalar.gain.linearRampToValueAtTime(value, t);
  };

  p5.Signal.prototype.exponentialRampToValueAtTime = function(value, endTime) {
    var t = endTime || 0;
    value *= this._syncRatio;
    this.scalar.gain.exponentialRampToValueAtTime(value, t);
  };

  /**
   *  Fade to value, for smooth transitions
   *
   *  @method  fade
   *  @param  {Number} value          Value to set this signal
   *  @param  {[Number]} secondsFromNow Length of fade, in seconds from now
   */
  p5.Signal.prototype.fade = function(value, secondsFromNow) {
    var s = secondsFromNow || 0;
    var t = ac.currentTime + s + 0.01;
    value *= this._syncRatio;
    this.scalar.gain.linearRampToValueAtTime(value, t);
  };

  p5.Signal.prototype.dispose = function() {
    // disconnect everything
    this.output.disconnect();
    this.scalar.disconnect();
    this.output = null;
    this.scalar = null;
  };

  /**
   *  Connect a p5.sound object or Web Audio node to this
   *  p5.Signal so that its amplitude values can be scaled.
   *  
   *  @method  setInput
   *  @param {Object} input
   */
  p5.Signal.prototype.setInput = function(_input) {
    _input.connect(this.input);
  };

  /**
   *  Connect a p5.Signal to an object, such a AudioParam
   *  
   *  @method connect
   *  @param  {Object} node An object that accepts a signal as input
   *                        such as a Web Audio API AudioParam
   */
  p5.Signal.prototype.connect = function(node) {
    // zero it out so that Signal can take control
    if (node instanceof p5.Signal) {
      node.setValue(0);
    }
    else if (node instanceof AudioParam) {
      node.setValueAtTime(0, ac.currentTime);
    }
    this.output.connect(node);
  };

  /**
   *  Disconnect the signal
   *
   *  @method disconnect
   *  @return {[type]} [description]
   */
  p5.Signal.prototype.disconnect = function() {
    this.output.disconnect(node);
  };

  // signals can add / mult / scale themselves

  /**
   *  Add a constant value to this audio signal,
   *  and return the resulting audio signal. Does
   *  not change the value of the original signal.
   *  
   *  @param {Number} number
   *  @return {p5.SignalAdd}
   */
  p5.Signal.prototype.add = function(num) {
    var add = new p5.SignalAdd(num);
    add.setInput(this);
    return add;
  };

  /**
   *  Multiply this signal by a constant value,
   *  and return the resulting audio signal. Does
   *  not change the value of the original signal.
   *  
   *  @param {Number} number to multiply
   *  @return {p5.SignalMult}
   */
  p5.Signal.prototype.mult = function(num) {
    var mult = new p5.SignalMult(num);
    mult.setInput(this);
    return mult;
  };

  /**
   *  Scale this signal value to a given range,
   *  and return the result as an audio signal. Does
   *  not change the value of the original signal.
   *  
   *  @param {Number} number to multiply
   *  @param  {Number} inMin  input range minumum
   *  @param  {Number} inMax  input range maximum
   *  @param  {Number} outMin input range minumum
   *  @param  {Number} outMax input range maximum
   *  @return {p5.SignalScale}
   */
  p5.Signal.prototype.scale = function(inMin, inMax, outMin, outMax) {
    var scale = new p5.SignalScale(inMin, inMax, outMin, outMax);
    scale.setInput(this);
    return scale;
  };

  // ======================== //
  // Signal Add, Mult & Scale //
  // ======================== //

 p5.SignalAdd = function(num) {
    var add = new p5.Signal(num);
    return add;
  };

  /**
   *  Multiply one signal by one constant value
   *  using setInput(signal), setValue(value).
   *  Or, multiply two signals together using
   *  setInput(signal), setValue(signal), 
   *
   *  @method  signalMult
   *  @param {[type]} num   [description]
   *  @param {[type]} input [description]
   *  @return {p5.SignalMult} Signal Returns the multiplied signal
   *                                 as a p5.SignalMult object
   */
  p5.SignalMult = function(num, _input) {
    var mult = new p5.Signal();
    mult.output = mult.input;
    mult.input.gain.maxValue = 10000;
    mult.input.gain.minValue = -10000;
    mult.setValue = function(value) {
      if (typeof(value) === 'number') {
        this.input.gain.value = value;
      } else {
        // multiply
        value.connect(this.input.gain);
      }
    }
    if (num){
      mult.setValue(num);
    }
    if (_input) {
      mult.setInput(_input);
    }
    return mult;
  };

  p5.SignalScale = function(inMin, inMax, outMin, outMax) {
    var scale = new p5.Signal();
    scale.scalar.disconnect();
    scale.input.disconnect();
    //if there are only two args
    if (arguments.length == 2){
      outMin = inMin;
      outMax = inMax;
      inMin = -1;
      inMax = 1;
    }
    scale._plusInput = new p5.SignalAdd( - inMin);
    scale._scale = new p5.SignalMult((outMax - outMin) / (inMax - inMin));
    scale._plusOutput = new p5.SignalAdd(outMin);
    // route
    scale._plusInput.setInput(scale.input);
    scale._scale.setInput(scale._plusInput.output);
    scale._plusOutput.setInput(scale._scale.output);
    scale._plusOutput.connect(scale.output);

    return scale;
  }

});