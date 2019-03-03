'use strict';
define(function() {
  let p5sound = require('master');

  /**
   * Base class for monophonic synthesizers. Any extensions of this class
   * should follow the API and implement the methods below in order to 
   * remain compatible with p5.PolySynth();
   *
   * @class p5.AudioVoice
   * @constructor
   */
  p5.AudioVoice = function () {
	  this.ac = p5sound.audiocontext;
	  this.output = this.ac.createGain();
	  this.connect();
	  p5sound.soundArray.push(this);
  };

  p5.AudioVoice.prototype.play = function (note, velocity, secondsFromNow, sustime) {
  };

  p5.AudioVoice.prototype.triggerAttack = function (note, velocity, secondsFromNow) {
  };

  p5.AudioVoice.prototype.triggerRelease = function (secondsFromNow) {
  };

  p5.AudioVoice.prototype.amp = function(vol, rampTime) {
  };

  /**
   * Connect to p5 objects or Web Audio Nodes
   * @method  connect
   * @param {Object} unit 
   */
  p5.AudioVoice.prototype.connect = function(unit) {
    let u = unit || p5sound.input;
    this.output.connect(u.input ? u.input : u);
  };

  /**
   * Disconnect from soundOut
   * @method  disconnect
   */
  p5.AudioVoice.prototype.disconnect = function() {
    this.output.disconnect();
  };

  p5.AudioVoice.prototype.dispose = function() {
    if (this.output) {
      this.output.disconnect();
      delete this.output;
    }
  };

  return p5.AudioVoice;
});
