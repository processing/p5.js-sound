define(function (require) {

  'use strict';

  var p5SOUND = require('sndcore');
  require('master');
  require('helpers');
  require('soundfile');
  require('amplitude');
  require('fft');
  require('oscillator');
  require('pulse');
  require('noise');
  require('audioin');
  require('env');
  require('filter');
  require('delay');
  require('reverb');
  require('looper');
  require('soundRecorder');

  return p5SOUND;

});