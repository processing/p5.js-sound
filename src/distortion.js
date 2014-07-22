define(function (require) {
  'use strict';

  var p5sound = require('master');

  p5.prototype.Distortion = function(amount) {
    var curve = makeDistortionCurve(amount);
    this.ws = p5sound.audiocontext.createWaveShaper();
    this.ws.curve = curve;
  };

  p5.prototype.Distortion.prototype.connect = function(unit) {
    if (!unit) {
       this.ws.connect(p5sound.input);
    }
    else if (unit.hasOwnProperty('input')){
      this.ws.connect(unit.input);
    }
    else {
      this.connect(unit);
    }
  };

  p5.prototype.Distortion.prototype.disconnect = function(unit){
    this.disconnect(unit);
  };

  // via http://stackoverflow.com/questions/22312841/waveshaper-node-in-webaudio-how-to-emulate-distortion
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

});