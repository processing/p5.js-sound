import { getAudioContext } from './audiocontext';
import CustomError from './errorHandler';
import Effect from './effect';

/**
 *  Reverb adds depth to a sound through a large number of decaying
 *  echoes. It creates the perception that sound is occurring in a
 *  physical space. The p5.Reverb has paramters for Time (how long does the
 *  reverb last) and decayRate (how much the sound decays with each echo)
 *  that can be set with the .set() or .process() methods. The p5.Convolver
 *  extends p5.Reverb allowing you to recreate the sound of actual physical
 *  spaces through convolution.
 *
 *  This class extends <a href = "/reference/#/p5.Effect">p5.Effect</a>.
 *  Methods <a href = "/reference/#/p5.Effect/amp">amp()</a>, <a href = "/reference/#/p5.Effect/chain">chain()</a>,
 *  <a href = "/reference/#/p5.Effect/drywet">drywet()</a>, <a href = "/reference/#/p5.Effect/connect">connect()</a>, and
 *  <a href = "/reference/#/p5.Effect/disconnect">disconnect()</a> are available.
 *
 *  @class p5.Reverb
 *  @extends p5.Effect
 *  @constructor
 *  @example
 *  <div><code>
 *  let soundFile, reverb;
 *  function preload() {
 *    soundFile = loadSound('assets/Damscray_DancingTiger.mp3');
 *  }
 *
 *  function setup() {
 *    let cnv = createCanvas(100, 100);
 *    cnv.mousePressed(playSound);
 *
 *    reverb = new p5.Reverb();
 *    soundFile.disconnect(); // so we'll only hear reverb...
 *
 *    // connect soundFile to reverb, process w/
 *    // 3 second reverbTime, decayRate of 2%
 *    reverb.process(soundFile, 3, 2);
 *  }
 *
 *  function draw() {
 *    let dryWet = constrain(map(mouseX, 0, width, 0, 1), 0, 1);
 *    // 1 = all reverb, 0 = no reverb
 *    reverb.drywet(dryWet);
 *
 *    background(220);
 *    text('tap to play', 10, 20);
 *    text('dry/wet: ' + round(dryWet * 100) + '%', 10, height - 20);
 *  }
 *
 *  function playSound() {
 *    soundFile.play();
 *  }
 *  </code></div>
 */

class Reverb extends Effect {
  constructor() {
    super();
    this._initConvolverNode();

    // otherwise, Safari distorts
    this.input.gain.value = 0.5;

    // default params
    this._seconds = 3;
    this._decay = 2;
    this._reverse = false;

    this._buildImpulse();
  }

  _initConvolverNode() {
    this.convolverNode = this.ac.createConvolver();
    this.input.connect(this.convolverNode);
    this.convolverNode.connect(this.wet);
  }

  _teardownConvolverNode() {
    if (this.convolverNode) {
      this.convolverNode.disconnect();
      delete this.convolverNode;
    }
  }

  _setBuffer(audioBuffer) {
    this._teardownConvolverNode();
    this._initConvolverNode();
    this.convolverNode.buffer = audioBuffer;
  }
  /**
   *  Connect a source to the reverb, and assign reverb parameters.
   *
   *  @method  process
   *  @for p5.Reverb
   *  @param  {Object} src     p5.sound / Web Audio object with a sound
   *                           output.
   *  @param  {Number} [seconds] Duration of the reverb, in seconds.
   *                           Min: 0, Max: 10. Defaults to 3.
   *  @param  {Number} [decayRate] Percentage of decay with each echo.
   *                            Min: 0, Max: 100. Defaults to 2.
   *  @param  {Boolean} [reverse] Play the reverb backwards or forwards.
   */
  process(src, seconds, decayRate, reverse) {
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
  }

  /**
   *  Set the reverb settings. Similar to .process(), but without
   *  assigning a new input.
   *
   *  @method  set
   *  @for p5.Reverb
   *  @param  {Number} [seconds] Duration of the reverb, in seconds.
   *                           Min: 0, Max: 10. Defaults to 3.
   *  @param  {Number} [decayRate] Percentage of decay with each echo.
   *                            Min: 0, Max: 100. Defaults to 2.
   *  @param  {Boolean} [reverse] Play the reverb backwards or forwards.
   */
  set(seconds, decayRate, reverse) {
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
  }

  // DocBlocks for methods inherited from p5.Effect
  /**
   *  Set the output level of the reverb effect.
   *
   *  @method  amp
   *  @for p5.Reverb
   *  @param  {Number} volume amplitude between 0 and 1.0
   *  @param  {Number} [rampTime] create a fade that lasts rampTime
   *  @param  {Number} [timeFromNow] schedule this event to happen
   *                                seconds from now
   */
  /**
   *  Send output to a p5.sound or web audio object
   *
   *  @method  connect
   *  @for p5.Reverb
   *  @param  {Object} unit
   */
  /**
   *  Disconnect all output.
   *
   *  @method disconnect
   *  @for p5.Reverb
   */

