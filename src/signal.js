'use strict';

define(function (require) {

  // Signal is built with the Tone.js signal by Yotam Mann
  // https://github.com/TONEnoTONE/Tone.js/
  var Signal = require('Tone/signal/Signal');
  var Add = require('Tone/signal/Add');
  var Mult = require('Tone/signal/Multiply');
  var Scale = require('Tone/signal/Scale');

  var Tone = require('Tone/core/Tone');
  var p5sound = require('master');
  Tone.setContext( p5sound.audiocontext);

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
   *  <p>This class mostly functions behind the scenes in p5.sound, and returns
   *  a Tone.Signal from the Tone.js library by Yotam Mann.
   *  If you want to work directly with audio signals for modular
   *  synthesis, check out
   *  <a href='http://bit.ly/1oIoEng' target=_'blank'>tone.js.</a></p>
   *
   *  @class  p5.Signal
   *  @constructor
   *  @return {Tone.Signal} A Signal object from the Tone.js library
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
   *    // Modulator's default amplitude range is -1 to 1.
   *    // Multiply it by -200, so the range is -200 to 200
   *    // then add 220 so the range is 20 to 420
   *    carrier.freq( modulator.mult(-200).add(220) );
   *  }
   *  </code></div>
   */
  p5.Signal = function(value) {
    var s = new Signal(value);
    // p5sound.soundArray.push(s);
    return s; // TODO: is this really a constructor?
  };

  /**
   *  Fade to value, for smooth transitions
   *
   *  @method  fade
   *  @param  {Number} value          Value to set this signal
   *  @param  {Number} [secondsFromNow] Length of fade, in seconds from now
   */
  Signal.prototype.fade = Signal.prototype.linearRampToValueAtTime;
  Mult.prototype.fade =   Signal.prototype.fade;
  Add.prototype.fade =   Signal.prototype.fade;
  Scale.prototype.fade =   Signal.prototype.fade;


  /**
   *  Connect a p5.sound object or Web Audio node to this
   *  p5.Signal so that its amplitude values can be scaled.
   *
   *  @param {Object} input
   */
  Signal.prototype.setInput = function(_input) {
    _input.connect(this);
  };
  Mult.prototype.setInput =   Signal.prototype.setInput;
  Add.prototype.setInput =   Signal.prototype.setInput;
  Scale.prototype.setInput =   Signal.prototype.setInput;


  // signals can add / mult / scale themselves

  /**
   *  Add a constant value to this audio signal,
   *  and return the resulting audio signal. Does
   *  not change the value of the original signal,
   *  instead it returns a new p5.SignalAdd.
   *
   *  @method  add
   *  @param {Number} number
   *  @return {p5.SignalAdd} object
   */
  Signal.prototype.add = function(num) {
    var add = new Add(num);
    // add.setInput(this);
    this.connect(add);
    return add;
  };
  Mult.prototype.add =   Signal.prototype.add;
  Add.prototype.add =   Signal.prototype.add;
  Scale.prototype.add =   Signal.prototype.add;

  /**
   *  Multiply this signal by a constant value,
   *  and return the resulting audio signal. Does
   *  not change the value of the original signal,
   *  instead it returns a new p5.SignalMult.
   *
   *  @method  mult
   *  @param {Number} number to multiply
   *  @return {Tone.Multiply} object
   */
  Signal.prototype.mult = function(num) {
    var mult = new Mult(num);
    // mult.setInput(this);
    this.connect(mult);
    return mult;
  };
  Mult.prototype.mult =   Signal.prototype.mult;
  Add.prototype.mult =   Signal.prototype.mult;
  Scale.prototype.mult =   Signal.prototype.mult;

  /**
   *  Scale this signal value to a given range,
   *  and return the result as an audio signal. Does
   *  not change the value of the original signal,
   *  instead it returns a new p5.SignalScale.
   *
   *  @method  scale
   *  @param {Number} number to multiply
   *  @param  {Number} inMin  input range minumum
   *  @param  {Number} inMax  input range maximum
   *  @param  {Number} outMin input range minumum
   *  @param  {Number} outMax input range maximum
   *  @return {p5.SignalScale} object
   */
  Signal.prototype.scale = function(inMin, inMax, outMin, outMax) {
    var mapOutMin, mapOutMax;
    if (arguments.length === 4) {
      mapOutMin = p5.prototype.map(outMin, inMin, inMax, 0, 1) - 0.5;
      mapOutMax = p5.prototype.map(outMax, inMin, inMax, 0, 1) - 0.5;
    }
    else {
      mapOutMin = arguments[0];
      mapOutMax = arguments[1];
    }
    var scale = new Scale(mapOutMin, mapOutMax);
    this.connect(scale);
    return scale;
  };
  Mult.prototype.scale =   Signal.prototype.scale;
  Add.prototype.scale =   Signal.prototype.scale;
  Scale.prototype.scale =   Signal.prototype.scale;
});
