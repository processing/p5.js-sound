TO DO list
========

This is a list of things that we hope to accomplish with p5.sound. If you want to work on one of these, or discuss an idea, feel free to make a github issue. Got something to add to the list? We'd love to hear it!

- Eliminate the click that occurs if an envelope re-triggers an oscillator before it finishes the envelope.

- Make a 'p5.Panner' class, rather than writing unique panner code for each class. In the process, can we optimize the panner? Provide methods for 3D panning? [Original github issue](https://github.com/therewasaguy/p5.sound/issues/4)

- Figure out a way to keep track of connections between objects. From there, .disconnect() can accept a specific object rather than disconnecting all output.

- How best to apply an effect like p5.Reverb to all sound in the sketch? Perhaps p5.soundOut gets a wet/dry effects bus.

- Improve timing of looper.js. Try using an oscillator to control the tempo, rather than relying
on javascript setTimeouts, which slow down when the window is out of focus.

- Make sure all methods that should be modular can accept a Number, AudioParam, p5.Env, p5.Oscillator or p5.Signal as input.

- Log a message to the console if a user calls FFT methods like getEnergy without first calling .analyze() in either the draw loop, or in the method in which they call getEnergy. Maybe log the time that .analyze was last called, and compare it to the current time, and if it is a big gap, then log the message?

- SoundFile.playMode('untilDone') would play a sound if not already playing, but if it is already playing, it would not play again until it is done. Feel free to re-open this [Github Issue](https://github.com/therewasaguy/p5.sound/issues/5) if you want to work on this.

- Improve p5.Pulse

- Dynamic Noramlization --> - Peak Detect https://github.com/therewasaguy/p5.sound/issues/12

- Beat Detect? 

- Pitch detect?

- Write more tests!

- Create more effects!
