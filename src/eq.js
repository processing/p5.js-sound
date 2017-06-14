define(function (require)) {
  'use strict';

  var p5Sound = require('master');
  var Effect = require('effect');



  p5.EQ = function() {
    Effect.call(this);

    this._eqIn = this.ac.createGain();
    this._eqOut = this.ac.createGain();

    this.one = new p5.BandPass();
    this.one.set(50, 50);

    this.two = new p5.BandPass();
    this.two.set(100,50);

    this.three = new p5.BandPass();
    this.three.set(500,50);

    this.four = new p5.BandPass();
    this.four.set(1000,50);

    this.five = new p5.BandPass();
    this.five.set(2500,50);

    this.six = new p5.BandPass();
    this.six.set.(5000,50)


    this.seven = new p5.BandPass();
    this.set(10000,50);

    this.eight = new p5.BandPass();
    this.set(20000,50)


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