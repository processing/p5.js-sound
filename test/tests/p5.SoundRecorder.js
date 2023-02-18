const expect = chai.expect;

describe('p5.SoundRecorder', function () {
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
    inputSoundFile.disconnect();
    inputSoundFile.stop();
    writeFileSub.reset();
  });

  afterEach(function () {});

  it('can be created and disposed', function () {
    let recorder = new p5.SoundRecorder();
    expect(recorder.input).to.have.property('context');
    expect(recorder.input).to.have.property('gain');
    expect(recorder.output).to.have.property('context');
    expect(recorder.output).to.have.property('gain');
    expect(recorder._inputChannels).to.equal(2);
    expect(recorder._outputChannels).to.equal(2);
    expect(recorder._workletNode).to.have.property('context');
    expect(recorder._workletNode).to.have.property('parameters');

    expect(p5.soundOut.soundArray).to.include(recorder);

    recorder.dispose();
    expect(p5.soundOut.soundArray).to.not.include(recorder);
    expect(recorder.input).to.be.null;
    expect(recorder._workletNode).to.be.null;
  });

  it('can record input from a microphone', function (done) {
    let recorder = new p5.SoundRecorder();
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
        recorder.record(outputSoundFile, 5 * recordingDuration, function () {
          expect(outputSoundFile.duration()).to.be.approximately(
            5 * recordingDuration,
            0.01
          );

          const outputChannel = outputSoundFile.buffer.getChannelData(0);
          let isAllZero = true;

          for (let i = 0; i < outputChannel.length; i++) {
            if (outputChannel[i] !== 0) {
              isAllZero = false;
              break;
            }
          }

          expect(isAllZero).to.be.false;
          outputSoundFile.dispose();
          mic.dispose();
          p5.prototype.outputVolume(0);
          recorder.dispose();
          done();
        });
      }, 500);
    });
  });

  it('can record input from a sound file', function (done) {
    let recorder = new p5.SoundRecorder();
    const sampleIndex = 0;
    // this is the shortest possible recording duration
    const recordingDuration =
      recorder.bufferSize / p5.soundOut.audiocontext.sampleRate;
    const inputChannel = inputSoundFile.buffer.getChannelData(0);
    const inputChannelSampleValue = inputChannel[sampleIndex];
    // input SoundFile should contain all 1s
    expect(inputChannelSampleValue).to.eq(1);

    const outputSoundFile = new p5.SoundFile();
    inputSoundFile.loop();
    recorder.setInput(inputSoundFile);
    recorder.record(outputSoundFile, recordingDuration, function () {
      expect(outputSoundFile.duration()).to.eq(recordingDuration);

      var outputChannel = outputSoundFile.buffer.getChannelData(0);
      expect(outputChannel[sampleIndex]).to.eq(inputChannelSampleValue);

      outputSoundFile.dispose();
      recorder.dispose();
      done();
    });
  });

  it('can record the main output of a sketch', function (done) {
    let recorder = new p5.SoundRecorder();
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
        recorder.dispose();
        done();
      });
    }, 20);
  });

  it('can save a recorded buffer to a .wav file and be stopped', function (done) {
    let recorder = new p5.SoundRecorder();
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
      recorder.stop();
      recorder.dispose();
      done();
    });
  });
});
