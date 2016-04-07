define(function (require) {
  'use strict';

  var p5sound = require('master');
  var CustomError = require('errorHandler');

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
   *  @return {Object} AudioIn
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

    this.currentSource = 0;

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

    // Some browsers let developer determine their input sources
    if (typeof window.MediaStreamTrack === 'undefined'){
      if (errorCallback) {
        errorCallback();
      } else {
        window.alert('This browser does not support AudioIn');        
      }
    } else if (typeof window.MediaStreamTrack.getSources === 'function') {
      // Chrome supports getSources to list inputs. Dev picks default
      window.MediaStreamTrack.getSources(this._gotSources);
    } else {
      // Firefox has no getSources() but lets user choose their input
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
   *  @param {Function} successCallback Name of a function to call on
   *                                    success.
   *  @param {Function} errorCallback Name of a function to call if
   *                                    there was an error. For example,
   *                                    some browsers do not support
   *                                    getUserMedia.
   */
  p5.AudioIn.prototype.start = function(successCallback, errorCallback) {
    var self = this;

    // if stream was already started...


    // if _gotSources() i.e. developers determine which source to use
    if (p5sound.inputSources[self.currentSource]) {
      // set the audio source
      var audioSource = p5sound.inputSources[self.currentSource].id;
      var constraints = {
          audio: {
            optional: [{sourceId: audioSource}]
          }};
      window.navigator.getUserMedia( constraints,
        this._onStream = function(stream) {
        self.stream = stream;
        self.enabled = true;
        // Wrap a MediaStreamSourceNode around the live input
        self.mediaStream = p5sound.audiocontext.createMediaStreamSource(stream);
        self.mediaStream.connect(self.output);
        if (successCallback) successCallback();
        // only send to the Amplitude reader, so we can see it but not hear it.
        self.amplitude.setInput(self.output);
      }, this._onStreamError = function(e) {
        if (errorCallback) errorCallback(e);
        else console.error(e);
      });
    } else {
    // if Firefox where users select their source via browser
    // if (typeof MediaStreamTrack.getSources === 'undefined') {
      // Only get the audio stream.
      window.navigator.getUserMedia( {'audio':true},
        this._onStream = function(stream) {
          self.stream = stream;
          self.enabled = true;
          // Wrap a MediaStreamSourceNode around the live input
          self.mediaStream = p5sound.audiocontext.createMediaStreamSource(stream);
          self.mediaStream.connect(self.output);
          // only send to the Amplitude reader, so we can see it but not hear it.
          self.amplitude.setInput(self.output);
          if (successCallback) successCallback();
        }, this._onStreamError = function(e) {
          if (errorCallback) errorCallback(e);
          else console.error(e);
        });
    }
  };

  /**
   *  Turn the AudioIn off. If the AudioIn is stopped, it cannot getLevel().
   *  If re-starting, the user may be prompted for permission access.
   *
   *  @method stop
   */
  p5.AudioIn.prototype.stop = function() {
    if (this.stream) {
      // assume only one track
      this.stream.getTracks()[0].stop();
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
   *  Add input sources to the list of available sources.
   *  
   *  @private
   */
  p5.AudioIn.prototype._gotSources = function(sourceInfos) {
    for (var i = 0; i< sourceInfos.length; i++) {
      var sourceInfo = sourceInfos[i];
      if (sourceInfo.kind === 'audio') {
        // add the inputs to inputSources
        //p5sound.inputSources.push(sourceInfo);
        return sourceInfo;
      }
    }
  };

  /**
   *  Set amplitude (volume) of a mic input between 0 and 1.0. <br/>
   *
   *  @method  amp
   *  @param  {Number} vol between 0 and 1.0
   *  @param {Number} [time] ramp time (optional)
   */
  p5.AudioIn.prototype.amp = function(vol, t){
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

  p5.AudioIn.prototype.listSources = function() {
    console.log('listSources is deprecated - please use AudioIn.getSources')
    console.log('input sources: ');
    if (p5sound.inputSources.length > 0) {
      return p5sound.inputSources;
    } else {
      return 'This browser does not support MediaStreamTrack.getSources()';
    }
  };
  /**
   * Chrome only. Returns a list of available input sources 
   * and allows the user to set the media source. Firefox allows 
   * the user to choose from input sources in the permissions dialogue
   * instead of enumerating available sources and selecting one.
   * Note: in order to have descriptive media names your page must be 
   * served over a secure (HTTPS) connection and the page should 
   * request user media before enumerating devices. Otherwise device 
   * ID will be a long device ID number and does not specify device 
   * type. For example see 
   * https://simpl.info/getusermedia/sources/index.html vs.
   * http://simpl.info/getusermedia/sources/index.html
   *
   * @method  getSources
   * @param  {Function} callback a callback to handle the sources 
   *                               when they have been enumerated
   * @example
   *  <div><code>
   *  var audiograb;
   *      
   *  function setup(){
   *    //new audioIn
   *    audioGrab = new p5.AudioIn();
   *    
   *    audioGrab.getSources(function(sourceList) {
   *      //print out the array of available sources
   *      console.log(sourceList);
   *      //set the source to the first item in the inputSources array
   *      audioGrab.setSource(0);
   *    });
   *  }
   *  </code></div>
   */
  p5.AudioIn.prototype.getSources = function (callback) {
    if(typeof window.MediaStreamTrack.getSources === 'function') {
      window.MediaStreamTrack.getSources(function (data) {
        for (var i = 0, max = data.length; i < max; i++) {
          var sourceInfo = data[i];
          if (sourceInfo.kind === 'audio') {
          // add the inputs to inputSources
          p5sound.inputSources.push(sourceInfo);
          }
        }
        callback(p5sound.inputSources);
      });
    } else {
      console.log('This browser does not support MediaStreamTrack.getSources()');
    }
  };
  /**
   *  Set the input source. Accepts a number representing a
   *  position in the array returned by listSources().
   *  This is only available in browsers that support 
   *  MediaStreamTrack.getSources(). Instead, some browsers
   *  give users the option to set their own media source.<br/>
   *  
   *  @method setSource
   *  @param {number} num position of input source in the array
   */
  p5.AudioIn.prototype.setSource = function(num) {
    // TO DO - set input by string or # (array position)
    var self = this;
    if ((p5sound.inputSources.length > 0) && (num < p5sound.inputSources.length)) {
      // set the current source
      self.currentSource = num;
      console.log('set source to ' + p5sound.inputSources[self.currentSource].id);
    } else {
      console.log('unable to set input source');
    }
  };

  // private method
  p5.AudioIn.prototype.dispose = function(){
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
    this.amplitude = null;
    this.output = null;
  };

});