/** [p5.sound]  Version: 0.3.12 - 2020-06-13 */ 
 /**
 *  <p>p5.sound extends p5 with <a href="http://caniuse.com/audio-api"
 *  target="_blank">Web Audio</a> functionality including audio input,
 *  playback, analysis and synthesis.
 *  </p>
 *  <ul>
 *  <li><a href="#/p5.SoundFile"><b>p5.SoundFile</b></a>: Load and play sound files.</li>
 *  <li><a href="#/p5.Amplitude"><b>p5.Amplitude</b></a>: Get the current volume of a sound.</li>
 *  <li><a href="#/p5.AudioIn"><b>p5.AudioIn</b></a>: Get sound from an input source, typically
 *    a computer microphone.</li>
 *  <li><a href="#/p5.FFT"><b>p5.FFT</b></a>: Analyze the frequency of sound. Returns
 *    results from the frequency spectrum or time domain (waveform).</li>
 *  <li><a href="#/p5.Oscillator"><b>p5.Oscillator</b></a>: Generate Sine,
 *    Triangle, Square and Sawtooth waveforms. Base class of
 *    <li><a href="#/p5.Noise">p5.Noise</a> and <a href="#/p5.Pulse">p5.Pulse</a>.
 *    </li>
 *  <li>
 *    <a href="#/p5.MonoSynth">p5.MonoSynth</a> and <a href="#/p5.PolySynth">p5.PolySynth</a>: Play musical notes
 *  </li>
 *  <li><a href="#/p5.Envelope"><b>p5.Envelope</b></a>: An Envelope is a series
 *    of fades over time. Often used to control an object's
 *    output gain level as an "ADSR Envelope" (Attack, Decay,
 *    Sustain, Release). Can also modulate other parameters.</li>
 *  <li><a href="#/p5.Delay"><b>p5.Delay</b></a>: A delay effect with
 *    parameters for feedback, delayTime, and lowpass filter.</li>
 *  <li><a href="#/p5.Filter"><b>p5.Filter</b></a>: Filter the frequency range of a
 *    sound.
 *  </li>
 *  <li><a href="#/p5.Reverb"><b>p5.Reverb</b></a>: Add reverb to a sound by specifying
 *    duration and decay. </li>
 *  <b><li><a href="#/p5.Convolver">p5.Convolver</a>:</b> Extends
 *  <a href="#/p5.Reverb">p5.Reverb</a> to simulate the sound of real
 *    physical spaces through convolution.</li>
 *  <b><li><a href="#/p5.SoundRecorder">p5.SoundRecorder</a></b>: Record sound for playback
 *    / save the .wav file.
 *  <b><li><a href="#/p5.SoundLoop">p5.SoundLoop</a>, <a href="#/p5.Phrase">p5.Phrase</a></b>, <b><a href="#/p5.Part">p5.Part</a></b> and
 *  <b><a href="#/p5.Score">p5.Score</a></b>: Compose musical sequences.
 *  </li>
 *  <li><a href="#/p5/userStartAudio">userStartAudio</a>: Enable audio in a
 *  browser- and user-friendly way.</a>
 *  <p>p5.sound is on <a href="https://github.com/therewasaguy/p5.sound/">GitHub</a>.
 *  Download the latest version
 *  <a href="https://github.com/therewasaguy/p5.sound/blob/master/lib/p5.sound.js">here</a>.</p>
 *
 *  @module p5.sound
 *  @submodule p5.sound
 *  @for p5.sound
 *  @main
 */

