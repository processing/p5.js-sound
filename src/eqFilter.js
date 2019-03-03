'use strict';

define(function (require) {
  let Filter = require('filter');
  let p5sound = require('master');

  /**
   *  EQFilter extends p5.Filter with constraints
   *  necessary for the p5.EQ
   *
   *  @private
   */
  let EQFilter = function(freq, res) {
    Filter.call(this, 'peaking');
    this.disconnect();
    this.set(freq, res);
    this.biquad.gain.value = 0;
    delete this.input;
    delete this.output;
    delete this._drywet;
    delete this.wet;

  };
  EQFilter.prototype = Object.create(Filter.prototype);

  EQFilter.prototype.amp = function() {
    console.warn('`amp()` is not available for p5.EQ bands. Use `.gain()`');
  };
  EQFilter.prototype.drywet = function() {
    console.warn('`drywet()` is not available for p5.EQ bands.');
  };
  EQFilter.prototype.connect = function(unit) {
    let u = unit || p5.soundOut.input;
    if (this.biquad) {
      this.biquad.connect(u.input ? u.input : u);
    } else {
      this.output.connect(u.input ? u.input : u);
    }
  };

  EQFilter.prototype.disconnect = function() {
    if (this.biquad) {
      this.biquad.disconnect();
    }
  };
  EQFilter.prototype.dispose = function() {
    // remove reference form soundArray
    let index = p5sound.soundArray.indexOf(this);
    p5sound.soundArray.splice(index, 1);
    this.disconnect();
    delete this.biquad;
  };

  return EQFilter;
});
