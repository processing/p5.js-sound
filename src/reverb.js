define(function (require) {
  'use strict';

  var p5sound = require('master');
  var CustomError = require('errorHandler');
  require('sndcore');

  /**
   *  Reverb adds depth to a sound through a large number of decaying
   *  echoes. It creates the perception that sound is occurring in a
   *  physical space. The p5.Reverb has paramters for Time (how long does the
   *  reverb last) and decayRate (how much the sound decays with each echo)
   *  that can be set with the .set() or .process() methods. The p5.Convolver
   *  extends p5.Reverb allowing you to recreate the sound of actual physical
   *  spaces through convolution.
   *  
   *  @class p5.Reverb
   *  @constructor
   *  @example
   *  <div><code>
   *  var soundFile, reverb;
   *  function preload() {
   *    soundFile = loadSound('assets/Damscray_DancingTiger.mp3');
   *  }
   *
   *  function setup() {
   *    reverb = new p5.Reverb();
   *    soundFile.disconnect(); // so we'll only hear reverb...
   *
   *    // connect soundFile to reverb, process w/
   *    // 3 second reverbTime, decayRate of 2%
   *    reverb.process(soundFile, 3, 2);
   *    soundFile.play();
   *  }
   *  </code></div>
   */
  p5.Reverb = function() {
    this.ac = p5sound.audiocontext;
    this.convolverNode = this.ac.createConvolver();

    this.input = this.ac.createGain();
    this.output = this.ac.createGain();

    // otherwise, Safari distorts
    this.input.gain.value = 0.5;

    this.input.connect(this.convolverNode);
    this.convolverNode.connect(this.output);

    // default params
    this._seconds = 3;
    this._decay = 2;
    this._reverse = false;

    this._buildImpulse();
    this.connect();
    p5sound.soundArray.push(this);
  };

  /**
   *  Connect a source to the reverb, and assign reverb parameters.
   *  
   *  @method  process
   *  @param  {Object} src     p5.sound / Web Audio object with a sound
   *                           output.
   *  @param  {Number} [seconds] Duration of the reverb, in seconds.
   *                           Min: 0, Max: 10. Defaults to 3.
   *  @param  {Number} [decayRate] Percentage of decay with each echo.
   *                            Min: 0, Max: 100. Defaults to 2.
   *  @param  {Boolean} [reverse] Play the reverb backwards or forwards.
   */
  p5.Reverb.prototype.process = function(src, seconds, decayRate, reverse) {
    src.connect(this.input);
    var rebuild = false;
    if (seconds) {
      this._seconds = seconds;
      rebuild = true;
    }
    if (decayRate) {
      this._decay = decayRate;
    }
    if (reverse) {
      this._reverse = reverse;
    }
    if (rebuild) {
      this._buildImpulse();
    }
  };

  /**
   *  Set the reverb settings. Similar to .process(), but without
   *  assigning a new input.
   *  
   *  @method  set
   *  @param  {Number} [seconds] Duration of the reverb, in seconds.
   *                           Min: 0, Max: 10. Defaults to 3.
   *  @param  {Number} [decayRate] Percentage of decay with each echo.
   *                            Min: 0, Max: 100. Defaults to 2.
   *  @param  {Boolean} [reverse] Play the reverb backwards or forwards.
   */
  p5.Reverb.prototype.set = function(seconds, decayRate, reverse) {
    var rebuild = false;
    if (seconds) {
      this._seconds = seconds;
      rebuild = true;
    }
    if (decayRate) {
      this._decay = decayRate;
    }
    if (reverse) {
      this._reverse = reverse;
    }
    if (rebuild) {
      this._buildImpulse();
    }
  };

  /**
   *  Set the output level of the delay effect.
   *  
   *  @method  amp
   *  @param  {Number} volume amplitude between 0 and 1.0
   *  @param  {Number} [rampTime] create a fade that lasts rampTime 
   *  @param  {Number} [timeFromNow] schedule this event to happen
   *                                seconds from now
   */
  p5.Reverb.prototype.amp = function(vol, rampTime, tFromNow) {
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
  p5.Reverb.prototype.connect = function(unit) {
    var u = unit || p5.soundOut.input;
    this.output.connect(u.input ? u.input : u);
  };

  /**
   *  Disconnect all output.
   *  
   *  @method disconnect
   */
  p5.Reverb.prototype.disconnect = function() {
    this.output.disconnect();
  };

  /**
   *  Inspired by Simple Reverb by Jordan Santell
   *  https://github.com/web-audio-components/simple-reverb/blob/master/index.js
   * 
   *  Utility function for building an impulse response
   *  based on the module parameters.
   *
   *  @private
   */
  p5.Reverb.prototype._buildImpulse = function() {
    var rate = this.ac.sampleRate;
    var length = rate*this._seconds;
    var decay = this._decay;
    var impulse = this.ac.createBuffer(2, length, rate);
    var impulseL = impulse.getChannelData(0);
    var impulseR = impulse.getChannelData(1);
    var n, i;
    for (i = 0; i < length; i++) {
      n = this.reverse ? length - i : i;
      impulseL[i] = (Math.random() * 2 - 1) * Math.pow(1 - n / length, decay);
      impulseR[i] = (Math.random() * 2 - 1) * Math.pow(1 - n / length, decay);
    }
    this.convolverNode.buffer = impulse;
  };

  p5.Reverb.prototype.dispose = function() {
    // remove reference from soundArray
    var index = p5sound.soundArray.indexOf(this);
    p5sound.soundArray.splice(index, 1);

    if (this.convolverNode) {
      this.convolverNode.buffer = null;
      this.convolverNode = null;
    }
    if (typeof(this.output) !== 'undefined'){
      this.output.disconnect();
      this.output = null;
    }
    if (typeof(this.panner) !== 'undefined'){
      this.panner.disconnect();
      this.panner = null;
    }
  };

  // =======================================================================
  //                          *** p5.Convolver ***
  // =======================================================================

  /**
   *  <p>p5.Convolver extends p5.Reverb. It can emulate the sound of real
   *  physical spaces through a process called <a href="
   *  https://en.wikipedia.org/wiki/Convolution_reverb#Real_space_simulation">
   *  convolution</a>.</p>
   *  
   *  <p>Convolution multiplies any audio input by an "impulse response"
   *  to simulate the dispersion of sound over time. The impulse response is
   *  generated from an audio file that you provide. One way to
   *  generate an impulse response is to pop a balloon in a reverberant space
   *  and record the echo. Convolution can also be used to experiment with
   *  sound.</p>
   *
   *  <p>Use the method <code>createConvolution(path)</code> to instantiate a
   *  p5.Convolver with a path to your impulse response audio file.</p>
   *  
   *  @class p5.Convolver
   *  @constructor
   *  @param  {String}   path     path to a sound file
   *  @param  {Function} [callback] function to call when loading succeeds
   *  @param  {Function} [errorCallback] function to call if loading fails.
   *                                     This function will receive an error or
   *                                     XMLHttpRequest object with information
   *                                     about what went wrong.
   *  @example
   *  <div><code>
   *  var cVerb, sound;
   *  function preload() {
   *    // We have both MP3 and OGG versions of all sound assets
   *    soundFormats('ogg', 'mp3');
   *    
   *    // Try replacing 'bx-spring' with other soundfiles like
   *    // 'concrete-tunnel' 'small-plate' 'drum' 'beatbox'
   *    cVerb = createConvolver('assets/bx-spring.mp3');
   *
   *    // Try replacing 'Damscray_DancingTiger' with
   *    // 'beat', 'doorbell', lucky_dragons_-_power_melody'
   *    sound = loadSound('assets/Damscray_DancingTiger.mp3');
   *  }
   *  
   *  function setup() {
   *    // disconnect from master output...
   *    sound.disconnect();
   *    
   *    // ...and process with cVerb
   *    // so that we only hear the convolution
   *    cVerb.process(sound);
   *    
   *    sound.play();
   *  }
   *  </code></div>
   */
  p5.Convolver = function(path, callback, errorCallback) {
    this.ac = p5sound.audiocontext;

    /**
     *  Internally, the p5.Convolver uses the a
     *  <a href="http://www.w3.org/TR/webaudio/#ConvolverNode">
     *  Web Audio Convolver Node</a>.
     *  
     *  @property convolverNode
     *  @type {Object}  Web Audio Convolver Node
     */
    this.convolverNode = this.ac.createConvolver();

    this.input = this.ac.createGain();
    this.output = this.ac.createGain();

    // otherwise, Safari distorts
    this.input.gain.value = 0.5;

    this.input.connect(this.convolverNode);
    this.convolverNode.connect(this.output);

    if (path) {
      this.impulses = [];
      this._loadBuffer(path, callback, errorCallback);
    }
    else {
      // parameters
      this._seconds = 3;
      this._decay = 2;
      this._reverse = false;

      this._buildImpulse();
    }
    this.connect();
    p5sound.soundArray.push(this);
  };

  p5.Convolver.prototype = Object.create(p5.Reverb.prototype);

  p5.prototype.registerPreloadMethod('createConvolver', p5.prototype);

  /**
   *  Create a p5.Convolver. Accepts a path to a soundfile 
   *  that will be used to generate an impulse response.
   *
   *  @method  createConvolver
   *  @param  {String}   path     path to a sound file
   *  @param  {Function} [callback] function to call if loading is successful.
   *                                The object will be passed in as the argument
   *                                to the callback function.
   *  @param  {Function} [errorCallback] function to call if loading is not successful.
   *                                A custom error will be passed in as the argument
   *                                to the callback function.
   *  @return {p5.Convolver}
   *  @example
   *  <div><code>
   *  var cVerb, sound;
   *  function preload() {
   *    // We have both MP3 and OGG versions of all sound assets
   *    soundFormats('ogg', 'mp3');
   *    
   *    // Try replacing 'bx-spring' with other soundfiles like
   *    // 'concrete-tunnel' 'small-plate' 'drum' 'beatbox'
   *    cVerb = createConvolver('assets/bx-spring.mp3');
   *
   *    // Try replacing 'Damscray_DancingTiger' with
   *    // 'beat', 'doorbell', lucky_dragons_-_power_melody'
   *    sound = loadSound('assets/Damscray_DancingTiger.mp3');
   *  }
   *  
   *  function setup() {
   *    // disconnect from master output...
   *    sound.disconnect();
   *    
   *    // ...and process with cVerb
   *    // so that we only hear the convolution
   *    cVerb.process(sound);
   *    
   *    sound.play();
   *  }
   *  </code></div>
   */
  p5.prototype.createConvolver = function(path, callback, errorCallback){
    // if loading locally without a server
    if (window.location.origin.indexOf('file://') > -1 && window.cordova === 'undefined') {
      alert('This sketch may require a server to load external files. Please see http://bit.ly/1qcInwS');
    }
    var cReverb = new p5.Convolver(path, callback, errorCallback);
    cReverb.impulses = [];
    return cReverb;
  };

  /**
   *  Private method to load a buffer as an Impulse Response,
   *  assign it to the convolverNode, and add to the Array of .impulses.
   *  
   *  @param   {String}   path
   *  @param   {Function} callback
   *  @param   {Function} errorCallback
   *  @private
   */
  p5.Convolver.prototype._loadBuffer = function(path, callback, errorCallback){
    var path = p5.prototype._checkFileFormats(path);
    var self = this;
    var errorTrace = new Error().stack;
    var ac = p5.prototype.getAudioContext();

    var request = new XMLHttpRequest();
    request.open('GET', path, true);
    request.responseType = 'arraybuffer';

    request.onload = function() {
      if (request.status == 200) {
        // on success loading file:
        ac.decodeAudioData(request.response,
          function(buff) {
            var buffer = {};
            var chunks = path.split('/');
            buffer.name = chunks[chunks.length - 1];
            buffer.audioBuffer = buff;
            self.impulses.push(buffer);
            self.convolverNode.buffer = buffer.audioBuffer;
            if (callback) {
              callback(buffer);
            }
          },
          // error decoding buffer. "e" is undefined in Chrome 11/22/2015
          function(e) {
            var err = new CustomError('decodeAudioData', errorTrace, self.url);
            var msg = 'AudioContext error at decodeAudioData for ' + self.url;
            if (errorCallback) {
              err.msg = msg;
              errorCallback(err);
            } else {
              console.error(msg +'\n The error stack trace includes: \n' + err.stack);
            }
          }
        );
      }
      // if request status != 200, it failed
      else {
        var err = new CustomError('loadConvolver', errorTrace, self.url);
        var msg = 'Unable to load ' + self.url + '. The request status was: ' + request.status + ' (' + request.statusText + ')';

        if (errorCallback) {
          err.message = msg;
          errorCallback(err);
        } else {
          console.error(msg +'\n The error stack trace includes: \n' + err.stack);
        }
      }
    };

    // if there is another error, aside from 404...
    request.onerror = function(e) {
      var err = new CustomError('loadConvolver', errorTrace, self.url);
      var msg = 'There was no response from the server at ' + self.url + '. Check the url and internet connectivity.';

      if (errorCallback) {
        err.message = msg;
        errorCallback(err);
      } else {
        console.error(msg +'\n The error stack trace includes: \n' + err.stack);
      }
    };
    request.send();
  };

  p5.Convolver.prototype.set = null;

  /**
   *  Connect a source to the reverb, and assign reverb parameters.
   *  
   *  @method  process
   *  @param  {Object} src     p5.sound / Web Audio object with a sound
   *                           output.
   *  @example
   *  <div><code>
   *  var cVerb, sound;
   *  function preload() {
   *    soundFormats('ogg', 'mp3');
   *    
   *    cVerb = createConvolver('assets/concrete-tunnel.mp3');
   *
   *    sound = loadSound('assets/beat.mp3');
   *  }
   *  
   *  function setup() {
   *    // disconnect from master output...
   *    sound.disconnect();
   *    
   *    // ...and process with (i.e. connect to) cVerb
   *    // so that we only hear the convolution
   *    cVerb.process(sound);
   *    
   *    sound.play();
   *  }
   *  </code></div>
   */
  p5.Convolver.prototype.process = function(src) {
    src.connect(this.input);
  };

  /**
   *  If you load multiple impulse files using the .addImpulse method,
   *  they will be stored as Objects in this Array. Toggle between them
   *  with the <code>toggleImpulse(id)</code> method.
   *  
   *  @property impulses
   *  @type {Array} Array of Web Audio Buffers
   */
  p5.Convolver.prototype.impulses = [];

  /**
   *  Load and assign a new Impulse Response to the p5.Convolver.
   *  The impulse is added to the <code>.impulses</code> array. Previous
   *  impulses can be accessed with the <code>.toggleImpulse(id)</code>
   *  method.
   *  
   *  @method  addImpulse
   *  @param  {String}   path     path to a sound file
   *  @param  {Function} callback function (optional)
   *  @param  {Function} errorCallback function (optional)
   */
  p5.Convolver.prototype.addImpulse = function(path, callback, errorCallback){
    // if loading locally without a server
    if (window.location.origin.indexOf('file://') > -1 && window.cordova === 'undefined') {
      alert('This sketch may require a server to load external files. Please see http://bit.ly/1qcInwS');
    }
    this._loadBuffer(path, callback, errorCallback);
  };

  /**
   *  Similar to .addImpulse, except that the <code>.impulses</code>
   *  Array is reset to save memory. A new <code>.impulses</code>
   *  array is created with this impulse as the only item. 
   *
   *  @method  resetImpulse
   *  @param  {String}   path     path to a sound file
   *  @param  {Function} callback function (optional)
   *  @param  {Function} errorCallback function (optional)
   */
  p5.Convolver.prototype.resetImpulse = function(path, callback, errorCallback){
    // if loading locally without a server
    if (window.location.origin.indexOf('file://') > -1 && window.cordova === 'undefined') {
      alert('This sketch may require a server to load external files. Please see http://bit.ly/1qcInwS');
    }
    this.impulses = [];
    this._loadBuffer(path, callback, errorCallback);
  };

  /**
   *  If you have used <code>.addImpulse()</code> to add multiple impulses
   *  to a p5.Convolver, then you can use this method to toggle between
   *  the items in the <code>.impulses</code> Array. Accepts a parameter
   *  to identify which impulse you wish to use, identified either by its
   *  original filename (String) or by its position in the <code>.impulses
   *  </code> Array (Number).<br/>
   *  You can access the objects in the .impulses Array directly. Each
   *  Object has two attributes: an <code>.audioBuffer</code> (type:
   *  Web Audio <a href="
   *  http://webaudio.github.io/web-audio-api/#the-audiobuffer-interface">
   *  AudioBuffer)</a> and a <code>.name</code>, a String that corresponds
   *  with the original filename. 
   *  
   *  @method toggleImpulse
   *  @param {String|Number} id Identify the impulse by its original filename
   *                            (String), or by its position in the
   *                            <code>.impulses</code> Array (Number).
   */
  p5.Convolver.prototype.toggleImpulse = function(id){
    if (typeof(id) === 'number' && id < this.impulses.length) {
      this.convolverNode.buffer = this.impulses[id].audioBuffer;
    }
    if (typeof(id) === 'string') {
      for (var i = 0; i < this.impulses.length; i++){
        if (this.impulses[i].name === id) {
          this.convolverNode.buffer = this.impulses[i].audioBuffer;
          break;
        }
      }
    }
  };

  p5.Convolver.prototype.dispose = function() {
    // remove all the Impulse Response buffers
    for (var i in this.impulses) {
      this.impulses[i] = null;
    }
    this.convolverNode.disconnect();
    this.concolverNode = null;
    if (typeof(this.output) !== 'undefined'){
      this.output.disconnect();
      this.output = null;
    }
    if (typeof(this.panner) !== 'undefined'){
      this.panner.disconnect();
      this.panner = null;
    }
  };

});