/**
 *  p5.sound 
 *  https://p5js.org/reference/#/libraries/p5.sound
 *
 *  From the Processing Foundation and contributors
 *  https://github.com/processing/p5.js-sound/graphs/contributors
 *
 *  MIT License (MIT)
 *  https://github.com/processing/p5.js-sound/blob/master/LICENSE
 *
 *  Some of the many audio libraries & resources that inspire p5.sound:
 *   - TONE.js (c) Yotam Mann. Licensed under The MIT License (MIT). https://github.com/TONEnoTONE/Tone.js
 *   - buzz.js (c) Jay Salvat. Licensed under The MIT License (MIT). http://buzz.jaysalvat.com/
 *   - Boris Smus Web Audio API book, 2013. Licensed under the Apache License http://www.apache.org/licenses/LICENSE-2.0
 *   - wavesurfer.js https://github.com/katspaugh/wavesurfer.js
 *   - Web Audio Components by Jordan Santell https://github.com/web-audio-components
 *   - Wilm Thoben's Sound library for Processing https://github.com/processing/processing/tree/master/java/libraries/sound
 *
 *   Web Audio API: http://w3.org/TR/webaudio/
 */

 (function(modules) { 
 	var installedModules = {};
 	function __webpack_require__(moduleId) {
 		if(installedModules[moduleId]) {
 			return installedModules[moduleId].exports;
 		}
 		var module = installedModules[moduleId] = {
 			i: moduleId,
 			l: false,
 			exports: {}
 		};
 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
 		module.l = true;
 		return module.exports;
 	}
 	__webpack_require__.m = modules;
 	__webpack_require__.c = installedModules;
 	__webpack_require__.d = function(exports, name, getter) {
 		if(!__webpack_require__.o(exports, name)) {
 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
 		}
 	};
 	__webpack_require__.r = function(exports) {
 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
 		}
 		Object.defineProperty(exports, '__esModule', { value: true });
 	};
 	__webpack_require__.t = function(value, mode) {
 		if(mode & 1) value = __webpack_require__(value);
 		if(mode & 8) return value;
 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
 		var ns = Object.create(null);
 		__webpack_require__.r(ns);
 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
 		return ns;
 	};
 	__webpack_require__.n = function(module) {
 		var getter = module && module.__esModule ?
 			function getDefault() { return module['default']; } :
 			function getModuleExports() { return module; };
 		__webpack_require__.d(getter, 'a', getter);
 		return getter;
 	};
 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
 	__webpack_require__.p = "";
 	return __webpack_require__(__webpack_require__.s = 4);
 })
 ([
 (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
(function(global) { var startaudiocontext__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2);
 var startaudiocontext__WEBPACK_IMPORTED_MODULE_0___default = __webpack_require__.n(startaudiocontext__WEBPACK_IMPORTED_MODULE_0__);


global.TONE_SILENCE_VERSION_LOGGING = true;

var audiocontext = new window.AudioContext(); 

/**
 * <p>Returns the Audio Context for this sketch. Useful for users
 * who would like to dig deeper into the <a target='_blank' href=
 * 'http://webaudio.github.io/web-audio-api/'>Web Audio API
 * </a>.</p>
 *
 * <p>Some browsers require users to startAudioContext
 * with a user gesture, such as touchStarted in the example below.</p>
 *
 * @for p5
 * @method getAudioContext
 * @return {Object}    AudioContext for this sketch
 * @example
 * <div><code>
 *  function draw() {
 *    background(255);
 *    textAlign(CENTER);
 *
 *    if (getAudioContext().state !== 'running') {
 *      text('click to start audio', width/2, height/2);
 *    } else {
 *      text('audio is enabled', width/2, height/2);
 *    }
 *  }
 *
 *  function touchStarted() {
 *    if (getAudioContext().state !== 'running') {
 *      getAudioContext().resume();
 *    }
 *    var synth = new p5.MonoSynth();
 *    synth.play('A4', 0.5, 0, 0.2);
 *  }
 *
 * </div></code>
 */

p5.prototype.getAudioContext = function () {
  return audiocontext;
};
/**
 *  <p>It is not only a good practice to give users control over starting
 *  audio. This policy is enforced by many web browsers, including iOS and
 *  <a href="https://goo.gl/7K7WLu" title="Google Chrome's autoplay
 *  policy">Google Chrome</a>, which create the Web Audio API's
 *  <a href="https://developer.mozilla.org/en-US/docs/Web/API/AudioContext"
 *  title="Audio Context @ MDN">Audio Context</a>
 *  in a suspended state.</p>
 *
 *  <p>In these browser-specific policies, sound will not play until a user
 *  interaction event (i.e. <code>mousePressed()</code>) explicitly resumes
 *  the AudioContext, or starts an audio node. This can be accomplished by
 *  calling <code>start()</code> on a <code>p5.Oscillator</code>,
 *  <code> play()</code> on a <code>p5.SoundFile</code>, or simply
 *  <code>userStartAudio()</code>.</p>
 *
 *  <p><code>userStartAudio()</code> starts the AudioContext on a user
 *  gesture. The default behavior will enable audio on any
 *  mouseUp or touchEnd event. It can also be placed in a specific
 *  interaction function, such as <code>mousePressed()</code> as in the
 *  example below. This method utilizes
 *  <a href="https://github.com/tambien/StartAudioContext">StartAudioContext
 *  </a>, a library by Yotam Mann (MIT Licence, 2016).</p>
 *  @param  {Element|Array}   [element(s)] This argument can be an Element,
 *                                Selector String, NodeList, p5.Element,
 *                                jQuery Element, or an Array of any of those.
 *  @param  {Function} [callback] Callback to invoke when the AudioContext
 *                                has started
 *  @return {Promise}            Returns a Promise that resolves when
 *                                       the AudioContext state is 'running'
 *  @method userStartAudio
 *  @for p5
 *  @example
 *  <div><code>
 *  function setup() {
 *    // mimics the autoplay policy
 *    getAudioContext().suspend();
 *
 *    let mySynth = new p5.MonoSynth();
 *
 *    // This won't play until the context has resumed
 *    mySynth.play('A6');
 *  }
 *  function draw() {
 *    background(220);
 *    textAlign(CENTER, CENTER);
 *    text(getAudioContext().state, width/2, height/2);
 *  }
 *  function mousePressed() {
 *    userStartAudio();
 *  }
 *  </code></div>
 */


p5.prototype.userStartAudio = function (elements, callback) {
  var elt = elements;

  if (elements instanceof p5.Element) {
    elt = elements.elt;
  } else if (elements instanceof Array && elements[0] instanceof p5.Element) {
    elt = elements.map(function (e) {
      return e.elt;
    });
  }

  return startaudiocontext__WEBPACK_IMPORTED_MODULE_0___default()(audiocontext, elt, callback);
};

 __webpack_exports__["a"] = (audiocontext);
}.call(this, __webpack_require__(3)))

 }),
 (function(module, exports) {

module.exports = {
  recorderProcessor: 'recorder-processor',
  soundFileProcessor: 'sound-file-processor',
  amplitudeProcessor: 'amplitude-processor'
};

 }),
 (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!function(e,t){ true?!(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_FACTORY__ = (t),
				__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
				(__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)):undefined}(this,function(){var r=function(e,t){this._dragged=!1,this._element=e,this._bindedMove=this._moved.bind(this),this._bindedEnd=this._ended.bind(this,t),e.addEventListener("touchstart",this._bindedEnd),e.addEventListener("touchmove",this._bindedMove),e.addEventListener("touchend",this._bindedEnd),e.addEventListener("mouseup",this._bindedEnd)};function o(e){return"running"===e.state}return r.prototype._moved=function(e){this._dragged=!0},r.prototype._ended=function(e){this._dragged||function(e){var t=e.createBuffer(1,1,e.sampleRate),n=e.createBufferSource();n.buffer=t,n.connect(e.destination),n.start(0),e.resume&&e.resume()}(e),this._dragged=!1},r.prototype.dispose=function(){this._element.removeEventListener("touchstart",this._bindedEnd),this._element.removeEventListener("touchmove",this._bindedMove),this._element.removeEventListener("touchend",this._bindedEnd),this._element.removeEventListener("mouseup",this._bindedEnd),this._bindedMove=null,this._bindedEnd=null,this._element=null},function(t,e,n){var i=new Promise(function(e){!function(t,n){o(t)?n():function e(){o(t)?n():(requestAnimationFrame(e),t.resume&&t.resume())}()}(t,e)}),d=[];return function e(t,n,i){if(Array.isArray(t)||NodeList&&t instanceof NodeList)for(var d=0;d<t.length;d++)e(t[d],n,i);else if("string"==typeof t)e(document.querySelectorAll(t),n,i);else if(t.jquery&&"function"==typeof t.toArray)e(t.toArray(),n,i);else if(Element&&t instanceof Element){var o=new r(t,i);n.push(o)}}(e=e||document.body,d,t),i.then(function(){for(var e=0;e<d.length;e++)d[e].dispose();d=null,n&&n()}),i}});

 }),
 (function(module, exports) {

var g;g=function(){return this}();try{g=g||new Function("return this")()}catch(t){"object"==typeof window&&(g=window)}module.exports=g;

 }),
 (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);