  /**
   *  Inspired by Simple Reverb by Jordan Santell
   *  https://github.com/web-audio-components/simple-reverb/blob/master/index.js
   *
   *  Utility function for building an impulse response
   *  based on the module parameters.
   *
   *  @private
   */
  _buildImpulse() {
    var rate = this.ac.sampleRate;
    var length = rate * this._seconds;
    var decay = this._decay;
    var impulse = this.ac.createBuffer(2, length, rate);
    var impulseL = impulse.getChannelData(0);
    var impulseR = impulse.getChannelData(1);
    var n, i;
    for (i = 0; i < length; i++) {
      n = this._reverse ? length - i : i;
      impulseL[i] = (Math.random() * 2 - 1) * Math.pow(1 - n / length, decay);
      impulseR[i] = (Math.random() * 2 - 1) * Math.pow(1 - n / length, decay);
    }
    this._setBuffer(impulse);
  }

  dispose() {
    super.dispose();
    this._teardownConvolverNode();
  }
}

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
 *  @extends p5.Effect
 *  @constructor
 *  @param  {String}   path     path to a sound file
 *  @param  {Function} [callback] function to call when loading succeeds
 *  @param  {Function} [errorCallback] function to call if loading fails.
 *                                     This function will receive an error or
 *                                     XMLHttpRequest object with information
 *                                     about what went wrong.
 *  @example
 *  <div><code>
 *  let cVerb, sound;
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
 *    let cnv = createCanvas(100, 100);
 *    cnv.mousePressed(playSound);
 *    background(220);
 *    text('tap to play', 20, 20);
 *
 *    // disconnect from master output...
 *    sound.disconnect();
 *
 *    // ...and process with cVerb
 *    // so that we only hear the convolution
 *    cVerb.process(sound);
 *  }
 *
 *  function playSound() {
 *    sound.play();
 *  }
 *  </code></div>
 */
class Convolver extends Reverb {
  constructor(path, callback, errorCallback) {
    super();
    /**
     *  Internally, the p5.Convolver uses the a
     *  <a href="http://www.w3.org/TR/webaudio/#ConvolverNode">
     *  Web Audio Convolver Node</a>.
     *
     *  @property {ConvolverNode} convolverNode
     */
    this._initConvolverNode();

    // otherwise, Safari distorts
    this.input.gain.value = 0.5;

    if (path) {
      this.impulses = [];
      this._loadBuffer(path, callback, errorCallback);
    } else {
      // parameters
      this._seconds = 3;
      this._decay = 2;
      this._reverse = false;

      this._buildImpulse();
    }

    /**
     *  If you load multiple impulse files using the .addImpulse method,
     *  they will be stored as Objects in this Array. Toggle between them
     *  with the <code>toggleImpulse(id)</code> method.
     *
     *  @property {Array} impulses
     *  @for p5.Convolver
     */
    this.impulses = [];
    this.set = null;
  }

  /**
   *  Private method to load a buffer as an Impulse Response,
   *  assign it to the convolverNode, and add to the Array of .impulses.
   *
   *  @param   {String}   path
   *  @param   {Function} callback
   *  @param   {Function} errorCallback
   *  @private
   */
  _loadBuffer(_path, callback, errorCallback) {
    var path = p5.prototype._checkFileFormats(_path);
    var self = this;
    var errorTrace = new Error().stack;
    var ac = getAudioContext();

    var request = new XMLHttpRequest();
    request.open('GET', path, true);
    request.responseType = 'arraybuffer';

    request.onload = function () {
      if (request.status === 200) {
        // on success loading file:
        ac.decodeAudioData(
          request.response,
          function (buff) {
            var buffer = {};
            var chunks = path.split('/');
            buffer.name = chunks[chunks.length - 1];
            buffer.audioBuffer = buff;
            self.impulses.push(buffer);
            self._setBuffer(buffer.audioBuffer);
            if (callback) {
              callback(buffer);
            }
          },
          // error decoding buffer. "e" is undefined in Chrome 11/22/2015
          function () {
            var err = new CustomError('decodeAudioData', errorTrace, self.url);
            var msg = 'AudioContext error at decodeAudioData for ' + self.url;
            if (errorCallback) {
              err.msg = msg;
              errorCallback(err);
            } else {
              console.error(
                msg + '\n The error stack trace includes: \n' + err.stack
              );
            }
          }
        );
      }
      // if request status != 200, it failed
      else {
        var err = new CustomError('loadConvolver', errorTrace, self.url);
        var msg =
          'Unable to load ' +
          self.url +
          '. The request status was: ' +
          request.status +
          ' (' +
          request.statusText +
          ')';

        if (errorCallback) {
          err.message = msg;
          errorCallback(err);
        } else {
          console.error(
            msg + '\n The error stack trace includes: \n' + err.stack
          );
        }
      }
    };

    // if there is another error, aside from 404...
    request.onerror = function () {
      var err = new CustomError('loadConvolver', errorTrace, self.url);
      var msg =
        'There was no response from the server at ' +
        self.url +
        '. Check the url and internet connectivity.';

      if (errorCallback) {
        err.message = msg;
        errorCallback(err);
      } else {
        console.error(
          msg + '\n The error stack trace includes: \n' + err.stack
        );
      }
    };
    request.send();
  }

