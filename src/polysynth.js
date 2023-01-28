import p5sound from './main';
import TimelineSignal from 'Tone/signal/TimelineSignal.js';
import { noteToFreq } from './helpers';

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
 *                                 the AudioVoice class. Defaults to p5.MonoSynth
 *  @param {Number} [maxVoices] Number of voices, defaults to 8;
 *  @example
 *  <div><code>
 *  let polySynth;
 *
 *  function setup() {
 *    let cnv = createCanvas(100, 100);
 *    cnv.mousePressed(playSynth);
 *    background(220);
 *    text('click to play', 20, 20);
 *
 *    polySynth = new p5.PolySynth();
 *  }
 *
 *  function playSynth() {
 *    userStartAudio();
 *
 *    // note duration (in seconds)
 *    let dur = 1.5;
 *
 *    // time from now (in seconds)
 *    let time = 0;
 *
 *    // velocity (volume, from 0 to 1)
 *    let vel = 0.1;
 *
 *    // notes can overlap with each other
 *    polySynth.play('G2', vel, 0, dur);
 *    polySynth.play('C3', vel, time += 1/3, dur);
 *    polySynth.play('G3', vel, time += 1/3, dur);
 *  }
 *  </code></div>
 **/
class PolySynth {
  constructor(audioVoice, maxVoices) {
    //audiovoices will contain maxVoices many monophonic synths
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
    this.maxVoices = maxVoices || 8;

    /**
     * Monosynth that generates the sound for each note that is triggered. The
     * p5.PolySynth defaults to using the p5.MonoSynth as its voice.
     * @property AudioVoice
     */
    this.AudioVoice = audioVoice === undefined ? p5.MonoSynth : audioVoice;

    /**
     * This value must only change as a note is attacked or released. Due to delay
     * and sustain times, Tone.TimelineSignal is required to schedule the change in value.
     * @private
     * @property {Tone.TimelineSignal} _voicesInUse
     */
    this._voicesInUse = new TimelineSignal(0);

    this.output = p5sound.audiocontext.createGain();
    this.connect();

    //Construct the appropriate number of audiovoices
    this._allocateVoices();
    p5sound.soundArray.push(this);
  }

  /**
   * Construct the appropriate number of audiovoices
   * @private
   * @for p5.PolySynth
   * @method  _allocateVoices
   */
  _allocateVoices() {
    for (var i = 0; i < this.maxVoices; i++) {
      this.audiovoices.push(new this.AudioVoice());
      this.audiovoices[i].disconnect();
      this.audiovoices[i].connect(this.output);
    }
  }

  /**
   *  Play a note by triggering noteAttack and noteRelease with sustain time
   *
   *  @method  play
   *  @for p5.PolySynth
   *  @param  {Number} [note] midi note to play (ranging from 0 to 127 - 60 being a middle C)
   *  @param  {Number} [velocity] velocity of the note to play (ranging from 0 to 1)
   *  @param  {Number} [secondsFromNow]  time from now (in seconds) at which to play
   *  @param  {Number} [sustainTime] time to sustain before releasing the envelope
   *  @example
   *  <div><code>
   *  let polySynth;
   *
   *  function setup() {
   *    let cnv = createCanvas(100, 100);
   *    cnv.mousePressed(playSynth);
   *    background(220);
   *    text('click to play', 20, 20);
   *
   *    polySynth = new p5.PolySynth();
   *  }
   *
   *  function playSynth() {
   *    userStartAudio();
   *
   *    // note duration (in seconds)
   *    let dur = 1.5;
   *
   *    // time from now (in seconds)
   *    let time = 0;
   *
   *    // velocity (volume, from 0 to 1)
   *    let vel = 0.1;
   *
   *    // notes can overlap with each other
   *    polySynth.play('G2', vel, 0, dur);
   *    polySynth.play('C3', vel, time += 1/3, dur);
   *    polySynth.play('G3', vel, time += 1/3, dur);
   *  }
   *  </code></div>
   */
  play(note, velocity = 0.1, secondsFromNow = 0, susTime = 1) {
    this.noteAttack(note, velocity, secondsFromNow);
    this.noteRelease(note, secondsFromNow + susTime);
  }

