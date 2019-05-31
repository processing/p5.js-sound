require.config({
  baseUrl:'./',
  paths : {
    'lib' : '../lib',
    'chai' : './testDeps/chai',
    'sinon': './testDeps/sinon'
  }
});

var allTests = [
  'tests/p5.SoundFile',
  'tests/p5.Amplitude',
  'tests/p5.Oscillator',
  'tests/p5.Distortion',
  'tests/p5.Effect',
  'tests/p5.Filter',
  'tests/p5.FFT',
  'tests/p5.Compressor',
  'tests/p5.EQ',
  'tests/p5.AudioIn',
  'tests/p5.AudioVoice',
  'tests/p5.MonoSynth',
  'tests/p5.PolySynth',
  'tests/p5.SoundRecorder'
];

p5.prototype.masterVolume(0);

require(allTests, function(){
  mocha.run();
});
