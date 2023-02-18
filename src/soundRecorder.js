// inspiration: recorder.js, Tone.js & typedarray.org

import p5sound from './main';
import { safeBufferSize } from './helpers';
import processorNames from './audioWorklet/processorNames';

const ac = p5sound.audiocontext;

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
 *  @example
 *  <div><code>
 *  let mic, recorder, soundFile;
 *  // keeps record if recording is started
 *  let isRecordingStarted = false;
 *  // keeps record if the recorded result is played
 *  let isResultPlayed = false;
 *
 *  function setup() {
 *    let cnv = createCanvas(100, 100);
 *    cnv.mousePressed(canvasPressed);
 *    background(220);
 *    textAlign(CENTER, CENTER);
 *
 *    // create an audio in
 *    mic = new p5.AudioIn();
 *
 *    // create a sound recorder
 *    recorder = new p5.SoundRecorder();
 *
 *    // connect the mic to the recorder
 *    recorder.setInput(mic);
 *
 *    // this sound file will be used to
 *    // playback & save the recording
 *    soundFile = new p5.SoundFile();
 *
 *    text('tap to record', width/2, height/2);
 *  }
 *
 *  function canvasPressed() {
 *    // ensure audio is enabled
 *    userStartAudio();
 *
 *    if (!isRecordingStarted && !isResultPlayed) {
 *    // make sure user enabled the mic by prompting to enable their browser mic
 *    // start recording after the mic is enabled
 *      mic.start(function() {
 *        // record to our p5.SoundFile
 *        recorder.record(soundFile);
 *
 *        background(255,0,0);
 *        text('Recording!', width/2, height/2);
 *        isRecordingStarted = true;
 *      });
 *    }
 *    else if (isRecordingStarted && !isResultPlayed) {
 *      background(0,255,0);
 *
 *      // stop recorder and
 *      // send result to soundFile
 *      recorder.stop();
 *      // stop browser from accessing the mic
 *      mic.dispose();
 *
 *      text('Done! Tap to play and download', width/2, height/2, width - 20);
 *      isResultPlayed = true;
 *    }
 *
 *    else if (isRecordingStarted && isResultPlayed) {
 *      soundFile.play(); // play the result!
 *      save(soundFile, 'mySound.wav');
 *    }
 *  }
 *  </div></code>
 */
class SoundRecorder {
  constructor() {
    this.input = ac.createGain();
    this.output = ac.createGain();

    this._inputChannels = 2;
    this._outputChannels = 2; // stereo output, even if input is mono

    const workletBufferSize = (this.bufferSize = safeBufferSize(1024));

    this._workletNode = new AudioWorkletNode(
      ac,
      processorNames.recorderProcessor,
      {
        outputChannelCount: [this._outputChannels],
        processorOptions: {
          numInputChannels: this._inputChannels,
          bufferSize: workletBufferSize,
        },
      }
    );

    this._workletNode.port.onmessage = function (event) {
      if (event.data.name === 'buffers') {
        const buffers = [
          new Float32Array(event.data.leftBuffer),
          new Float32Array(event.data.rightBuffer),
        ];
        this._callback(buffers);
      }
    }.bind(this);

    /**
     *  callback invoked when the recording is over
     *  @private
     *  @type Function(Float32Array)
     */
    this._callback = function () {};

    // connections
    this._workletNode.connect(p5.soundOut._silentNode);
    this.setInput();

    // add this p5.SoundFile to the soundArray
    p5sound.soundArray.push(this);
  }

  /**
   *  Connect a specific device to the p5.SoundRecorder.
   *  If no parameter is given, p5.SoundRecorer will record
   *  all audible p5.sound from your sketch.
   *
   *  @method  setInput
   *  @for p5.SoundRecorder
   *  @param {Object} [unit] p5.sound object or a web audio unit
   *                         that outputs sound
   */
  setInput(unit) {
    this.input.disconnect();
    this.input = null;
    this.input = ac.createGain();
    this.input.connect(this._workletNode);
    this.input.connect(this.output);
    if (unit) {
      unit.connect(this.input);
    } else {
      p5.soundOut.output.connect(this.input);
    }
  }

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
   *  @for p5.SoundRecorder
   *  @param  {p5.SoundFile}   soundFile    p5.SoundFile
   *  @param  {Number}   [duration] Time (in seconds)
   *  @param  {Function} [callback] The name of a function that will be
   *                                called once the recording completes
   */
  record(sFile, duration, callback) {
    this._workletNode.port.postMessage({ name: 'start', duration: duration });

    if (sFile && callback) {
      this._callback = function (buffer) {
        sFile.setBuffer(buffer);
        callback();
      };
    } else if (sFile) {
      this._callback = function (buffer) {
        sFile.setBuffer(buffer);
      };
    }
  }

  /**
   *  Stop the recording. Once the recording is stopped,
   *  the results will be sent to the p5.SoundFile that
   *  was given on .record(), and if a callback function
   *  was provided on record, that function will be called.
   *
   *  @method  stop
   *  @for p5.SoundRecorder
   */
  stop() {
    this._workletNode.port.postMessage({ name: 'stop' });
  }

  dispose() {
    // remove reference from soundArray
    var index = p5sound.soundArray.indexOf(this);
    p5sound.soundArray.splice(index, 1);

    this._callback = function () {};
    if (this.input) {
      this.input.disconnect();
    }
    this.input = null;
    this._workletNode = null;
  }
}

export default SoundRecorder;
