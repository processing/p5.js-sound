define(function (require) {

  'use strict';

  var p5SOUND = require('sndcore');
  require('master');
  require('helpers');
  require('errorHandler');
  require('panner');
  require('soundfile');
  require('amplitude');
  require('fft');
  require('signal');
  require('oscillator');
  require('env');
  require('pulse');
  require('noise');
  require('audioin');
  require('filter');
  require('delay');
  require('reverb');
  require('metro');
  require('looper');
  require('soundRecorder');
  require('peakdetect');
  require('gain');
  require('distortion');

  return p5SOUND;

});
