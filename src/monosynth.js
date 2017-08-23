'use strict';
define(function (require) {

  var p5sound = require('master');
  var AudioVoice = require('audioVoice');

  /**
    *  An MonoSynth is used as a single voice for sound synthesis.
    *  This is a class to be used in conjonction with the PolySynth
    *  class. Custom synthetisers should be built inheriting from
    *  this class.
    *
    *  @class p5.MonoSynth
    *  @constructor
    *  @example
    *  <div><code>
    *  var monosynth;
    *  var x;
    *
    *  function setup() {
    *    monosynth = new p5.MonoSynth();
    *    monosynth.loadPreset('simpleBass');
    *    monosynth.play(45,1,x=0,1);
    *    monosynth.play(49,1,x+=1,0.25);
    *    monosynth.play(50,1,x+=0.25,0.25);
    *    monosynth.play(49,1,x+=0.5,0.25);
    *    monosynth.play(50,1,x+=0.25,0.25);
    *  }
    *  </code></div>
    **/

  p5.MonoSynth = function () {
    AudioVoice.call(this);

    this.oscillator = new p5.Oscillator();
    // this.oscillator.disconnect();

    this.env = new p5.Env();
    this.env.setRange(1, 0);
    this.env.setExp(true);

    //set params
    this.setADSR(0.02, 0.25, 0.05, 0.35);

    // filter
    this.filter = new p5.Filter('highpass');
    this.filter.set(5, 1);

    // oscillator --> env --> filter --> this.output (gain) --> p5.soundOut
    this.oscillator.disconnect();
    this.oscillator.connect(this.filter);
    this.env.disconnect();
    this.env.setInput(this.oscillator);
    // this.env.connect(this.filter);
    this.filter.connect(this.output);

    this.oscillator.start();
    this.connect();

    //Audiovoices are connected to soundout by default

    this._isOn = false;

    p5sound.soundArray.push(this);
  };

  p5.MonoSynth.prototype = Object.create(p5.AudioVoice.prototype);

  /**
     *  Play tells the MonoSynth to start playing a note. This method schedules
     *  the calling of .triggerAttack and .triggerRelease.
     *
     *  @method play
     *  @param {String | Number} note the note you want to play, specified as a 
     *                                 frequency in Hertz (Number) or as a midi 
     *                                 value in Note/Octave format ("C4", "Eb3"...etc")
     *                                 See <a href = "https://github.com/Tonejs/Tone.js/wiki/Instruments">
     *                                 Tone</a>. Defaults to 440 hz.
     *  @param  {Number} [velocity] velocity of the note to play (ranging from 0 to 1)
     *  @param  {Number} [secondsFromNow]  time from now (in seconds) at which to play
     *  @param  {Number} [sustainTime] time to sustain before releasing the envelope
     *
     */
  p5.MonoSynth.prototype.play = function (note, velocity, secondsFromNow, susTime) {
    // set range of env (TO DO: allow this to be scheduled in advance)
    var susTime = susTime || this.sustain;
    this.susTime = susTime;
    this.triggerAttack(note, velocity, secondsFromNow);
    this.triggerRelease(secondsFromNow + susTime);
  };

  /**
     *  Trigger the Attack, and Decay portion of the Envelope.
     *  Similar to holding down a key on a piano, but it will
     *  hold the sustain level until you let go.
     *
     *  @param {String | Number} note the note you want to play, specified as a 
     *                                 frequency in Hertz (Number) or as a midi 
     *                                 value in Note/Octave format ("C4", "Eb3"...etc")
     *                                 See <a href = "https://github.com/Tonejs/Tone.js/wiki/Instruments">
     *                                 Tone</a>. Defaults to 440 hz
     *  @param  {Number} secondsFromNow time from now (in seconds)
     *  @param  {Number} [velocity] velocity of the note to play (ranging from 0 to 1)
     *  @param  {Number} [secondsFromNow]  time from now (in seconds) at which to play
     *  @method  triggerAttack
     */
  p5.MonoSynth.prototype.triggerAttack = function (note, velocity, secondsFromNow) {
    var secondsFromNow = secondsFromNow || 0;

    //triggerAttack uses ._setNote to convert a midi string to a frequency if necessary
    var freq = typeof note === 'string' ? this._setNote(note)
      : typeof note === 'number' ? note : 440;
    var vel = velocity || 1;
    this._isOn = true;
    this.oscillator.freq(freq, 0, secondsFromNow);
    this.env.ramp(this.output, secondsFromNow, vel);
  };

  /**
     *  Trigger the release of the Envelope. This is similar to releasing
     *  the key on a piano and letting the sound fade according to the
     *  release level and release time.
     *
     *  @param  {Number} secondsFromNow time to trigger the release
     *  @method  triggerRelease
     */
  p5.MonoSynth.prototype.triggerRelease = function (secondsFromNow) {
    var secondsFromNow = secondsFromNow || 0;
    this.env.ramp(this.output, secondsFromNow, 0);
    this._isOn = false;
  };

  /**
     *  Set values like a traditional
     *  <a href="https://en.wikipedia.org/wiki/Synthesizer#/media/File:ADSR_parameter.svg">
     *  ADSR envelope
     *  </a>.
     *
     *  @method  setADSR
     *  @param {Number} attackTime    Time (in seconds before envelope
     *                                reaches Attack Level
     *  @param {Number} [decayTime]    Time (in seconds) before envelope
     *                                reaches Decay/Sustain Level
     *  @param {Number} [susRatio]    Ratio between attackLevel and releaseLevel, on a scale from 0 to 1,
     *                                where 1.0 = attackLevel, 0.0 = releaseLevel.
     *                                The susRatio determines the decayLevel and the level at which the
     *                                sustain portion of the envelope will sustain.
     *                                For example, if attackLevel is 0.4, releaseLevel is 0,
     *                                and susAmt is 0.5, the decayLevel would be 0.2. If attackLevel is
     *                                increased to 1.0 (using <code>setRange</code>),
     *                                then decayLevel would increase proportionally, to become 0.5.
     *  @param {Number} [releaseTime]   Time in seconds from now (defaults to 0)
     */
  p5.MonoSynth.prototype.setADSR = function (attack,decay,sustain,release) {
    this.env.setADSR(attack, decay,  sustain, release);
  };


  /**
   * Getters and Setters
   * @property {Number} attack
   * @property {Number} decay
   * @property {Number} sustain
   * @property {Number} release
   */
  Object.defineProperties(p5.MonoSynth.prototype, {
    'attack': {
      get : function() {
        return this.env.aTime;
      },
      set : function(attack) {
        this.env.setADSR(attack, this.env.dTime,
          this.env.sPercent, this.env.rTime);
      }
    },
    'decay': {
      get : function() {
        return this.env.dTime;
      },
      set : function(decay) {
        this.env.setADSR(this.env.aTime, decay,
          this.env.sPercent, this.env.rTime);
      }
    },
    'sustain': {
      get : function() {
        return this.env.sPercent;
      },
      set : function(sustain) {
        this.env.setADSR(this.env.aTime, this.env.dTime,
          sustain, this.env.rTime);
      }
    },
    'release': {
      get : function() {
        return this.env.rTime;
      },
      set : function(release) {
        this.env.setADSR(this.env.aTime, this.env.dTime,
          this.env.sPercent, release);
      }
    },
  });


  /**
   * MonoSynth amp
   * @method  amp
   * @param  {Number} vol      desired volume
   * @param  {Number} [rampTime] Time to reach new volume
   * @return {Number}          new volume value
   */
  p5.MonoSynth.prototype.amp = function(vol, rampTime) {
    var t = rampTime || 0;
    if (typeof vol !== 'undefined') {
      this.oscillator.amp(vol, t);
    }
    return this.oscillator.amp().value;
  };

  /**
   *  Connect to a p5.sound / Web Audio object.
   *
   *  @method  connect
   *  @param  {Object} unit A p5.sound or Web Audio object
   */

  p5.MonoSynth.prototype.connect = function(unit) {
    var u = unit || p5sound.input;
    this.output.connect(u.input ? u.input : u);
  };

  /**
   *  Disconnect all outputs
   *
   *  @method  disconnect
   */
  p5.MonoSynth.prototype.disconnect = function() {
    this.output.disconnect();
  };


  /**
   *  Get rid of the MonoSynth and free up its resources / memory.
   *
   *  @method  dispose
   */
  p5.MonoSynth.prototype.dispose = function() {
    AudioVoice.prototype.dispose.apply(this);

    this.filter.dispose();
    this.env.dispose();
    try {
      this.oscillator.dispose();
    } catch(e) {
      console.error('mono synth default oscillator already disposed');
    }
  };

});
