define(function (require) {
  'use strict';

  var p5sound = require('master');

  // requires the Tone.js library's Clock (MIT license, Yotam Mann)
  // https://github.com/TONEnoTONE/Tone.js/
  var Clock = require("Tone/core/Clock");

  var ac = p5sound.audiocontext;
  var upTick = false;
  var tatums = 4; // lowest possible division of a beat

  p5.Metro = function() {

    this.clock = new Clock(ac.sampleRate, this.ontick.bind(this));

    this.syncedParts = [];
    this.bpm = 120; // default --> or global bpm?
    this._init();
  };

  p5.Metro.prototype.ontick = function(tickTime) {
    // for all of the active things on the metro:
    for (var i in this.syncedParts) {
      var thisPart = this.syncedParts[i];
      thisPart.incrementStep();
      // each synced source keeps track of its own beat number
      for (var j in thisPart.phrases) {
        var thisPhrase = thisPart.phrases[j];
        var phraseArray = thisPhrase.array;
        var bNum = this.metroTicks % (phraseArray.length);
        if (phraseArray[bNum] !== 0 ) {
          // console.log(phraseArray[bNum]);
          thisPhrase.callback(phraseArray[bNum], tickTime);
        }
      }
      thisPart.onStep(tickTime);
    }
    this.metroTicks += 1;
    this.lastTick = tickTime;
  };

  p5.Metro.prototype.setBPM = function(bpm, rampTime) {
    var beatTime =  60 / (bpm*tatums);
    var ramp = rampTime || 0;
    this.clock.setRate(beatTime, rampTime + p5sound.audiocontext.currentTime);
    this.bpm = bpm;
  };

  p5.Metro.prototype.getBPM = function(tempo) {
    return ( this.clock.getRate() / tatums ) * 60;
  };

  p5.Metro.prototype._init = function(part) {
    this.metroTicks = 0;
    this.lastTick = 0;
    this.setBPM(this.bpm);
  };

  // clear existing synced parts, add only this one
  p5.Metro.prototype.resetSync = function(part) {
    this.syncedParts = [part];
  };

  // push a new synced part to the array
  p5.Metro.prototype.pushSync = function(part) {
    this.syncedParts.push(part);
  };

  p5.Metro.prototype.start = function(time) {
    var t = time || 0;
    this.clock.start(t);
    this.setBPM(this.bpm);
  };

  p5.Metro.prototype.stop = function(time) {
    var t = time || 0;
    this.clock.stop(t);
  }

});