/**
 * This module has shims
 */

/* AudioContext Monkeypatch
     Copyright 2013 Chris Wilson
     Licensed under the Apache License, Version 2.0 (the "License");
     you may not use this file except in compliance with the License.
     You may obtain a copy of the License at
         http://www.apache.org/licenses/LICENSE-2.0
     Unless required by applicable law or agreed to in writing, software
     distributed under the License is distributed on an "AS IS" BASIS,
     WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     See the License for the specific language governing permissions and
     limitations under the License.
  */
(function () {
  function fixSetTarget(param) {
    if (!param)
      // if NYI, just return
      return;
    if (!param.setTargetAtTime)
      param.setTargetAtTime = param.setTargetValueAtTime;
  }

  if (
    window.hasOwnProperty('webkitAudioContext') &&
    !window.hasOwnProperty('AudioContext')
  ) {
    window.AudioContext = window.webkitAudioContext;

    if (typeof AudioContext.prototype.createGain !== 'function')
      AudioContext.prototype.createGain = AudioContext.prototype.createGainNode;
    if (typeof AudioContext.prototype.createDelay !== 'function')
      AudioContext.prototype.createDelay =
        AudioContext.prototype.createDelayNode;
    if (typeof AudioContext.prototype.createScriptProcessor !== 'function')
      AudioContext.prototype.createScriptProcessor =
        AudioContext.prototype.createJavaScriptNode;
    if (typeof AudioContext.prototype.createPeriodicWave !== 'function')
      AudioContext.prototype.createPeriodicWave =
        AudioContext.prototype.createWaveTable;

    AudioContext.prototype.internal_createGain =
      AudioContext.prototype.createGain;
    AudioContext.prototype.createGain = function () {
      var node = this.internal_createGain();
      fixSetTarget(node.gain);
      return node;
    };

    AudioContext.prototype.internal_createDelay =
      AudioContext.prototype.createDelay;
    AudioContext.prototype.createDelay = function (maxDelayTime) {
      var node = maxDelayTime
        ? this.internal_createDelay(maxDelayTime)
        : this.internal_createDelay();
      fixSetTarget(node.delayTime);
      return node;
    };

    AudioContext.prototype.internal_createBufferSource =
      AudioContext.prototype.createBufferSource;
    AudioContext.prototype.createBufferSource = function () {
      var node = this.internal_createBufferSource();
      if (!node.start) {
        node.start = function (when, offset, duration) {
          if (offset || duration) this.noteGrainOn(when || 0, offset, duration);
          else this.noteOn(when || 0);
        };
      } else {
        node.internal_start = node.start;
        node.start = function (when, offset, duration) {
          if (typeof duration !== 'undefined')
            node.internal_start(when || 0, offset, duration);
          else node.internal_start(when || 0, offset || 0);
        };
      }
      if (!node.stop) {
        node.stop = function (when) {
          this.noteOff(when || 0);
        };
      } else {
        node.internal_stop = node.stop;
        node.stop = function (when) {
          node.internal_stop(when || 0);
        };
      }
      fixSetTarget(node.playbackRate);
      return node;
    };

    AudioContext.prototype.internal_createDynamicsCompressor =
      AudioContext.prototype.createDynamicsCompressor;
    AudioContext.prototype.createDynamicsCompressor = function () {
      var node = this.internal_createDynamicsCompressor();
      fixSetTarget(node.threshold);
      fixSetTarget(node.knee);
      fixSetTarget(node.ratio);
      fixSetTarget(node.reduction);
      fixSetTarget(node.attack);
      fixSetTarget(node.release);
      return node;
    };

    AudioContext.prototype.internal_createBiquadFilter =
      AudioContext.prototype.createBiquadFilter;
    AudioContext.prototype.createBiquadFilter = function () {
      var node = this.internal_createBiquadFilter();
      fixSetTarget(node.frequency);
      fixSetTarget(node.detune);
      fixSetTarget(node.Q);
      fixSetTarget(node.gain);
      return node;
    };

    if (typeof AudioContext.prototype.createOscillator !== 'function') {
      AudioContext.prototype.internal_createOscillator =
        AudioContext.prototype.createOscillator;
      AudioContext.prototype.createOscillator = function () {
        var node = this.internal_createOscillator();
        if (!node.start) {
          node.start = function (when) {
            this.noteOn(when || 0);
          };
        } else {
          node.internal_start = node.start;
          node.start = function (when) {
            node.internal_start(when || 0);
          };
        }
        if (!node.stop) {
          node.stop = function (when) {
            this.noteOff(when || 0);
          };
        } else {
          node.internal_stop = node.stop;
          node.stop = function (when) {
            node.internal_stop(when || 0);
          };
        }
        if (!node.setPeriodicWave) node.setPeriodicWave = node.setWaveTable;
        fixSetTarget(node.frequency);
        fixSetTarget(node.detune);
        return node;
      };
    }
  }

  if (
    window.hasOwnProperty('webkitOfflineAudioContext') &&
    !window.hasOwnProperty('OfflineAudioContext')
  ) {
    window.OfflineAudioContext = window.webkitOfflineAudioContext;
  }
})(window);
// <-- end MonkeyPatch.

// Polyfill for AudioIn, also handled by p5.dom createCapture
navigator.getUserMedia =
  navigator.getUserMedia ||
  navigator.webkitGetUserMedia ||
  navigator.mozGetUserMedia ||
  navigator.msGetUserMedia;

/**
 * Determine which filetypes are supported (inspired by buzz.js)
 * The audio element (el) will only be used to test browser support for various audio formats
 */
var el = document.createElement('audio');

p5.prototype.isSupported = function () {
  return !!el.canPlayType;
};
var isOGGSupported = function () {
  return !!el.canPlayType && el.canPlayType('audio/ogg; codecs="vorbis"');
};
var isMP3Supported = function () {
  return !!el.canPlayType && el.canPlayType('audio/mpeg;');
};
var isWAVSupported = function () {
  return !!el.canPlayType && el.canPlayType('audio/wav; codecs="1"');
};
var isAACSupported = function () {
  return (
    !!el.canPlayType &&
    (el.canPlayType('audio/x-m4a;') || el.canPlayType('audio/aac;'))
  );
};
var isAIFSupported = function () {
  return !!el.canPlayType && el.canPlayType('audio/x-aiff;');
};
p5.prototype.isFileSupported = function (extension) {
  switch (extension.toLowerCase()) {
    case 'mp3':
      return isMP3Supported();
    case 'wav':
      return isWAVSupported();
    case 'ogg':
      return isOGGSupported();
    case 'aac':
    case 'm4a':
    case 'mp4':
      return isAACSupported();
    case 'aif':
    case 'aiff':
      return isAIFSupported();
    default:
      return false;
  }
};
