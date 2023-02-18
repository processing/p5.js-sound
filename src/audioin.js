import p5sound from './main';
import Amplitude from './amplitude';

// an array of input sources
p5sound.inputSources = [];

/**
 *  <p>Get audio from an input, i.e. your computer's microphone.</p>
 *
 *  <p>Turn the mic on/off with the start() and stop() methods. When the mic
 *  is on, its volume can be measured with getLevel or by connecting an
 *  FFT object.</p>
 *
 *  <p>If you want to hear the AudioIn, use the .connect() method.
 *  AudioIn does not connect to p5.sound output by default to prevent
 *  feedback.</p>
 *
 *  <p><em>Note: This uses the <a href="http://caniuse.com/stream">getUserMedia/
 *  Stream</a> API, which is not supported by certain browsers. Access in Chrome browser
 *  is limited to localhost and https, but access over http may be limited.</em></p>
 *
 *  @class p5.AudioIn
 *  @constructor
 *  @param {Function} [errorCallback] A function to call if there is an error
 *                                    accessing the AudioIn. For example,
 *                                    Safari and iOS devices do not
 *                                    currently allow microphone access.
 *  @example
 *  <div><code>
 *  let mic;
 *
 *   function setup(){
 *    let cnv = createCanvas(100, 100);
 *    cnv.mousePressed(userStartAudio);
 *    textAlign(CENTER);
 *    mic = new p5.AudioIn();
 *    mic.start();
 *  }
 *
 *  function draw(){
 *    background(0);
 *    fill(255);
 *    text('tap to start', width/2, 20);
 *
 *    micLevel = mic.getLevel();
 *    let y = height - micLevel * height;
 *    ellipse(width/2, y, 10, 10);
 *  }
 *  </code></div>
 */
class AudioIn {
  constructor(errorCallback) {
    /**
     * Set up audio input
     * @property {GainNode} input
     */
    this.input = p5sound.audiocontext.createGain();
    /**
     * Send audio as an output, i.e. your computer's speaker.
     * @property {GainNode} output
     */
    this.output = p5sound.audiocontext.createGain();
    /**
     * Used to store the MediaStream object that is returned from the getUserMedia() API,
     * which allows access to the user's microphone. The stream is used to create a MediaStreamAudioSourceNode,
     * which is used as the audio source for the input and output gain nodes.
     * The stream is also used to check if the browser supports the MediaStreamTrack and mediaDevices API,
     * and if not, an errorCallback function is called or an alert is displayed.
     * @property {MediaStream|null} stream
     */
    this.stream = null;
    /**
     * Used to access the "audio input" from the user's microphone.
     * It creates a MediaStream object that can be used to start and stop the mic and measure its volume using the getLevel() method or by connecting it to an FFT object.
     * MediaStream object can also be use to check if the browser supports MediaStreamTrack and mediaDevices and to add the AudioIn object to the soundArray for disposal on close.
     * @property {MediaStreamAudioSourceNode|null} mediaStream
     */
    this.mediaStream = null;
    /**
     * Used to store the "current source of audio input", such as the user's microphone.
     * Initially set to "null" and can be updated as the user selects different audio sources.
     * Also used in conjunction with the "input" and "mediaStream" properties to control audio input.
     * @property {Number|null} currentSource
     */
    this.currentSource = null;
    /**
     *  Client must allow browser to access their microphone / audioin source.
     *  Default: false. Will become true when the client enables access.
     *  @property {Boolean} enabled
     */
    this.enabled = false;
    /**
     * Input amplitude, connect to it by default but not to master out
     *  @property {p5.Amplitude} amplitude
     */
    this.amplitude = new Amplitude();
    this.output.connect(this.amplitude.input);

    if (
      !window.MediaStreamTrack ||
      !window.navigator.mediaDevices ||
      !window.navigator.mediaDevices.getUserMedia
    ) {
      errorCallback
        ? errorCallback()
        : window.alert(
            'This browser does not support MediaStreamTrack and mediaDevices'
          );
    }

    // add to soundArray so we can dispose on close
    p5sound.soundArray.push(this);
  }
  /**
   *  Start processing audio input. This enables the use of other
   *  AudioIn methods like getLevel(). Note that by default, AudioIn
   *  is not connected to p5.sound's output. So you won't hear
   *  anything unless you use the connect() method.<br/>
   *
   *  Certain browsers limit access to the user's microphone. For example,
   *  Chrome only allows access from localhost and over https. For this reason,
   *  you may want to include an errorCallback—a function that is called in case
   *  the browser won't provide mic access.
   *
   *  @method start
   *  @for p5.AudioIn
   *  @param {Function} [successCallback] Name of a function to call on
   *                                    success.
   *  @param {Function} [errorCallback] Name of a function to call if
   *                                    there was an error. For example,
   *                                    some browsers do not support
   *                                    getUserMedia.
   */
  start(successCallback, errorCallback) {
    var self = this;

    if (this.stream) {
      this.stop();
    }

    // set the audio source
    var audioSource = p5sound.inputSources[self.currentSource];
    var constraints = {
      audio: {
        sampleRate: p5sound.audiocontext.sampleRate,
        echoCancellation: false,
      },
    };

    // if developers determine which source to use
    if (p5sound.inputSources[this.currentSource]) {
      constraints.audio.deviceId = audioSource.deviceId;
    }

    window.navigator.mediaDevices
      .getUserMedia(constraints)
      .then(function (stream) {
        self.stream = stream;
        self.enabled = true;
        // Wrap a MediaStreamSourceNode around the live input
        self.mediaStream = p5sound.audiocontext.createMediaStreamSource(stream);
        self.mediaStream.connect(self.output);
        // only send to the Amplitude reader, so we can see it but not hear it.
        self.amplitude.setInput(self.output);
        if (successCallback) successCallback();
      })
      .catch(function (err) {
        if (errorCallback) errorCallback(err);
        else console.error(err);
      });
  }

