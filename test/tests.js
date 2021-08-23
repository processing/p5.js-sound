let spec = [
    './tests/main.js',
    './tests/p5.Helpers.js',
    './tests/p5.PeakDetect.js',
    './tests/p5.OnsetDetect.js',
    './tests/p5.Distortion.js',
    './tests/p5.AudioContext.js',
    './tests/p5.Looper.js',
    './tests/p5.Metro.js',
    './tests/p5.Effect.js',
    './tests/p5.Filter.js',
    './tests/p5.Gain.js',
    './tests/p5.FFT.js',
    './tests/p5.SoundLoop.js',
    './tests/p5.Compressor.js',
    './tests/p5.EQ.js',
    './tests/p5.AudioIn.js',
    './tests/p5.AudioVoice.js',
    './tests/p5.MonoSynth.js',
    './tests/p5.PolySynth.js',
    './tests/p5.SoundRecorder.js', 
    './tests/p5.SoundFile.js',
    './tests/p5.Amplitude.js',
    './tests/p5.Oscillator.js',
    './tests/p5.Envelope.js',
    './tests/p5.Pulse.js',
    './tests/p5.Noise.js',
    './tests/p5.Panner.js',
    './tests/p5.Panner3d.js',
    './tests/p5.Delay.js',
    './tests/p5.Reverb.js',
    './tests/p5.Listener3d.js',
  ];
  
  spec.map((file) => {
    var string = [
      '<script src="./',
      file,
      '" type="text/javascript" ></script>',
    ];
    document.write(string.join(''));
  });