  /**
   *  noteADSR sets the envelope for a specific note that has just been triggered.
   *  Using this method modifies the envelope of whichever audiovoice is being used
   *  to play the desired note. The envelope should be reset before noteRelease is called
   *  in order to prevent the modified envelope from being used on other notes.
   *
   *  @method  noteADSR
   *  @for p5.PolySynth
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

  noteADSR(note, a, d, s, r, timeFromNow = 0) {
    var now = p5sound.audiocontext.currentTime;
    var t = now + timeFromNow;
    this.audiovoices[this.notes[note].getValueAtTime(t)].setADSR(a, d, s, r);
  }

  /**
   * Set the PolySynths global envelope. This method modifies the envelopes of each
   * monosynth so that all notes are played with this envelope.
   *
   *  @method  setADSR
   *  @for p5.PolySynth
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
  setADSR(a, d, s, r) {
    this.audiovoices.forEach(function (voice) {
      voice.setADSR(a, d, s, r);
    });
  }

  /**
   *  Trigger the Attack, and Decay portion of a MonoSynth.
   *  Similar to holding down a key on a piano, but it will
   *  hold the sustain level until you let go.
   *
   *  @method  noteAttack
   *  @for p5.PolySynth
   *  @param  {Number} [note]           midi note on which attack should be triggered.
   *  @param  {Number} [velocity]       velocity of the note to play (ranging from 0 to 1)/
   *  @param  {Number} [secondsFromNow] time from now (in seconds)
   *  @example
   *  <div><code>
   *  let polySynth = new p5.PolySynth();
   *  let pitches = ['G', 'D', 'G', 'C'];
   *  let octaves = [2, 3, 4];
   *
   *  function setup() {
   *    let cnv = createCanvas(100, 100);
   *    cnv.mousePressed(playChord);
   *    background(220);
   *    text('tap to play', 20, 20);
   *  }
   *
   *  function playChord() {
   *    userStartAudio();
   *
   *    // play a chord: multiple notes at the same time
   *    for (let i = 0; i < 4; i++) {
   *      let note = random(pitches) + random(octaves);
   *      polySynth.noteAttack(note, 0.1);
   *    }
   *  }
   *
   *  function mouseReleased() {
   *    // release all voices
   *    polySynth.noteRelease();
   *  }
   *  </code></div>
   */
  noteAttack(_note, _velocity, secondsFromNow = 0) {
    //this value is used by this._voicesInUse
    var acTime = p5sound.audiocontext.currentTime + secondsFromNow;

    //Convert note to frequency if necessary. This is because entries into this.notes
    //should be based on frequency for the sake of consistency.
    var note = noteToFreq(_note);
    var velocity = _velocity || 0.1;

    var currentVoice;

    //Release the note if it is already playing
    if (this.notes[note] && this.notes[note].getValueAtTime(acTime) !== null) {
      this.noteRelease(note, 0);
    }

    //Check to see how many voices are in use at the time the note will start
    if (this._voicesInUse.getValueAtTime(acTime) < this.maxVoices) {
      currentVoice = Math.max(~~this._voicesInUse.getValueAtTime(acTime), 0);
    }
    //If we are exceeding the polyvalue, bump off the oldest notes and replace
    //with a new note
    else {
      currentVoice = this._oldest;

      let oldestNote = this.audiovoices[this._oldest].oscillator.freq().value;
      this.noteRelease(oldestNote);
      this._oldest = (this._oldest + 1) % (this.maxVoices - 1);
    }

    //Overrite the entry in the notes object. A note (frequency value)
    //corresponds to the index of the audiovoice that is playing it
    this.notes[note] = new TimelineSignal();
    this.notes[note].setValueAtTime(currentVoice, acTime);

    //Find the scheduled change in this._voicesInUse that will be previous to this new note
    //Add 1 and schedule this value at time 't', when this note will start playing
    var previousVal =
      this._voicesInUse._searchBefore(acTime) === null
        ? 0
        : this._voicesInUse._searchBefore(acTime).value;
    this._voicesInUse.setValueAtTime(previousVal + 1, acTime);

    //Then update all scheduled values that follow to increase by 1
    this._updateAfter(acTime, 1);

    this._newest = currentVoice;
    //The audiovoice handles the actual scheduling of the note
    if (typeof velocity === 'number') {
      var maxRange = (1 / this._voicesInUse.getValueAtTime(acTime)) * 2;
      velocity = velocity > maxRange ? maxRange : velocity;
    }

    // use secondsFromNow because this method will add AudioContext currentTime
    this.audiovoices[currentVoice].triggerAttack(
      note,
      velocity,
      secondsFromNow
    );
  }