var audiocontext = __webpack_require__(0);


var master_Master = function Master() {
  this.input = audiocontext["a" ].createGain();
  this.output = audiocontext["a" ].createGain(); 

  this.limiter = audiocontext["a" ].createDynamicsCompressor();
  this.limiter.threshold.value = -3;
  this.limiter.ratio.value = 20;
  this.limiter.knee.value = 1;
  this.audiocontext = audiocontext["a" ];
  this.output.disconnect(); 

  this.input.connect(this.limiter); 

  this.limiter.connect(this.output); 

  this.meter = audiocontext["a" ].createGain();
  this.fftMeter = audiocontext["a" ].createGain();
  this.output.connect(this.meter);
  this.output.connect(this.fftMeter); 

  this.output.connect(this.audiocontext.destination); 

  this.soundArray = []; 

  this.parts = []; 

  this.extensions = [];
}; 


var p5sound = new master_Master();
/**
 * Returns a number representing the master amplitude (volume) for sound
 * in this sketch.
 *
 * @method getMasterVolume
 * @return {Number} Master amplitude (volume) for sound in this sketch.
 *                  Should be between 0.0 (silence) and 1.0.
 */

p5.prototype.getMasterVolume = function () {
  return p5sound.output.gain.value;
};
/**
 *  <p>Scale the output of all sound in this sketch</p>
 *  Scaled between 0.0 (silence) and 1.0 (full volume).
 *  1.0 is the maximum amplitude of a digital sound, so multiplying
 *  by greater than 1.0 may cause digital distortion. To
 *  fade, provide a <code>rampTime</code> parameter. For more
 *  complex fades, see the Envelope class.
 *
 *  Alternately, you can pass in a signal source such as an
 *  oscillator to modulate the amplitude with an audio signal.
 *
 *  <p><b>How This Works</b>: When you load the p5.sound module, it
 *  creates a single instance of p5sound. All sound objects in this
 *  module output to p5sound before reaching your computer's output.
 *  So if you change the amplitude of p5sound, it impacts all of the
 *  sound in this module.</p>
 *
 *  <p>If no value is provided, returns a Web Audio API Gain Node</p>
 *
 *  @method  masterVolume
 *  @param {Number|Object} volume  Volume (amplitude) between 0.0
 *                                     and 1.0 or modulating signal/oscillator
 *  @param {Number} [rampTime]  Fade for t seconds
 *  @param {Number} [timeFromNow]  Schedule this event to happen at
 *                                 t seconds in the future
 */