  /**
   *  Turn the AudioIn off. If the AudioIn is stopped, it cannot getLevel().
   *  If re-starting, the user may be prompted for permission access.
   *
   *  @method stop
   *  @for p5.AudioIn
   */
  stop() {
    if (this.stream) {
      this.stream.getTracks().forEach(function (track) {
        track.stop();
      });

      this.mediaStream.disconnect();

      delete this.mediaStream;
      delete this.stream;
    }
  }

  /**
   *  Connect to an audio unit. If no parameter is provided, will
   *  connect to the main output (i.e. your speakers).<br/>
   *
   *  @method  connect
   *  @for p5.AudioIn
   *  @param  {Object} [unit] An object that accepts audio input,
   *                          such as an FFT
   */
  connect(unit) {
    if (unit) {
      if (unit.hasOwnProperty('input')) {
        this.output.connect(unit.input);
      } else if (unit.hasOwnProperty('analyser')) {
        this.output.connect(unit.analyser);
      } else {
        this.output.connect(unit);
      }
    } else {
      this.output.connect(p5sound.input);
    }
    if (unit && unit._onNewInput) {
      unit._onNewInput(this);
    }
  }

  /**
   *  Disconnect the AudioIn from all audio units. For example, if
   *  connect() had been called, disconnect() will stop sending
   *  signal to your speakers.<br/>
   *
   *  @method  disconnect
   *  @for p5.AudioIn
   */
  disconnect() {
    if (this.output) {
      this.output.disconnect();
      // stay connected to amplitude even if not outputting to p5
      this.output.connect(this.amplitude.input);
    }
  }

  /**
   *  Read the Amplitude (volume level) of an AudioIn. The AudioIn
   *  class contains its own instance of the Amplitude class to help
   *  make it easy to get a microphone's volume level. Accepts an
   *  optional smoothing value (0.0 < 1.0). <em>NOTE: AudioIn must
   *  .start() before using .getLevel().</em><br/>
   *
   *  @method  getLevel
   *  @for p5.AudioIn
   *  @param  {Number} [smoothing] Smoothing is 0.0 by default.
   *                               Smooths values based on previous values.
   *  @return {Number}           Volume level (between 0.0 and 1.0)
   */
  getLevel(smoothing) {
    if (smoothing) {
      this.amplitude.smooth(smoothing);
    }
    return this.amplitude.getLevel();
  }

