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
   *  p5.Signal is a constant audio-rate signal.
   *  
   *  Used by p5.Oscillator and p5.Envelope for modulation math.
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

  p5.Signal.prototype.getValue = function() {
    return this.scalar.gain.value;
  }

  p5.Signal.prototype.setValue = function(value) {
    if (typeof(value) === 'number') {
      if (this._syncRatio === 0){
        value = 0;
      } else {
        value *= this._syncRatio;
      }
      console.log('value: ' + value);
      // this.scalar.gain.value = value;
      this.scalar.gain.setValueAtTime(value, ac.currentTime + 0.01);
    } else {
      value.connect(this._syncRatio);
    }
  };

  p5.Signal.prototype.setValueAtTime = function(value, time) {
    value *= this._syncRatio;
    console.log(ac.currentTime);
    var t = time || 0;
    this.scalar.gain.setValueAtTime(value, t + 0.01);
  };

  p5.Signal.prototype.setCurrentValueNow = function(){
    var now = ac.currentTime + 0.01;
    var currentVal = this.getValue();
    this.cancelScheduledValues(now);
    this.scalar.gain.setValueAtTime(currentVal, now);
    return currentVal;
  };

  p5.Signal.prototype.cancelScheduledValues = function(time) {
    var t = time || 0;
    this.scalar.gain.cancelScheduledValues(t + 0.01);
  };

  p5.Signal.prototype.linearRampToValueAtTime = function(value, endTime) {
    var t = endTime || 0;
    value *= this._syncRatio;
    this.scalar.gain.linearRampToValueAtTime(value, t + 0.01);
  };

  p5.Signal.prototype.exponentialRampToValueAtTime = function(value, endTime) {
    var t = endTime || 0;
    value *= this._syncRatio;
    this.scalar.gain.exponentialRampToValueAtTime(value, t + 0.01);
  };

  p5.Signal.prototype.dispose = function() {
    // disconnect everything
    this.output.disconnect();
    this.scalar.disconnect();
    this.output = null;
    this.scalar = null;
  };

  p5.Signal.prototype.connect = function(node) {
    // zero it out so that Signal can take control
    if (node instanceof p5.Signal) {
      node.setValue(0);
    } else if (node.output instanceof AudioParam) {
      node.setValueAtTime(0, ac.currentTime);
      console.log('yea');
    }
    this.output.connect(node);
  };

  p5.Signal.prototype.disconnect = function() {
    this.output.disconnect(node);
  };

  // signals can add / mult / scale themselves

  p5.Signal.prototype.add = function(num) {
    var add = new p5.SignalAdd(num);
    add.setInput(this);
    return add;
  };

  p5.Signal.prototype.mult = function(num) {
    var mult = new p5.SignalMult(num);
    mult.setInput(this);
    return mult;
  };

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
    add.setInput = function(input) {
      input.connect(add.input);
    };
    return add;
  };

  p5.SignalMult = function(num, input) {
    var mult = new p5.Signal();
    mult.output = mult.input;
    mult.input.gain.maxValue = 10000;
    mult.input.gain.minValue = -10000;
    // mult.scalar.disconnect();
    // mult.scalar = null;
    mult.input.gain.value = num;
    mult.setInput = function(input) {
      input.connect(mult.input);
    };
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

    scale.setInput = function(input) {
      input.connect(scale.input);
    };

    return scale;
  }

});