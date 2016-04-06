define(function (require) {
  'use strict';

  var p5sound = require('master');

  // requires the Tone.js library's Clock (MIT license, Yotam Mann)
  // https://github.com/TONEnoTONE/Tone.js/
  var Clock = require("Tone/core/Clock");

  var ac = p5sound.audiocontext;
  // var upTick = false;

  p5.Metro = function() {
    this.clock = new Clock({
      'callback': this.ontick.bind(this)
    });
    this.syncedParts = [];
    this.bpm = 120; // gets overridden by p5.Part
    this._init();

    this.tickCallback = function(){};
  };

  var prevTick = 0;
  var tatumTime = 0;

  p5.Metro.prototype.ontick = function(tickTime) {
    var elapsedTime = tickTime - prevTick;
    var secondsFromNow = tickTime - p5sound.audiocontext.currentTime;
    if (elapsedTime - tatumTime <= -0.02) {
      return;
    } else {
      prevTick = tickTime;
      // for all of the active things on the metro:
      for (var i in this.syncedParts) {
        var thisPart = this.syncedParts[i];
        if (!thisPart.isPlaying) return;
        thisPart.incrementStep(secondsFromNow);
        // each synced source keeps track of its own beat number
        for (var j in thisPart.phrases) {
          var thisPhrase = thisPart.phrases[j];
          var phraseArray = thisPhrase.sequence;
          var bNum = this.metroTicks % (phraseArray.length );
          if (phraseArray[bNum] !== 0 && (this.metroTicks < phraseArray.length || !thisPhrase.looping) ) {
            thisPhrase.callback(secondsFromNow, phraseArray[bNum]);
          }
        }
      }
      this.metroTicks += 1;
      this.tickCallback(secondsFromNow);
    }
  };

  p5.Metro.prototype.setBPM = function(bpm, rampTime) {
    var beatTime =  60 / (bpm*this.tatums);
    var now = p5sound.audiocontext.currentTime;
    tatumTime = beatTime;

    var rampTime = rampTime || 0;
    this.clock.frequency.setValueAtTime(this.clock.frequency.value, now);
    this.clock.frequency.linearRampToValueAtTime(bpm, now + rampTime);
    this.bpm = bpm;
  };

  p5.Metro.prototype.getBPM = function(tempo) {
    return ( this.clock.getRate() / this.tatums ) * 60;
  };

  p5.Metro.prototype._init = function() {
    this.metroTicks = 0;
    // this.setBPM(120);
  };

  // clear existing synced parts, add only this one
  p5.Metro.prototype.resetSync = function(part) {
    this.syncedParts = [part];
  };

  // push a new synced part to the array
  p5.Metro.prototype.pushSync = function(part) {
    this.syncedParts.push(part);
  };

  p5.Metro.prototype.start = function(timeFromNow) {
    var t = timeFromNow || 0;
    var now = p5sound.audiocontext.currentTime;
    this.clock.start(now + t);
    this.setBPM(this.bpm);
  };

  p5.Metro.prototype.stop = function(timeFromNow) {
    var t = timeFromNow || 0;
    var now = p5sound.audiocontext.currentTime;
    if (this.clock._oscillator) {
      this.clock.stop(now + t);
    }
  };

  p5.Metro.prototype.beatLength = function(tatums) {
    this.tatums = 1/tatums / 4; // lowest possible division of a beat
  };

});