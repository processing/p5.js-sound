/**
 * @module p5.sound
 * @submodule p5.sound
 * @for p5.sound
 * @main
 */

define(function (require) {

  'use strict';

  require('sndcore');

  /**
   * Master contains AudioContext and the master sound output.
   */
  var Master = function() {
    var audiocontext = p5.prototype.getAudioContext();
    this.input = audiocontext.createGain();
    this.output = audiocontext.createGain();

    //put a hard limiter on the output
    this.limiter = audiocontext.createDynamicsCompressor();
    this.limiter.threshold.value = 0;
    this.limiter.ratio.value = 100;

    this.audiocontext = audiocontext;

    this.output.disconnect(this.audiocontext.destination);

    // an array of input sources
    this.inputSources = [];

    // connect input to limiter
    this.input.connect(this.limiter);

    // connect limiter to output
    this.limiter.connect(this.output);

    // meter is just for measuring global Amplitude
    this.meter = audiocontext.createGain();
    this.output.connect(this.meter);

    // connect output to destination
    this.output.connect(this.audiocontext.destination);

    // an array of all sounds in the sketch
    this.soundArray = [];

    // file extensions to search for
    this.extensions = [];

  };

  // Will this be useful to access?
  // p5.prototype.SoundOut = p5sound;

  // create a single instance of the p5Sound / master output for use within this sketch
  var p5sound = new Master();

  return p5sound;

});