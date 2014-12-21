define(function (require) {

  'use strict';

  var p5sound = require('master');
  var ac = p5sound.audiocontext;

  // Stereo panner
  p5.Panner = function(input, output) {
    this.left = ac.createGain();
    this.right = ac.createGain();
    this.left.channelInterpretation = "discrete";
    this.right.channelInterpretation = "discrete";

    var splitter = ac.createChannelSplitter(2);

    input.connect(splitter);

    splitter.connect(this.left, 1);
    splitter.connect(this.right, 0);

    var mixer = ac.createChannelMerger(2);
    this.left.connect(mixer, 0, 1);
    this.right.connect(mixer, 0, 0);
    mixer.connect(output);
    console.log(output);
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