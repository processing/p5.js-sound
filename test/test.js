
  import  './tests/p5.Master.js'
  import  './tests/p5.SoundFile.js'
  import  './tests/p5.Amplitude.js'
  import  './tests/p5.Oscillator.js'
  import  './tests/p5.Distortion.js'
  import  './tests/p5.Effect.js'
  import  './tests/p5.Filter.js'
  import  './tests/p5.FFT.js'
  import  './tests/p5.Compressor.js'
  import  './tests/p5.EQ.js'
  import  './tests/p5.AudioIn.js'
  import  './tests/p5.AudioVoice.js'
  import  './tests/p5.MonoSynth.js'
  import  './tests/p5.PolySynth.js'
  import  './tests/p5.SoundRecorder.js'


p5.prototype.masterVolume(0);

var test_has_run = false;


  document.getElementById('mocha').innerHTML = 'click to begin tests';

  // chromes autoplay policy requires a user interaction
  // before the audiocontext can activate
  function mousePressed() {
    if (!test_has_run) {
      document.getElementById('mocha').innerHTML = '';
      p5.prototype.userStartAudio();
      mocha.run();
      test_has_run = true;
    }
  }

  document.addEventListener('click', mousePressed, false);