p5.prototype.masterVolume = function (vol) {
  var rampTime = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  var tFromNow = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

  if (typeof vol === 'number') {
    var now = p5sound.audiocontext.currentTime;
    var currentVol = p5sound.output.gain.value;
    p5sound.output.gain.cancelScheduledValues(now + tFromNow);
    p5sound.output.gain.linearRampToValueAtTime(currentVol, now + tFromNow);
    p5sound.output.gain.linearRampToValueAtTime(vol, now + tFromNow + rampTime);
  } else if (vol) {
    vol.connect(p5sound.output.gain);
  } else {
    return p5sound.output.gain;
  }
};
/**
 *  `p5.soundOut` is the p5.sound master output. It sends output to
 *  the destination of this window's web audio context. It contains
 *  Web Audio API nodes including a dyanmicsCompressor (<code>.limiter</code>),
 *  and Gain Nodes for <code>.input</code> and <code>.output</code>.
 *
 *  @property {Object} soundOut
 */


p5.prototype.soundOut = p5.soundOut = p5sound; 

p5.soundOut._silentNode = p5sound.audiocontext.createGain();
p5.soundOut._silentNode.gain.value = 0;

p5.soundOut._silentNode.connect(p5sound.audiocontext.destination);

 var master = (p5sound);
var processorNames = __webpack_require__(1);
var processorNames_default = __webpack_require__.n(processorNames);



function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }



/**
 * @for p5
 */

/**
 * Returns a number representing the sample rate, in samples per second,
 * of all sound objects in this audio context. It is determined by the
 * sampling rate of your operating system's sound card, and it is not
 * currently possile to change.
 * It is often 44100, or twice the range of human hearing.
 *
 * @method sampleRate
 * @return {Number} samplerate samples per second
 */