  /**
   *  Set amplitude (volume) of a mic input between 0 and 1.0. <br/>
   *
   *  @method  amp
   *  @for p5.AudioIn
   *  @param  {Number} vol between 0 and 1.0
   *  @param {Number} [time] ramp time (optional)
   */
  amp(vol, t) {
    if (t) {
      var rampTime = t || 0;
      var currentVol = this.output.gain.value;
      this.output.gain.cancelScheduledValues(p5sound.audiocontext.currentTime);
      this.output.gain.setValueAtTime(
        currentVol,
        p5sound.audiocontext.currentTime
      );
      this.output.gain.linearRampToValueAtTime(
        vol,
        rampTime + p5sound.audiocontext.currentTime
      );
    } else {
      this.output.gain.cancelScheduledValues(p5sound.audiocontext.currentTime);
      this.output.gain.setValueAtTime(vol, p5sound.audiocontext.currentTime);
    }
  }

  /**
   * Returns a list of available input sources. This is a wrapper
   * for <a href="https://developer.mozilla.org/
   * en-US/docs/Web/API/MediaDevices/enumerateDevices" target="_blank">
   * MediaDevices.enumerateDevices() - Web APIs | MDN</a>
   * and it returns a Promise.
   * @method  getSources
   * @for p5.AudioIn
   * @param  {Function} [successCallback] This callback function handles the sources when they
   *                                      have been enumerated. The callback function
   *                                      receives the deviceList array as its only argument
   * @param  {Function} [errorCallback] This optional callback receives the error
   *                                    message as its argument.
   * @returns {Promise} Returns a Promise that can be used in place of the callbacks, similar
   *                            to the enumerateDevices() method
   * @example
   *  <div><code>
   *  let audioIn;
   *
   *  function setup(){
   *    text('getting sources...', 0, 20);
   *    audioIn = new p5.AudioIn();
   *    audioIn.getSources(gotSources);
   *  }
   *
   *  function gotSources(deviceList) {
   *    if (deviceList.length > 0) {
   *      //set the source to the first item in the deviceList array
   *      audioIn.setSource(0);
   *      let currentSource = deviceList[audioIn.currentSource];
   *      text('set source to: ' + currentSource.deviceId, 5, 20, width);
   *    }
   *  }
   *  </code></div>
   */
  getSources(onSuccess, onError) {
    return new Promise(function (resolve, reject) {
      window.navigator.mediaDevices
        .enumerateDevices()
        .then(function (devices) {
          p5sound.inputSources = devices.filter(function (device) {
            return device.kind === 'audioinput';
          });
          resolve(p5sound.inputSources);
          if (onSuccess) {
            onSuccess(p5sound.inputSources);
          }
        })
        .catch(function (error) {
          reject(error);
          if (onError) {
            onError(error);
          } else {
            console.error(
              'This browser does not support MediaStreamTrack.getSources()'
            );
          }
        });
    });
  }

  /**
   *  Set the input source. Accepts a number representing a
   *  position in the array returned by getSources().
   *  This is only available in browsers that support
   * <a href="https://developer.mozilla.org/
   * en-US/docs/Web/API/MediaDevices/enumerateDevices" target="_blank">
   * navigator.mediaDevices.enumerateDevices()</a>
   *
   *  @method setSource
   *  @for p5.AudioIn
   *  @param {number} num position of input source in the array
   *  @example
   *  <div><code>
   *  let audioIn;
   *
   *  function setup(){
   *    text('getting sources...', 0, 20);
   *    audioIn = new p5.AudioIn();
   *    audioIn.getSources(gotSources);
   *  }
   *
   *  function gotSources(deviceList) {
   *    if (deviceList.length > 0) {
   *      //set the source to the first item in the deviceList array
   *      audioIn.setSource(0);
   *      let currentSource = deviceList[audioIn.currentSource];
   *      text('set source to: ' + currentSource.deviceId, 5, 20, width);
   *    }
   *  }
   *  </code></div>
   */
  setSource(num) {
    if (p5sound.inputSources.length > 0 && num < p5sound.inputSources.length) {
      // set the current source
      this.currentSource = num;
      console.log('set source to ', p5sound.inputSources[this.currentSource]);
    } else {
      console.log('unable to set input source');
    }

    // restart stream if currently active
    if (this.stream && this.stream.active) {
      this.start();
    }
  }

  // private method
  dispose() {
    // remove reference from soundArray
    var index = p5sound.soundArray.indexOf(this);
    p5sound.soundArray.splice(index, 1);

    this.stop();

    if (this.output) {
      this.output.disconnect();
    }
    if (this.amplitude) {
      this.amplitude.dispose();
    }
    delete this.amplitude;
    delete this.output;
  }
}

export default AudioIn;
