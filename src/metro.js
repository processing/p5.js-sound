define(function (require) {
  'use strict';

  var p5sound = require('master');
  var Clock = require("Tone/core/Clock");
  var ac = p5sound.audiocontext;
  var upTick = false;
  var tatums = 4; // lowest possible division of a beat

  // Oscillator + Script Processor to keep time.
  // inspired by Tone.js library's Transport (MIT license, Yotam Mann)
  // https://github.com/TONEnoTONE/Tone.js/blob/master/Tone/core/Transport.js

  p5.Metro = function() {
    this.metroTicks = 0;

    this.clock = new Clock(rate, this.ontick.bind(this));

    /**
     *  watch this.oscillator for timing ticks
     */
    this._jsNode = p5sound.audiocontext.createScriptProcessor(this.bufferSize, 1, 1);
    this._jsNode.onaudioprocess = this._processBuffer.bind(this);
    this._jsNode.connect(p5.soundOut._silentNode);

    this.oscillator = ac.createOscillator();
    this.oscillator.type = 'square';
    this.oscillator.connect(this._jsNode);
    this.oscillator.start();
    this.oscillator.frequency.value = 1;

    this.lastTick = 0;

    this.syncedParts = [];
  };

  p5.Metro.prototype._processBuffer = function(event){
    var now = ac.currentTime;
    var incomingBuffer = event.inputBuffer.getChannelData(0);
    var bufferSize = this._jsNode.bufferSize;
    for (var i = 0; i< bufferSize; i++) {
      var sample = incomingBuffer[i];
      if (sample > 0 && !upTick) {
        upTick = true;
        this._processTick(now + i / ac.sampleRate); // samples to seconds
      } else if (sample < 0 && upTick) {
        upTick = false;
      }
    }
  };

  p5.Metro.prototype._processTick = function(tickTime) {
    this.metroTicks += 1;
    this.lastTick = tickTime;

    // for all of the active things on the metro:
    for (var i in syncedParts) {
      // each synced source keeps track of its own beat number
      for (var j in syncedParts[i].phrases) {
        var thisPart = syncedParts[i];
        if (thisPart.phrases[j].array[bNum] !== 0 ) {
          thisPart.phrases[i].callback(thisPart.phrases[i].array[bNum]);
        }
      }
    }
  };

  p5.Metro.prototype.setBPM = function(bpm, rampTime) {
    // var tatumFreq = this.secondsToFrequency(this.notationToSeconds(tatum.toString() + "n", bpm, transportTimeSignature));
    var freq =  (bpm / 60) / 2 * tatums;
    var ramp = rampTime || 0;
    this.oscillator.frequency.linearRampToValueAtTime(freq, ramp);
    this.clock.setRate(freq, rampTime);
  };

  p5.Metro.prototype.getBPM = function(tempo) {
    return (this.oscillator.frequency.value * 60) * 2;
  };


});