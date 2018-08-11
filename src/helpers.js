'use strict';
define(function (require) {
  var p5sound = require('master');
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
  p5.prototype.sampleRate = function() {
    return p5sound.audiocontext.sampleRate;
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
  p5.prototype.freqToMidi = function(f) {
    var mathlog2 = Math.log(f/440) / Math.log(2);
    var m = Math.round(12*mathlog2)+69;
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
   *  var notes = [60, 64, 67, 72];
   *  var i = 0;
   *
   *  function setup() {
   *    osc = new p5.Oscillator('Triangle');
   *    osc.start();
   *    frameRate(1);
   *  }
   *
   *  function draw() {
   *    var freq = midiToFreq(notes[i]);
   *    osc.freq(freq);
   *    i++;
   *    if (i >= notes.length){
   *      i = 0;
   *    }
   *  }
   *  </code></div>
   */
  var midiToFreq = p5.prototype.midiToFreq = function(m) {
    return 440 * Math.pow(2, (m-69)/12.0);
  };

  // This method converts ANSI notes specified as a string "C4", "Eb3" to a frequency
  var noteToFreq = function(note) {
    if (typeof note !== 'string') {
      return note;
    }
    var wholeNotes = {A:21, B:23, C:24, D:26, E:28, F:29, G:31};
    var value = wholeNotes[ note[0].toUpperCase() ];
    var octave = ~~note.slice(-1);
    value += 12 * (octave -1);

    switch(note[1]) {
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
  }

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
   *    mySound.play();
   *  }
   *  </code></div>
   */
  p5.prototype.soundFormats = function() {
    // reset extensions array
    p5sound.extensions = [];
    // add extensions
    for (var i = 0; i < arguments.length; i++) {
      arguments[i] = arguments[i].toLowerCase();
      if (['mp3','wav','ogg', 'm4a', 'aac'].indexOf(arguments[i]) > -1) {
        p5sound.extensions.push(arguments[i]);
      } else {
        throw arguments[i] + ' is not a valid sound format!';
      }
    }
  };

  p5.prototype.disposeSound = function() {
    for (var i = 0; i < p5sound.soundArray.length; i++) {
      p5sound.soundArray[i].dispose();
    }
  };

  // register removeSound to dispose of p5sound SoundFiles, Convolvers,
  // Oscillators etc when sketch ends
  p5.prototype.registerMethod('remove', p5.prototype.disposeSound);

  p5.prototype._checkFileFormats = function(paths) {
    var path;
    // if path is a single string, check to see if extension is provided
    if (typeof paths === 'string') {
      path = paths;
      // see if extension is provided
      var extTest = path.split('.').pop();
      // if an extension is provided...
      if (['mp3','wav','ogg', 'm4a', 'aac'].indexOf(extTest) > -1) {
        if (p5.prototype.isFileSupported(extTest)) {
          path = path;
        }
        else {
          var pathSplit = path.split('.');
          var pathCore = pathSplit[pathSplit.length - 1];
          for (var i = 0; i<p5sound.extensions.length; i++) {
            var extension = p5sound.extensions[i];
            var supported = p5.prototype.isFileSupported(extension);
            if (supported) {
              pathCore = '';
              if (pathSplit.length === 2) {
                pathCore += pathSplit[0];
              }
              for (var i = 1; i <= pathSplit.length - 2; i++) {
                var p = pathSplit[i];
                pathCore += '.' + p;
              }
              path = pathCore += '.';
              path = path += extension;
              break;
            }
          }
        }
      }
      // if no extension is provided...
      else {
        for (var i = 0; i<p5sound.extensions.length; i++) {
          var extension = p5sound.extensions[i];
          var supported = p5.prototype.isFileSupported(extension);
          if (supported) {
            path = path + '.' + extension;
            break;
          }
        }
      }
    } // end 'if string'

    // path can either be a single string, or an array
    else if (typeof paths === 'object') {
      for (var i = 0; i<paths.length; i++) {
        var extension = paths[i].split('.').pop();
        var supported = p5.prototype.isFileSupported(extension);
        if (supported) {
          // console.log('.'+extension + ' is ' + supported +
          //  ' supported by your browser.');
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
  p5.prototype._mathChain = function(o, math, thisChain, nextChain, type) {
    // if this type of math already exists in the chain, replace it
    for (var i in o.mathOps) {
      if (o.mathOps[i] instanceof type) {
        o.mathOps[i].dispose();
        thisChain = i;
        if (thisChain < o.mathOps.length - 1) {
          nextChain = o.mathOps[i+1];
        }
      }
    }
    o.mathOps[thisChain-1].disconnect();
    o.mathOps[thisChain-1].connect(math);
    math.connect(nextChain);
    o.mathOps[thisChain] = math;
    return o;
  };


  // helper methods to convert audio file as .wav format,
  // will use as saving .wav file and saving blob object
  // Thank you to Matt Diamond's RecorderJS (MIT License)
  // https://github.com/mattdiamond/Recorderjs
  function convertToWav(audioBuffer) {
    var leftChannel, rightChannel;
    leftChannel = audioBuffer.getChannelData(0);

    // handle mono files
    if (audioBuffer.numberOfChannels > 1) {
      rightChannel = audioBuffer.getChannelData(1);
    } else {
      rightChannel = leftChannel;
    }

    var interleaved = interleave(leftChannel, rightChannel);

    // create the buffer and view to create the .WAV file
    var buffer = new window.ArrayBuffer(44 + interleaved.length * 2);
    var view = new window.DataView(buffer);

    // write the WAV container,
    // check spec at: https://web.archive.org/web/20171215131933/http://tiny.systems/software/soundProgrammer/WavFormatDocs.pdf

    // RIFF chunk descriptor
    writeUTFBytes(view, 0, 'RIFF');
    view.setUint32(4, 36 + interleaved.length * 2, true);
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
    for (var i = 0; i < lng; i++) {
      view.setInt16(index, interleaved[i] * (0x7FFF * volume), true);
      index += 2;
    }

    return view;
  }

  // helper methods to save waves
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

  return {
    convertToWav: convertToWav,
    midiToFreq: midiToFreq,
    noteToFreq: noteToFreq
  };

});
