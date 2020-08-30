import p5sound from './master';
import Metro from './metro';

var BPM = 120;

/**
 *  Set the global tempo, in beats per minute, for all
 *  p5.Parts. This method will impact all active p5.Parts.
 *
 *  @method setBPM
 *  @for p5
 *  @param {Number} BPM      Beats Per Minute
 *  @param {Number} rampTime Seconds from now
 */
p5.prototype.setBPM = function (bpm, rampTime) {
  BPM = bpm;
  for (var i in p5sound.parts) {
    if (p5sound.parts[i]) {
      p5sound.parts[i].setBPM(bpm, rampTime);
    }
  }
};

/**
 *  <p>A phrase is a pattern of musical events over time, i.e.
 *  a series of notes and rests.</p>
 *
 *  <p>Phrases must be added to a p5.Part for playback, and
 *  each part can play multiple phrases at the same time.
 *  For example, one Phrase might be a kick drum, another
 *  could be a snare, and another could be the bassline.</p>
 *
 *  <p>The first parameter is a name so that the phrase can be
 *  modified or deleted later. The callback is a a function that
 *  this phrase will call at every step—for example it might be
 *  called <code>playNote(value){}</code>. The array determines
 *  which value is passed into the callback at each step of the
 *  phrase. It can be numbers, an object with multiple numbers,
 *  or a zero (0) indicates a rest so the callback won't be called).</p>
 *
 *  @class p5.Phrase
 *  @constructor
 *  @param {String}   name     Name so that you can access the Phrase.
 *  @param {Function} callback The name of a function that this phrase
 *                             will call. Typically it will play a sound,
 *                             and accept two parameters: a time at which
 *                             to play the sound (in seconds from now),
 *                             and a value from the sequence array. The
 *                             time should be passed into the play() or
 *                             start() method to ensure precision.
 *  @param {Array}   sequence    Array of values to pass into the callback
 *                            at each step of the phrase.
 *  @example
 *  <div><code>
 *  let mySound, myPhrase, myPart;
 *  let pattern = [1,0,0,2,0,2,0,0];
 *
 *  function preload() {
 *    mySound = loadSound('assets/beatbox.mp3');
 *  }
 *
 *  function setup() {
 *    let cnv = createCanvas(100, 100);
 *    cnv.mousePressed(playMyPart);
 *    background(220);
 *    text('tap to play', width/2, height/2);
 *    textAlign(CENTER, CENTER);
 *
 *    myPhrase = new p5.Phrase('bbox', onEachStep, pattern);
 *    myPart = new p5.Part();
 *    myPart.addPhrase(myPhrase);
 *    myPart.setBPM(60);
 *  }
 *
 *  function onEachStep(time, playbackRate) {
 *    mySound.rate(playbackRate);
 *    mySound.play(time);
 *  }
 *
 *  function playMyPart() {
 *    userStartAudio();
 *    myPart.start();
 *  }
 *  </code></div>
 */
class Phrase {
  constructor(name, callback, sequence) {
    this.phraseStep = 0;
    this.name = name;
    this.callback = callback;
    /**
     * Array of values to pass into the callback
     * at each step of the phrase. Depending on the callback
     * function's requirements, these values may be numbers,
     * strings, or an object with multiple parameters.
     * Zero (0) indicates a rest.
     *
     * @property {Array} sequence
     */
    this.sequence = sequence;
  }
}

/**
 *  <p>A p5.Part plays back one or more p5.Phrases. Instantiate a part
 *  with steps and tatums. By default, each step represents a 1/16th note.</p>
 *
 *  <p>See p5.Phrase for more about musical timing.</p>
 *
 *  @class p5.Part
 *  @constructor
 *  @param {Number} [steps]   Steps in the part
 *  @param {Number} [tatums] Divisions of a beat, e.g. use 1/4, or 0.25 for a quater note (default is 1/16, a sixteenth note)
 *  @example
 *  <div><code>
 *  let box, drum, myPart;
 *  let boxPat = [1,0,0,2,0,2,0,0];
 *  let drumPat = [0,1,1,0,2,0,1,0];
 *
 *  function preload() {
 *    box = loadSound('assets/beatbox.mp3');
 *    drum = loadSound('assets/drum.mp3');
 *  }
 *
 *  function setup() {
 *    let cnv = createCanvas(100, 100);
 *    cnv.mousePressed(playMyPart);
 *    background(220);
 *    textAlign(CENTER, CENTER);
 *    text('tap to play', width/2, height/2);
 *
 *    let boxPhrase = new p5.Phrase('box', playBox, boxPat);
 *    let drumPhrase = new p5.Phrase('drum', playDrum, drumPat);
 *    myPart = new p5.Part();
 *    myPart.addPhrase(boxPhrase);
 *    myPart.addPhrase(drumPhrase);
 *    myPart.setBPM(60);
 *  }
 *
 *  function playBox(time, playbackRate) {
 *    box.rate(playbackRate);
 *    box.play(time);
 *  }
 *
 *  function playDrum(time, playbackRate) {
 *    drum.rate(playbackRate);
 *    drum.play(time);
 *  }
 *
 *  function playMyPart() {
 *    userStartAudio();
 *
 *    myPart.start();
 *  }
 *  </code></div>
 */