  /**
   * Private method to ensure accurate values of this._voicesInUse
   * Any time a new value is scheduled, it is necessary to increment all subsequent
   * scheduledValues after attack, and decrement all subsequent
   * scheduledValues after release
   *
   * @private
   * @for p5.PolySynth
   * @param  {[type]} time  [description]
   * @param  {[type]} value [description]
   * @return {[type]}       [description]
   */
  _updateAfter(time, value) {
    if (this._voicesInUse._searchAfter(time) === null) {
      return;
    } else {
      this._voicesInUse._searchAfter(time).value += value;
      var nextTime = this._voicesInUse._searchAfter(time).time;
      this._updateAfter(nextTime, value);
    }
  }

  /**
   *  Trigger the Release of an AudioVoice note. This is similar to releasing
   *  the key on a piano and letting the sound fade according to the
   *  release level and release time.
   *
   *  @method  noteRelease
   *  @for p5.PolySynth
   *  @param  {Number} [note]           midi note on which attack should be triggered.
   *                                    If no value is provided, all notes will be released.
   *  @param  {Number} [secondsFromNow] time to trigger the release
   *  @example
   *  <div><code>
   *  let polySynth = new p5.PolySynth();
   *  let pitches = ['G', 'D', 'G', 'C'];
   *  let octaves = [2, 3, 4];
   *
   *  function setup() {
   *    let cnv = createCanvas(100, 100);
   *    cnv.mousePressed(playChord);
   *    background(220);
   *    text('tap to play', 20, 20);
   *  }
   *
   *  function playChord() {
   *    userStartAudio();
   *
   *    // play a chord: multiple notes at the same time
   *    for (let i = 0; i < 4; i++) {
   *      let note = random(pitches) + random(octaves);
   *      polySynth.noteAttack(note, 0.1);
   *    }
   *  }
   *
   *  function mouseReleased() {
   *    // release all voices
   *    polySynth.noteRelease();
   *  }
   *  </code></div>
   *
   */
  noteRelease(_note, secondsFromNow) {
    var now = p5sound.audiocontext.currentTime;
    var tFromNow = secondsFromNow || 0;
    var t = now + tFromNow;

    // if a note value is not provided, release all voices
    if (!_note) {
      this.audiovoices.forEach(function (voice) {
        voice.triggerRelease(tFromNow);
      });
      this._voicesInUse.setValueAtTime(0, t);
      for (var n in this.notes) {
        this.notes[n].dispose();
        delete this.notes[n];
      }
      this._newest = 0;
      this._oldest = 0;
      return;
    }

    //Make sure note is in frequency inorder to query the this.notes object
    var note = noteToFreq(_note);

    if (!this.notes[note] || this.notes[note].getValueAtTime(t) === null) {
      console.warn('Cannot release a note that is not already playing');
    } else {
      //Find the scheduled change in this._voicesInUse that will be previous to this new note
      //subtract 1 and schedule this value at time 't', when this note will stop playing
      var previousVal = Math.max(~~this._voicesInUse.getValueAtTime(t), 1);
      this._voicesInUse.setValueAtTime(previousVal - 1, t);
      //Then update all scheduled values that follow to decrease by 1 but never go below 0
      if (previousVal > 0) {
        this._updateAfter(t, -1);
      }

      this.audiovoices[this.notes[note].getValueAtTime(t)].triggerRelease(
        tFromNow
      );
      this.notes[note].dispose();
      delete this.notes[note];

      this._newest =
        this._newest === 0 ? 0 : (this._newest - 1) % (this.maxVoices - 1);
    }
  }

  /**
   *  Connect to a p5.sound / Web Audio object.
   *
   *  @method  connect
   *  @for p5.PolySynth
   *  @param  {Object} unit A p5.sound or Web Audio object
   */
  connect(unit) {
    var u = unit || p5sound.input;
    this.output.connect(u.input ? u.input : u);
    if (unit && unit._onNewInput) {
      unit._onNewInput(this);
    }
  }

  /**
   *  Disconnect all outputs
   *
   *  @method  disconnect
   *  @for p5.PolySynth
   */
  disconnect() {
    if (this.output) {
      this.output.disconnect();
    }
  }

  /**
   *  Get rid of the MonoSynth and free up its resources / memory.
   *
   *  @method  dispose
   *  @for p5.PolySynth
   */
  dispose() {
    this.audiovoices.forEach(function (voice) {
      voice.dispose();
    });

    if (this.output) {
      this.output.disconnect();
      delete this.output;
    }
  }
}

export default PolySynth;
