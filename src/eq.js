define(function (require) {
  'use strict';

  var p5Sound = require('master');
  var Effect = require('effect');



  p5.EQ = function() {
    Effect.call(this);

    this._eqIn = this.ac.createGain();
    this._eqOut = this.ac.createGain();

    this.one = new p5.Filter();
    this.one.setType('peaking');
    this.one.toggle = true;
    this.one.set(0, 1);


 
    this.two = new p5.Filter();
    this.two.setType('peaking');
    this.two.toggle = true;
    this.two.set(3333,1);

    this.three = new p5.Filter();
    this.three.setType('peaking');
    this.three.toggle = true;
    this.three.set(6666,5);

    this.four = new p5.Filter();
    this.four.setType('peaking');
    this.four.toggle = true;
    this.four.set(7500,5);

    this.five = new p5.Filter();
    this.five.setType('peaking');
    this.five.toggle = true;
    this.five.set(10000,5);

    this.six = new p5.Filter();
    this.six.setType('peaking');
    this.six.toggle = true;
    this.six.set(133333,5);


    this.seven = new p5.Filter();
    this.seven.setType('peaking');
    this.seven.toggle = true;
    this.seven.set(16666,25); 

    this.eight = new p5.Filter();
    this.eight.setType('peaking');
    this.eight.toggle = true;
    this.eight.set(20000,30)


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
    this.eight.connect(this._eqOut);


    // this._eqIn.connect(this.one);
    // this._eqIn.connect(this.two);
    // this._eqIn.connect(this.three);
    // this._eqIn.connect(this.four);
    // this._eqIn.connect(this.five);
    // this._eqIn.connect(this.six);
    // this._eqIn.connect(this.seven);
    // this._eqIn.connect(this.eight);

    // this.one.connect(this._eqOut);
    // this.two.connect(this._eqOut);
    // this.three.connect(this._eqOut);
    // this.four.connect(this._eqOut);
    // this.five.connect(this._eqOut);
    // this.six.connect(this._eqOut);
    // this.seven.connect(this._eqOut);
    // this.eight.connect(this._eqOut);





  };

  p5.EQ.prototype = Object.create(Effect.prototype);

  //eventually, take a preset argument here
  p5.EQ.prototype.process = function (src) {
    src.connect(this.input);
  };

  /**
   *  @{param} band {number} specify the band to motify (1-8)
   *  @{param} option {string} specify how to modify the band;
   */

  p5.EQ.prototype.setBand = function (band, option, param) {
    if (option === "toggle") { 
      this.toggleBand(band);
    } else if (option === "gain") { 
      this.gainBand(band, param);
      // console.log("gain");
    } else if (option === "type") { 
      this.modBand(band, param); 
    } else {
      console.log("error");
    }
  };

  p5.EQ.prototype.toggleBand = function (band) {
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

  p5.EQ.prototype.gainBand = function (band, vol) {

    switch (band) {
      case 1:
        this.one.biquad.gain.value = vol;
        break
      case 2:
        this.two.biquad.gain.value = vol;
        break
      case 3:
        this.three.biquad.gain.value = vol;
        break
      case 4:
        this.four.biquad.gain.value = vol;
        break
      case 5:
        this.five.biquad.gain.value = vol;
        break
      case 6:
        this.six.biquad.gain.value = vol;
        break
      case 7:
        this.seven.biquad.gain.value = vol;
        break
      case 8:
        this.eight.biquad.gain.value = vol;
        break
      default:
        return 0;
    }
  };

  p5.EQ.prototype.modBand = function (band, type) {
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
        this.five.setType(type);
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


  p5.EQ.prototype.print = function () {
    var array;
    array.push(this.one.output.gain.value);
    array.push(this.one.output.gain.value);
    array.push(this.one.output.gain.value);
    array.push(this.one.output.gain.value);
    array.push(this.one.output.gain.value);
    array.push(this.one.output.gain.value);
    array.push(this.one.output.gain.value);
    array.push(this.one.output.gain.value);
  }

  p5.EQ.prototype.dispose = function (argument) {
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
