define(function (require)) {
  'use strict';

  var p5Sound = require('master');
  var Effect = require('effect');


  p5.EQ = function() {
    Effect.call(this);

    this._eqIn = this.ac.createGain();
    this._eqOut = this.ac.createGain();

    this.one = this.ac.createBiquadFilter();
    this.one.setType('bandpass');

    this.two = this.ac.createBiquadFilter();
    this.two.setType('bandpass');

    this.three = this.ac.createBiquadFilter();
    this.three.setType('bandpass');

    this.four = this.ac.createBiquadFilter();
    this.four.setType('bandpass');

    this.five = this.ac.createBiquadFilter();
    this.five.setType('bandpass');

    this.six = this.ac.createBiquadFilter();
    this.six.setType('bandpass');

    this.seven = this.ac.createBiquadFilter();
    this.seven.setType('bandpass');

    this.eight = this.ac.createBiquadFilter();
    this.eight.setType('bandpass');


    this.input.connect(this._eqIn);
    this._eqOut.connect(this.wet);

    this._eqIn.connect(this.one);
    this.one.connect(this.two);
    this.two.connect(this.three);
    this.three.connect(this.four);
    this.four.connect(this.five);
    this.five.connect(this.six);
    this.six.connect(this.seven);
    this.seven.connect(this.eight);


  }
}