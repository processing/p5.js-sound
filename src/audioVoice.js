'use strict';
define(function() {
  var p5sound = require('master');

  /**
   * Base class for monophonic synthesizers. Any extensions of this class
   * should follow the API and implement the methods below in order to 
   * remain compatible with p5.PolySynth();
   *
   * @class AudioVoice
   * @constructor
   */
  p5.AudioVoice = function () {
	  this.ac = p5sound.audiocontext;
	  this.output = this.ac.createGain();
	  this.connect();
	  p5sound.soundArray.push(this);
  };

  /**
   * This method converts midi notes specified as a string "C4", "Eb3"...etc
   * to frequency
   * @private
   * @method  _setNote
   * @param {String} note 
   */
  p5.AudioVoice.prototype._setNote = function(note) {
    var wholeNotes = {A:21, B:23, C:24, D:26, E:28, F:29, G:31};
    var value = wholeNotes[ note[0] ];
    var octave = typeof Number(note.slice(-1)) === 'number'? note.slice(-1) : 0;
    value += 12 * octave;
    value = note[1] === '#' ? value+1 : note[1] ==='b' ? value - 1 : value;
    //return midi value converted to frequency
    return p5.prototype.midiToFreq(value);
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
    var u = unit || p5sound.input;
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
    this.output.disconnect();
    delete this.output;
  };

  return p5.AudioVoice;
});
