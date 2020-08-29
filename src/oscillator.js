import p5sound from './master';
import Add from 'Tone/signal/Add';
import Mult from 'Tone/signal/Multiply';
import Scale from 'Tone/signal/Scale';
import Panner from './panner';
// ========================== //
// SIGNAL MATH FOR MODULATION //
// ========================== //

// return sigChain(this, scale, thisChain, nextChain, Scale);
function sigChain(o, mathObj, thisChain, nextChain, type) {
  var chainSource = o.oscillator;
  // if this type of math already exists in the chain, replace it
  for (var i in o.mathOps) {
    if (o.mathOps[i] instanceof type) {
      chainSource.disconnect();
      o.mathOps[i].dispose();
      thisChain = i;
      // assume nextChain is output gain node unless...
      if (thisChain < o.mathOps.length - 2) {
        nextChain = o.mathOps[i + 1];
      }
    }
  }
  if (thisChain === o.mathOps.length - 1) {
    o.mathOps.push(nextChain);
  }
  // assume source is the oscillator unless i > 0
  if (i > 0) {
    chainSource = o.mathOps[i - 1];
  }
  chainSource.disconnect();
  chainSource.connect(mathObj);
  mathObj.connect(nextChain);
  o.mathOps[thisChain] = mathObj;
  return o;
}

/**
 *  <p>Creates a signal that oscillates between -1.0 and 1.0.
 *  By default, the oscillation takes the form of a sinusoidal
 *  shape ('sine'). Additional types include 'triangle',
 *  'sawtooth' and 'square'. The frequency defaults to
 *  440 oscillations per second (440Hz, equal to the pitch of an
 *  'A' note).</p>
 *
 *  <p>Set the type of oscillation with setType(), or by instantiating a
 *  specific oscillator: <a href="/reference/#/p5.SinOsc">p5.SinOsc</a>, <a
 *  href="/reference/#/p5.TriOsc">p5.TriOsc</a>, <a
 *  href="/reference/#/p5.SqrOsc">p5.SqrOsc</a>, or <a
 *  href="/reference/#/p5.SawOsc">p5.SawOsc</a>.
 *  </p>
 *
 *  @class p5.Oscillator
 *  @constructor
 *  @param {Number} [freq] frequency defaults to 440Hz
 *  @param {String} [type] type of oscillator. Options:
 *                         'sine' (default), 'triangle',
 *                         'sawtooth', 'square'
 *  @example
 *  <div><code>
 *  let osc, playing, freq, amp;
 *
 *  function setup() {
 *    let cnv = createCanvas(100, 100);
 *    cnv.mousePressed(playOscillator);
 *    osc = new p5.Oscillator('sine');
 *  }
 *
 *  function draw() {
 *    background(220)
 *    freq = constrain(map(mouseX, 0, width, 100, 500), 100, 500);
 *    amp = constrain(map(mouseY, height, 0, 0, 1), 0, 1);
 *
 *    text('tap to play', 20, 20);
 *    text('freq: ' + freq, 20, 40);
 *    text('amp: ' + amp, 20, 60);
 *
 *    if (playing) {
 *      // smooth the transitions by 0.1 seconds
 *      osc.freq(freq, 0.1);
 *      osc.amp(amp, 0.1);
 *    }
 *  }
 *
 *  function playOscillator() {
 *    // starting an oscillator on a user gesture will enable audio
 *    // in browsers that have a strict autoplay policy.
 *    // See also: userStartAudio();
 *    osc.start();
 *    playing = true;
 *  }
 *
 *  function mouseReleased() {
 *    // ramp amplitude to 0 over 0.5 seconds
 *    osc.amp(0, 0.5);
 *    playing = false;
 *  }
 *  </code> </div>
 */
