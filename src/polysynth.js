'use strict';
define(function (require) {


  var p5sound = require('master');
  var TimelineSignal = require('Tone/signal/TimelineSignal');
  require('sndcore');

  /**
    *  An AudioVoice is used as a single voice for sound synthesis.
    *  The PolySynth class holds an array of AudioVoice, and deals
    *  with voices allocations, with setting notes to be played, and
    *  parameters to be set. 
    *
    *  @class p5.PolySynth
    *  @constructor
    *  
    *  @param {Number} [synthVoice]   A monophonic synth voice inheriting
    *                                 the AudioVoice class. Defaults ot p5.MonoSynth
    *
    *  @param {Number} [polyValue] Number of voices, defaults to 8;
    *
    *
    *
    *  @example
    *  <div><code>
    *  var polysynth;
    *  function setup() {
    *    polysynth = new p5.PolySynth();
    *    polysynth.play(53,1,0,3);
    *    polysynth.play(60,1,0,2.9);
    *    polysynth.play(69,1,0,3);
    *    polysynth.play(71,1,0,3);
    *    polysynth.play(74,1,0,3);
    *  }
    *  </code></div>
    *  
    **/
  p5.PolySynth = function(audioVoice, polyValue) {
    //audiovoices will contain polyValue many monophonic synths
    this.audiovoices = [];

    /**
     * An object that holds information about which notes have been played and 
     * which notes are currently being played. New notes are added as keys
     * on the fly. While a note has been attacked, but not released, the value of the
     * key is the audiovoice which is generating that note. When notes are released,
     * the value of the key becomes undefined. 
     * @property notes 
     */
    this.notes = {};

    //indices of the most recently used, and least recently used audiovoice
    this._newest = 0;
    this._oldest = 0;

    /**
     * A PolySynth must have at least 1 voice, defaults to 8
     * @property polyvalue
     */
    this.polyValue = polyValue || 8;

    /**
     * Monosynth that generates the sound for each note that is triggered. The
     * p5.PolySynth defaults to using the p5.MonoSynth as its voice.
     * @property AudioVoice
     */
    this.AudioVoice = audioVoice === undefined ? p5.MonoSynth : audioVoice;

    /**
     * This value must only change as a note is attacked or released. Due to delay
     * and sustain times, Tone.TimelineSignal is required to schedule the change in value.
     * @property {Tone.TimelineSignal} _voicesInUse
     */
    this._voicesInUse = new TimelineSignal(0);

    this.output = p5sound.audiocontext.createGain();

    //Construct the appropriate number of audiovoices
    this._allocateVoices();
    p5sound.soundArray.push(this);
  };

  /**
   * Construct the appropriate number of audiovoices
   * @private
   */
  p5.PolySynth.prototype._allocateVoices = function() {
    for(var i = 0; i< this.polyValue; i++) {
      this.audiovoices.push(new this.AudioVoice());
      this.audiovoices[i].disconnect();
      this.audiovoices[i].connect(this.output);
    }
  };

  /**
   *  Play a note by triggering noteAttack and noteRelease with sustain time
   *  
   *  @method  play
   *  @param  {Number} [note] midi note to play (ranging from 0 to 127 - 60 being a middle C)
   *  @param  {Number} [velocity] velocity of the note to play (ranging from 0 to 1)
   *  @param  {Number} [secondsFromNow]  time from now (in seconds) at which to play
   *  @param  {Number} [sustainTime] time to sustain before releasing the envelope
   */
  p5.PolySynth.prototype.play = function (note,velocity, secondsFromNow, susTime) {
    this.noteAttack(note, velocity, secondsFromNow);
    this.noteRelease(note, secondsFromNow + susTime);
  };


  /** 
   *  noteADSR sets the envelope for a specific note that has just been triggered.
   *  Using this method modifies the envelope of whichever audiovoice is being used
   *  to play the desired note. The envelope should be reset before noteRelease is called
   *  in order to prevent the modified envelope from being used on other notes.
   *  
   *  @method  noteADSR
   *  @param {Number} [note]        Midi note on which ADSR should be set.
   *  @param {Number} [attackTime]  Time (in seconds before envelope
   *                                reaches Attack Level
   *  @param {Number} [decayTime]   Time (in seconds) before envelope
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
   **/

  p5.PolySynth.prototype.noteADSR = function (note,a,d,s,r) {
    this.audiovoices[ this.notes[note] ].setADSR(a,d,s,r);
  };


  /** 
   * Set the PolySynths global envelope. This method modifies the envelopes of each
   * monosynth so that all notes are played with this envelope.
   *  
   *  @method  setADSR
   *  @param {Number} [note]        Midi note on which ADSR should be set.
   *  @param {Number} [attackTime]  Time (in seconds before envelope
   *                                reaches Attack Level
   *  @param {Number} [decayTime]   Time (in seconds) before envelope
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
   **/
  p5.PolySynth.prototype.setADSR = function(a,d,s,r) {
    this.audiovoices.forEach(function(voice){
      voice.setADSR(a,d,s,r);
    })
  }

  /**
   *  Trigger the Attack, and Decay portion of a MonoSynth.
   *  Similar to holding down a key on a piano, but it will
   *  hold the sustain level until you let go. 
   *
   *  @method  noteAttack
   *  @param  {Number} [note]           midi note on which attack should be triggered.
   *  @param  {Number} [velocity]       velocity of the note to play (ranging from 0 to 1)/
   *  @param  {Number} [secondsFromNow] time from now (in seconds)
   *  
   */  
  p5.PolySynth.prototype.noteAttack = function (_note, _velocity, secondsFromNow) {
    var now =  p5sound.audiocontext.currentTime;
    var tFromNow = secondsFromNow || 0;
    var t = now + tFromNow;

    var note = _note === undefined ?  60 : _note;
    var velocity = _velocity === undefined ? 1 : _velocity;

    var currentVoice;

    if (this.notes[note] !== undefined) {
      this.noteRelease(note,0);
    }


    if(this._voicesInUse.value < this.polyValue) {
      currentVoice = this._voicesInUse.value;
    } else {
      currentVoice = this._oldest;

      var oldestNote = p5.prototype.freqToMidi(this.audiovoices[this._oldest].oscillator.freq().value);
      this.noteRelease(oldestNote);
      this._oldest = ( this._oldest + 1 ) % (this.polyValue - 1);
    }

    this.notes[note] = currentVoice;

    this._voicesInUse.setValueAtTime(this._voicesInUse.value + 1, t);

    this._newest = currentVoice;

    this.audiovoices[currentVoice].triggerAttack(note, velocity, secondsFromNow);

  };

  /**
   *  Trigger the Release of a MonoSynth note. This is similar to releasing
   *  the key on a piano and letting the sound fade according to the
   *  release level and release time.
   *  
   *  @method  noteRelease
   *  @param  {Number} [note]           midi note on which attack should be triggered.
   *  @param  {Number} [secondsFromNow] time to trigger the release
   *  
   */  

  p5.PolySynth.prototype.noteRelease = function (_note,secondsFromNow) {
    var note = _note === undefined ?
      p5.prototype.freqToMidi(this.audiovoices[this._newest].oscillator.freq().value)
      : _note;

    if (this.notes[_note] === undefined) {
      console.warn('Cannot release a note that is not already playing');
    } else {
      var now =  p5sound.audiocontext.currentTime;
      var tFromNow = secondsFromNow || 0;
      var t = now + tFromNow;


      this._voicesInUse.setValueAtTime(this._voicesInUse.value - 1, t);
      this.audiovoices[ this.notes[note] ].triggerRelease(secondsFromNow);
      this.notes[note] = undefined;

      this._newest = this._newest === 0 ? 0 : (this._newest - 1) % (this.polyValue - 1);
    }

  };


  /**
   *  Set cutoms parameters to a specific synth implementation 
   *  with the help of JavaScript Object Notation (JSON).
   *  
   *  @method  setParams
   *  @param   JSON object  
   * 
   *  For instance to set the detune parameter of a synth, call :
   *  setParams({detune: 15 });
   *
   */  
  p5.PolySynth.prototype.noteParams = function (note,params) {
    if(this.voices[note] == null) {
      this.voices[note] = new this.AudioVoice();
    }
    this.voices[note].setParams(params);

  };

  p5.PolySynth.prototype.connect = function (unit) {
    var u = unit || p5sound.input;
    this.output.connect(u.input ? u.input : u);
  };

  p5.PolySynth.prototype.disconnect = function() {
    this.output.disconnect();
  };

  p5.PolySynth.prototype.dispose = function() {
    this.audiovoices.forEach(function(voice){
      voice.dispose();
    });

    this.output.disconnect();
    delete this.output;
  };

});
