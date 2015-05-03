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

    this.output.disconnect();

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
    // an array of all musical parts in the sketch
    this.parts = [];

    // file extensions to search for
    this.extensions = [];

  };

  // create a single instance of the p5Sound / master output for use within this sketch
  var p5sound = new Master();

  /**
   *  p5.soundOut is the p5.sound master output. It sends output to
   *  the destination of this window's web audio context. It contains 
   *  Web Audio API nodes including a dyanmicsCompressor (<code>.limiter</code>),
   *  and Gain Nodes for <code>.input</code> and <code>.output</code>.
   *  
   *  @property p5.soundOut
   *  @type {Object}
   */
  p5.soundOut = p5sound;

  /**
   *  a silent connection to the DesinationNode
   *  which will ensure that anything connected to it
   *  will not be garbage collected
   *  
   *  @private
   */
  p5.soundOut._silentNode = p5sound.audiocontext.createGain();
  p5.soundOut._silentNode.gain.value = 0;
  p5.soundOut._silentNode.connect(p5sound.audiocontext.destination);


  return p5sound;

});