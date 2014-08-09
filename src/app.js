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
  require('delay');
  require('filter');

  return p5SOUND;

});