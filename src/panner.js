define(function (require) {

  'use strict';

  var p5sound = require('master');
  var ac = p5sound.audiocontext;

  // Stereo panner
  p5.Panner = function(input, output) {
    console.log(input);
    this.input = ac.createGain();
    input.connect(this.input);

    this.left = ac.createGain();
    this.right = ac.createGain();
    this.left.channelInterpretation = "discrete";
    this.right.channelInterpretation = "discrete";

    var splitter = ac.createChannelSplitter(2);

    this.input.connect(splitter);

    splitter.connect(this.left, 1);
    splitter.connect(this.right, 0);

    this.output = ac.createChannelMerger(2);
    this.left.connect(this.output, 0, 1);
    this.right.connect(this.output, 0, 0);
    this.output.connect(output);
  }

  // -1 is left, +1 is right
  p5.Panner.prototype.pan = function(val, t) {
    var t = ac.currentTime || ac.currentTime + t;
    var v = (val + 1) / 2;
    var leftVal = Math.cos(v*Math.PI/2);
    var rightVal = Math.sin(v * Math.PI/2);
    this.left.gain.linearRampToValueAtTime(leftVal, t);
    this.right.gain.linearRampToValueAtTime(rightVal, t);
  }

  p5.Panner.prototype.connect = function(obj) {
    this.output.connect(obj);
  }

  p5.Panner.prototype.disconnect = function(obj) {
    this.output.disconnect();
  }

  // 3D panner
  p5.Panner3D = function(input, output) {
    var panner3D = ac.createPanner();
    panner3D.panningModel = 'HRTF';
    panner3D.distanceModel = 'linear';
    panner3D.setPosition(0,0,0);
    input.connect(panner3D);
    panner3D.connect(output);

    panner3D.pan = function(xVal, yVal, zVal) {
      panner3D.setPosition(xVal, yVal, zVal);
    }

    return panner3D;
  };

});