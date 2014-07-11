(function () {var sndcore = function (require) {
        'use strict';
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        var audiocontext = new window.AudioContext();
        p5.prototype.getAudioContext = function () {
            return audiocontext;
        };
        if (typeof audiocontext.createGain !== 'function') {
            window.audioContext.createGain = window.audioContext.createGainNode;
        }
        if (typeof audiocontext.createDelay !== 'function') {
            window.audioContext.createDelay = window.audioContext.createDelayNode;
        }
        if (typeof window.AudioBufferSourceNode.prototype.start !== 'function') {
            window.AudioBufferSourceNode.prototype.start = window.AudioBufferSourceNode.prototype.noteGrainOn;
        }
        if (typeof window.AudioBufferSourceNode.prototype.stop !== 'function') {
            window.AudioBufferSourceNode.prototype.stop = window.AudioBufferSourceNode.prototype.noteOff;
        }
        if (typeof window.OscillatorNode.prototype.start !== 'function') {
            window.OscillatorNode.prototype.start = window.OscillatorNode.prototype.noteOn;
        }
        if (typeof window.OscillatorNode.prototype.stop !== 'function') {
            window.OscillatorNode.prototype.stop = window.OscillatorNode.prototype.noteOff;
        }
        if (!window.AudioContext.prototype.hasOwnProperty('createScriptProcessor')) {
            window.AudioContext.prototype.createScriptProcessor = window.AudioContext.prototype.createJavaScriptNode;
        }
        navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
        var el = document.createElement('audio');
        p5.prototype.isSupported = function () {
            return !!el.canPlayType;
        };
        p5.prototype.isOGGSupported = function () {
            return !!el.canPlayType && el.canPlayType('audio/ogg; codecs="vorbis"');
        };
        p5.prototype.isMP3Supported = function () {
            return !!el.canPlayType && el.canPlayType('audio/mpeg;');
        };
        p5.prototype.isWAVSupported = function () {
            return !!el.canPlayType && el.canPlayType('audio/wav; codecs="1"');
        };
        p5.prototype.isAACSupported = function () {
            return !!el.canPlayType && (el.canPlayType('audio/x-m4a;') || el.canPlayType('audio/aac;'));
        };
        p5.prototype.isAIFSupported = function () {
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
            case 'aac', 'm4a', 'mp4':
                return isAACSupported();
            case 'aif', 'aiff':
                return isAIFSupported();
            default:
                return false;
            }
        };
    }({});
var master = function (require, sndcore) {
        'use strict';
        var Master = function () {
            var audiocontext = p5.prototype.getAudioContext();
            this.input = audiocontext.createGain();
            this.output = audiocontext.createGain();
            this.limiter = audiocontext.createDynamicsCompressor();
            this.limiter.threshold.value = 0;
            this.limiter.ratio.value = 100;
            this.audiocontext = audiocontext;
            this.output.disconnect(this.audiocontext.destination);
            this.inputSources = [];
            this.input.connect(this.limiter);
            this.limiter.connect(this.output);
            this.meter = audiocontext.createGain();
            this.output.connect(this.meter);
            this.output.connect(this.audiocontext.destination);
            this.soundArray = [];
        };
        var p5sound = new Master();
        return p5sound;
    }({}, sndcore);
var helpers = function (require, master) {
        'use strict';
        var p5sound = master;
        p5.prototype.masterVolume = function (vol) {
            p5sound.output.gain.value = vol;
        };
        p5.prototype.sampleRate = function () {
            return p5sound.audiocontext.sampleRate;
        };
        p5.prototype.getMasterVolume = function () {
            return p5sound.output.gain.value;
        };
        p5.prototype.freqToMidi = function (f) {
            var mathlog2 = Math.log(f / 440) / Math.log(2);
            var m = Math.round(12 * mathlog2) + 57;
            return m;
        };
        p5.prototype.midiToFreq = function (m) {
            return 440 * Math.pow(2, (m - 69) / 12);
        };
        p5.prototype._registerRemoveFunc('disposeSound');
        p5.prototype.disposeSound = function () {
            for (var i = 0; i < p5sound.soundArray.length; i++) {
                console.log(p5sound.soundArray[i]);
                p5sound.soundArray[i].dispose();
                console.log(p5sound.soundArray[i]);
            }
        };
    }({}, master);
var soundfile = function (require, sndcore, master) {
        'use strict';
        var p5sound = master;
        p5.prototype.SoundFile = function (paths, onload) {
            var path;
            if (typeof paths === 'string') {
                path = paths;
            } else if (typeof paths === 'object') {
                for (var i = 0; i < paths.length; i++) {
                    var extension = paths[i].split('.').pop();
                    var supported = p5.prototype.isFileSupported(extension);
                    if (supported) {
                        console.log('.' + extension + ' is ' + supported + ' supported by your browser.');
                        path = paths[i];
                        break;
                    }
                }
            }
            this.p5s = p5sound;
            this.url = path;
            this.sources = [];
            this.source = null;
            this.buffer = null;
            this.playbackRate = 1;
            this.gain = 1;
            this.input = this.p5s.audiocontext.createGain();
            this.output = this.p5s.audiocontext.createGain();
            this.reversed = false;
            this.startTime = 0;
            this.endTime = null;
            this.playing = false;
            this.paused = null;
            this.mode = 'sustain';
            this.startMillis = null;
            this.panPosition = 0;
            this.panner = this.p5s.audiocontext.createPanner();
            this.panner.panningModel = 'equalpower';
            this.panner.distanceModel = 'linear';
            this.panner.setPosition(0, 0, 0);
            this.output.connect(this.panner);
            this.panner.connect(this.p5s.input);
            this.load(onload);
            this.p5s.soundArray.push(this);
        };
        p5.prototype.SoundFile.prototype.load = function (callback) {
            if (!this.buffer) {
                var request = new XMLHttpRequest();
                request.open('GET', this.url, true);
                request.responseType = 'arraybuffer';
                var self = this;
                request.onload = function () {
                    var ac = p5.prototype.getAudioContext();
                    ac.decodeAudioData(request.response, function (buff) {
                        self.buffer = buff;
                        if (callback) {
                            callback(self);
                        }
                    });
                };
                request.send();
            } else {
                if (callback) {
                    callback(this);
                }
            }
        };
        p5.prototype.SoundFile.prototype.isLoaded = function () {
            if (this.buffer) {
                return true;
            } else {
                return false;
            }
        };
        p5.prototype.SoundFile.prototype.play = function (rate, amp, startTime, endTime) {
            if (this.buffer) {
                if (this.mode === 'restart' && this.buffer && this.source) {
                    this.source.stop();
                }
                if (startTime) {
                    if (startTime >= 0 && startTime < this.buffer.duration) {
                        this.startTime = startTime;
                    } else {
                        throw 'start time out of range';
                    }
                }
                if (endTime) {
                    if (endTime >= 0 && endTime <= this.buffer.duration) {
                        this.endTime = endTime;
                    } else {
                        throw 'end time out of range';
                    }
                } else {
                    this.endTime = this.buffer.duration;
                }
                this.source = this.p5s.audiocontext.createBufferSource();
                this.source.buffer = this.buffer;
                this.source.loop = this.looping;
                if (this.source.loop === true) {
                    this.source.loopStart = this.startTime;
                    this.source.loopEnd = this.endTime;
                }
                this.source.onended = function () {
                    if (this.playing) {
                        this.playing = !this.playing;
                        this.stop();
                    }
                };
                if (!this.source.gain) {
                    this.source.gain = this.p5s.audiocontext.createGain();
                    this.source.connect(this.source.gain);
                    this.source.gain.gain.value = amp || 1;
                    this.source.gain.connect(this.output);
                } else {
                    this.source.gain.value = amp || 1;
                    this.source.connect(this.output);
                }
                this.source.playbackRate.value = rate || Math.abs(this.playbackRate);
                if (this.paused) {
                    this.source.start(0, this.pauseTime, this.endTime);
                    this.unpaused = true;
                } else {
                    this.unpaused = false;
                    this.source.start(0, this.startTime, this.endTime);
                }
                this.startSeconds = this.p5s.audiocontext.currentTime;
                this.playing = true;
                this.paused = false;
                this.sources.push(this.source);
            } else {
                throw 'not ready to play file, buffer has yet to load. Try preload()';
            }
        };
        p5.prototype.SoundFile.prototype.playMode = function (str) {
            var s = str.toLowerCase();
            if (s === 'restart' && this.buffer && this.source) {
                for (var i = 0; i < this.sources.length - 1; i++) {
                    this.sources[i].stop();
                }
            }
            if (s === 'restart' || s === 'sustain') {
                this.mode = s;
            } else {
                throw 'Invalid play mode. Must be either "restart" or "sustain"';
            }
        };
        p5.prototype.SoundFile.prototype.pause = function () {
            var keepLoop = this.looping;
            if (this.isPlaying() && this.buffer && this.source) {
                this.pauseTime = this.currentTime();
                this.source.stop();
                this.paused = true;
            } else {
                var origStart = this.startTime;
                this.startTime = this.pauseTime;
                this.play();
                this.looping = keepLoop;
                this.startTime = origStart;
            }
        };
        p5.prototype.SoundFile.prototype.loop = function (rate, amp, loopStart, loopEnd) {
            this.looping = true;
            this.play(rate, amp, loopStart, loopEnd);
        };
        p5.prototype.SoundFile.prototype.setLoop = function (bool) {
            if (bool === true) {
                this.looping = true;
            } else if (bool === false) {
                this.looping = false;
            } else {
                throw 'Error: setLoop accepts either true or false';
            }
            if (this.source) {
                this.source.loop = this.looping;
            }
        };
        p5.prototype.SoundFile.prototype.isLooping = function () {
            if (!this.source) {
                return false;
            }
            if (this.looping === true && this.isPlaying() === true) {
                return true;
            }
            return false;
        };
        p5.prototype.SoundFile.prototype.isPlaying = function () {
            if (this.source) {
                if (this.source.playbackState === 2) {
                    this.playing = true;
                }
                if (this.source.playbackState === 3) {
                    this.playing = false;
                }
            }
            return this.playing;
        };
        p5.prototype.SoundFile.prototype.isPaused = function () {
            if (!this.paused) {
                return false;
            }
            return this.paused;
        };
        p5.prototype.SoundFile.prototype.stop = function () {
            if (this.buffer && this.source) {
                this.source.stop();
                this.pauseTime = 0;
                this.playing = false;
            }
        };
        p5.prototype.SoundFile.prototype.stopAll = function () {
            if (this.buffer && this.source) {
                for (var i = 0; i < this.sources.length - 1; i++) {
                    if (this.sources[i] !== null) {
                        this.sources[i].stop();
                    }
                }
                this.playing = false;
            }
        };
        p5.prototype.SoundFile.prototype.rate = function (playbackRate) {
            if (this.playbackRate === playbackRate) {
                return;
            }
            this.playbackRate = playbackRate;
            if (playbackRate === 0 && this.playing) {
                this.pause();
            }
            if (playbackRate < 0 && !this.reversed) {
                this.reverseBuffer();
            } else if (playbackRate > 0 && this.reversed) {
                this.reverseBuffer();
            }
            if (this.isPlaying() === true) {
                this.pause();
                this.play();
            }
        };
        p5.prototype.SoundFile.prototype.getPlaybackRate = function () {
            return this.playbackRate;
        };
        p5.prototype.SoundFile.prototype.channels = function () {
            return this.buffer.numberOfChannels;
        };
        p5.prototype.SoundFile.prototype.sampleRate = function () {
            return this.buffer.sampleRate;
        };
        p5.prototype.SoundFile.prototype.frames = function () {
            return this.buffer.length;
        };
        p5.prototype.SoundFile.prototype.duration = function () {
            if (this.buffer) {
                return this.buffer.duration;
            } else {
                return 0;
            }
        };
        p5.prototype.SoundFile.prototype.currentTime = function () {
            var howLong;
            if (this.isPlaying() && !this.unpaused) {
                howLong = (this.p5s.audiocontext.currentTime - this.startSeconds + this.startTime) * this.source.playbackRate.value % this.duration();
                return howLong;
            } else if (this.isPlaying() && this.unpaused) {
                howLong = (this.pauseTime + (this.p5s.audiocontext.currentTime - this.startSeconds) * this.source.playbackRate.value) % this.duration();
                return howLong;
            } else if (this.paused) {
                return this.pauseTime;
            } else {
                return this.startTime;
            }
        };
        p5.prototype.SoundFile.prototype.jump = function (cueTime, endTime) {
            if (cueTime < 0 || cueTime > this.buffer.duration) {
                throw 'jump time out of range';
            }
            if (endTime < cueTime || endTime > this.buffer.duration) {
                throw 'end time out of range';
            }
            this.startTime = cueTime || 0;
            if (endTime) {
                this.endTime = endTime;
            } else {
                this.endTime = this.buffer.duration;
            }
            if (this.isPlaying()) {
                this.stop();
                this.play(cueTime, this.endTime);
            }
        };
        p5.prototype.SoundFile.prototype.getPeaks = function (length) {
            if (this.buffer) {
                if (!length) {
                    length = window.width * 5;
                }
                if (this.buffer) {
                    var buffer = this.buffer;
                    var sampleSize = buffer.length / length;
                    var sampleStep = ~~(sampleSize / 10) || 1;
                    var channels = buffer.numberOfChannels;
                    var peaks = new Float32Array(length);
                    for (var c = 0; c < channels; c++) {
                        var chan = buffer.getChannelData(c);
                        for (var i = 0; i < length; i++) {
                            var start = ~~(i * sampleSize);
                            var end = ~~(start + sampleSize);
                            var max = 0;
                            for (var j = start; j < end; j += sampleStep) {
                                var value = chan[j];
                                if (value > max) {
                                    max = value;
                                } else if (-value > max) {
                                    max = value;
                                }
                            }
                            if (c === 0 || max > peaks[i]) {
                                peaks[i] = max;
                            }
                        }
                    }
                    return peaks;
                }
            } else {
                throw 'Cannot load peaks yet, buffer is not loaded';
            }
        };
        p5.prototype.SoundFile.prototype.reverseBuffer = function () {
            if (this.buffer) {
                Array.prototype.reverse.call(this.buffer.getChannelData(0));
                Array.prototype.reverse.call(this.buffer.getChannelData(1));
                this.reversed = !this.reversed;
            } else {
                throw 'SoundFile is not done loading';
            }
        };
        p5.prototype.SoundFile.prototype._onEnded = function (s) {
            s.onended = function (s) {
                console.log(s);
                s.stop();
            };
        };
        p5.prototype.SoundFile.prototype.setVolume = function (vol, t) {
            if (t) {
                var rampTime = t || 0;
                var currentVol = this.output.gain.value;
                this.output.gain.cancelScheduledValues(this.p5s.audiocontext.currentTime);
                this.output.gain.setValueAtTime(currentVol, this.p5s.audiocontext.currentTime);
                this.output.gain.linearRampToValueAtTime(vol, rampTime + this.p5s.audiocontext.currentTime);
            } else {
                this.output.gain.cancelScheduledValues(this.p5s.audiocontext.currentTime);
                this.output.gain.setValueAtTime(vol, this.p5s.audiocontext.currentTime);
            }
        };
        p5.prototype.SoundFile.prototype.add = function () {
        };
        p5.prototype.SoundFile.prototype.dispose = function () {
            if (this.buffer && this.source) {
                for (var i = 0; i < this.sources.length - 1; i++) {
                    if (this.sources[i] !== null) {
                        this.sources[i].stop();
                        this.sources[i] = null;
                    }
                }
            }
            if (this.output !== null) {
                this.output.disconnect();
                this.output = null;
            }
            if (this.panner !== null) {
                this.panner.disconnect();
                this.panner = null;
            }
        };
        p5.prototype.SoundFile.prototype.pan = function (pval) {
            this.panPosition = pval;
            pval = pval * 90;
            var xDeg = parseInt(pval);
            var zDeg = xDeg + 90;
            if (zDeg > 90) {
                zDeg = 180 - zDeg;
            }
            var x = Math.sin(xDeg * (Math.PI / 180));
            var z = Math.sin(zDeg * (Math.PI / 180));
            this.panner.setPosition(x, 0, z);
        };
        p5.prototype.SoundFile.prototype.getPan = function () {
            return this.panPosition;
        };
        p5.prototype.SoundFile.prototype.connect = function (unit) {
            if (!unit) {
                this.panner.connect(this.p5s.input);
            } else if (this.buffer && this.source) {
                if (unit.hasOwnProperty('input')) {
                    this.panner.connect(unit.input);
                } else {
                    this.panner.connect(unit);
                }
            }
        };
        p5.prototype.SoundFile.prototype.disconnect = function (unit) {
            this.panner.disconnect(unit);
        };
        p5.prototype._registerPreloadFunc('loadSound');
        p5.prototype.loadSound = function (path, callback) {
            var s = new p5.prototype.SoundFile(path, callback);
            return s;
        };
    }({}, sndcore, master);
var amplitude = function (require, master) {
        'use strict';
        var p5sound = master;
        p5.prototype.Amplitude = function (smoothing) {
            this.p5s = p5sound;
            this.bufferSize = 2048;
            this.audiocontext = this.p5s.audiocontext;
            this.processor = this.audiocontext.createScriptProcessor(this.bufferSize);
            this.input = this.processor;
            this.output = this.audiocontext.createGain();
            this.smoothing = smoothing || 0;
            this.volume = 0;
            this.average = 0;
            this.volMax = 0.001;
            this.normalize = false;
            this.processor.onaudioprocess = this.volumeAudioProcess.bind(this);
            this.processor.connect(this.output);
            this.output.gain.value = 0;
            this.output.connect(this.audiocontext.destination);
            this.p5s.meter.connect(this.processor);
        };
        p5.prototype.Amplitude.prototype.setInput = function (source, smoothing) {
            this.p5s.meter.disconnect(this.processor);
            if (smoothing) {
                this.smoothing = smoothing;
            }
            if (source == null) {
                console.log('Amplitude input source is not ready! Connecting to master output instead');
                this.p5s.meter.connect(this.processor);
            } else if (source) {
                source.connect(this.processor);
                this.processor.disconnect();
                this.processor.connect(this.output);
                console.log('source connected');
            } else {
                this.p5s.meter.connect(this.processor);
            }
        };
        p5.prototype.Amplitude.prototype.connect = function (unit) {
            if (unit) {
                if (unit.hasOwnProperty('input')) {
                    this.output.connect(unit.input);
                } else {
                    this.output.connect(unit);
                }
            } else {
                this.output.connect(this.panner.connect(this.p5s.input));
            }
        };
        p5.prototype.Amplitude.prototype.volumeAudioProcess = function (event) {
            var inputBuffer = event.inputBuffer.getChannelData(0);
            var bufLength = inputBuffer.length;
            var total = 0;
            var sum = 0;
            var x;
            for (var i = 0; i < bufLength; i++) {
                x = inputBuffer[i];
                if (this.normalize) {
                    total += constrain(x / this.volMax, -1, 1);
                    sum += constrain(x / this.volMax, -1, 1) * constrain(x / this.volMax, -1, 1);
                } else {
                    total += x;
                    sum += x * x;
                }
            }
            var average = total / bufLength;
            var rms = Math.sqrt(sum / bufLength);
            this.volume = Math.max(rms, this.volume * this.smoothing);
            this.volMax = Math.max(this.volume, this.volMax);
            this.volNorm = constrain(this.volume / this.volMax, 0, 1);
        };
        p5.prototype.Amplitude.prototype.getLevel = function () {
            if (this.normalize) {
                return this.volNorm;
            } else {
                return this.volume;
            }
        };
        p5.prototype.Amplitude.prototype.toggleNormalize = function (bool) {
            if (typeof bool === 'boolean') {
                this.normalize = bool;
            } else {
                this.normalize = !this.normalize;
            }
        };
        p5.prototype.Amplitude.prototype.smooth = function (s) {
            if (s >= 0 && s < 1) {
                this.smoothing = s;
            } else {
                console.log('Error: smoothing must be between 0 and 1');
            }
        };
    }({}, master);
var fft = function (require, master) {
        'use strict';
        var p5sound = master;
        p5.prototype.FFT = function (smoothing, fft_size, minDecibels, maxDecibels) {
            var SMOOTHING = smoothing || 0.6;
            var FFT_SIZE = fft_size || 1024;
            this.p5s = p5sound;
            this.analyser = this.p5s.audiocontext.createAnalyser();
            this.p5s.output.connect(this.analyser);
            this.analyser.maxDecibels = maxDecibels || 0;
            this.analyser.minDecibels = minDecibels || -140;
            this.analyser.smoothingTimeConstant = SMOOTHING;
            this.analyser.fftSize = FFT_SIZE;
            this.freqDomain = new Uint8Array(this.analyser.frequencyBinCount);
            this.timeDomain = new Uint8Array(this.analyser.frequencyBinCount);
        };
        p5.prototype.FFT.prototype.setInput = function (source) {
            source.connect(this.analyser);
            this.analyser.disconnect();
        };
        p5.prototype.FFT.prototype.processFreq = function () {
            this.analyser.getByteFrequencyData(this.freqDomain);
            return this.freqDomain;
        };
        p5.prototype.FFT.prototype.waveform = function () {
            this.analyser.getByteTimeDomainData(this.timeDomain);
            return this.timeDomain;
        };
        p5.prototype.FFT.prototype.setSmoothing = function (s) {
            this.analyser.smoothingTimeConstant = s;
        };
        p5.prototype.FFT.prototype.getSmoothing = function () {
            return this.analyser.smoothingTimeConstant;
        };
        p5.prototype.FFT.prototype.getFreq = function (frequency1, frequency2) {
            var nyquist = this.p5s.audiocontext.sampleRate / 2;
            if (typeof frequency1 !== 'number') {
                return null;
            } else if (!frequency2) {
                var index = Math.round(frequency1 / nyquist * this.freqDomain.length);
                return this.freqDomain[index];
            } else if (frequency1 && frequency2) {
                if (frequency1 > frequency2) {
                    var swap = frequency2;
                    frequency2 = frequency1;
                    frequency1 = swap;
                }
                var lowIndex = Math.round(frequency1 / nyquist * this.freqDomain.length);
                var highIndex = Math.round(frequency2 / nyquist * this.freqDomain.length);
                var total = 0;
                var numFrequencies = 0;
                for (var i = lowIndex; i <= highIndex; i++) {
                    total += this.freqDomain[i];
                    numFrequencies += 1;
                }
                var toReturn = total / numFrequencies;
                return toReturn;
            } else {
                throw 'invalid input for getFreq()';
            }
        };
    }({}, master);
var oscillator = function (require, master) {
        'use strict';
        var p5sound = master;
        p5.prototype.Oscillator = function (freq, type) {
            this.started = false;
            this.p5s = p5sound;
            this.oscillator = this.p5s.audiocontext.createOscillator();
            this.f = freq || 440;
            this.oscillator.frequency.value = this.f;
            this.oscillator.type = type || 'sine';
            var o = this.oscillator;
            this.input = this.p5s.audiocontext.createGain();
            this.output = this.p5s.audiocontext.createGain();
            this.ampNode = this.output.gain;
            this.freqNode = this.oscillator.frequency;
            this.output.gain.value = 0.5;
            this.panPosition = 0;
            this.panner = this.p5s.audiocontext.createPanner();
            this.panner.panningModel = 'equalpower';
            this.panner.distanceModel = 'linear';
            this.panner.setPosition(0, 0, 0);
            this.oscillator.connect(this.output);
            this.output.connect(this.panner);
            this.panner.connect(this.p5s.input);
            this.p5s.soundArray.push(this);
        };
        p5.prototype.Oscillator.prototype.start = function (f, time) {
            if (this.started) {
                this.stop();
            }
            if (!this.started) {
                var freq = f || this.f;
                var type = this.oscillator.type;
                this.oscillator = this.p5s.audiocontext.createOscillator();
                this.oscillator.frequency.exponentialRampToValueAtTime(Math.abs(freq), this.p5s.audiocontext.currentTime);
                this.oscillator.type = type;
                this.oscillator.connect(this.output);
                this.started = true;
                time = time || this.p5s.audiocontext.currentTime;
                this.oscillator.start(time);
                this.freqNode = this.oscillator.frequency;
                if (this.mods !== undefined && this.mods.frequency !== undefined) {
                    this.mods.frequency.connect(this.freqNode);
                }
            }
        };
        p5.prototype.Oscillator.prototype.stop = function (time) {
            if (this.started) {
                var t = time || this.p5s.audiocontext.currentTime;
                this.oscillator.stop(t);
                this.started = false;
            }
        };
        p5.prototype.Oscillator.prototype.amp = function (vol, t) {
            if (t) {
                var rampTime = t || 0;
                var currentVol = this.output.gain.value;
                this.output.gain.cancelScheduledValues(this.p5s.audiocontext.currentTime);
                this.output.gain.setValueAtTime(currentVol, this.p5s.audiocontext.currentTime);
                this.output.gain.linearRampToValueAtTime(vol, rampTime + this.p5s.audiocontext.currentTime);
            } else {
                this.output.gain.cancelScheduledValues(this.p5s.audiocontext.currentTime);
                this.output.gain.setValueAtTime(vol, this.p5s.audiocontext.currentTime);
            }
        };
        p5.prototype.Oscillator.prototype.getAmp = function () {
            return this.output.gain.value;
        };
        p5.prototype.Oscillator.prototype.freq = function (val, t) {
            this.f = val;
            if (t) {
                var rampTime = t || 0;
                var currentFreq = this.oscillator.frequency.value;
                this.oscillator.frequency.cancelScheduledValues(this.p5s.audiocontext.currentTime);
                this.oscillator.frequency.setValueAtTime(currentFreq, this.p5s.audiocontext.currentTime);
                this.oscillator.frequency.exponentialRampToValueAtTime(val, rampTime + this.p5s.audiocontext.currentTime);
            } else {
                this.oscillator.frequency.cancelScheduledValues(this.p5s.audiocontext.currentTime);
                this.oscillator.frequency.setValueAtTime(val, this.p5s.audiocontext.currentTime);
            }
        };
        p5.prototype.Oscillator.prototype.getFreq = function () {
            return this.oscillator.frequency.value;
        };
        p5.prototype.Oscillator.prototype.setType = function (type) {
            this.oscillator.type = type;
        };
        p5.prototype.Oscillator.prototype.getType = function () {
            return this.oscillator.type;
        };
        p5.prototype.Oscillator.prototype.connect = function (unit) {
            if (!unit) {
                this.panner.connect(this.p5s.input);
            } else if (unit.hasOwnProperty('input')) {
                this.panner.connect(unit.input);
            } else {
                this.panner.connect(unit);
            }
        };
        p5.prototype.Oscillator.prototype.disconnect = function (unit) {
            this.panner.disconnect(unit);
        };
        p5.prototype.Oscillator.prototype.pan = function (pval) {
            if (!pval) {
                pval = 0;
            }
            this.panPosition = pval;
            pval = pval * 90;
            var xDeg = parseInt(pval);
            var zDeg = xDeg + 90;
            if (zDeg > 90) {
                zDeg = 180 - zDeg;
            }
            var x = Math.sin(xDeg * (Math.PI / 180));
            var z = Math.sin(zDeg * (Math.PI / 180));
            this.panner.setPosition(x, 0, z);
        };
        p5.prototype.Oscillator.prototype.getPan = function () {
            return this.panPosition;
        };
        p5.prototype.Oscillator.prototype.dispose = function () {
            if (this.oscillator) {
                this.stop();
                this.disconnect();
                this.oscillator.disconnect();
                this.panner = null;
                this.oscillator = null;
            }
            if (this.osc2) {
                this.osc2.dispose();
            }
        };
        p5.prototype.Oscillator.prototype.mod = function (unit) {
            unit.cancelScheduledValues(this.p5s.audiocontext.currentTime);
            this.output.connect(unit);
        };
        p5.prototype.SinOsc = function (freq) {
            p5.prototype.Oscillator.call(this, freq, 'sine');
        };
        p5.prototype.SinOsc.prototype = Object.create(p5.prototype.Oscillator.prototype);
        p5.prototype.TriOsc = function (freq) {
            p5.prototype.Oscillator.call(this, freq, 'triangle');
        };
        p5.prototype.TriOsc.prototype = Object.create(p5.prototype.Oscillator.prototype);
        p5.prototype.SawOsc = function (freq) {
            p5.prototype.Oscillator.call(this, freq, 'sawtooth');
        };
        p5.prototype.SawOsc.prototype = Object.create(p5.prototype.Oscillator.prototype);
        p5.prototype.SqrOsc = function (freq) {
            p5.prototype.Oscillator.call(this, freq, 'square');
        };
        p5.prototype.SqrOsc.prototype = Object.create(p5.prototype.Oscillator.prototype);
    }({}, master);
var pulse = function (require, master, oscillator) {
        'use strict';
        var p5sound = master;
        p5.prototype.Pulse = function (freq, w) {
            p5.prototype.Oscillator.call(this, freq, 'sawtooth');
            this.w = w || 0;
            this.osc2 = new SawOsc(freq);
            this.dNode = this.p5s.audiocontext.createDelay();
            this.dNode.delayTime.value = map(this.w, 0, 1, 0, 1 / this.oscillator.frequency.value);
            this.osc2.disconnect();
            this.osc2.panner.connect(this.dNode);
            this.dNode.connect(this.output);
        };
        p5.prototype.Pulse.prototype = Object.create(p5.prototype.Oscillator.prototype);
        p5.prototype.Pulse.prototype.width = function (w) {
            if (w <= 1 && w >= 0) {
                this.w = w;
                this.dNode.delayTime.value = map(this.w, 0, 1, 0, 1 / this.oscillator.frequency.value);
            }
        };
        p5.prototype.Pulse.prototype.start = function (f, time) {
            if (this.started) {
                this.stop();
            }
            if (!this.started) {
                var freq = f || this.f;
                var type = this.oscillator.type;
                this.oscillator = this.p5s.audiocontext.createOscillator();
                this.oscillator.frequency.exponentialRampToValueAtTime(freq, this.p5s.audiocontext.currentTime);
                this.oscillator.type = type;
                this.oscillator.connect(this.output);
                this.started = true;
                time = time + this.p5s.audiocontext.currentTime || this.p5s.audiocontext.currentTime;
                this.oscillator.start(time);
                this.osc2.oscillator = this.p5s.audiocontext.createOscillator();
                this.osc2.oscillator.frequency.value = freq;
                this.osc2.oscillator.frequency.exponentialRampToValueAtTime(freq, this.p5s.audiocontext.currentTime);
                this.osc2.oscillator.type = type;
                this.osc2.start(time);
                this.freqNode = [
                    this.oscillator.frequency,
                    this.osc2.oscillator.frequency
                ];
                if (this.mods !== undefined && this.mods.frequency !== undefined) {
                    this.mods.frequency.connect(this.freqNode[0]);
                    this.mods.frequency.connect(this.freqNode[1]);
                }
            }
        };
        p5.prototype.Pulse.prototype.stop = function (_time) {
            if (this.started) {
                var time = _time + this.p5s.audiocontext.currentTime;
                var t = time || this.p5s.audiocontext.currentTime;
                this.oscillator.stop(t);
                this.osc2.stop(t);
                this.started = false;
            }
        };
        p5.prototype.Pulse.prototype.freq = function (val, t) {
            var rampTime = t || 0;
            this.oscillator.frequency.cancelScheduledValues(this.p5s.audiocontext.currentTime);
            this.osc2.oscillator.frequency.cancelScheduledValues(this.p5s.audiocontext.currentTime);
            this.oscillator.frequency.exponentialRampToValueAtTime(val, rampTime + this.p5s.audiocontext.currentTime);
            this.osc2.oscillator.frequency.exponentialRampToValueAtTime(val, rampTime + this.p5s.audiocontext.currentTime);
        };
    }({}, master, oscillator);
var lfo = function (require, master, oscillator) {
        'use strict';
        var p5sound = master;
        p5.prototype.LFO = function (freq, type) {
            this.started = false;
            this.p5s = p5sound;
            this.input = this.p5s.audiocontext.createGain();
            this.output = this.p5s.audiocontext.createGain();
            if (!this.oscillator) {
                this.oscillator = this.p5s.audiocontext.createOscillator();
                this.oscillator.frequency.value = freq || 1;
                this.f = this.oscillator.frequency.value;
                this.oscillator.type = type || 'sine';
            }
            this.output.gain.value = 1;
            this.oscillator.connect(this.output);
        };
        p5.prototype.LFO.prototype = Object.create(p5.prototype.Oscillator.prototype);
        p5.prototype.LFO.prototype.freqMod = function (unit) {
            unit.oscillator.frequency.cancelScheduledValues(this.p5s.audiocontext.currentTime);
            this.output.connect(unit.oscillator.frequency);
            if (unit.oscillator.osc2) {
                this.output.connect(unit.osc2.oscillator.frequency);
            }
            if (!unit.mods) {
                unit.mods = {};
            }
            unit.mods.frequency = this.output;
            if (this.connections === undefined) {
                this.connections = [];
            }
            this.connections.push(unit.mods.frequency);
        };
        p5.prototype.LFO.prototype.ampMod = function (unit) {
            unit.output.gain.cancelScheduledValues(this.p5s.audiocontext.currentTime);
            this.output.connect(unit.output.gain);
        };
        p5.prototype.LFO.prototype.disconnect = function (unit) {
            this.output.disconnect(unit);
            for (var i = 0; i < this.connections.length; i++) {
                this.connections[i] = null;
            }
        };
        p5.prototype.LFO.prototype.freq = function (val, t) {
            this.f = val;
            var rampTime = t || 0;
            this.oscillator.frequency.cancelScheduledValues(this.p5s.audiocontext.currentTime);
            this.oscillator.frequency.exponentialRampToValueAtTime(val, rampTime + this.p5s.audiocontext.currentTime);
        };
    }({}, master, oscillator);
var noise = function (require, master) {
        'use strict';
        var p5sound = master;
        p5.prototype.Noise = function (type) {
            this.started = false;
            this.buffer = _whiteNoise;
            this.output = p5sound.audiocontext.createGain();
            this.output.gain.value = 0.5;
            this.panPosition = 0;
            this.panner = p5sound.audiocontext.createPanner();
            this.panner.panningModel = 'equalpower';
            this.panner.distanceModel = 'linear';
            this.panner.setPosition(0, 0, 0);
            this.output.connect(this.panner);
            p5sound.soundArray.push(this);
        };
        var _whiteNoise = function () {
                var bufferSize = 2 * p5sound.audiocontext.sampleRate;
                var whiteBuffer = p5sound.audiocontext.createBuffer(1, bufferSize, p5sound.audiocontext.sampleRate);
                var noiseData = whiteBuffer.getChannelData(0);
                for (var i = 0; i < bufferSize; i++) {
                    noiseData[i] = Math.random() * 2 - 1;
                }
                return whiteBuffer;
            }();
        var _pinkNoise = function () {
                var bufferSize = 2 * p5sound.audiocontext.sampleRate;
                var pinkBuffer = p5sound.audiocontext.createBuffer(1, bufferSize, p5sound.audiocontext.sampleRate);
                var noiseData = pinkBuffer.getChannelData(0);
                var b0, b1, b2, b3, b4, b5, b6;
                b0 = b1 = b2 = b3 = b4 = b5 = b6 = 0;
                for (var i = 0; i < bufferSize; i++) {
                    var white = Math.random() * 2 - 1;
                    b0 = 0.99886 * b0 + white * 0.0555179;
                    b1 = 0.99332 * b1 + white * 0.0750759;
                    b2 = 0.969 * b2 + white * 0.153852;
                    b3 = 0.8665 * b3 + white * 0.3104856;
                    b4 = 0.55 * b4 + white * 0.5329522;
                    b5 = -0.7616 * b5 - white * 0.016898;
                    noiseData[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
                    noiseData[i] *= 0.11;
                    b6 = white * 0.115926;
                }
                return pinkBuffer;
            }();
        var _brownNoise = function () {
                var bufferSize = 2 * p5sound.audiocontext.sampleRate;
                var brownBuffer = p5sound.audiocontext.createBuffer(1, bufferSize, p5sound.audiocontext.sampleRate);
                var noiseData = brownBuffer.getChannelData(0);
                var lastOut = 0;
                for (var i = 0; i < bufferSize; i++) {
                    var white = Math.random() * 2 - 1;
                    noiseData[i] = (lastOut + 0.02 * white) / 1.02;
                    lastOut = noiseData[i];
                    noiseData[i] *= 3.5;
                }
                return brownBuffer;
            }();
        p5.prototype.Noise.prototype.connect = function (unit) {
            if (!unit) {
                this.panner.connect(p5sound.input);
            } else if (unit.hasOwnProperty('input')) {
                this.panner.connect(unit.input);
            } else {
                this.panner.connect(unit);
            }
        };
        p5.prototype.Noise.prototype.disconnect = function (unit) {
            this.output.disconnect();
            this.panner.disconnect();
            this.output.connect(this.panner);
        };
        p5.prototype.Noise.prototype.ampMod = function (unit) {
            unit.output.gain.cancelScheduledValues(p5sound.audiocontext.currentTime);
            this.output.connect(unit.output.gain);
        };
        p5.prototype.Noise.prototype.start = function () {
            if (this.started) {
                this.stop();
            }
            this.noise = p5sound.audiocontext.createBufferSource();
            this.noise.buffer = this.buffer;
            this.noise.loop = true;
            this.noise.connect(this.output);
            console.log(this.output);
            this.noise.start();
            this.started = true;
        };
        p5.prototype.Noise.prototype.setType = function (type) {
            switch (type) {
            case 'white':
                this.buffer = _whiteNoise;
                break;
            case 'pink':
                this.buffer = _pinkNoise;
                break;
            case 'brown':
                this.buffer = _brownNoise;
                break;
            default:
                this.buffer = _whiteNoise;
            }
            if (this.started) {
                this.stop();
                this.start();
            }
        };
        p5.prototype.Noise.prototype.stop = function () {
            this.noise.stop();
            this.started = false;
        };
        p5.prototype.Noise.prototype.pan = function (pval) {
            this.panPosition = pval;
            pval = pval * 90;
            var xDeg = parseInt(pval);
            var zDeg = xDeg + 90;
            if (zDeg > 90) {
                zDeg = 180 - zDeg;
            }
            var x = Math.sin(xDeg * (Math.PI / 180));
            var z = Math.sin(zDeg * (Math.PI / 180));
            this.panner.setPosition(x, 0, z);
        };
        p5.prototype.Noise.prototype.amp = function (vol, t) {
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
        p5.prototype.Noise.prototype.dispose = function () {
            this.stop();
            this.output.disconnect();
            this.panner.disconnect();
            this.output = null;
            this.panner = null;
            this.buffer = null;
            this.noise.disconnect();
            this.noise = null;
        };
    }({}, master);
var audioin = function (require, master) {
        'use strict';
        var p5sound = master;
        p5.prototype.AudioIn = function () {
            this.p5s = p5sound;
            this.input = this.p5s.audiocontext.createGain();
            this.output = this.p5s.audiocontext.createGain();
            this.stream = null;
            this.mediaStream = null;
            this.currentSource = 0;
            this.amplitude = new Amplitude();
            this.output.connect(this.amplitude.input);
            if (typeof window.MediaStreamTrack === 'undefined') {
                window.alert('This browser does not support MediaStreamTrack');
            } else if (typeof window.MediaStreamTrack.getSources !== 'undefined') {
                window.MediaStreamTrack.getSources(this._gotSources);
            } else {
            }
            this.p5s.soundArray.push(this);
        };
        p5.prototype.AudioIn.prototype.connect = function (unit) {
            if (unit) {
                if (unit.hasOwnProperty('input')) {
                    this.output.connect(unit.input);
                } else {
                    this.output.connect(unit);
                }
            } else {
                this.output.connect(this.p5s.input);
            }
        };
        p5.prototype.AudioIn.prototype.listSources = function () {
            console.log('input sources: ');
            console.log(p5sound.inputSources);
            if (p5sound.inputSources.length > 0) {
                return p5sound.inputSources;
            } else {
                return 'This browser does not support MediaStreamTrack.getSources()';
            }
        };
        p5.prototype.AudioIn.prototype.setSource = function (num) {
            var self = this;
            if (p5sound.inputSources.length > 0 && num < p5sound.inputSources.length) {
                self.currentSource = num;
                console.log('set source to ' + p5sound.inputSources[self.currentSource].id);
            } else {
                console.log('unable to set input source');
            }
        };
        p5.prototype.AudioIn.prototype.disconnect = function (unit) {
            this.output.disconnect(unit);
            this.output.connect(this.amplitude.input);
        };
        p5.prototype.AudioIn.prototype.getLevel = function (smoothing) {
            if (smoothing) {
                this.amplitude.smoothing = smoothing;
            }
            return this.amplitude.getLevel();
        };
        p5.prototype.AudioIn.prototype.on = function () {
            var self = this;
            if (p5sound.inputSources[self.currentSource]) {
                var audioSource = p5sound.inputSources[self.currentSource].id;
                var constraints = { audio: { optional: [{ sourceId: audioSource }] } };
                navigator.getUserMedia(constraints, this._onStream = function (stream) {
                    self.stream = stream;
                    self.mediaStream = self.p5s.audiocontext.createMediaStreamSource(stream);
                    self.mediaStream.connect(self.output);
                    self.amplitude.setInput(self.output);
                }, this._onStreamError = function (stream) {
                    console.error(e);
                });
            } else {
                window.navigator.getUserMedia({ 'audio': true }, this._onStream = function (stream) {
                    self.stream = stream;
                    self.mediaStream = self.p5s.audiocontext.createMediaStreamSource(stream);
                    self.mediaStream.connect(self.output);
                    self.amplitude.setInput(self.output);
                }, this._onStreamError = function (stream) {
                    console.error(e);
                });
            }
        };
        p5.prototype.AudioIn.prototype.off = function () {
            if (this.stream) {
                this.stream.stop();
            }
        };
        p5.prototype.AudioIn.prototype._gotSources = function (sourceInfos) {
            for (var i = 0; i !== sourceInfos.length; i++) {
                var sourceInfo = sourceInfos[i];
                if (sourceInfo.kind === 'audio') {
                    p5sound.inputSources.push(sourceInfo);
                }
            }
        };
        p5.prototype.AudioIn.prototype.amp = function (vol, t) {
            if (t) {
                var rampTime = t || 0;
                var currentVol = this.output.gain.value;
                this.output.gain.cancelScheduledValues(this.p5s.audiocontext.currentTime);
                this.output.gain.setValueAtTime(currentVol, this.p5s.audiocontext.currentTime);
                this.output.gain.linearRampToValueAtTime(vol, rampTime + this.p5s.audiocontext.currentTime);
            } else {
                this.output.gain.cancelScheduledValues(this.p5s.audiocontext.currentTime);
                this.output.gain.setValueAtTime(vol, this.p5s.audiocontext.currentTime);
            }
        };
        p5.prototype.AudioIn.prototype.dispose = function () {
            this.off();
            this.output.disconnect();
            this.amplitude.disconnect();
            this.amplitude = null;
            this.output = null;
        };
    }({}, master);
var env = function (require, master) {
        'use strict';
        var p5sound = master;
        p5.prototype.Env = function (attackTime, attackLevel, decayTime, sustainLevel, sustainTime, releaseTime, releaseLevel) {
            this.attackTime = attackTime;
            this.attackLevel = attackLevel;
            this.decayTime = decayTime || 0;
            this.sustainTime = sustainTime || 0;
            this.sustainLevel = sustainLevel || 0;
            this.releaseTime = releaseTime || 0;
            this.releaseLevel = releaseLevel || 0;
        };
        p5.prototype.Env.prototype.play = function (input) {
            if (input.output !== undefined) {
                input = input.output.gain;
            }
            var now = p5sound.audiocontext.currentTime;
            input.cancelScheduledValues(now);
            input.setValueAtTime(0, now);
            input.linearRampToValueAtTime(this.attackLevel, now + this.attackTime);
            input.linearRampToValueAtTime(this.sustainLevel, now + this.attackTime + this.decayTime);
            input.setValueAtTime(this.sustainLevel, now + this.attackTime + this.decayTime + this.sustainTime);
            input.linearRampToValueAtTime(this.releaseLevel, now + this.attackTime + this.decayTime + this.sustainTime + this.releaseTime);
        };
        p5.prototype.Env.prototype.stop = function (input) {
            if (input.output !== undefined) {
                input = input.output.gain;
            }
            input.cancelScheduledValues(p5sound.audiocontext.currentTime);
            input.setValueAtTime(0, p5sound.audiocontext.currentTime);
        };
    }({}, master);
var src_app = function (require, sndcore, master, helpers, soundfile, amplitude, fft, oscillator, pulse, lfo, noise, audioin, env) {
        'use strict';
        var p5SOUND = sndcore;
        return p5SOUND;
    }({}, sndcore, master, helpers, soundfile, amplitude, fft, oscillator, pulse, lfo, noise, audioin, env);
}());