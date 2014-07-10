define(function (require) {

  'use strict';

  var p5SOUND = require('sndcore');
  
  require('master');
  require('global');
  require('soundfile');
  require('amplitude');
  require('fft');
  require('oscillator');
  require('pulse');
  require('lfo');
  require('noise');
  require('audioin');
  require('env');


  return p5;

});