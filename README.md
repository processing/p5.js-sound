p5.sound
========

p5.sound brings the [Processing](http://processing.org) approach to [Web Audio](http://w3.org/TR/webaudio/) as an addon for [p5.js](github.com/lmccart/p5.js). p5.sound is here to help you get creative with digital audio in JavaScript.

Classes include: 
- p5.SoundFile: Load and play sound files.
- p5.Amplitude: Get the current volume of a sound.
- p5.AudioIn: Get sound from an input source, typically a computer microphone.
- p5.FFT: Analyze the frequency of sound. Returns results from the frequency spectrum or time domain.
- p5.Oscillator: Generate Sine, Triangle, Square and Sawtooth waveforms for playback and/or parameter modulation. Base class of p5.Noise (white, pink, brown) and p5.Pulse. 
- p5.Env: An Envelope is a series of fades over time. Often used to control an object's output gain level as an "ADSR Envelope" (Attack, Decay, Sustain, Release). Can also modulate other parameters. 

More classes and functionality are in development. [This version](https://github.com/therewasaguy/p5.sound/blob/master/lib/p5.sound.js) of the library is updated daily. A [stable version](http://p5js.org/download/) comes with p5.js.

If you have contributions, feedback, bug reports, or ideas to share, I'd love to hear from you! Email (hello@jasonsigal.cc), or [join the discussion on github](https://github.com/therewasaguy/p5.sound/issues).