p5.prototype.sampleRate = function () {
  return master.audiocontext.sampleRate;
};
/**
 *  Returns the closest MIDI note value for
 *  a given frequency.
 *
 *  @method freqToMidi
 *  @param  {Number} frequency A freqeuncy, for example, the "A"
 *                             above Middle C is 440Hz
 *  @return {Number}   MIDI note value
 */


p5.prototype.freqToMidi = function (f) {
  var mathlog2 = Math.log(f / 440) / Math.log(2);
  var m = Math.round(12 * mathlog2) + 69;
  return m;
};
/**
 *  Returns the frequency value of a MIDI note value.
 *  General MIDI treats notes as integers where middle C
 *  is 60, C# is 61, D is 62 etc. Useful for generating
 *  musical frequencies with oscillators.
 *
 *  @method  midiToFreq
 *  @param  {Number} midiNote The number of a MIDI note
 *  @return {Number} Frequency value of the given MIDI note
 *  @example
 *  <div><code>
 *  let midiNotes = [60, 64, 67, 72];
 *  let noteIndex = 0;
 *  let midiVal, freq;
 *
 *  function setup() {
 *    let cnv = createCanvas(100, 100);
 *    cnv.mousePressed(startSound);
 *    osc = new p5.TriOsc();
 *    env = new p5.Envelope();
 *  }
 *
 *  function draw() {
 *    background(220);
 *    text('tap to play', 10, 20);
 *    if (midiVal) {
 *      text('MIDI: ' + midiVal, 10, 40);
 *      text('Freq: ' + freq, 10, 60);
 *    }
 *  }
 *
 *  function startSound() {
 *    // see also: userStartAudio();
 *    osc.start();
 *
 *    midiVal = midiNotes[noteIndex % midiNotes.length];
 *    freq = midiToFreq(midiVal);
 *    osc.freq(freq);
 *    env.ramp(osc, 0, 1.0, 0);
 *
 *    noteIndex++;
 *  }
 *  </code></div>
 */


var midiToFreq = p5.prototype.midiToFreq = function (m) {
  return 440 * Math.pow(2, (m - 69) / 12.0);
}; 

var noteToFreq = function noteToFreq(note) {
  if (typeof note !== 'string') {
    return note;
  }

  var wholeNotes = {
    A: 21,
    B: 23,
    C: 24,
    D: 26,
    E: 28,
    F: 29,
    G: 31
  };
  var value = wholeNotes[note[0].toUpperCase()];
  var octave = ~~note.slice(-1);
  value += 12 * (octave - 1);

  switch (note[1]) {
    case '#':
      value += 1;
      break;

    case 'b':
      value -= 1;
      break;

    default:
      break;
  }

  return midiToFreq(value);
};
/**
 *  List the SoundFile formats that you will include. LoadSound
 *  will search your directory for these extensions, and will pick
 *  a format that is compatable with the client's web browser.
 *  <a href="http://media.io/">Here</a> is a free online file
 *  converter.
 *
 *  @method soundFormats
 *  @param {String} [...formats] i.e. 'mp3', 'wav', 'ogg'
 *  @example
 *  <div><code>
 *  function preload() {
 *    // set the global sound formats
 *    soundFormats('mp3', 'ogg');
 *
 *    // load either beatbox.mp3, or .ogg, depending on browser
 *    mySound = loadSound('assets/beatbox.mp3');
 *  }
 *
 *  function setup() {
 *       let cnv = createCanvas(100, 100);
 *       background(220);
 *       text('sound loaded! tap to play', 10, 20, width - 20);
 *       cnv.mousePressed(function() {
 *         mySound.play();
 *       });
 *     }
 *  </code></div>
 */

p5.prototype.soundFormats = function () {
  master.extensions = []; 

  for (var i = 0; i < arguments.length; i++) {
    arguments[i] = arguments[i].toLowerCase();

    if (['mp3', 'wav', 'ogg', 'm4a', 'aac'].indexOf(arguments[i]) > -1) {
      master.extensions.push(arguments[i]);
    } else {
      throw arguments[i] + ' is not a valid sound format!';
    }
  }
};

p5.prototype.disposeSound = function () {
  for (var i = 0; i < master.soundArray.length; i++) {
    master.soundArray[i].dispose();
  }
}; 


p5.prototype.registerMethod('remove', p5.prototype.disposeSound);

