define(function (require) {
  'use strict';

  var p5sound = require('master');

  // oscBuffer CLASS, a private function
  var oscBuffer = function(name, tableSize) {
    this.name = name; // required for constructor, no default
    this.tableSize = tableSize || 88200; // optional, defaults to 2 seconds
    var real = new Float32Array(this.tableSize);
    var imag = new Float32Array(this.tableSize);

    this.array;
    this.buffer;

    this.fill(this.name);
    return this.buffer;
  };


  oscBuffer.prototype.fill = function(name) {
    switch (name.toLowerCase()) {
      case 'sine':
          this.array = generateSin(this.tableSize);
          this.decodeBuffer(this.array);
      // case 'square':
      //     return generateSqr();
      // case 'sawtooth':
      //     return generateSaw();
      // case 'triangle':
      //     return generateTri();
      // case 'phasor':
      //     return generatePhasor();
      default:
          this.array = generateSin(this.tableSize);
          this.decodeBuffer(this.array);
    }
  };

  // convert array to buffer
  oscBuffer.prototype.decodeBuffer = function(newArray){
    var newBuffer = p5sound.audiocontext.createBuffer(1, this.tableSize, p5sound.audiocontext.sampleRate);
    var channelData = newBuffer.getChannelData(0);
    channelData.set(newArray);
    this.setBuffer(newBuffer);
  };

  // set the buffer for this oscBuffer to a new buffer
  oscBuffer.prototype.setBuffer = function(newBuf){
    this.buffer = newBuf;
  };

  oscBuffer.prototype.getBuffer = function(){
    return this.buffer;
  };

  // Osc is the new oscillator for phase manipulation
  p5.prototype.Osc = function() {
    // assign buffer to sine by default
    this.buffer = new oscBuffer('sine');

    this.input = p5sound.audiocontext.createGain();
    this.output = p5sound.audiocontext.createGain();

    // stereo panning
    this.panPosition = 0.0;
    this.panner = p5sound.audiocontext.createPanner();
    this.panner.panningModel = 'equalpower';
    this.panner.distanceModel = 'linear';
    this.panner.setPosition(0,0,0);

    this.output.connect(this.panner);

    // by default, the panner is connected to the p5s destination
    this.panner.connect(p5sound.input);
  };

  // start playback
  p5.prototype.Osc.prototype.start = function(t) {
    var time = t || p5sound.audiocontext.currentTime;

    this.source = p5sound.audiocontext.createBufferSource();
    this.source.buffer = this.buffer;
    this.source.loop = true;

    // control gain
    if (!this.source.gain) {
      this.source.gain = p5sound.audiocontext.createGain();
      this.source.connect(this.source.gain);
      // set local amp if provided, otherwise 1
      this.source.gain.gain.value = amp || 1;
      this.source.gain.connect(this.output); 
    }
    // chrome method of controlling gain without resetting volume
    else {
      this.source.gain.value = amp || 1;
      this.source.connect(this.output); 
    }

    this.source.start(time);
  };

  p5.prototype.Osc.prototype.stop = function(t) {
    var time = t || p5sound.audiocontext.currentTime;

    if (this.buffer && this.source) {
      this.source.stop(time);
    }

  };

  // ================
  // generate buffers
  // ================

  // via http://music.columbia.edu/cmc/musicandcomputers/popups/chapter4/xbit_4_1.php
  var generateSin = function(tableSize) {
    var samples = new Float32Array(tableSize);
    var phaseInc = TWO_PI/tableSize;
    var currentPhase = 0.0;
    for (var i = 0; i < tableSize; i++){
      samples[i] = Math.sin(currentPhase);
      currentPhase += phaseInc;
    }
    return samples;
  };


});