  /**
   *  Connect a source to the convolver.
   *
   *  @method  process
   *  @for p5.Convolver
   *  @param  {Object} src     p5.sound / Web Audio object with a sound
   *                           output.
   *  @example
   *  <div><code>
   *  let cVerb, sound;
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
   *    let cnv = createCanvas(100, 100);
   *    cnv.mousePressed(playSound);
   *    background(220);
   *    text('tap to play', 20, 20);
   *
   *    // disconnect from master output...
   *    sound.disconnect();
   *
   *    // ...and process with cVerb
   *    // so that we only hear the convolution
   *    cVerb.process(sound);
   *  }
   *
   *  function playSound() {
   *    sound.play();
   *  }
   *
   *  </code></div>
   */
  process(src) {
    src.connect(this.input);
  }

  /**
   *  Load and assign a new Impulse Response to the p5.Convolver.
   *  The impulse is added to the <code>.impulses</code> array. Previous
   *  impulses can be accessed with the <code>.toggleImpulse(id)</code>
   *  method.
   *
   *  @method  addImpulse
   *  @for p5.Convolver
   *  @param  {String}   path     path to a sound file
   *  @param  {Function} callback function (optional)
   *  @param  {Function} errorCallback function (optional)
   */
  addImpulse(path, callback, errorCallback) {
    // if loading locally without a server
    if (
      window.location.origin.indexOf('file://') > -1 &&
      window.cordova === 'undefined'
    ) {
      alert(
        'This sketch may require a server to load external files. Please see http://bit.ly/1qcInwS'
      );
    }
    this._loadBuffer(path, callback, errorCallback);
  }

  /**
   *  Similar to .addImpulse, except that the <code>.impulses</code>
   *  Array is reset to save memory. A new <code>.impulses</code>
   *  array is created with this impulse as the only item.
   *
   *  @method  resetImpulse
   *  @for p5.Convolver
   *  @param  {String}   path     path to a sound file
   *  @param  {Function} callback function (optional)
   *  @param  {Function} errorCallback function (optional)
   */
  resetImpulse(path, callback, errorCallback) {
    // if loading locally without a server
    if (
      window.location.origin.indexOf('file://') > -1 &&
      window.cordova === 'undefined'
    ) {
      alert(
        'This sketch may require a server to load external files. Please see http://bit.ly/1qcInwS'
      );
    }
    this.impulses = [];
    this._loadBuffer(path, callback, errorCallback);
  }

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
   *  @for p5.Convolver
   *  @param {String|Number} id Identify the impulse by its original filename
   *                            (String), or by its position in the
   *                            <code>.impulses</code> Array (Number).
   */
  toggleImpulse(id) {
    if (typeof id === 'number' && id < this.impulses.length) {
      this._setBuffer(this.impulses[id].audioBuffer);
    }
    if (typeof id === 'string') {
      for (var i = 0; i < this.impulses.length; i++) {
        if (this.impulses[i].name === id) {
          this._setBuffer(this.impulses[i].audioBuffer);
          break;
        }
      }
    }
  }

  dispose() {
    super.dispose();

    // remove all the Impulse Response buffers
    for (var i in this.impulses) {
      if (this.impulses[i]) {
        this.impulses[i] = null;
      }
    }
  }
}

/**
 *  Create a p5.Convolver. Accepts a path to a soundfile
 *  that will be used to generate an impulse response.
 *
 *  @method  createConvolver
 *  @for p5
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
 *  let cVerb, sound;
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
 *    let cnv = createCanvas(100, 100);
 *    cnv.mousePressed(playSound);
 *    background(220);
 *    text('tap to play', 20, 20);
 *
 *    // disconnect from master output...
 *    sound.disconnect();
 *
 *    // ...and process with cVerb
 *    // so that we only hear the convolution
 *    cVerb.process(sound);
 *  }
 *
 *  function playSound() {
 *    sound.play();
 *  }
 *  </code></div>
 */
function createConvolver(path, callback, errorCallback) {
  // if loading locally without a server
  if (
    window.location.origin.indexOf('file://') > -1 &&
    window.cordova === 'undefined'
  ) {
    alert(
      'This sketch may require a server to load external files. Please see http://bit.ly/1qcInwS'
    );
  }
  var self = this;
  var cReverb = new Convolver(
    path,
    function (buffer) {
      if (typeof callback === 'function') {
        callback(buffer);
      }

      if (typeof self._decrementPreload === 'function') {
        self._decrementPreload();
      }
    },
    errorCallback
  );
  cReverb.impulses = [];
  return cReverb;
}

export { Reverb, Convolver, createConvolver };
