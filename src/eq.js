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
    this.four.set(9999,5);

    this.five = new p5.Filter();
    this.five.setType('peaking');
    this.five.toggle = true;
    this.five.set(13333,5);

    this.six = new p5.Filter();
    this.six.setType('peaking');
    this.six.toggle = true;
    this.six.set(16666,5);


    this.seven = new p5.Filter();
    this.seven.setType('peaking');
    this.seven.toggle = true;
    this.seven.set(19999,25); 

    this.eight = new p5.Filter();
    this.eight.setType('peaking');
    this.eight.toggle = true;
    this.eight.set(22050,30)


    this.input.connect(this._eqIn);
    this._eqOut.connect(this.wet);

   



    this.bands = [this.one, this.two, this.three, this.four,
                  this.five, this.six, this.seven, this.eight];

    for (var i = 0; i<this.bands.length; i++){
      this.bands[i].disconnect();
      delete this.bands[i].output;
    }


    this._eqIn.connect(this.one);
    this.one.biquad.connect(this.two);
    this.two.biquad.connect(this.three);
    this.three.biquad.connect(this.four);
    this.four.biquad.connect(this.five);
    this.five.biquad.connect(this.six);
    this.six.biquad.connect(this.seven);
    this.seven.biquad.connect(this.eight);
    this.eight.biquad.connect(this._eqOut);


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

  p5.EQ.prototype.setBand = function (band, option, param1, param2) {
    if (option === "toggle") { 
      this.toggleBand(band);
    } else if (option === "mod") { 
      this.modBand(band, param1, param2);
      // console.log("gain");
    } else if (option === "type") { 
      this.bandType(band, param1); 
    } else {
      console.log("error");
    }
  };

  p5.EQ.prototype.toggleBand = function (index) {

    this.bands[index].toggle = !this.bands[index].toggle;
    console.log(this.bands[index].toggle);
    this.bands[index].toggle ? this.bands[index].setType('peaking') : this.bands[index].setType('allpass')
  };

  p5.EQ.prototype.modBand = function (index, vol, freq) {
    this.bands[index].biquad.gain.value = vol;
    this.bands[index].set(freq);
  };

  p5.EQ.prototype.bandType = function (index, type) {

    this.bannds[index].setType(type);
  };

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
