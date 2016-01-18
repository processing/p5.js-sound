define(function (require) {
  'use strict';

  var p5sound = require('master');
  var Filter = require('filter');
  /**
   *  Delay is an echo effect. It processes an existing sound source,
   *  and outputs a delayed version of that sound. The p5.Delay can
   *  produce different effects depending on the delayTime, feedback,
   *  filter, and type. In the example below, a feedback of 0.5 will
   *  produce a looping delay that decreases in volume by
   *  50% each repeat. A filter will cut out the high frequencies so
   *  that the delay does not sound as piercing as the original source.
   *  
   *  @class p5.Delay
   *  @constructor
   *  @return {Object} Returns a p5.Delay object
   *  @example
   *  <div><code>
   *  var noise, env, delay;
   *  
   *  function setup() {
   *    background(0);
   *    noStroke();
   *    fill(255);
   *    textAlign(CENTER);
   *    text('click to play', width/2, height/2);
   *    
   *    noise = new p5.Noise('brown');
   *    noise.amp(0);
   *    noise.start();
   *    
   *    delay = new p5.Delay();
   *
   *    // delay.process() accepts 4 parameters:
   *    // source, delayTime, feedback, filter frequency
   *    // play with these numbers!!
   *    delay.process(noise, .12, .7, 2300);
   *    
   *    // play the noise with an envelope,
   *    // a series of fades ( time / value pairs )
   *    env = new p5.Env(.01, 0.2, .2, .1);
   *  }
   *
   *  // mouseClick triggers envelope
   *  function mouseClicked() {
   *    // is mouse over canvas?
   *    if (mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height) {
   *      env.play(noise);
   *    }
   *  }
   *  </code></div>
   */
  p5.Delay = function() {
    this.ac = p5sound.audiocontext;

    this.input = this.ac.createGain();
    this.output = this.ac.createGain();

    this._split = this.ac.createChannelSplitter(2);
    this._merge = this.ac.createChannelMerger(2);

    this._leftGain = this.ac.createGain();
    this._rightGain = this.ac.createGain();

    /**
     *  The p5.Delay is built with two
     *  <a href="http://www.w3.org/TR/webaudio/#DelayNode">
     *  Web Audio Delay Nodes</a>, one for each stereo channel.
     *  
     *  @property leftDelay
     *  @type {Object}  Web Audio Delay Node
     */
    this.leftDelay = this.ac.createDelay();
    /**
     *  The p5.Delay is built with two
     *  <a href="http://www.w3.org/TR/webaudio/#DelayNode">
     *  Web Audio Delay Nodes</a>, one for each stereo channel.
     *  
     *  @property rightDelay
     *  @type {Object}  Web Audio Delay Node
     */
    this.rightDelay = this.ac.createDelay();

    this._leftFilter = new p5.Filter();
    this._rightFilter = new p5.Filter();
    this._leftFilter.disconnect();
    this._rightFilter.disconnect();

    this._leftFilter.biquad.frequency.setValueAtTime(1200, this.ac.currentTime);
    this._rightFilter.biquad.frequency.setValueAtTime(1200, this.ac.currentTime);
    this._leftFilter.biquad.Q.setValueAtTime(0.3, this.ac.currentTime);
    this._rightFilter.biquad.Q.setValueAtTime(0.3, this.ac.currentTime);

    // graph routing
    this.input.connect(this._split);
    this.leftDelay.connect(this._leftGain);
    this.rightDelay.connect(this._rightGain);
    this._leftGain.connect(this._leftFilter.input);
    this._rightGain.connect(this._rightFilter.input);
    this._merge.connect(this.output);
    this.output.connect(p5.soundOut.input);

    this._leftFilter.biquad.gain.setValueAtTime(1, this.ac.currentTime);
    this._rightFilter.biquad.gain.setValueAtTime(1, this.ac.currentTime);

    // default routing
    this.setType(0);

    this._maxDelay = this.leftDelay.delayTime.maxValue;

    // add this p5.SoundFile to the soundArray
    p5sound.soundArray.push(this);
  };

  /**
   *  Add delay to an audio signal according to a set
   *  of delay parameters.
   *  
   *  @method  process
   *  @param  {Object} Signal  An object that outputs audio
   *  @param  {Number} [delayTime] Time (in seconds) of the delay/echo.
   *                               Some browsers limit delayTime to
   *                               1 second.
   *  @param  {Number} [feedback]  sends the delay back through itself
   *                               in a loop that decreases in volume
   *                               each time.
   *  @param  {Number} [lowPass]   Cutoff frequency. Only frequencies
   *                               below the lowPass will be part of the
   *                               delay.
   */
  p5.Delay.prototype.process = function(src, _delayTime, _feedback, _filter) {
    var feedback = _feedback || 0;
    var delayTime = _delayTime || 0;
    if (feedback >= 1.0) {
      throw new Error('Feedback value will force a positive feedback loop.');
    }
    if (delayTime >= this._maxDelay) {
      throw new Error('Delay Time exceeds maximum delay time of ' + this._maxDelay + ' second.');
    }

    src.connect(this.input);
    this.leftDelay.delayTime.setValueAtTime(delayTime, this.ac.currentTime);
    this.rightDelay.delayTime.setValueAtTime(delayTime, this.ac.currentTime);
    this._leftGain.gain.setValueAtTime(feedback, this.ac.currentTime);
    this._rightGain.gain.setValueAtTime(feedback, this.ac.currentTime);

    if (_filter) {
      this._leftFilter.freq(_filter);
      this._rightFilter.freq(_filter);
    }
  };

  /**
   *  Set the delay (echo) time, in seconds. Usually this value will be
   *  a floating point number between 0.0 and 1.0.
   *
   *  @method  delayTime
   *  @param {Number} delayTime Time (in seconds) of the delay
   */
  p5.Delay.prototype.delayTime = function(t) {
    // if t is an audio node...
    if (typeof(t) !== 'number'){
      t.connect(this.leftDelay.delayTime);
      t.connect(this.rightDelay.delayTime);
    }

    else {
      this.leftDelay.delayTime.cancelScheduledValues(this.ac.currentTime);
      this.rightDelay.delayTime.cancelScheduledValues(this.ac.currentTime);  
      this.leftDelay.delayTime.linearRampToValueAtTime(t, this.ac.currentTime);
      this.rightDelay.delayTime.linearRampToValueAtTime(t, this.ac.currentTime);
    }
  };

  /**
   *  Feedback occurs when Delay sends its signal back through its input
   *  in a loop. The feedback amount determines how much signal to send each
   *  time through the loop. A feedback greater than 1.0 is not desirable because
   *  it will increase the overall output each time through the loop,
   *  creating an infinite feedback loop.
   *  
   *  @method  feedback
   *  @param {Number|Object} feedback 0.0 to 1.0, or an object such as an
   *                                  Oscillator that can be used to
   *                                  modulate this param
   */
  p5.Delay.prototype.feedback = function(f) {
    // if f is an audio node...
    if (typeof(f) !== 'number'){
      f.connect(this._leftGain.gain);
      f.connect(this._rightGain.gain);
    }
    else if (f >= 1.0) {
      throw new Error('Feedback value will force a positive feedback loop.');
    }
    else {
      this._leftGain.gain.exponentialRampToValueAtTime(f, this.ac.currentTime);
      this._rightGain.gain.exponentialRampToValueAtTime(f, this.ac.currentTime);
    }
  };

  /**
   *  Set a lowpass filter frequency for the delay. A lowpass filter
   *  will cut off any frequencies higher than the filter frequency.
   *   
   *  @method  filter
   *  @param {Number|Object} cutoffFreq  A lowpass filter will cut off any 
   *                              frequencies higher than the filter frequency.
   *  @param {Number|Object} res  Resonance of the filter frequency
   *                              cutoff, or an object (i.e. a p5.Oscillator)
   *                              that can be used to modulate this parameter.
   *                              High numbers (i.e. 15) will produce a resonance,
   *                              low numbers (i.e. .2) will produce a slope.
   */
  p5.Delay.prototype.filter = function(freq, q) {
    this._leftFilter.set(freq, q);
    this._rightFilter.set(freq, q);
  };


  /**
   *  Choose a preset type of delay. 'pingPong' bounces the signal
   *  from the left to the right channel to produce a stereo effect.
   *  Any other parameter will revert to the default delay setting.
   *  
   *  @method  setType
   *  @param {String|Number} type 'pingPong' (1) or 'default' (0)
   */
  p5.Delay.prototype.setType = function(t) {
    if (t === 1) {
      t = 'pingPong';
    }
    this._split.disconnect();
    this._leftFilter.disconnect();
    this._rightFilter.disconnect();
    this._split.connect(this.leftDelay, 0);
    this._split.connect(this.rightDelay, 1);
    switch(t) {
      case 'pingPong':
        this._rightFilter.setType( this._leftFilter.biquad.type );
        this._leftFilter.output.connect(this._merge, 0, 0);
        this._rightFilter.output.connect(this._merge, 0, 1);
        this._leftFilter.output.connect(this.rightDelay);
        this._rightFilter.output.connect(this.leftDelay);
        break
      default:
        this._leftFilter.output.connect(this._merge, 0, 0);
        this._leftFilter.output.connect(this._merge, 0, 1);
        this._leftFilter.output.connect(this.leftDelay);
        this._leftFilter.output.connect(this.rightDelay);
    }
  };

  /**
   *  Set the output level of the delay effect.
   *  
   *  @method  amp
   *  @param  {Number} volume amplitude between 0 and 1.0
   *  @param {Number} [rampTime] create a fade that lasts rampTime 
   *  @param {Number} [timeFromNow] schedule this event to happen
   *                                seconds from now
   */
  p5.Delay.prototype.amp = function(vol, rampTime, tFromNow){
    var rampTime = rampTime || 0;
    var tFromNow = tFromNow || 0;
    var now = p5sound.audiocontext.currentTime;
    var currentVol = this.output.gain.value;
    this.output.gain.cancelScheduledValues(now);
    this.output.gain.linearRampToValueAtTime(currentVol, now + tFromNow + .001);
    this.output.gain.linearRampToValueAtTime(vol, now + tFromNow + rampTime + .001);
  };

  /**
   *  Send output to a p5.sound or web audio object
   *  
   *  @method  connect
   *  @param  {Object} unit
   */
  p5.Delay.prototype.connect = function(unit) {
    var u = unit || p5.soundOut.input;
    this.output.connect(u);
  };

  /**
   *  Disconnect all output.
   *  
   *  @method disconnect
   */
  p5.Delay.prototype.disconnect = function() {
    this.output.disconnect();
  };

  p5.Delay.prototype.dispose = function() {
    // remove reference from soundArray
    var index = p5sound.soundArray.indexOf(this);
    p5sound.soundArray.splice(index, 1);

    this.input.disconnect();
    this.output.disconnect();
    this._split.disconnect();
    this._leftFilter.disconnect();
    this._rightFilter.disconnect();
    this._merge.disconnect();
    this._leftGain.disconnect();
    this._rightGain.disconnect();
    this.leftDelay.disconnect();
    this.rightDelay.disconnect();

    this.input = undefined;
    this.output = undefined;
    this._split = undefined;
    this._leftFilter = undefined;
    this._rightFilter = undefined;
    this._merge = undefined;
    this._leftGain = undefined;
    this._rightGain = undefined;
    this.leftDelay = undefined;
    this.rightDelay = undefined;
  }

});