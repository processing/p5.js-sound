'use strict';
define(function (require) {

  var p5sound = require('master');
  var AudioVoice = require('audioVoice');
  var noteToFreq = require('helpers').noteToFreq;

  var DEFAULT_SUSTAIN = 0.15;

  /**
    *  A MonoSynth is used as a single voice for sound synthesis.
    *  This is a class to be used in conjunction with the PolySynth
    *  class. Custom synthetisers should be built inheriting from
    *  this class.
    *
    *  @class p5.MonoSynth
    *  @constructor
    *  @example
    *  <div><code>
    *  var monoSynth;
    *
    *  function setup() {
    *    var cnv = createCanvas(100, 100);
    *    cnv.mousePressed(playSynth);
    *
    *    monoSynth = new p5.MonoSynth();
    *
    *    textAlign(CENTER);
    *    text('click to play', width/2, height/2);
    *  }
    *
    *  function playSynth() {
    *    // time from now (in seconds)
    *    var time = 0;
    *    // note duration (in seconds)
    *    var dur = 0.25;
    *    // velocity (volume, from 0 to 1)
    *    var v = 0.2;
    *
    *    monoSynth.play("G3", v, time, dur);
    *    monoSynth.play("C4", v, time += dur, dur);
    *
    *    background(random(255), random(255), 255);
    *    text('click to play', width/2, height/2);
    *  }
    *  </code></div>
    **/

  p5.MonoSynth = function () {
    AudioVoice.call(this);

    this.oscillator = new p5.Oscillator();

    this.env = new p5.Envelope();
    this.env.setRange(1, 0);
    this.env.setExp(true);

    //set params
    this.setADSR(0.02, 0.25, 0.05, 0.35);

    // oscillator --> env --> this.output (gain) --> p5.soundOut
    this.oscillator.disconnect();
    this.oscillator.connect(this.output);

    this.env.disconnect();
    this.env.setInput(this.output.gain);

    // reset oscillator gain to 1.0
    this.oscillator.output.gain.value = 1.0;

    this.oscillator.start();
    this.connect();

    p5sound.soundArray.push(this);
  };

  p5.MonoSynth.prototype = Object.create(p5.AudioVoice.prototype);

  /**
    *  Play tells the MonoSynth to start playing a note. This method schedules
    *  the calling of .triggerAttack and .triggerRelease.
    *
    *  @method play
    *  @for p5.MonoSynth
    *  @param {String | Number} note the note you want to play, specified as a
    *                                 frequency in Hertz (Number) or as a midi
    *                                 value in Note/Octave format ("C4", "Eb3"...etc")
    *                                 See <a href = "https://github.com/Tonejs/Tone.js/wiki/Instruments">
    *                                 Tone</a>. Defaults to 440 hz.
    *  @param  {Number} [velocity] velocity of the note to play (ranging from 0 to 1)
    *  @param  {Number} [secondsFromNow]  time from now (in seconds) at which to play
    *  @param  {Number} [sustainTime] time to sustain before releasing the envelope
    *  @example
    *  <div><code>
    *  var monoSynth;
    *
    *  function setup() {
    *    var cnv = createCanvas(100, 100);
    *    cnv.mousePressed(playSynth);
    *
    *    monoSynth = new p5.MonoSynth();
    *
    *    textAlign(CENTER);
    *    text('click to play', width/2, height/2);
    *  }
    *
    *  function playSynth() {
    *    // time from now (in seconds)
    *    var time = 0;
    *    // note duration (in seconds)
    *    var dur = 1/6;
    *    // note velocity (volume, from 0 to 1)
    *    var v = random();
    *
    *    monoSynth.play("Fb3", v, 0, dur);
    *    monoSynth.play("Gb3", v, time += dur, dur);
    *
    *    background(random(255), random(255), 255);
    *    text('click to play', width/2, height/2);
    *  }
    *  </code></div>
    *
    */
  p5.MonoSynth.prototype.play = function (note, velocity, secondsFromNow, susTime) {
    this.triggerAttack(note, velocity, ~~secondsFromNow);
    this.triggerRelease(~~secondsFromNow + (susTime || DEFAULT_SUSTAIN));
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
     *  @param  {Number} [velocity] velocity of the note to play (ranging from 0 to 1)
     *  @param  {Number} [secondsFromNow]  time from now (in seconds) at which to play
     *  @method  triggerAttack
     *  @for p5.MonoSynth
     *  @example
     *  <div><code>
     *  var monoSynth = new p5.MonoSynth();
     *
     *  function mousePressed() {
     *    monoSynth.triggerAttack("E3");
     *  }
     *
     *  function mouseReleased() {
     *    monoSynth.triggerRelease();
     *  }
     *  </code></div>
     */
  p5.MonoSynth.prototype.triggerAttack = function (note, velocity, secondsFromNow) {
    var secondsFromNow = ~~secondsFromNow;
    var freq = noteToFreq(note);
    var vel = velocity || 0.1;
    this.oscillator.freq(freq, 0, secondsFromNow);
    this.env.ramp(this.output.gain, secondsFromNow, vel);
  };

  /**
     *  Trigger the release of the Envelope. This is similar to releasing
     *  the key on a piano and letting the sound fade according to the
     *  release level and release time.
     *
     *  @param  {Number} secondsFromNow time to trigger the release
     *  @method  triggerRelease
     *  @for p5.MonoSynth
     *  @example
     *  <div><code>
     *  var monoSynth = new p5.MonoSynth();
     *
     *  function mousePressed() {
     *    monoSynth.triggerAttack("E3");
     *  }
     *
     *  function mouseReleased() {
     *    monoSynth.triggerRelease();
     *  }
     *  </code></div>
     */
  p5.MonoSynth.prototype.triggerRelease = function (secondsFromNow) {
    var secondsFromNow = secondsFromNow || 0;
    this.env.ramp(this.output.gain, secondsFromNow, 0);
  };

  /**
     *  Set values like a traditional
     *  <a href="https://en.wikipedia.org/wiki/Synthesizer#/media/File:ADSR_parameter.svg">
     *  ADSR envelope
     *  </a>.
     *
     *  @method  setADSR
     *  @for p5.MonoSynth
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
   * @for p5.MonoSynth
   */
  /**
   * @property {Number} decay
   * @for p5.MonoSynth
   */
  /**
   * @property {Number} sustain
   * @for p5.MonoSynth
   */
  /**
   * @property {Number} release
   * @for p5.MonoSynth
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
   * @for p5.MonoSynth
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
   *  @for p5.MonoSynth
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
   *  @for p5.MonoSynth
   */
  p5.MonoSynth.prototype.disconnect = function() {
    if (this.output) {
      this.output.disconnect();
    }
  };


  /**
   *  Get rid of the MonoSynth and free up its resources / memory.
   *
   *  @method  dispose
   *  @for p5.MonoSynth
   */
  p5.MonoSynth.prototype.dispose = function() {
    AudioVoice.prototype.dispose.apply(this);

    if (this.env) {
      this.env.dispose();
    }
    if (this.oscillator) {
      this.oscillator.dispose();
    }
  };

});
