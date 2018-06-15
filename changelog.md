p5.sound v. 0.3.8
- many updates to documentation and examples
- protect against errors during duplicate dispose/disconnect calls to ensure dispose methods free up resources, and to enable testing in headless Chrome
- Deprecate p5.Env in favor of p5.Envelope
- p5.MonoSynth and p5.PolySynth updates and bug fixes

p5.sound v. 0.3.7
- fix audioIn getSources
- improvements to soundFile.rate
- documentation updates

p5.sound v. 0.3.6
- add MonoSynth, PolySynth and AudioVoice classes by @jvntf
- add playmode untilDone to p5.SoundFile https://github.com/processing/p5.js-sound/pull/223
- fix comment in p5.oscillator example https://github.com/processing/p5.js-sound/commit/7927e0f928816562c01ac8f4cedb34aeae30f838
- doc comment fixes (https://github.com/processing/p5.js-sound/pull/222) that go along with this https://github.com/processing/p5.js/pull/2279

p5.sound v. 0.3.5
* New FFT methods by @mkontogiannis
  * getOctaveBands
  * linAverages
  * logAverages

* SoundFile `onended` does not trigger on pause, fix by @aksperiod 

* Remove calls to `AudioContext.prototype.hasOwnProperty` in case [this](https://groups.google.com/a/chromium.org/forum/#!topic/blink-dev/QOR76GjwrkA) is an issue

p5.sound v. 0.3.1
- add p5.Distortion effect
- add p5.AudioIn error handler for ios and safari
- fix p5.SoundFile playbackRate in Chrome 53+
- fix DynamicsCompressor.ratio.value clamping warning
- fix for p5.Noise constructor ignores argument
- fix p5.SoundFile whileLoading callback
- fix for Oscillator dispose method & general improvements to oscillator memory management
- fix WAV format in soundRecorder saveSound()
- fix p5.AudioIn stop error due to mediastream api changes
- fix p5.Part timing
- fix p5.Part removePhrase
- fix a bug when passing a parameter to the disconnect method
- updates to documentation / inline examples for p5js.org

p5.sound v. 0.3.0
- ensure proper dispose methods for all p5.sound classes
- many improvements to p5.Env
- new methods for p5.Env:
  - ``setADSR``
  - ``setRange``
  - ``ramp``
  - ``setExp``
new methods for p5.FFT: ``getCentroid``


p5.sound v. 0.2.17
- fix soundfile memory leak
- update osc freq to factor in time
- add error callback to audioIn
- add error handler module
- add error handling for loadSound and createConvolver
- add onended(callback) to p5.SoundFile

p5.sound v. 0.2.16
- remove sketch fix for safari

p5.sound v 0.2.15
- preload fix for loadSound and createConvolver, v0.2.15
- fix for ios9

p5.sound v 0.2.14
- fix for new registerPreloadMethod in core library

p5.sound v. 0.2.13
- add p5.AudioIn getSources(callback) method
- p5.AudioIn listSources is deprecated.

p5.sound v. 0.2.12
- p5.Gain

p5.sound v. 0.2.11
- Safari patch

p5.sound v. 0.2.1

- p5.PeakDetect class (thx @b2renger !)
- p5.SoundFile drag and drop works with p5.File and HTML File API (thx @johnpasquarello !)
- p5.FFT enhancements
- ``.waveform()`` always scaled -1 to 1, can return p5 Array or Float32Array ^
- ``.spectrum()`` db mode
- p5.SoundFile.setCue()
- p5.Phrase, Part and Score tweaks for musical timing: callbacks accept time first, then parameter^
- various bug fixes
-  ^ breaking changes

p5.sound.js v0.1.9 2015-05-02
- new, more accurate approach to p5.SoundFile.currentTime
- fix bug in Chrome 43+
- fix soundfile loop bug in Chrome
- SoundFile.pause tweaks
- p5.Amplitude can return stereo values
- fix for phonegap/corvoda web view

p5.sound.js v0.1.8 2015-02-27
- p5.SoundFile.jump() does not impact the start/end time for future .play() or .loop()

p5.sound.js v0.1.7 2015-01-26
- p5.SoundFile.play() accepts timeFromNow as first parameter
- Improvements to p5.Part / scheduling. Sequencing callbacks send a time, which should be used to schedule with precision.

p5.sound.js v0.1.6 2014-12-26
- amplitude modulation for p5.Noise and p5.SoundFile
- updating to latest version of Tone (0.3.0)
- fixes for new Tone Signal math
- musical timing (p5.Metro) fix for Firefox
- revamp the p5.Panner: defaults to stereo, 3D version (and web audio panner) is not used
- p5.Noise inherits from p5.Oscillator prototype
- improvements to p5.Env

p5.sound.js v0.1.5 2014-12-05
- p5.Oscillator defauts to 0.5 amp
- using Tone.Signal for signal math, and Tone.Clock for Transport. 
- updates to Sequencing objects (p5.Part, p5.Phrase, p5.Score) including documentation for reference pages
- p5.Panner class
- various bug fixes


p5.sound.js v0.14 2014-08-18
- added changelog
- Recording: add p5.SoundRecorder class. SoundFile has a .saveSound() method to save as .wav
- Sequencer: p5.Part, p5.Phrase, p5.Score, setBPM() etc (in development)
- p5.Oscillator defauts to 0 amp (better for envelopes)
- osc.start(time, freq) instead of osc.start(freq, time)
- p5.Signal class introduced to manage .add, .mult and .scale of audio signals. p5.Oscillator and p5.Env get .add, .mult and .scale methods
- removing the .mod method for oscillator
- new way to modulate: pass the oscillator or envelope as the parameter, i.e. ```carrier.freq(mod)```, or ```carrier.freq(mod.scale(-1, 1, 400, 600))``` (converts to a p5.Signal)

p5.sound.js v0.122 2014-08-11
- adding p5.Delay, p5.Filter, p5.Reverb

p5.sound.js v0.121 2014-08-07
- FFT.getFreq --> getEnergy
- FFT.getEnergy accepts preset ranges for 'bass', 'lowMid', 'mid', 'treble'
- FFT returns Array instead of Uint8Array

p5.sound.js v0.120 2014-08-06
- Objects become p5.Objects

p5.sound.js v0.1 2014-08-04
- fft.analyze() returns Uint8Array (0 to 255) instead of a float32 Array
