'use strict';

define(function (require) {

  require('audioworklet-polyfill');
  require('shims');
  require('audiocontext');
  var p5SOUND = require('master');
  require('helpers');
  require('errorHandler');
  require('audioWorklet');
  require('panner');
  require('soundfile');
  require('amplitude');
  require('fft');
  require('signal');
  require('oscillator');
  require('envelope');
  require('pulse');
  require('noise');
  require('audioin');
  require('filter');
  require('eq');
  require('panner3d');
  require('listener3d');
  require('delay');
  require('reverb');
  require('metro');
  require('looper');
  require('soundLoop');
  require('compressor');
  require('soundRecorder');
  require('peakDetect');
  require('gain');
  require('monosynth');
  require('polysynth');
  require('distortion');
  require('audioVoice');
  require('monosynth');
  require('polysynth');

  return p5SOUND;

});
