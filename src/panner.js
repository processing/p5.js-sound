define(function (require) {

  'use strict';

  var p5sound = require('master');
  var ac = p5sound.audiocontext;

  // Stereo panner
  // if there is a stereo panner node use it
  if(typeof ac.createStereoPanner !== "undefined"){
    p5.Panner = function (input, output, numInputChannels) {
      this.stereoPanner = this.input = ac.createStereoPanner();
      input.connect(this.stereoPanner);
      this.stereoPanner.connect(output);
    };

    p5.Panner.prototype.pan = function(val, tFromNow) {
      var time = tFromNow || 0;
      var t = ac.currentTime + time;

      this.stereoPanner.pan.linearRampToValueAtTime(val, t);
    };

    p5.Panner.prototype.inputChannels = function(numChannels) {
      //not implemented because stereopanner 
      //node does not require this and will automatically
      //convert single channel or multichannel to stereo.
      //tested with single and stereo, not with (>2) multichannel 
    };

    p5.Panner.prototype.connect = function(obj) {
      this.stereoPanner.connect(obj);
    };
    p5.Panner.prototype.disconnect = function(obj) {
      this.stereoPanner.disconnect();
    };

  } else {
    // if there is no createStereoPanner object
    // such as in safari 7.1.7 at the time of writing this
    // use this method to create the effect
    p5.Panner = function(input, output, numInputChannels) {
      this.input = ac.createGain();
      input.connect(this.input);

      this.left = ac.createGain();
      this.right = ac.createGain();
      this.left.channelInterpretation = "discrete";
      this.right.channelInterpretation = "discrete";

      // if input is stereo
      if (numInputChannels > 1) {
        this.splitter = ac.createChannelSplitter(2);
        this.input.connect(this.splitter);

        this.splitter.connect(this.left, 1);
        this.splitter.connect(this.right, 0);
      }
      else {
        this.input.connect(this.left);
        this.input.connect(this.right);
      }

      this.output = ac.createChannelMerger(2);
      this.left.connect(this.output, 0, 1);
      this.right.connect(this.output, 0, 0);
      this.output.connect(output);
    };

    // -1 is left, +1 is right
    p5.Panner.prototype.pan = function(val, tFromNow) {
      var time = tFromNow || 0;
      var t = ac.currentTime + time;
      var v = (val + 1) / 2;
      var rightVal = Math.cos(v*Math.PI/2);
      var leftVal = Math.sin(v * Math.PI/2);
      this.left.gain.linearRampToValueAtTime(leftVal, t);
      this.right.gain.linearRampToValueAtTime(rightVal, t);
    };

    p5.Panner.prototype.inputChannels = function(numChannels) {
      if (numChannels === 1) {
        this.input.disconnect();
        this.input.connect(this.left);
        this.input.connect(this.right);
      } else if (numChannels === 2) {
        if (typeof(this.splitter === 'undefined')){
          this.splitter = ac.createChannelSplitter(2);
        }
        this.input.disconnect();
        this.input.connect(this.splitter);
        this.splitter.connect(this.left, 1);
        this.splitter.connect(this.right, 0);
      }
    };

    p5.Panner.prototype.connect = function(obj) {
      this.output.connect(obj);
    };

    p5.Panner.prototype.disconnect = function(obj) {
      this.output.disconnect();
    };
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