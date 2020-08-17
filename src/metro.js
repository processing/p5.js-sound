import p5sound from './master';
// requires the Tone.js library's Clock (MIT license, Yotam Mann)
// https://github.com/TONEnoTONE/Tone.js/
import Clock from 'Tone/core/Clock';

class Metro {
  constructor() {
    this.clock = new Clock({
      callback: this.ontick.bind(this),
    });
    this.syncedParts = [];
    this.bpm = 120; // gets overridden by p5.Part
    this._init();

    this.prevTick = 0;
    this.tatumTime = 0;

    this.tickCallback = function () {};
  }

  ontick(tickTime) {
    var elapsedTime = tickTime - this.prevTick;
    var secondsFromNow = tickTime - p5sound.audiocontext.currentTime;
    if (elapsedTime - this.tatumTime <= -0.02) {
      return;
    } else {
      // console.log('ok', this.syncedParts[0].phrases[0].name);
      this.prevTick = tickTime;

      // for all of the active things on the metro:
      var self = this;
      this.syncedParts.forEach(function (thisPart) {
        if (!thisPart.isPlaying) return;
        thisPart.incrementStep(secondsFromNow);
        // each synced source keeps track of its own beat number
        thisPart.phrases.forEach(function (thisPhrase) {
          var phraseArray = thisPhrase.sequence;
          var bNum = self.metroTicks % phraseArray.length;
          if (
            phraseArray[bNum] !== 0 &&
            (self.metroTicks < phraseArray.length || !thisPhrase.looping)
          ) {
            thisPhrase.callback(secondsFromNow, phraseArray[bNum]);
          }
        });
      });
      this.metroTicks += 1;
      this.tickCallback(secondsFromNow);
    }
  }

  setBPM(bpm, rampTime = 0) {
    var beatTime = 60 / (bpm * this.tatums);
    var now = p5sound.audiocontext.currentTime;
    this.tatumTime = beatTime;

    this.clock.frequency.setValueAtTime(this.clock.frequency.value, now);
    this.clock.frequency.linearRampToValueAtTime(bpm, now + rampTime);
    this.bpm = bpm;
  }

  getBPM() {
    return (this.clock.getRate() / this.tatums) * 60;
  }

  _init() {
    this.metroTicks = 0;
    // this.setBPM(120);
  }

  // clear existing synced parts, add only this one
  resetSync(part) {
    this.syncedParts = [part];
  }

  // push a new synced part to the array
  pushSync(part) {
    this.syncedParts.push(part);
  }

  start(timeFromNow) {
    var t = timeFromNow || 0;
    var now = p5sound.audiocontext.currentTime;
    this.clock.start(now + t);
    this.setBPM(this.bpm);
  }

  stop(timeFromNow) {
    var t = timeFromNow || 0;
    var now = p5sound.audiocontext.currentTime;
    this.clock.stop(now + t);
  }

  beatLength(tatums) {
    this.tatums = 1 / tatums / 4; // lowest possible division of a beat
  }
}
export default Metro;