class Oscillator {
  constructor(freq, type) {
    if (typeof freq === 'string') {
      let f = type;
      type = freq;
      freq = f;
    }
    if (typeof type === 'number') {
      let f = type;
      type = freq;
      freq = f;
    }
    this.started = false;

    // components
    this.phaseAmount = undefined;
    this.oscillator = p5sound.audiocontext.createOscillator();
    this.f = freq || 440.0; // frequency
    this.oscillator.type = type || 'sine';
    this.oscillator.frequency.setValueAtTime(
      this.f,
      p5sound.audiocontext.currentTime
    );

    // connections
    this.output = p5sound.audiocontext.createGain();

    this._freqMods = []; // modulators connected to this oscillator's frequency

    // set default output gain to 0.5
    this.output.gain.value = 0.5;
    this.output.gain.setValueAtTime(0.5, p5sound.audiocontext.currentTime);

    this.oscillator.connect(this.output);
    // stereo panning
    this.panPosition = 0.0;
    this.connection = p5sound.input; // connect to p5sound by default
    this.panner = new Panner(this.output, this.connection, 1);

    //array of math operation signal chaining
    this.mathOps = [this.output];

    // add to the soundArray so we can dispose of the osc later
    p5sound.soundArray.push(this);

    // these methods are now the same thing
    this.fade = this.amp;
  }

  /**
   *  Start an oscillator.
   *
   *  Starting an oscillator on a user gesture will enable audio in browsers
   *  that have a strict autoplay policy, including Chrome and most mobile
   *  devices. See also: `userStartAudio()`.
   *
   *  @method  start
   *  @for p5.Oscillator
   *  @param  {Number} [time] startTime in seconds from now.
   *  @param  {Number} [frequency] frequency in Hz.
   */
  start(time, f) {
    if (this.started) {
      var now = p5sound.audiocontext.currentTime;
      this.stop(now);
    }
    if (!this.started) {
      var freq = f || this.f;
      var type = this.oscillator.type;

      // set old osc free to be garbage collected (memory)
      if (this.oscillator) {
        this.oscillator.disconnect();
        delete this.oscillator;
      }

      // var detune = this.oscillator.frequency.value;
      this.oscillator = p5sound.audiocontext.createOscillator();
      this.oscillator.frequency.value = Math.abs(freq);
      this.oscillator.type = type;
      // this.oscillator.detune.value = detune;
      this.oscillator.connect(this.output);
      time = time || 0;
      this.oscillator.start(time + p5sound.audiocontext.currentTime);
      this.freqNode = this.oscillator.frequency;

      // if other oscillators are already connected to this osc's freq
      for (var i in this._freqMods) {
        if (typeof this._freqMods[i].connect !== 'undefined') {
          this._freqMods[i].connect(this.oscillator.frequency);
        }
      }

      this.started = true;
    }
  }

  /**
   *  Stop an oscillator. Accepts an optional parameter
   *  to determine how long (in seconds from now) until the
   *  oscillator stops.
   *
   *  @method  stop
   *  @for p5.Oscillator
   *  @param  {Number} secondsFromNow Time, in seconds from now.
   */
  stop(time) {
    if (this.started) {
      var t = time || 0;
      var now = p5sound.audiocontext.currentTime;
      this.oscillator.stop(t + now);
      this.started = false;
    }
  }

  /**
   *  Set the amplitude between 0 and 1.0. Or, pass in an object
   *  such as an oscillator to modulate amplitude with an audio signal.
   *
   *  @method  amp
   *  @for p5.Oscillator
   *  @param  {Number|Object} vol between 0 and 1.0
   *                              or a modulating signal/oscillator
   *  @param {Number} [rampTime] create a fade that lasts rampTime
   *  @param {Number} [timeFromNow] schedule this event to happen
   *                                seconds from now
   *  @return  {AudioParam} gain  If no value is provided,
   *                              returns the Web Audio API
   *                              AudioParam that controls
   *                              this oscillator's
   *                              gain/amplitude/volume)
   */
  amp(vol, rampTime = 0, tFromNow = 0) {
    if (typeof vol === 'number') {
      var now = p5sound.audiocontext.currentTime;
      this.output.gain.linearRampToValueAtTime(vol, now + tFromNow + rampTime);
    } else if (vol) {
      vol.connect(this.output.gain);
    } else {
      // return the Gain Node
      return this.output.gain;
    }
  }