p5.prototype._checkFileFormats = function (paths) {
  var path; 

  if (typeof paths === 'string') {
    path = paths; 

    var extTest = path.split('.').pop(); 

    if (['mp3', 'wav', 'ogg', 'm4a', 'aac'].indexOf(extTest) > -1) {
      if (!p5.prototype.isFileSupported(extTest)) {
        var pathSplit = path.split('.');
        var pathCore = pathSplit[pathSplit.length - 1];

        for (var _i = 0; _i < master.extensions.length; _i++) {
          var _extension = master.extensions[_i];

          var _supported = p5.prototype.isFileSupported(_extension);

          if (_supported) {
            pathCore = '';

            if (pathSplit.length === 2) {
              pathCore += pathSplit[0];
            }

            for (var _i2 = 1; _i2 <= pathSplit.length - 2; _i2++) {
              var p = pathSplit[_i2];
              pathCore += '.' + p;
            }

            path = pathCore += '.';
            path = path += _extension;
            break;
          }
        }
      }
    } 
    else {
        for (var _i3 = 0; _i3 < master.extensions.length; _i3++) {
          var _extension2 = master.extensions[_i3];

          var _supported2 = p5.prototype.isFileSupported(_extension2);

          if (_supported2) {
            path = path + '.' + _extension2;
            break;
          }
        }
      }
  } 
  else if (_typeof(paths) === 'object') {
      for (var i = 0; i < paths.length; i++) {
        var extension = paths[i].split('.').pop();
        var supported = p5.prototype.isFileSupported(extension);

        if (supported) {
          path = paths[i];
          break;
        }
      }
    }

  return path;
};
/**
 *  Used by Osc and Envelope to chain signal math
 */


p5.prototype._mathChain = function (o, math, thisChain, nextChain, type) {
  for (var i in o.mathOps) {
    if (o.mathOps[i] instanceof type) {
      o.mathOps[i].dispose();
      thisChain = i;

      if (thisChain < o.mathOps.length - 1) {
        nextChain = o.mathOps[i + 1];
      }
    }
  }

  o.mathOps[thisChain - 1].disconnect();
  o.mathOps[thisChain - 1].connect(math);
  math.connect(nextChain);
  o.mathOps[thisChain] = math;
  return o;
}; 


function convertToWav(audioBuffer) {
  var leftChannel, rightChannel;
  leftChannel = audioBuffer.getChannelData(0); 

  if (audioBuffer.numberOfChannels > 1) {
    rightChannel = audioBuffer.getChannelData(1);
  } else {
    rightChannel = leftChannel;
  }

  var interleaved = interleave(leftChannel, rightChannel); 

  var buffer = new window.ArrayBuffer(44 + interleaved.length * 2);
  var view = new window.DataView(buffer); 

  writeUTFBytes(view, 0, 'RIFF');
  view.setUint32(4, 36 + interleaved.length * 2, true);
  writeUTFBytes(view, 8, 'WAVE'); 

  writeUTFBytes(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); 

  view.setUint16(22, 2, true);
  view.setUint32(24, master.audiocontext.sampleRate, true);
  view.setUint32(28, master.audiocontext.sampleRate * 4, true);
  view.setUint16(32, 4, true);
  view.setUint16(34, 16, true); 

  writeUTFBytes(view, 36, 'data');
  view.setUint32(40, interleaved.length * 2, true); 

  var lng = interleaved.length;
  var index = 44;
  var volume = 1;

  for (var i = 0; i < lng; i++) {
    view.setInt16(index, interleaved[i] * (0x7fff * volume), true);
    index += 2;
  }

  return view;
} 

function interleave(leftChannel, rightChannel) {
  var length = leftChannel.length + rightChannel.length;
  var result = new Float32Array(length);
  var inputIndex = 0;

  for (var index = 0; index < length;) {
    result[index++] = leftChannel[inputIndex];
    result[index++] = rightChannel[inputIndex];
    inputIndex++;
  }

  return result;
}

