var expect = chai.expect;

describe('p5.SoundRecorder', function () {
  var recorder;
  var inputSoundFile;
  var writeFileSub;

  before(function (done) {
    this.timeout(10000);

    writeFileSub = sinon.stub(p5.prototype, 'writeFile');

    inputSoundFile = new p5.SoundFile();
    inputSoundFile.setBuffer([[1], [1]]);

    // request microphone access and throw an error if permission is denied
    var tempMic = new p5.AudioIn();
    tempMic.start(
      function () {
        tempMic.dispose();
        done();
      },
      function () {
        tempMic.dispose();
        done(new Error('Microphone access denied'));
      }
    );
  });

  after(function () {
    inputSoundFile.dispose();
    writeFileSub.restore();
  });

  beforeEach(function () {
    recorder = new p5.SoundRecorder();
    inputSoundFile.disconnect();
    inputSoundFile.stop();
    writeFileSub.reset();
  });

  afterEach(function () {
    recorder.dispose();
  });

  it('can record input from a microphone', function (done) {
    // this is the shortest possible recording duration
    var recordingDuration =
      recorder.bufferSize / p5.soundOut.audiocontext.sampleRate;

    // need to enable master volume to test recording from the microphone
    p5.prototype.masterVolume(1);

    var mic = new p5.AudioIn();
    mic.start(function () {
      var outputSoundFile = new p5.SoundFile();
      recorder.record(outputSoundFile, recordingDuration, function () {
        expect(outputSoundFile.duration()).to.eq(recordingDuration);

        var outputChannel = outputSoundFile.buffer.getChannelData(0);
        expect(outputChannel[0]).to.not.eq(0);

        outputSoundFile.dispose();
        mic.dispose();
        p5.prototype.masterVolume(0);
        done();
      });
    });
  });

  it('can record input from a sound file', function (done) {
    var sampleIndex = 0;
    // this is the shortest possible recording duration
    var recordingDuration =
      recorder.bufferSize / p5.soundOut.audiocontext.sampleRate;
    var inputChannel = inputSoundFile.buffer.getChannelData(0);
    // input SoundFile should contain all 1s
    expect(inputChannel[sampleIndex]).to.eq(1);

    var outputSoundFile = new p5.SoundFile();
    inputSoundFile.loop();
    recorder.setInput(inputSoundFile);
    recorder.record(outputSoundFile, recordingDuration, function () {
      expect(outputSoundFile.duration()).to.eq(recordingDuration);

      var outputChannel = outputSoundFile.buffer.getChannelData(0);
      expect(outputChannel[sampleIndex]).to.eq(inputChannel[sampleIndex]);

      outputSoundFile.dispose();
      done();
    });
  });

  it('can record the master output of a sketch', function (done) {
    // this is the shortest possible recording duration
    var recordingDuration =
      recorder.bufferSize / p5.soundOut.audiocontext.sampleRate;
    var inputChannel = inputSoundFile.buffer.getChannelData(0);
    // input SoundFile should contain all 1s
    expect(inputChannel[0]).to.eq(1);

    // need to enable master volume to test recording from master output
    p5.prototype.masterVolume(1);

    var outputSoundFile = new p5.SoundFile();
    inputSoundFile.connect();
    inputSoundFile.loop();
    recorder.setInput();
    recorder.record(outputSoundFile, recordingDuration, function () {
      expect(outputSoundFile.duration()).to.eq(recordingDuration);

      var outputChannel = outputSoundFile.buffer.getChannelData(0);
      expect(outputChannel[0]).to.not.eq(0);

      outputSoundFile.dispose();
      p5.prototype.masterVolume(0);
      done();
    });
  });

  it('can save a recorded buffer to a .wav file', function (done) {
    // this is the shortest possible recording duration
    var recordingDuration =
      recorder.bufferSize / p5.soundOut.audiocontext.sampleRate;

    var outputSoundFile = new p5.SoundFile();
    inputSoundFile.play();
    recorder.setInput(inputSoundFile);
    recorder.record(outputSoundFile, recordingDuration, function () {
      expect(outputSoundFile.duration()).to.eq(recordingDuration);

      p5.prototype.saveSound(outputSoundFile, 'test.wav');
      expect(writeFileSub.called).to.be.true;

      outputSoundFile.dispose();
      done();
    });
  });
});
