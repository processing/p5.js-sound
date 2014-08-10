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

  return p5SOUND;

});