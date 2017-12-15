'use strict';

define(function (require) {
  var p5sound = require('master');

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
   *  var mic;
   *  function setup(){
   *    mic = new p5.AudioIn()
   *    mic.start();
   *  }
   *  function draw(){
   *    background(0);
   *    micLevel = mic.getLevel();
   *    ellipse(width/2, constrain(height-micLevel*height*5, 0, height), 10, 10);
   *  }
   *  </code></div>
   */
  p5.AudioIn = function(errorCallback) {
    // set up audio input
    this.input = p5sound.audiocontext.createGain();
    this.output = p5sound.audiocontext.createGain();

    this.stream = null;
    this.mediaStream = null;
    this.currentSource = null;

    /**
     *  Client must allow browser to access their microphone / audioin source.
     *  Default: false. Will become true when the client enables acces.
     *
     *  @property {Boolean} enabled
     */
    this.enabled = false;

    // create an amplitude, connect to it by default but not to master out
    this.amplitude = new p5.Amplitude();
    this.output.connect(this.amplitude.input);

    if (!window.MediaStreamTrack || !window.navigator.mediaDevices || !window.navigator.mediaDevices.getUserMedia) {
      errorCallback ? errorCallback() : window.alert('This browser does not support MediaStreamTrack and mediaDevices');
    }

    // add to soundArray so we can dispose on close
    p5sound.soundArray.push(this);
  };

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
   *  @param {Function} [successCallback] Name of a function to call on
   *                                    success.
   *  @param {Function} [errorCallback] Name of a function to call if
   *                                    there was an error. For example,
   *                                    some browsers do not support
   *                                    getUserMedia.
   */
  p5.AudioIn.prototype.start = function(successCallback, errorCallback) {
    var self = this;

    if (this.stream) {
      this.stop();
    }

    // set the audio source
    var audioSource = p5sound.inputSources[self.currentSource];
    var constraints = {
      audio: {
        sampleRate: p5sound.audiocontext.sampleRate,
        echoCancellation: false
      }
    };

    // if developers determine which source to use
    if (p5sound.inputSources[this.currentSource]) {
      constraints.audio.deviceId = audioSource.deviceId;
    }

    window.navigator.mediaDevices.getUserMedia( constraints )
      .then( function(stream) {
        self.stream = stream;
        self.enabled = true;
        // Wrap a MediaStreamSourceNode around the live input
        self.mediaStream = p5sound.audiocontext.createMediaStreamSource(stream);
        self.mediaStream.connect(self.output);
        // only send to the Amplitude reader, so we can see it but not hear it.
        self.amplitude.setInput(self.output);
        if (successCallback) successCallback();
      })
      .catch( function(err) {
        if (errorCallback) errorCallback(err);
        else console.error(err);
      });
  };

  /**
   *  Turn the AudioIn off. If the AudioIn is stopped, it cannot getLevel().
   *  If re-starting, the user may be prompted for permission access.
   *
   *  @method stop
   */
  p5.AudioIn.prototype.stop = function() {
    if (this.stream) {
      this.stream.getTracks().forEach(function(track) {
        track.stop();
      });

      this.mediaStream.disconnect();

      delete this.mediaStream;
      delete this.stream;
    }
  };

  /**
   *  Connect to an audio unit. If no parameter is provided, will
   *  connect to the master output (i.e. your speakers).<br/>
   *
   *  @method  connect
   *  @param  {Object} [unit] An object that accepts audio input,
   *                          such as an FFT
   */
  p5.AudioIn.prototype.connect = function(unit) {
    if (unit) {
      if (unit.hasOwnProperty('input')) {
        this.output.connect(unit.input);
      }
      else if (unit.hasOwnProperty('analyser')) {
        this.output.connect(unit.analyser);
      }
      else {
        this.output.connect(unit);
      }
    }
    else {
      this.output.connect(p5sound.input);
    }
  };

  /**
   *  Disconnect the AudioIn from all audio units. For example, if
   *  connect() had been called, disconnect() will stop sending
   *  signal to your speakers.<br/>
   *
   *  @method  disconnect
   */
  p5.AudioIn.prototype.disconnect = function() {
    this.output.disconnect();
    // stay connected to amplitude even if not outputting to p5
    this.output.connect(this.amplitude.input);
  };

  /**
   *  Read the Amplitude (volume level) of an AudioIn. The AudioIn
   *  class contains its own instance of the Amplitude class to help
   *  make it easy to get a microphone's volume level. Accepts an
   *  optional smoothing value (0.0 < 1.0). <em>NOTE: AudioIn must
   *  .start() before using .getLevel().</em><br/>
   *
   *  @method  getLevel
   *  @param  {Number} [smoothing] Smoothing is 0.0 by default.
   *                               Smooths values based on previous values.
   *  @return {Number}           Volume level (between 0.0 and 1.0)
   */
  p5.AudioIn.prototype.getLevel = function(smoothing) {
    if (smoothing) {
      this.amplitude.smoothing = smoothing;
    }
    return this.amplitude.getLevel();
  };

  /**
   *  Set amplitude (volume) of a mic input between 0 and 1.0. <br/>
   *
   *  @method  amp
   *  @param  {Number} vol between 0 and 1.0
   *  @param {Number} [time] ramp time (optional)
   */
  p5.AudioIn.prototype.amp = function(vol, t) {
    if (t) {
      var rampTime = t || 0;
      var currentVol = this.output.gain.value;
      this.output.gain.cancelScheduledValues(p5sound.audiocontext.currentTime);
      this.output.gain.setValueAtTime(currentVol, p5sound.audiocontext.currentTime);
      this.output.gain.linearRampToValueAtTime(vol, rampTime + p5sound.audiocontext.currentTime);
    } else {
      this.output.gain.cancelScheduledValues(p5sound.audiocontext.currentTime);
      this.output.gain.setValueAtTime(vol, p5sound.audiocontext.currentTime);
    }
  };

  /**
   * Returns a list of available input sources. This is a wrapper
   * for <a title="MediaDevices.enumerateDevices() - Web APIs | MDN" target="_blank" href=
   *  "https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/enumerateDevices"
   *  > and it returns a Promise.
   *
   * @method  getSources
   * @param  {Function} [successCallback] This callback function handles the sources when they
   *                                      have been enumerated. The callback function
   *                                      receives the deviceList array as its only argument
   * @param  {Function} [errorCallback] This optional callback receives the error
   *                                    message as its argument.
   * @returns {Promise} Returns a Promise that can be used in place of the callbacks, similar
   *                            to the enumerateDevices() method
   * @example
   *  <div><code>
   *  var audiograb;
   *
   *  function setup(){
   *    //new audioIn
   *    audioGrab = new p5.AudioIn();
   *
   *    audioGrab.getSources(function(deviceList) {
   *      //print out the array of available sources
   *      console.log(deviceList);
   *      //set the source to the first item in the deviceList array
   *      audioGrab.setSource(0);
   *    });
   *  }
   *  </code></div>
   */
  p5.AudioIn.prototype.getSources = function (onSuccess, onError) {
    return new Promise( function(resolve, reject) {
      window.navigator.mediaDevices.enumerateDevices()
        .then( function(devices) {
          p5sound.inputSources = devices.filter(function(device) {
            return device.kind === 'audioinput';
          });
          resolve(p5sound.inputSources);
          if (onSuccess) {
            onSuccess(p5sound.inputSources);
          }
        })
        .catch( function(error) {
          reject(error);
          if (onError) {
            onError(error);
          } else {
            console.error('This browser does not support MediaStreamTrack.getSources()');
          }
        });
    });
  };

  /**
   *  Set the input source. Accepts a number representing a
   *  position in the array returned by getSources().
   *  This is only available in browsers that support
   *  <a title="MediaDevices.enumerateDevices() - Web APIs | MDN" target="_blank" href=
   *  "https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/enumerateDevices"
   *  >navigator.mediaDevices.enumerateDevices()</a>.<br/>
   *
   *  @method setSource
   *  @param {number} num position of input source in the array
   */
  p5.AudioIn.prototype.setSource = function(num) {
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
  };

  // private method
  p5.AudioIn.prototype.dispose = function() {
    // remove reference from soundArray
    var index = p5sound.soundArray.indexOf(this);
    p5sound.soundArray.splice(index, 1);

    this.stop();

    if (this.output) {
      this.output.disconnect();
    }
    if (this.amplitude) {
      this.amplitude.disconnect();
    }
    delete this.amplitude;
    delete this.output;
  };

});
