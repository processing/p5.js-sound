
![](http://p5js.org/img/libraries/sound.jpg)

p5.sound
========
p5.sound brings the [Processing](http://processing.org) approach to [Web Audio](http://w3.org/TR/webaudio/) as an addon for [p5.js](github.com/lmccart/p5.js). Functionality includes audio input, playback, manipulation, effects, recording, sequencing, analysis and synthesis. The library is designed to be used in tandem with [p5.js](http://p5js.org).

 Examples
========
#### [>> p5js.org/learn](http://p5js.org/learn/)  ***<-- interactive examples!***

#### [>> examples on github](https://github.com/therewasaguy/p5.sound/tree/master/examples)


Docs
============
#### [>> interactive documentation](http://p5js.org/reference/#/libraries/p5.sound)

Here is an overview of what p5.sound offers:
- **p5.SoundFile** [[source](https://github.com/therewasaguy/p5.sound/blob/master/src/soundfile.js) /  [docs](http://p5js.org/reference/#/p5.SoundFile)]:  Load and play sound files, manipulate playback
- **p5.Amplitude** [[source](https://github.com/therewasaguy/p5.sound/blob/master/src/amplitude.js) /  [docs](http://p5js.org/reference/#/p5.Amplitude)]: Get the current volume of a sound.
- **p5.AudioIn** [[source](https://github.com/therewasaguy/p5.sound/blob/master/src/audioin.js) /  [docs](http://p5js.org/reference/#/p5.AudioIn)]: Get sound from an input source like a computer mic.
- **p5.FFT** [[source](https://github.com/therewasaguy/p5.sound/blob/master/src/fft.js)] [ [docs](http://p5js.org/reference/#/p5.FFT)]: Analyze the frequency of sound.
- **p5.Oscillator** [[source](https://github.com/therewasaguy/p5.sound/blob/master/src/oscillator.js) /  [docs](http://p5js.org/reference/#/p5.Oscillator)] / **p5.Pulse** [[source](https://github.com/therewasaguy/p5.sound/blob/master/src/pulse.js) / [docs](http://p5js.org/reference/#/p5.Pulse)]: Waveforms for playback & modulation.
- **p5.Noise** [[source](https://github.com/therewasaguy/p5.sound/blob/master/src/noise.js) / [docs](http://p5js.org/reference/#/p5.Noise): White, pink or brown noise generator
- **p5.Env** [[source](https://github.com/therewasaguy/p5.sound/blob/master/src/env.js) / [[docs](http://p5js.org/reference/#/p5.Env)]: Trigger an attack/release envelope, or modulate other parameters
- **p5.Reverb** [[source](https://github.com/therewasaguy/p5.sound/blob/master/src/reverb.js) / [docs](http://p5js.org/reference/#/p5.Reverb)]: Add reverb to a sound by specifying duration and decay. 
- **p5.Convolver** extends p5.Reverb. Simulate the sound of real physical spaces w/ convolution.
- **p5.Filter** [[source](https://github.com/therewasaguy/p5.sound/blob/master/src/filter.js) / [docs](http://p5js.org/reference/#/p5.Filter)]: Filter the frequency range of a sound.
- **p5.Delay** [[source](https://github.com/therewasaguy/p5.sound/blob/master/src/delay.js) / [docs](http://p5js.org/reference/#/p5.Delay)]: Stereo delay effect w/ feedback and a lowpass filter.
- **p5.SoundRecorder** [ [source](https://github.com/therewasaguy/p5.sound/blob/master/src/soundrecorder.js) ]: record sound for playback / save the .wav
- **p5.Phrase, p5.Part, p5.Score** [ [source](https://github.com/therewasaguy/p5.sound/blob/master/src/looper.js) ]: Sequence musical patterns (in development).


Latest Version
========
[This version](https://github.com/therewasaguy/p5.sound/blob/master/lib) of the library is updated daily. A [stable version](http://p5js.org/download/) comes with p5.js. Here's the [Change Log](https://github.com/therewasaguy/p5.sound/blob/master/changelog.md).

Contribute
========
If you have contributions, feedback, bug reports, or ideas to share, get involved! Email hello@jasonsigal.cc, or [join the discussion on github](https://github.com/therewasaguy/p5.sound/issues). There is plenty to do, check out the [to do list](https://github.com/therewasaguy/p5.sound/blob/master/todo.md).

Before contributing, you will need to install npm and download node modules. Edit the /src files, and then build the lib files by calling ```grunt``` from the command line. Check out the [p5.js setup instructions](https://github.com/lmccart/p5.js/wiki/Development) for more details.

Dependencies
=========
p5.sound imports Signal Math and Clock modules directly from [Tone.js](https://github.com/TONEnoTONE/Tone.js).

References and Inspiration
=========
- [Yotam Mann & TONE.js](https://github.com/TONEnoTONE/Tone.js)
- [Boris Smus Web Audio API book](http://www.apache.org/licenses/LICENSE-2.0)
- [wavesurfer.js](https://github.com/katspaugh/wavesurfer.js)
- [Web Audio Components](https://github.com/web-audio-components)
- [buzz.js](http://buzz.jaysalvat.com/)
- [Chris Wilson](https://github.com/cwilso/)
- [Chris Lowis](http://blog.chrislowis.co.uk/)
- [Kevin Ennis](https://github.com/kevincennis)
- [Wilm Thoben's Sound library for Processing](https://github.com/processing/processing/tree/master/java/libraries/sound)
- [Web Audio API](www.w3.org/TR/webaudio/)