class Part {
  constructor(steps, bLength) {
    this.length = steps || 0; // how many beats
    this.partStep = 0;
    this.phrases = [];
    this.isPlaying = false;
    this.noLoop();
    this.tatums = bLength || 0.0625; // defaults to quarter note

    this.metro = new Metro();
    this.metro._init();
    this.metro.beatLength(this.tatums);
    this.metro.setBPM(BPM);
    p5sound.parts.push(this);
    this.callback = function () {};
  }

  /**
   *  Set the tempo of this part, in Beats Per Minute.
   *
   *  @method  setBPM
   *  @for p5.Part
   *  @param {Number} BPM      Beats Per Minute
   *  @param {Number} [rampTime] Seconds from now
   */
  setBPM(tempo, rampTime) {
    this.metro.setBPM(tempo, rampTime);
  }

  /**
   *  Returns the tempo, in Beats Per Minute, of this part.
   *
   *  @method getBPM
   *  @for p5.Part
   *  @return {Number}
   */
  getBPM() {
    return this.metro.getBPM();
  }

  /**
   *  Start playback of this part. It will play
   *  through all of its phrases at a speed
   *  determined by setBPM.
   *
   *  @method  start
   *  @for p5.Part
   *  @param  {Number} [time] seconds from now
   */
  start(time) {
    if (!this.isPlaying) {
      this.isPlaying = true;
      this.metro.resetSync(this);
      var t = time || 0;
      this.metro.start(t);
    }
  }

  /**
   *  Loop playback of this part. It will begin
   *  looping through all of its phrases at a speed
   *  determined by setBPM.
   *
   *  @method  loop
   *  @for p5.Part
   *  @param  {Number} [time] seconds from now
   */
  loop(time) {
    this.looping = true;
    // rest onended function
    this.onended = function () {
      this.partStep = 0;
    };
    var t = time || 0;
    this.start(t);
  }

  /**
   *  Tell the part to stop looping.
   *
   *  @method  noLoop
   *  @for p5.Part
   */
  noLoop() {
    this.looping = false;
    // rest onended function
    this.onended = function () {
      this.stop();
    };
  }

  /**
   *  Stop the part and cue it to step 0. Playback will resume from the begining of the Part when it is played again.
   *
   *  @method  stop
   *  @for p5.Part
   *  @param  {Number} [time] seconds from now
   */
  stop(time) {
    this.partStep = 0;
    this.pause(time);
  }

  /**
   *  Pause the part. Playback will resume
   *  from the current step.
   *
   *  @method  pause
   *  @for p5.Part
   *  @param  {Number} time seconds from now
   */
  pause(time) {
    this.isPlaying = false;
    var t = time || 0;
    this.metro.stop(t);
  }

  /**
   *  Add a p5.Phrase to this Part.
   *
   *  @method  addPhrase
   *  @for p5.Part
   *  @param {p5.Phrase}   phrase   reference to a p5.Phrase
   */
  addPhrase(name, callback, array) {
    var p;
    if (arguments.length === 3) {
      p = new Phrase(name, callback, array);
    } else if (arguments[0] instanceof Phrase) {
      p = arguments[0];
    } else {
      throw 'invalid input. addPhrase accepts name, callback, array or a p5.Phrase';
    }
    this.phrases.push(p);
    // reset the length if phrase is longer than part's existing length
    if (p.sequence.length > this.length) {
      this.length = p.sequence.length;
    }
  }

  /**
   *  Remove a phrase from this part, based on the name it was
   *  given when it was created.
   *
   *  @method  removePhrase
   *  @for p5.Part
   *  @param  {String} phraseName
   */
  removePhrase(name) {
    for (var i in this.phrases) {
      if (this.phrases[i].name === name) {
        this.phrases.splice(i, 1);
      }
    }
  }

