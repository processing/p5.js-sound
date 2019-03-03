'use strict';

define(function (require) {
  let p5sound = require('master');

  // requires the Tone.js library's Clock (MIT license, Yotam Mann)
  // https://github.com/TONEnoTONE/Tone.js/
  let Clock = require('Tone/core/Clock');

  p5.Metro = function() {
    this.clock = new Clock({
      'callback': this.ontick.bind(this)
    });
    this.syncedParts = [];
    this.bpm = 120; // gets overridden by p5.Part
    this._init();

    this.prevTick = 0;
    this.tatumTime = 0;

    this.tickCallback = function() {};
  };

  p5.Metro.prototype.ontick = function(tickTime) {
    let elapsedTime = tickTime - this.prevTick;
    let secondsFromNow = tickTime - p5sound.audiocontext.currentTime;
    if (elapsedTime - this.tatumTime <= -0.02) {
      return;
    } else {
      // console.log('ok', this.syncedParts[0].phrases[0].name);
      this.prevTick = tickTime;

      // for all of the active things on the metro:
      let self = this;
      this.syncedParts.forEach(function(thisPart) {
        if (!thisPart.isPlaying) return;
        thisPart.incrementStep(secondsFromNow);
        // each synced source keeps track of its own beat number
        thisPart.phrases.forEach(function(thisPhrase) {
          let phraseArray = thisPhrase.sequence;
          let bNum = self.metroTicks % phraseArray.length;
          if (phraseArray[bNum] !== 0 && (self.metroTicks < phraseArray.length || !thisPhrase.looping) ) {
            thisPhrase.callback(secondsFromNow, phraseArray[bNum]);
          }
        });
      });
      this.metroTicks += 1;
      this.tickCallback(secondsFromNow);
    }
  };

  p5.Metro.prototype.setBPM = function(bpm, rampTime) {
    let beatTime =  60 / (bpm*this.tatums);
    let now = p5sound.audiocontext.currentTime;
    this.tatumTime = beatTime;

    let rampTime = rampTime || 0;
    this.clock.frequency.setValueAtTime(this.clock.frequency.value, now);
    this.clock.frequency.linearRampToValueAtTime(bpm, now + rampTime);
    this.bpm = bpm;
  };

  p5.Metro.prototype.getBPM = function() {
    return this.clock.getRate() / this.tatums * 60;
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
    let t = timeFromNow || 0;
    let now = p5sound.audiocontext.currentTime;
    this.clock.start(now + t);
    this.setBPM(this.bpm);
  };

  p5.Metro.prototype.stop = function(timeFromNow) {
    let t = timeFromNow || 0;
    let now = p5sound.audiocontext.currentTime;
    this.clock.stop(now + t);
  };

  p5.Metro.prototype.beatLength = function(tatums) {
    this.tatums = 1/tatums / 4; // lowest possible division of a beat
  };

});
