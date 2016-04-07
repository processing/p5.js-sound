
define(function (require) {
  'use strict';

  var p5sound = require('master');
  var Signal = require('Tone/signal/Signal');
  var Add = require('Tone/signal/Add');
  var Mult = require('Tone/signal/Multiply');
  var Scale = require('Tone/signal/Scale');

  /**
   *  <p>Creates a signal that oscillates between -1.0 and 1.0.
   *  By default, the oscillation takes the form of a sinusoidal
   *  shape ('sine'). Additional types include 'triangle',
   *  'sawtooth' and 'square'. The frequency defaults to
   *  440 oscillations per second (440Hz, equal to the pitch of an
   *  'A' note).</p> 
   *
   *  <p>Set the type of oscillation with setType(), or by creating a
   *  specific oscillator.</p> For example:
   *  <code>new p5.SinOsc(freq)</code>
   *  <code>new p5.TriOsc(freq)</code>
   *  <code>new p5.SqrOsc(freq)</code>
   *  <code>new p5.SawOsc(freq)</code>.
   *  </p>
   *  
   *  @class p5.Oscillator
   *  @constructor
   *  @param {Number} [freq] frequency defaults to 440Hz
   *  @param {String} [type] type of oscillator. Options:
   *                         'sine' (default), 'triangle',
   *                         'sawtooth', 'square'
   *  @return {Object}    Oscillator object
   *  @example
   *  <div><code>
   *  var osc;
   *  var playing = false;
   *  
   *  function setup() {
   *    backgroundColor = color(255,0,255);
   *    textAlign(CENTER);
   *    
   *    osc = new p5.Oscillator();
   *    osc.setType('sine');
   *    osc.freq(240);
   *    osc.amp(0);
   *    osc.start();
   *  }
   *
   *  function draw() {
   *    background(backgroundColor)
   *    text('click to play', width/2, height/2);
   *  }
   *
   *  function mouseClicked() {
   *    if (mouseX > 0 && mouseX < width && mouseY < height && mouseY > 0) {
   *      if (!playing) {
   *        // ramp amplitude to 0.5 over 0.1 seconds
   *        osc.amp(0.5, 0.05);
   *        playing = true;
   *        backgroundColor = color(0,255,255);
   *      } else {
   *        // ramp amplitude to 0 over 0.5 seconds
   *        osc.amp(0, 0.5);
   *        playing = false;
   *        backgroundColor = color(255,0,255);
   *      }
   *    }
   *  }
   *  </code> </div>
   */
  p5.Oscillator = function(freq, type){
    if (typeof(freq) === 'string') {
      var f = type;
      type = freq;
      freq = f;
    } if (typeof(type) === 'number') {
      var f = type;
      type = freq;
      freq = f;
    }
    this.started = false;

    // components
    this.phaseAmount = undefined;
    this.oscillator = p5sound.audiocontext.createOscillator();
    this.f = freq || 440.0; // frequency
    this.oscillator.type = type || 'sine';
    this.oscillator.frequency.setValueAtTime(this.f, p5sound.audiocontext.currentTime);

    var o = this.oscillator;

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
    this.panner = new p5.Panner(this.output, this.connection, 1);

    //array of math operation signal chaining
    this.mathOps = [this.output];

    // add to the soundArray so we can dispose of the osc later
    p5sound.soundArray.push(this);
  };

  /**
   *  Start an oscillator. Accepts an optional parameter to
   *  determine how long (in seconds from now) until the
   *  oscillator starts.
   *
   *  @method  start
   *  @param  {Number} [time] startTime in seconds from now.
   *  @param  {Number} [frequency] frequency in Hz.
   */
  p5.Oscillator.prototype.start = function(time, f) {
    if (this.started){
      var now = p5sound.audiocontext.currentTime;
      this.stop(now);
    }
    if (!this.started){
      var freq = f || this.f;
      var type = this.oscillator.type;

      // set old osc free to be garbage collected (memory)
      if (this.oscillator) {
        this.oscillator.disconnect();
        this.oscillator = undefined;
      }

      // var detune = this.oscillator.frequency.value;
      this.oscillator = p5sound.audiocontext.createOscillator();
      this.oscillator.frequency.exponentialRampToValueAtTime(Math.abs(freq), p5sound.audiocontext.currentTime);
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
  };

  /**
   *  Stop an oscillator. Accepts an optional parameter
   *  to determine how long (in seconds from now) until the
   *  oscillator stops.
   *
   *  @method  stop
   *  @param  {Number} secondsFromNow Time, in seconds from now.
   */
  p5.Oscillator.prototype.stop = function(time){
    if (this.started){
      var t = time || 0;
      var now = p5sound.audiocontext.currentTime;
      this.oscillator.stop(t + now);
      this.started = false;
    }
  };

  /**
   *  Set the amplitude between 0 and 1.0. Or, pass in an object
   *  such as an oscillator to modulate amplitude with an audio signal.
   *
   *  @method  amp
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
  p5.Oscillator.prototype.amp = function(vol, rampTime, tFromNow){
    var self = this;
    if (typeof(vol) === 'number') {
      var rampTime = rampTime || 0;
      var tFromNow = tFromNow || 0;
      var now = p5sound.audiocontext.currentTime;
      var currentVol = this.output.gain.value;
      this.output.gain.cancelScheduledValues(now);
      this.output.gain.linearRampToValueAtTime(currentVol, now + tFromNow);
      this.output.gain.linearRampToValueAtTime(vol, now + tFromNow + rampTime);
    }

    else if (vol) {
      vol.connect(self.output.gain);
    } else {
      // return the Gain Node
      return this.output.gain;
    }
  };

  // these are now the same thing
  p5.Oscillator.prototype.fade =   p5.Oscillator.prototype.amp;

  p5.Oscillator.prototype.getAmp = function(){
    return this.output.gain.value;
  };

  /**
   *  Set frequency of an oscillator to a value. Or, pass in an object
   *  such as an oscillator to modulate the frequency with an audio signal.
   *
   *  @method  freq
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
   *  var osc = new p5.Oscillator(300);
   *  osc.start();
   *  osc.freq(40, 10);
   *  </code></div>
   */
  p5.Oscillator.prototype.freq = function(val, rampTime, tFromNow){
    if (typeof(val) === 'number' && !isNaN(val)) {
      this.f = val;
      var now = p5sound.audiocontext.currentTime;
      var rampTime = rampTime || 0;
      var tFromNow = tFromNow || 0;
      // var currentFreq = this.oscillator.frequency.value;
      // this.oscillator.frequency.cancelScheduledValues(now);

      if (rampTime == 0) {
        this.oscillator.frequency.cancelScheduledValues(now);
        this.oscillator.frequency.setValueAtTime(val, tFromNow + now);
      } else {
        if (val > 0 ){
          this.oscillator.frequency.exponentialRampToValueAtTime(val, tFromNow + rampTime + now);
        } else {
          this.oscillator.frequency.linearRampToValueAtTime(val, tFromNow + rampTime + now);
        }
      }



      // reset phase if oscillator has a phase
      if (this.phaseAmount) {
        this.phase(this.phaseAmount);
      }

    } else if (val) {
      if (val.output){
        val = val.output;
      }
      val.connect(this.oscillator.frequency);

      // keep track of what is modulating this param
      // so it can be re-connected if 
      this._freqMods.push( val );
    } else {
      // return the Frequency Node
      return this.oscillator.frequency;
    }
  };

  p5.Oscillator.prototype.getFreq = function(){
    return this.oscillator.frequency.value;
  };

  /**
   *  Set type to 'sine', 'triangle', 'sawtooth' or 'square'.
   *
   *  @method  setType
   *  @param {String} type 'sine', 'triangle', 'sawtooth' or 'square'.
   */
  p5.Oscillator.prototype.setType = function(type){
    this.oscillator.type = type;
  };

  p5.Oscillator.prototype.getType = function(){
    return this.oscillator.type;
  };

  /**
   *  Connect to a p5.sound / Web Audio object.
   *
   *  @method  connect
   *  @param  {Object} unit A p5.sound or Web Audio object
   */
  p5.Oscillator.prototype.connect = function(unit){
    if (!unit) {
       this.panner.connect(p5sound.input);
    }
    else if (unit.hasOwnProperty('input')){
      this.panner.connect(unit.input);
      this.connection = unit.input;
      }
    else {
      this.panner.connect(unit);
      this.connection = unit;
    }
  };

  /**
   *  Disconnect all outputs
   *
   *  @method  disconnect
   */
  p5.Oscillator.prototype.disconnect = function(unit){
    this.output.disconnect();
    this.panner.disconnect();
    this.output.connect(this.panner);
    this.oscMods = [];
  };

  /**
   *  Pan between Left (-1) and Right (1)
   *
   *  @method  pan
   *  @param  {Number} panning Number between -1 and 1
   *  @param  {Number} timeFromNow schedule this event to happen
   *                                seconds from now
   */
  p5.Oscillator.prototype.pan = function(pval, tFromNow) {
    this.panPosition = pval;
    this.panner.pan(pval, tFromNow);
  };

  p5.Oscillator.prototype.getPan = function() {
    return this.panPosition;
  };

  // get rid of the oscillator
  p5.Oscillator.prototype.dispose = function() {
    // remove reference from soundArray
    var index = p5sound.soundArray.indexOf(this);
    p5sound.soundArray.splice(index, 1);

    if (this.oscillator){
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
  };

  /**
   *  Set the phase of an oscillator between 0.0 and 1.0.
   *  In this implementation, phase is a delay time
   *  based on the oscillator's current frequency.
   *  
   *  @method  phase
   *  @param  {Number} phase float between 0.0 and 1.0
   */
  p5.Oscillator.prototype.phase = function(p){
    var delayAmt = p5.prototype.map(p, 0, 1.0, 0, 1/this.f);
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
  };

  // ========================== //
  // SIGNAL MATH FOR MODULATION //
  // ========================== //

  // return sigChain(this, scale, thisChain, nextChain, Scale);
  var sigChain = function(o, mathObj, thisChain, nextChain, type) {
    var chainSource = o.oscillator;
    // if this type of math already exists in the chain, replace it
    for (var i in o.mathOps) {
      if (o.mathOps[i] instanceof type) {
        chainSource.disconnect();
        o.mathOps[i].dispose();
        thisChain = i;
        // assume nextChain is output gain node unless...
        if (thisChain < o.mathOps.length - 2) {
          nextChain = o.mathOps[i+1];
        }
      }
    }
    if (thisChain == o.mathOps.length - 1) {
      o.mathOps.push(nextChain);
    }
    // assume source is the oscillator unless i > 0
    if (i > 0){
      chainSource = o.mathOps[i-1];
    } 
    chainSource.disconnect();
    chainSource.connect(mathObj);
    mathObj.connect(nextChain);
    o.mathOps[thisChain] = mathObj;
    return o;
  };

  /**
   *  Add a value to the p5.Oscillator's output amplitude,
   *  and return the oscillator. Calling this method again
   *  will override the initial add() with a new value.
   *  
   *  @method  add
   *  @param {Number} number Constant number to add
   *  @return {p5.Oscillator} Oscillator Returns this oscillator
   *                                     with scaled output
   *  
   */
  p5.Oscillator.prototype.add = function(num) {
    var add = new Add(num);
    var thisChain = this.mathOps.length-1;
    var nextChain = this.output;
    return sigChain(this, add, thisChain, nextChain, Add);
  };

  /**
   *  Multiply the p5.Oscillator's output amplitude
   *  by a fixed value (i.e. turn it up!). Calling this method
   *  again will override the initial mult() with a new value.
   *  
   *  @method  mult
   *  @param {Number} number Constant number to multiply
   *  @return {p5.Oscillator} Oscillator Returns this oscillator
   *                                     with multiplied output
   */
  p5.Oscillator.prototype.mult = function(num) {
    var mult = new Mult(num);
    var thisChain = this.mathOps.length-1;
    var nextChain = this.output;
    return sigChain(this, mult, thisChain, nextChain, Mult);
  };

  /**
   *  Scale this oscillator's amplitude values to a given
   *  range, and return the oscillator. Calling this method
   *  again will override the initial scale() with new values.
   *  
   *  @method  scale
   *  @param  {Number} inMin  input range minumum
   *  @param  {Number} inMax  input range maximum
   *  @param  {Number} outMin input range minumum
   *  @param  {Number} outMax input range maximum
   *  @return {p5.Oscillator} Oscillator Returns this oscillator
   *                                     with scaled output
   */
  p5.Oscillator.prototype.scale = function(inMin, inMax, outMin, outMax) {
    var mapOutMin, mapOutMax;
    if (arguments.length === 4){
      mapOutMin = p5.prototype.map(outMin, inMin, inMax, 0, 1) - 0.5;
      mapOutMax = p5.prototype.map(outMax, inMin, inMax, 0, 1) - 0.5;
    }
    else {
      mapOutMin = arguments[0];
      mapOutMax = arguments[1];
    }
    var scale = new Scale(mapOutMin, mapOutMax);
    var thisChain = this.mathOps.length-1;
    var nextChain = this.output;
    return sigChain(this, scale, thisChain, nextChain, Scale);

    // this.output.disconnect();
    // this.output.connect(scale)
  };

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
   *  @method  p5.SinOsc
   *  @param {[Number]} freq Set the frequency
   */
  p5.SinOsc = function(freq) {
    p5.Oscillator.call(this, freq, 'sine');
  };

  p5.SinOsc.prototype = Object.create(p5.Oscillator.prototype);

  /**
   *  Constructor: <code>new p5.TriOsc()</code>.
   *  This creates a Triangle Wave Oscillator and is
   *  equivalent to <code>new p5.Oscillator('triangle')
   *  </code> or creating a p5.Oscillator and then calling
   *  its method <code>setType('triangle')</code>.
   *  See p5.Oscillator for methods.
   *
   *  @method  p5.TriOsc
   *  @param {[Number]} freq Set the frequency
   */
  p5.TriOsc = function(freq) {
    p5.Oscillator.call(this, freq, 'triangle');
  };

  p5.TriOsc.prototype = Object.create(p5.Oscillator.prototype);

  /**
   *  Constructor: <code>new p5.SawOsc()</code>.
   *  This creates a SawTooth Wave Oscillator and is
   *  equivalent to <code> new p5.Oscillator('sawtooth')
   *  </code> or creating a p5.Oscillator and then calling
   *  its method <code>setType('sawtooth')</code>.
   *  See p5.Oscillator for methods.
   *
   *  @method  p5.SawOsc
   *  @param {[Number]} freq Set the frequency
   */
  p5.SawOsc = function(freq) {
    p5.Oscillator.call(this, freq, 'sawtooth');
  };

  p5.SawOsc.prototype = Object.create(p5.Oscillator.prototype);

  /**
   *  Constructor: <code>new p5.SqrOsc()</code>.
   *  This creates a Square Wave Oscillator and is
   *  equivalent to <code> new p5.Oscillator('square')
   *  </code> or creating a p5.Oscillator and then calling
   *  its method <code>setType('square')</code>.
   *  See p5.Oscillator for methods.
   *
   *  @method  p5.SqrOsc
   *  @param {[Number]} freq Set the frequency
   */
  p5.SqrOsc = function(freq) {
    p5.Oscillator.call(this, freq, 'square');
  };

  p5.SqrOsc.prototype = Object.create(p5.Oscillator.prototype);

});