  /**
   *  Get a phrase from this part, based on the name it was
   *  given when it was created. Now you can modify its array.
   *
   *  @method  getPhrase
   *  @for p5.Part
   *  @param  {String} phraseName
   */
  getPhrase(name) {
    for (var i in this.phrases) {
      if (this.phrases[i].name === name) {
        return this.phrases[i];
      }
    }
  }

  /**
   *  Find all sequences with the specified name, and replace their patterns with the specified array.
   *
   *  @method  replaceSequence
   *  @for p5.Part
   *  @param  {String} phraseName
   *  @param  {Array} sequence  Array of values to pass into the callback
   *                            at each step of the phrase.
   */
  replaceSequence(name, array) {
    for (var i in this.phrases) {
      if (this.phrases[i].name === name) {
        this.phrases[i].sequence = array;
      }
    }
  }

  incrementStep(time) {
    if (this.partStep < this.length - 1) {
      this.callback(time);
      this.partStep += 1;
    } else {
      if (!this.looping && this.partStep === this.length - 1) {
        // this.callback(time);
        this.onended();
      }
    }
  }

  /**
   *  Set the function that will be called at every step. This will clear the previous function.
   *
   *  @method onStep
   *  @for p5.Part
   *  @param  {Function} callback The name of the callback
   *                              you want to fire
   *                              on every beat/tatum.
   */
  onStep(callback) {
    this.callback = callback;
  }
}

// ===============
// p5.Score
// ===============

/**
 *  A Score consists of a series of Parts. The parts will
 *  be played back in order. For example, you could have an
 *  A part, a B part, and a C part, and play them back in this order
 *  <code>new p5.Score(a, a, b, a, c)</code>
 *
 *  @class p5.Score
 *  @constructor
 *  @param {p5.Part} [...parts] One or multiple parts, to be played in sequence.
 */
class Score {
  constructor() {
    // for all of the arguments
    this.parts = [];
    this.currentPart = 0;

    var thisScore = this;
    for (var i in arguments) {
      if (arguments[i] && this.parts[i]) {
        this.parts[i] = arguments[i];
        this.parts[i].nextPart = this.parts[i + 1];
        this.parts[i].onended = function () {
          thisScore.resetPart(i);
          playNextPart(thisScore);
        };
      }
    }
    this.looping = false;
  }

  onended() {
    if (this.looping) {
      // this.resetParts();
      this.parts[0].start();
    } else {
      this.parts[this.parts.length - 1].onended = function () {
        this.stop();
        this.resetParts();
      };
    }
    this.currentPart = 0;
  }

  /**
   *  Start playback of the score.
   *
   *  @method  start
   *  @for p5.Score
   */
  start() {
    this.parts[this.currentPart].start();
    this.scoreStep = 0;
  }

  /**
   *  Stop playback of the score.
   *
   *  @method  stop
   *  @for p5.Score
   */
  stop() {
    this.parts[this.currentPart].stop();
    this.currentPart = 0;
    this.scoreStep = 0;
  }

  /**
   *  Pause playback of the score.
   *
   *  @method  pause
   *  @for p5.Score
   */
  pause() {
    this.parts[this.currentPart].stop();
  }

  /**
   *  Loop playback of the score.
   *
   *  @method  loop
   *  @for p5.Score
   */
  loop() {
    this.looping = true;
    this.start();
  }

  /**
   *  Stop looping playback of the score. If it
   *  is currently playing, this will go into effect
   *  after the current round of playback completes.
   *
   *  @method  noLoop
   *  @for p5.Score
   */
  noLoop() {
    this.looping = false;
  }

  resetParts() {
    var self = this;
    this.parts.forEach(function (part) {
      self.resetParts[part];
    });
  }

  resetPart(i) {
    this.parts[i].stop();
    this.parts[i].partStep = 0;
    for (var p in this.parts[i].phrases) {
      if (this.parts[i]) {
        this.parts[i].phrases[p].phraseStep = 0;
      }
    }
  }

  /**
   *  Set the tempo for all parts in the score
   *
   *  @method setBPM
   *  @for p5.Score
   *  @param {Number} BPM      Beats Per Minute
   *  @param {Number} rampTime Seconds from now
   */
  setBPM(bpm, rampTime) {
    for (var i in this.parts) {
      if (this.parts[i]) {
        this.parts[i].setBPM(bpm, rampTime);
      }
    }
  }
}

function playNextPart(aScore) {
  aScore.currentPart++;
  if (aScore.currentPart >= aScore.parts.length) {
    aScore.scoreStep = 0;
    aScore.onended();
  } else {
    aScore.scoreStep = 0;
    aScore.parts[aScore.currentPart - 1].stop();
    aScore.parts[aScore.currentPart].start();
  }
}

export { Phrase, Part, Score };
