- Make a 'p5.Panner' class, rather than writing unique panner code for each class. In the process, can we optimize the panner? Provide methods for 3D panning?

- Figure out a way to keep track of connections between objects. From there, .disconnect() can accept a specific object rather than disconnecting all output.

- How best to apply an effect like p5.Reverb to all sound in the sketch? Perhaps p5.soundOut gets a wet/dry effects bus.

- Improve timing of looper.js. Try using an oscillator to control the tempo, rather than relying
on javascript setTimeouts, which slow down when the window is out of focus.

- Make sure all methods that should be modular can accept a Number, AudioParam, p5.Env, p5.Oscillator or p5.Signal as input.

- Log a message to the console if a user calls FFT methods like getEnergy without first calling .analyze() in either the draw loop, or in the method in which they call getEnergy. Maybe log the time that .analyze was last called, and compare it to the current time, and if it is a big gap, then log the message?

- Improve p5.Pulse

- Peak Detect?

- Beat Detect?

- Pitch detect?

- Write more tests