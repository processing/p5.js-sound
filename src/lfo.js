define(function (require) {
  'use strict';

  var p5sound = require('master');
  require('oscillator');

  /**
   *  A Low Frequency Oscillator (LFO) oscillates at a lower frequency
   *  than humans can hear, and is typically used to modulate a
   *  parameter. By default this class not connect to the master output,
   *  and oscillates at 1Hz. Use freqMod() to modulate the frequency of
   *  another oscillator, ampMod() to modulate the amplitude, and mod()
   *  to modulate any other Web Audio Param.
   *  
   *  @class Pulse
   *  @constructor
   *  @param {[Number]} freq Frequency of the oscillator (1Hz by default)
   *  @param {[String]} type Type of oscillator (defaults to 'sine')
   */
  p5.prototype.LFO = function(freq, type) {
    this.started = false;
    this.p5s = p5sound;

    // connections
    this.input = this.p5s.audiocontext.createGain();
    this.output = this.p5s.audiocontext.createGain();

    // components
    if (!this.oscillator){
      this.oscillator = this.p5s.audiocontext.createOscillator();
      this.oscillator.frequency.value = freq || 1;
      this.f = this.oscillator.frequency.value;
      this.oscillator.type = type || 'sine';
    }
    // set default output gain
    this.output.gain.value = 1;

    // connect to nothing by default
    this.oscillator.connect(this.output);
  };

  p5.prototype.LFO.prototype = Object.create(p5.prototype.Oscillator.prototype);

  /**
   *  Frequency Modulation (FM): Modulate the frequency
   *  of another signal with the frequency of this LFO.
   *  Pass in the oscillator whose frequency you want to
   *  modulate.
   *
   *  @method  freqMod
   *  @param  {Object} oscillator The oscillator whose frequency will
   *                              be modulated.
   */
  p5.prototype.LFO.prototype.freqMod = function(unit){
    unit.oscillator.frequency.cancelScheduledValues(this.p5s.audiocontext.currentTime);
    this.output.connect(unit.oscillator.frequency);
    // for Pulse
    if (unit.oscillator.osc2){
      this.output.connect(unit.osc2.oscillator.frequency);
    }
    // save the connections in case the oscillator doesn't exist
    if (!unit.mods){
      unit.mods = {};
    }
    unit.mods.frequency = this.output;
    // also save a record of the connections in an array
    if (this.connections === undefined) {
      this.connections = [];
    }
    this.connections.push(unit.mods.frequency);
  };

  /**
   *  Amplitude Modulation (AM): Modulate the amplitude
   *  of another signal with the frequency of this LFO.
   *  Pass in the oscillator whose amplitude you want to
   *  modulate.
   *
   *  @method  ampMod
   *  @param  {Object} oscillator The oscillator whose amplitude will
   *                              be modulated.
   */
  p5.prototype.LFO.prototype.ampMod = function(unit){
    unit.output.gain.cancelScheduledValues(this.p5s.audiocontext.currentTime);
    this.output.connect(unit.output.gain);
  };

  p5.prototype.LFO.prototype.disconnect = function(unit){
    this.output.disconnect(unit);
    // disassociate all connections that have been made with this LFO
    for (var i = 0; i< this.connections.length; i++){
      this.connections[i] = null;
    }
  };

  p5.prototype.LFO.prototype.freq = function(val, t){
    this.f = val;
    var rampTime = t || 0;
    this.oscillator.frequency.cancelScheduledValues(this.p5s.audiocontext.currentTime);
    this.oscillator.frequency.exponentialRampToValueAtTime(val, rampTime + this.p5s.audiocontext.currentTime);
  };

});