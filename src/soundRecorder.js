define(function (require) {
  'use strict';

  // inspiration: recorder.js, Tone.js & typedarray.org

  require('sndcore');
  var p5sound = require('master');
  var ac = p5sound.audiocontext;

  /**
   *  <p>Record sounds for playback and/or to save as a .wav file.
   *  The p5.SoundRecorder records all sound output from your sketch,
   *  or can be assigned a specific source with setInput().</p>
   *  <p>The record() method accepts a p5.SoundFile as a parameter.
   *  When playback is stopped (either after the given amount of time,
   *  or with the stop() method), the p5.SoundRecorder will send its
   *  recording to that p5.SoundFile for playback.</p>
   *  
   *  @class p5.SoundRecorder
   *  @constructor
   */
  p5.SoundRecorder = function() {
    this.input = ac.createGain();
    this.output = ac.createGain();

    this.recording = false;

    this.bufferSize = 1024;
    this._channels = 2; // stereo (default)

    this._clear(); // initialize variables

    this._jsNode = ac.createScriptProcessor(this.bufferSize, this._channels, 2);
    this._jsNode.onaudioprocess = this._audioprocess.bind(this);

    /** 
     *  callback invoked when the recording is over
     *  @private
     *  @type {function(Float32Array)}
     */
    this._callback = function(){};

    // connections
    this._jsNode.connect(p5.soundOut._silentNode);
    this.setInput();
  };

  /**
   *  Connect a specific device to the p5.SoundRecorder.
   *  If no parameter is given, p5.SoundRecorer will record
   *  all audible p5.sound from your sketch.
   *  
   *  @method  setInput
   *  @param {Object} [unit] p5.sound object or a web audio unit
   *                         that outputs sound
   */
  p5.SoundRecorder.prototype.setInput = function(unit) {
    this.input.disconnect();
    this.input = null;
    this.input = ac.createGain();
    this.input.connect(this._jsNode);
    this.input.connect(this.output);
    if (unit) {
      unit.connect(this.input);
    } else {
      p5.soundOut.output.connect(this.input);
    }
  };

  /**
   *  Start recording. To access the recording, provide
   *  a p5.SoundFile as the first parameter. The p5.SoundRecorder
   *  will send its recording to that p5.SoundFile for playback once
   *  recording is complete. Optional parameters include duration
   *  (in seconds) of the recording, and a callback function that
   *  will be called once the complete recording has been
   *  transfered to the p5.SoundFile.
   *  
   *  @method  record
   *  @param  {p5.SoundFile}   soundFile    p5.SoundFile
   *  @param  {Number}   [duration] Time (in seconds)
   *  @param  {Function} [callback] The name of a function that will be
   *                                called once the recording completes
   */
  p5.SoundRecorder.prototype.record = function(sFile, duration, callback) {
    this.recording = true;
    if (duration) {
      this.sampleLimit = Math.round(duration * ac.sampleRate);
    }

    if (sFile && callback) {
      this._callback = function() {
        this.buffer = this._getBuffer();
        console.log(this.buffer);
        sFile.setBuffer(this.buffer);
        callback();
      };
    }
    else if (sFile) {
      this._callback = function() {
        this.buffer = this._getBuffer();
        console.log(this.buffer);
        sFile.setBuffer(this.buffer);
      };
    }
  };

  /**
   *  Stop the recording. Once the recording is stopped,
   *  the results will be sent to the p5.SoundFile that
   *  was given on .record(), and if a callback function
   *  was provided on record, that function will be called.
   *  
   *  @method  stop
   */
  p5.SoundRecorder.prototype.stop = function() {
    this.recording = false;
    this._callback();
    this._clear();
  };

  p5.SoundRecorder.prototype._clear = function() {
    this._leftBuffers = [];
    this._rightBuffers = [];
    this.recordedSamples = 0;
    this.sampleLimit = null;
  };

  /**
   *  internal method called on audio process
   *  
   *  @private
   *  @param   {AudioProcessorEvent} event 
   */
  p5.SoundRecorder.prototype._audioprocess = function(event){
    if (this.recording === false){
      return;
    } else if (this.recording === true){

      // if we are past the duration, then stop... else:
      if (this.sampleLimit && this.recordedSamples >= this.sampleLimit) {
        this.stop();
      } else {
      // get channel data
      var left = event.inputBuffer.getChannelData(0);
      var right = event.inputBuffer.getChannelData(1);

      // clone the samples
      this._leftBuffers.push(new Float32Array(left));
      this._rightBuffers.push(new Float32Array(right));

      this.recordedSamples += this.bufferSize;
      }
    }
  };

  p5.SoundRecorder.prototype._getBuffer = function() {
    var buffers = [];
    buffers.push( this._mergeBuffers(this._leftBuffers) );
    buffers.push( this._mergeBuffers(this._rightBuffers) );
    return buffers;
  };

  p5.SoundRecorder.prototype._mergeBuffers = function(channelBuffer){
    var result = new Float32Array(this.recordedSamples);
    var offset = 0;
    var lng = channelBuffer.length;
    for (var i = 0; i < lng; i++){
      var buffer = channelBuffer[i];
      result.set(buffer, offset);
      offset += buffer.length;
    }
    return result;
  };

  /**
   *  Save a p5.SoundFile as a .wav audio file.
   *  
   *  @method saveSound
   *  @param  {p5.SoundFile} soundFile p5.SoundFile that you wish to save
   *  @param  {String} name      name of the resulting .wav file.
   */
  p5.prototype.saveSound = function(soundFile, name) {
    var leftChannel = soundFile.buffer.getChannelData(0);
    var rightChannel = soundFile.buffer.getChannelData(1);
    var interleaved = interleave(leftChannel,rightChannel);

    // create the buffer and view to create the .WAV file
    var buffer = new ArrayBuffer(44 + interleaved.length * 2);
    var view = new DataView(buffer);
     
    // write the WAV container,
    // check spec at: https://ccrma.stanford.edu/courses/422/projects/WaveFormat/
    // RIFF chunk descriptor
    writeUTFBytes(view, 0, 'RIFF');
    view.setUint32(4, 44 + interleaved.length * 2, true);
    writeUTFBytes(view, 8, 'WAVE');
    // FMT sub-chunk
    writeUTFBytes(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    // stereo (2 channels)
    view.setUint16(22, 2, true);
    view.setUint32(24, 44100, true);
    view.setUint32(28, 44100 * 4, true);
    view.setUint16(32, 4, true);
    view.setUint16(34, 16, true);
    // data sub-chunk
    writeUTFBytes(view, 36, 'data');
    view.setUint32(40, interleaved.length * 2, true);
     
    // write the PCM samples
    var lng = interleaved.length;
    var index = 44;
    var volume = 1;
    for (var i = 0; i < lng; i++){
        view.setInt16(index, interleaved[i] * (0x7FFF * volume), true);
        index += 2;
    }
    
    p5.prototype.writeFile( [ view ], name, 'wav');
  };


  // helper methods to save waves
  function interleave(leftChannel, rightChannel){
    var length = leftChannel.length + rightChannel.length;
    var result = new Float32Array(length);
   
    var inputIndex = 0;
   
    for (var index = 0; index < length; ){
      result[index++] = leftChannel[inputIndex];
      result[index++] = rightChannel[inputIndex];
      inputIndex++;
    }
    return result;
  }

  function writeUTFBytes(view, offset, string){ 
    var lng = string.length;
    for (var i = 0; i < lng; i++){
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }

});