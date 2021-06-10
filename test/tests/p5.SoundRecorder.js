const expect = chai.expect;

describe('p5.SoundRecorder', function () {
  let recorder;
  let inputSoundFile;
  let writeFileSub;

  before(function (done) {
    this.timeout(10000);

    writeFileSub = sinon.stub(p5.prototype, 'writeFile');

    inputSoundFile = new p5.SoundFile();
    inputSoundFile.setBuffer([[1], [1]]);

    // request microphone access and throw an error if permission is denied
    const tempMic = new p5.AudioIn();
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
    const recordingDuration =
      recorder.bufferSize / p5.soundOut.audiocontext.sampleRate;

    // need to enable output volume to test recording from the microphone
    p5.prototype.outputVolume(1);

    const mic = new p5.AudioIn();
    mic.start(function () {
      recorder.setInput(mic);
      const outputSoundFile = new p5.SoundFile();
      setTimeout(() => {
        recorder.record(outputSoundFile, recordingDuration, function () {
          expect(outputSoundFile.duration()).to.eq(recordingDuration);

          const outputChannel = outputSoundFile.buffer.getChannelData(0);
          expect(outputChannel[0]).to.not.eq(0);

          outputSoundFile.dispose();
          mic.dispose();
          p5.prototype.outputVolume(0);
          done();
        });
      }, 100);
    });
  });

  it('can record input from a sound file', function (done) {
    const sampleIndex = 0;
    // this is the shortest possible recording duration
    const recordingDuration =
      recorder.bufferSize / p5.soundOut.audiocontext.sampleRate;
    const inputChannel = inputSoundFile.buffer.getChannelData(0);
    // input SoundFile should contain all 1s
    expect(inputChannel[sampleIndex]).to.eq(1);

    const outputSoundFile = new p5.SoundFile();
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

  it('can record the main output of a sketch', function (done) {
    // this is the shortest possible recording duration
    const recordingDuration =
      recorder.bufferSize / p5.soundOut.audiocontext.sampleRate;
    const inputChannel = inputSoundFile.buffer.getChannelData(0);
    // input SoundFile should contain all 1s
    expect(inputChannel[0]).to.eq(1);

    // need to enable output volume to test recording from main output
    p5.prototype.outputVolume(1);

    const outputSoundFile = new p5.SoundFile();
    inputSoundFile.connect();
    inputSoundFile.loop();
    recorder.setInput();
    setTimeout(() => {
      recorder.record(outputSoundFile, recordingDuration, function () {
        expect(outputSoundFile.duration()).to.eq(recordingDuration);

        const outputChannel = outputSoundFile.buffer.getChannelData(0);
        expect(outputChannel[0]).to.not.eq(0);

        outputSoundFile.dispose();
        p5.prototype.outputVolume(0);
        done();
      });
    }, 10);
  });

  it('can save a recorded buffer to a .wav file', function (done) {
    // this is the shortest possible recording duration
    const recordingDuration =
      recorder.bufferSize / p5.soundOut.audiocontext.sampleRate;

    const outputSoundFile = new p5.SoundFile();
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