function writeUTFBytes(view, offset, string) {
  var lng = string.length;

  for (var i = 0; i < lng; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

function safeBufferSize(idealBufferSize) {
  var bufferSize = idealBufferSize; 

  var tempAudioWorkletNode = new AudioWorkletNode(master.audiocontext, processorNames_default.a.soundFileProcessor);

  if (tempAudioWorkletNode instanceof ScriptProcessorNode) {
    bufferSize = tempAudioWorkletNode.bufferSize;
  }

  tempAudioWorkletNode.disconnect();
  tempAudioWorkletNode = null;
  return bufferSize;
} 





/**
 *  Amplitude measures volume between 0.0 and 1.0.
 *  Listens to all p5sound by default, or use setInput()
 *  to listen to a specific sound source. Accepts an optional
 *  smoothing value, which defaults to 0.
 *
 *  @class p5.Amplitude
 *  @constructor
 *  @param {Number} [smoothing] between 0.0 and .999 to smooth
 *                             amplitude readings (defaults to 0)
 *  @example
 *  <div><code>
 *  let sound, amplitude;
 *
 *  function preload(){
 *    sound = loadSound('assets/beat.mp3');
 *  }
 *  function setup() {
 *    let cnv = createCanvas(100,100);
 *    cnv.mouseClicked(toggleSound);
 *    amplitude = new p5.Amplitude();
 *  }
 *
 *  function draw() {
 *    background(220);
 *    text('tap to play', 20, 20);
 *
 *    let level = amplitude.getLevel();
 *    let size = map(level, 0, 1, 0, 200);
 *    ellipse(width/2, height/2, size, size);
 *  }
 *
 *  function toggleSound() {
 *    if (sound.isPlaying() ){
 *      sound.stop();
 *    } else {
 *      sound.play();
 *    }
 *  }
 *
 *  </code></div>
 */

p5.Amplitude = function (smoothing) {
  this.bufferSize = safeBufferSize(2048); 

  this.audiocontext = master.audiocontext;
  this._workletNode = new AudioWorkletNode(this.audiocontext, processorNames_default.a.amplitudeProcessor, {
    outputChannelCount: [1],
    parameterData: {
      smoothing: smoothing || 0
    },
    processorOptions: {
      normalize: false,
      smoothing: smoothing || 0,
      numInputChannels: 2,
      bufferSize: this.bufferSize
    }
  });

  this._workletNode.port.onmessage = function (event) {
    if (event.data.name === 'amplitude') {
      this.volume = event.data.volume;
      this.volNorm = event.data.volNorm;
      this.stereoVol = event.data.stereoVol;
      this.stereoVolNorm = event.data.stereoVolNorm;
    }
  }.bind(this); 


  this.input = this._workletNode;
  this.output = this.audiocontext.createGain(); 

  this.volume = 0;
  this.volNorm = 0;
  this.stereoVol = [0, 0];
  this.stereoVolNorm = [0, 0];
  this.normalize = false;

  this._workletNode.connect(this.output);

  this.output.gain.value = 0; 

  this.output.connect(this.audiocontext.destination); 

  master.meter.connect(this._workletNode); 

  master.soundArray.push(this);
};
/**
 *  Connects to the p5sound instance (master output) by default.
 *  Optionally, you can pass in a specific source (i.e. a soundfile).
 *
 *  @method setInput
 *  @for p5.Amplitude
 *  @param {soundObject|undefined} [snd] set the sound source
 *                                       (optional, defaults to
 *                                       master output)
 *  @param {Number|undefined} [smoothing] a range between 0.0 and 1.0
 *                                        to smooth amplitude readings
 *  @example
 *  <div><code>
 *  function preload(){
 *    sound1 = loadSound('assets/beat.mp3');
 *    sound2 = loadSound('assets/drum.mp3');
 *  }
 *  function setup(){
 *    cnv = createCanvas(100, 100);
 *    cnv.mouseClicked(toggleSound);
 *
 *    amplitude = new p5.Amplitude();
 *    amplitude.setInput(sound2);
 *  }
 *
 *  function draw() {
 *    background(220);
 *    text('tap to play', 20, 20);
 *
 *    let level = amplitude.getLevel();
 *    let size = map(level, 0, 1, 0, 200);
 *    ellipse(width/2, height/2, size, size);
 *  }
 *
 *  function toggleSound(){
 *    if (sound1.isPlaying() && sound2.isPlaying()) {
 *      sound1.stop();
 *      sound2.stop();
 *    } else {
 *      sound1.play();
 *      sound2.play();
 *    }
 *  }
 *  </code></div>
 */


p5.Amplitude.prototype.setInput = function (source, smoothing) {
  master.meter.disconnect();

  if (smoothing) {
    this._workletNode.parameters.get('smoothing').value = smoothing;
  } 


  if (source == null) {
    console.log('Amplitude input source is not ready! Connecting to master output instead');
    master.meter.connect(this._workletNode);
  } 
  else if (source instanceof p5.Signal) {
      source.output.connect(this._workletNode);
    } 
    else if (source) {
        source.connect(this._workletNode);

        this._workletNode.disconnect();

        this._workletNode.connect(this.output);
      } 
      else {
          master.meter.connect(this._workletNode);
        }
};

p5.Amplitude.prototype.connect = function (unit) {
  if (unit) {
    if (unit.hasOwnProperty('input')) {
      this.output.connect(unit.input);
    } else {
      this.output.connect(unit);
    }
  } else {
    this.output.connect(this.panner.connect(master.input));
  }
};

p5.Amplitude.prototype.disconnect = function () {
  if (this.output) {
    this.output.disconnect();
  }
};
/**
 *  Returns a single Amplitude reading at the moment it is called.
 *  For continuous readings, run in the draw loop.
 *
 *  @method getLevel
 *  @for p5.Amplitude
 *  @param {Number} [channel] Optionally return only channel 0 (left) or 1 (right)
 *  @return {Number}       Amplitude as a number between 0.0 and 1.0
 *  @example
 *  <div><code>
 *  function preload(){
 *    sound = loadSound('assets/beat.mp3');
 *  }
 *
 *  function setup() {
 *    let cnv = createCanvas(100, 100);
 *    cnv.mouseClicked(toggleSound);
 *    amplitude = new p5.Amplitude();
 *  }
 *
 *  function draw() {
 *    background(220, 150);
 *    textAlign(CENTER);
 *    text('tap to play', width/2, 20);
 *
 *    let level = amplitude.getLevel();
 *    let size = map(level, 0, 1, 0, 200);
 *    ellipse(width/2, height/2, size, size);
 *  }
 *
 *  function toggleSound(){
 *    if (sound.isPlaying()) {
 *      sound.stop();
 *    } else {
 *      sound.play();
 *    }
 *  }
 *  </code></div>
 */


p5.Amplitude.prototype.getLevel = function (channel) {
  if (typeof channel !== 'undefined') {
    if (this.normalize) {
      return this.stereoVolNorm[channel];
    } else {
      return this.stereoVol[channel];
    }
  } else if (this.normalize) {
    return this.volNorm;
  } else {
    return this.volume;
  }
};
/**
 * Determines whether the results of Amplitude.process() will be
 * Normalized. To normalize, Amplitude finds the difference the
 * loudest reading it has processed and the maximum amplitude of
 * 1.0. Amplitude adds this difference to all values to produce
 * results that will reliably map between 0.0 and 1.0. However,
 * if a louder moment occurs, the amount that Normalize adds to
 * all the values will change. Accepts an optional boolean parameter
 * (true or false). Normalizing is off by default.
 *
 * @method toggleNormalize
 * @for p5.Amplitude
 * @param {boolean} [boolean] set normalize to true (1) or false (0)
 */


p5.Amplitude.prototype.toggleNormalize = function (bool) {
  if (typeof bool === 'boolean') {
    this.normalize = bool;
  } else {
    this.normalize = !this.normalize;
  }

  this._workletNode.port.postMessage({
    name: 'toggleNormalize',
    normalize: this.normalize
  });
};
/**
 *  Smooth Amplitude analysis by averaging with the last analysis
 *  frame. Off by default.
 *
 *  @method smooth
 *  @for p5.Amplitude
 *  @param {Number} set smoothing from 0.0 <= 1
 */


p5.Amplitude.prototype.smooth = function (s) {
  if (s >= 0 && s < 1) {
    this._workletNode.port.postMessage({
      name: 'smoothing',
      smoothing: s
    });
  } else {
    console.log('Error: smoothing must be between 0 and 1');
  }
};

p5.Amplitude.prototype.dispose = function () {
  var index = master.soundArray.indexOf(this);
  master.soundArray.splice(index, 1);

  if (this.input) {
    this.input.disconnect();
    delete this.input;
  }

  if (this.output) {
    this.output.disconnect();
    delete this.output;
  }

  this._workletNode.disconnect();

  delete this._workletNode;
};


 })
 ]);