  /**
   * Returns the value of output gain
   *
   *  @method  getAmp
   *  @for p5.Oscillator
   *
   * @returns {number} Amplitude value between 0.0 and 1.0
   */

  getAmp() {
    return this.output.gain.value;
  }

  /**
   *  Set frequency of an oscillator to a value. Or, pass in an object
   *  such as an oscillator to modulate the frequency with an audio signal.
   *
   *  @method  freq
   *  @for p5.Oscillator
   *  @param  {Number|Object} Frequency Frequency in Hz
   *                                        or modulating signal/oscillator
   *  @param  {Number} [rampTime] Ramp time (in seconds)
   *  @param  {Number} [timeFromNow] Schedule this event to happen
   *                                   at x seconds from now
   *  @return  {AudioParam} Frequency If no value is provided,
   *                                  returns the Web Audio API
   *                                  AudioParam that controls
   *                                  this oscillator's frequency
   *  @example
   *  <div><code>
   *  let osc;
   *
   *  function setup() {
   *    let cnv = createCanvas(100, 100);
   *    cnv.mousePressed(playOscillator);
   *    osc = new p5.Oscillator(300);
   *    background(220);
   *    text('tap to play', 20, 20);
   *  }
   *
   *  function playOscillator() {
   *    osc.start();
   *    osc.amp(0.5);
   *    // start at 700Hz
   *    osc.freq(700);
   *    // ramp to 60Hz over 0.7 seconds
   *    osc.freq(60, 0.7);
   *    osc.amp(0, 0.1, 0.7);
   *  }
   *  </code></div>
   */
  freq(val, rampTime = 0, tFromNow = 0) {
    if (typeof val === 'number' && !isNaN(val)) {
      this.f = val;
      var now = p5sound.audiocontext.currentTime;

      if (rampTime === 0) {
        this.oscillator.frequency.setValueAtTime(val, tFromNow + now);
      } else {
        if (val > 0) {
          this.oscillator.frequency.exponentialRampToValueAtTime(
            val,
            tFromNow + rampTime + now
          );
        } else {
          this.oscillator.frequency.linearRampToValueAtTime(
            val,
            tFromNow + rampTime + now
          );
        }
      }

      // reset phase if oscillator has a phase
      if (this.phaseAmount) {
        this.phase(this.phaseAmount);
      }
    } else if (val) {
      if (val.output) {
        val = val.output;
      }
      val.connect(this.oscillator.frequency);

      // keep track of what is modulating this param
      // so it can be re-connected if
      this._freqMods.push(val);
    } else {
      // return the Frequency Node
      return this.oscillator.frequency;
    }
  }
  /**
   * Returns the value of frequency of oscillator
   *
   *  @method  getFreq
   *  @for p5.Oscillator
   *  @returns {number} Frequency of oscillator in Hertz
   */

  getFreq() {
    return this.oscillator.frequency.value;
  }

  /**
   *  Set type to 'sine', 'triangle', 'sawtooth' or 'square'.
   *
   *  @method  setType
   *  @for p5.Oscillator
   *  @param {String} type 'sine', 'triangle', 'sawtooth' or 'square'.
   */
  setType(type) {
    this.oscillator.type = type;
  }
  /**
   *  Returns  current type of oscillator eg. 'sine', 'triangle', 'sawtooth' or 'square'.
   *
   *  @method  getType
   *  @for p5.Oscillator
   *  @returns {String} type of oscillator  eg . 'sine', 'triangle', 'sawtooth' or 'square'.
   */

  getType() {
    return this.oscillator.type;
  }

