define(function (require) {

  'use strict';

  var p5SOUND = require('sndcore');
  require('master');
  require('helpers');
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
  require('looper');
  require('soundRecorder');
  require('metro');

  return p5SOUND;

});