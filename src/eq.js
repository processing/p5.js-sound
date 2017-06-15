define(function (require) {
  'use strict';

  var p5Sound = require('master');
  var Effect = require('effect');



  p5.EQ = function() {
    Effect.call(this);

    this._eqIn = this.ac.createGain();
    this._eqOut = this.ac.createGain();

    this.one = new p5.BandPass();
    this.one.toggle = true;
    this.one.set(50, 50);

    this.two = new p5.BandPass();
    this.one.toggle = true;
    this.two.set(100,50);

    this.three = new p5.BandPass();
    this.eight .toggle = true;
    this.three.set(500,50);

    this.four = new p5.BandPass();
    this.eight.toggle = true;
    this.four.set(1000,50);

    this.five = new p5.BandPass();
    this.eight.toggle = true;
    this.five.set(2500,50);

    this.six = new p5.BandPass();
    this.eight.toggle = true;
    this.six.set.(5000,50)


    this.seven = new p5.BandPass();
    this.one.toggle = true;
    this.set(10000,50);

    this.eight = new p5.BandPass();
    this.eight.toggle = true;
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
  };

  p5.EQ.prototype = Object.create(Effect.prototype);

  //eventually, take a preset argument here
  p5.EQ.process = function (src) {
    src.connect(this.input);
  };

  /**
   *  @{param} band {number} specify the band to motify (1-8)
   *  @{param} option {string} specify how to modify the band;
   */

  p5.EQ.setBand = function (band, option, param) {
	if (option == "toggle") { this.toggleBand(band);}
	else if (option == "gain") { this.gainBand(band, param);}
	else if (option == "type") { this.modBand(band, param); }
	else return new Error();
  };

  p5.EQ.toggleBand = function (band) {
    switch (band) {
      case 1:
        this.one.toggle = !this.one.toggle;
        break
      case 2:
        this.two.toggle = !this.two.toggle;
        break
      case 3:
        this.three.toggle = !this.three.toggle;
        break
      case 4:
        this.four.toggle = !this.four.toggle;
        break
      case 5:
        this.five.toggle = !this.five.toggle;
        break
      case 6:
        this.six.toggle = !this.six.toggle;
        break
      case 7:
        this.seven.toggle = !this.seven.toggle;
        break
      case 8:
        this.eight.toggle = !this.one.toggle;
        break
      default:
        return 0;
    }
  };

  p5.EQ.gainBand = function (band, vol) {
    switch (band) {
      case 1:
        this.one.amp(vol);
        break
      case 2:
        this.two.amp(vol);
        break
      case 3:
        this.three.amp(vol);
        break
      case 4:
        this.four.amp(vol);
        break
      case 5:
        this.five.amp(vol);
        break
      case 6:
        this.six.amp(vol);
        break
      case 7:
        this.seven.amp(vol);
        break
      case 8:
        this.eight.amp(vol);
        break
      default:
        return 0;
    }
  };

  p5.EQ.modBand = function (band, type) {
    switch (band) {
      case 1:
        this.one.setType(type);
        break
      case 2:
        this.two.setType(type);
        break
      case 3:
        this.three.setType(type);
        break
      case 4:
        this.four.setType(type);
        break
      case 5:
        this.five.
        break
      case 6:
        this.six.setType(type);
        break
      case 7:
        this.seven.setType(type);
        break
      case 8:
        this.eight.setType(type);
        break
      default:
        return 0;
    }
  };

  p5.EQ.dispose = function (argument) {
    Effect.prototype.dispose.apply(this);

    this.one.disconnect();
    this.one = undefined;
    this.two.disconnect();
    this.two = undefined;
    this.three.disconnect();
    this.three = undefined;
    this.four.disconnect();
    this.four = undefined;
    this.five.disconnect();
    this.five = undefined;
    this.six.disconnect();
    this.six = undefined;
    this.seven.disconnect();
    this.seven = undefined;
    this.eight.disconnect();
    this.eight = undefined;
   
  }



});