  /**
   *  Connect to a p5.sound / Web Audio object.
   *
   *  @method  connect
   *  @for p5.Oscillator
   *  @param  {Object} unit A p5.sound or Web Audio object
   */
  connect(unit) {
    if (!unit) {
      this.panner.connect(p5sound.input);
    } else if (unit.hasOwnProperty('input')) {
      this.panner.connect(unit.input);
      this.connection = unit.input;
    } else {
      this.panner.connect(unit);
      this.connection = unit;
    }
  }

  /**
   *  Disconnect all outputs
   *
   *  @method  disconnect
   *  @for p5.Oscillator
   */
  disconnect() {
    if (this.output) {
      this.output.disconnect();
    }
    if (this.panner) {
      this.panner.disconnect();
      if (this.output) {
        this.output.connect(this.panner);
      }
    }
    this.oscMods = [];
  }

  /**
   *  Pan between Left (-1) and Right (1)
   *
   *  @method  pan
   *  @for p5.Oscillator
   *  @param  {Number} panning Number between -1 and 1
   *  @param  {Number} timeFromNow schedule this event to happen
   *                                seconds from now
   */
  pan(pval, tFromNow) {
    this.panPosition = pval;
    this.panner.pan(pval, tFromNow);
  }

  /**
   *  Returns the current value of panPosition , between Left (-1) and Right (1)
   *
   *  @method  getPan
   *  @for p5.Oscillator
   *
   *  @returns {number} panPosition of oscillator , between Left (-1) and Right (1)
   */

  getPan() {
    return this.panPosition;
  }

  // get rid of the oscillator
  dispose() {
    // remove reference from soundArray
    var index = p5sound.soundArray.indexOf(this);
    p5sound.soundArray.splice(index, 1);

    if (this.oscillator) {
      var now = p5sound.audiocontext.currentTime;
      this.stop(now);
      this.disconnect();
      this.panner = null;
      this.oscillator = null;
    }
    // if it is a Pulse
    if (this.osc2) {
      this.osc2.dispose();
    }
  }

  /**
   *  Set the phase of an oscillator between 0.0 and 1.0.
   *  In this implementation, phase is a delay time
   *  based on the oscillator's current frequency.
   *
   *  @method  phase
   *  @for p5.Oscillator
   *  @param  {Number} phase float between 0.0 and 1.0
   */
  phase(p) {
    var delayAmt = p5.prototype.map(p, 0, 1.0, 0, 1 / this.f);
    var now = p5sound.audiocontext.currentTime;

    this.phaseAmount = p;

    if (!this.dNode) {
      // create a delay node
      this.dNode = p5sound.audiocontext.createDelay();
      // put the delay node in between output and panner
      this.oscillator.disconnect();
      this.oscillator.connect(this.dNode);
      this.dNode.connect(this.output);
    }

    // set delay time to match phase:
    this.dNode.delayTime.setValueAtTime(delayAmt, now);
  }

  /**
   *  Add a value to the p5.Oscillator's output amplitude,
   *  and return the oscillator. Calling this method again
   *  will override the initial add() with a new value.
   *
   *  @method  add
   *  @for p5.Oscillator
   *  @param {Number} number Constant number to add
   *  @return {p5.Oscillator} Oscillator Returns this oscillator
   *                                     with scaled output
   *
   */
  add(num) {
    var add = new Add(num);
    var thisChain = this.mathOps.length - 1;
    var nextChain = this.output;
    return sigChain(this, add, thisChain, nextChain, Add);
  }
  /**
   *  Multiply the p5.Oscillator's output amplitude
   *  by a fixed value (i.e. turn it up!). Calling this method
   *  again will override the initial mult() with a new value.
   *
   *  @method  mult
   *  @for p5.Oscillator
   *  @param {Number} number Constant number to multiply
   *  @return {p5.Oscillator} Oscillator Returns this oscillator
   *                                     with multiplied output
   */
  mult(num) {
    var mult = new Mult(num);
    var thisChain = this.mathOps.length - 1;
    var nextChain = this.output;
    return sigChain(this, mult, thisChain, nextChain, Mult);
  }

  /**
   *  Scale this oscillator's amplitude values to a given
   *  range, and return the oscillator. Calling this method
   *  again will override the initial scale() with new values.
   *
   *  @method  scale
   *  @for p5.Oscillator
   *  @param  {Number} inMin  input range minumum
   *  @param  {Number} inMax  input range maximum
   *  @param  {Number} outMin input range minumum
   *  @param  {Number} outMax input range maximum
   *  @return {p5.Oscillator} Oscillator Returns this oscillator
   *                                     with scaled output
   */
  scale(inMin, inMax, outMin, outMax) {
    var mapOutMin, mapOutMax;
    if (arguments.length === 4) {
      mapOutMin = p5.prototype.map(outMin, inMin, inMax, 0, 1) - 0.5; //find a way to get rid of p5.prototype ?
      mapOutMax = p5.prototype.map(outMax, inMin, inMax, 0, 1) - 0.5; //find a way to get rid of p5.prototype ?
    } else {
      mapOutMin = arguments[0];
      mapOutMax = arguments[1];
    }
    var scale = new Scale(mapOutMin, mapOutMax);
    var thisChain = this.mathOps.length - 1;
    var nextChain = this.output;
    return sigChain(this, scale, thisChain, nextChain, Scale);

    // this.output.disconnect();
    // this.output.connect(scale)
  }
}

// ============================== //
// SinOsc, TriOsc, SqrOsc, SawOsc //
// ============================== //

/**
 *  Constructor: <code>new p5.SinOsc()</code>.
 *  This creates a Sine Wave Oscillator and is
 *  equivalent to <code> new p5.Oscillator('sine')
 *  </code> or creating a p5.Oscillator and then calling
 *  its method <code>setType('sine')</code>.
 *  See p5.Oscillator for methods.
 *
 *  @class  p5.SinOsc
 *  @constructor
 *  @extends p5.Oscillator
 *  @param {Number} [freq] Set the frequency
 */
class SinOsc extends Oscillator {
  constructor(freq) {
    super(freq, 'sine');
  }
}

/**
 *  Constructor: <code>new p5.TriOsc()</code>.
 *  This creates a Triangle Wave Oscillator and is
 *  equivalent to <code>new p5.Oscillator('triangle')
 *  </code> or creating a p5.Oscillator and then calling
 *  its method <code>setType('triangle')</code>.
 *  See p5.Oscillator for methods.
 *
 *  @class  p5.TriOsc
 *  @constructor
 *  @extends p5.Oscillator
 *  @param {Number} [freq] Set the frequency
 */
class TriOsc extends Oscillator {
  constructor(freq) {
    super(freq, 'triangle');
  }
}

/**
 *  Constructor: <code>new p5.SawOsc()</code>.
 *  This creates a SawTooth Wave Oscillator and is
 *  equivalent to <code> new p5.Oscillator('sawtooth')
 *  </code> or creating a p5.Oscillator and then calling
 *  its method <code>setType('sawtooth')</code>.
 *  See p5.Oscillator for methods.
 *
 *  @class  p5.SawOsc
 *  @constructor
 *  @extends p5.Oscillator
 *  @param {Number} [freq] Set the frequency
 */
class SawOsc extends Oscillator {
  constructor(freq) {
    super(freq, 'sawtooth');
  }
}

/**
 *  Constructor: <code>new p5.SqrOsc()</code>.
 *  This creates a Square Wave Oscillator and is
 *  equivalent to <code> new p5.Oscillator('square')
 *  </code> or creating a p5.Oscillator and then calling
 *  its method <code>setType('square')</code>.
 *  See p5.Oscillator for methods.
 *
 *  @class  p5.SqrOsc
 *  @constructor
 *  @extends p5.Oscillator
 *  @param {Number} [freq] Set the frequency
 */
class SqrOsc extends Oscillator {
  constructor(freq) {
    super(freq, 'square');
  }
}

export default Oscillator;
export { SinOsc, TriOsc, SawOsc, SqrOsc };
