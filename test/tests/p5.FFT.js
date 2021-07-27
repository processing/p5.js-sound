const expect = chai.expect;

describe('p5.FFT', function () {
  it('can be created and disposed', function () {
    let fft = new p5.FFT();

    expect(fft.input).to.have.property('context');
    expect(fft.input).to.have.property('frequencyBinCount');
    expect(fft.analyser).to.have.property('context');
    expect(fft.analyser).to.have.property('frequencyBinCount');
    expect(fft.bins).to.equal(1024);
    expect(fft.freqDomain).to.be.a('Uint8Array').to.have.length(1024);
    expect(fft.timeDomain).to.be.a('Uint8Array').to.have.length(1024);

    expect(fft.bass).to.deep.equal([20, 140]);
    expect(fft.lowMid).to.deep.equal([140, 400]);
    expect(fft.mid).to.deep.equal([400, 2600]);
    expect(fft.highMid).to.deep.equal([2600, 5200]);
    expect(fft.treble).to.deep.equal([5200, 14000]);

    expect(p5.soundOut.soundArray).to.include(fft);

    fft.dispose();
    expect(p5.soundOut.soundArray).to.not.include(fft);
    expect(fft).to.not.have.property('analyser');
  });

  it('can be created with smoothing and bins value', function () {
    let fft = new p5.FFT(0.4, 128);
    expect(fft.smoothing).to.equal(0.4);
    expect(fft.bins).to.equal(128);
  });
  it('can get and set smoothing and bins value', function () {
    let fft = new p5.FFT();
    expect(fft.analyser.smoothingTimeConstant).to.equal(0.8);
    expect(fft.analyser.fftSize).to.equal(2048);
    fft.smoothing = 0.23;
    fft.bins = 64;
    expect(fft.analyser.smoothingTimeConstant).to.equal(0.23);
    expect(fft.smoothing).to.equal(0.23);
    expect(fft.analyser.fftSize).to.equal(128);
    expect(fft.bins).to.equal(64);
  });
  it('can handle out of range smoothing and bins values', function () {
    let fft = new p5.FFT();
    //smoothing
    expect(() => fft.smooth(-1)).to.throw();
    expect(() => fft.smooth(1.1)).to.throw();
    fft.smoothing = 0.54;
    expect(() => fft.smooth('some bad param')).to.throw();
    expect(fft.smoothing).to.equal(0.54);

    //bins
    expect(() => (fft.bins = 8)).to.throw();
    expect(() => (fft.bins = 13)).to.throw();
    expect(() => (fft.bins = -1)).to.throw();
    fft.bins = 512;
    expect(() => (fft.bins = 'some bad param')).to.throw();
    expect(fft.bins).to.equal(512);
  });

  describe('methods', function () {
    it('can set input source of fft', function () {
      let osc = new p5.SinOsc();
      let fft = new p5.FFT();
      fft.setInput(); //to p5sound.fftMeter
      fft.setInput(osc); //to osc.output
      fft.setInput(osc.output);
    });

    it('can get the waveform', function () {
      let fft = new p5.FFT();
      let source = new p5.AudioIn();
      fft.setInput(source);
      //no mode
      let waveform = fft.waveform();
      expect(waveform).to.be.a('array').to.have.length(1024);
      expect(fft.timeDomain).to.be.a('Uint8Array').to.have.length(1024); //timeToInt
    });
    it('can get waveform with parameters', function () {
      let fft = new p5.FFT();
      let source = new p5.AudioIn();
      fft.setInput(source);

      let waveform = fft.waveform(256);
      expect(fft.bins).to.equal(256);
      expect(waveform).to.be.a('array').to.have.length(1024);
      expect(fft.timeDomain).to.be.a('Uint8Array').to.have.length(1024);

      waveform = fft.waveform(64, 'float32');
      expect(fft.bins).to.equal(64);
      expect(waveform).to.be.a('Float32Array').to.have.length(64);
      expect(fft.timeDomain).to.be.a('Float32Array').to.have.length(64); // timeToFloat

      // parameters position doesn't matter if there is a number and a string
      waveform = fft.waveform(undefined, 'float32', 128);
      expect(fft.bins).to.equal(128);
      expect(waveform).to.be.a('Float32Array').to.have.length(64);
      expect(fft.timeDomain).to.be.a('Float32Array').to.have.length(64);
    });

    it('can analyze a fft', function () {
      let fft = new p5.FFT();
      //no mode
      let spectrum = fft.analyze();
      expect(fft.freqDomain).to.be.a('Uint8Array').to.have.length(1024);
      expect(spectrum).to.be.a('array').to.have.length(1024);
    });
    it('can get analyze with parameters', function () {
      let fft = new p5.FFT();
      let source = new p5.AudioIn();
      fft.setInput(source);

      let spectrum = fft.analyze(256);
      expect(fft.bins).to.equal(256);
      expect(spectrum).to.be.a('array').to.have.length(1024);

      spectrum = fft.analyze(64, 'DB');
      expect(fft.bins).to.equal(64);
      expect(spectrum).to.be.a('Float32Array').to.have.length(64); //freqToFloat
      expect(fft.freqDomain).to.be.a('Float32Array').to.have.length(64);

      // parameters position doesn't matter if there is a number and a string
      spectrum = fft.analyze(undefined, 'dB', 128);
      expect(fft.bins).to.equal(128);
      expect(spectrum).to.be.a('Float32Array').to.have.length(64);
      expect(fft.freqDomain).to.be.a('Float32Array').to.have.length(64);
    });

    it('can get energy at a frequency', function () {
      let fft = new p5.FFT();
      let energy = fft.getEnergy('bass');
      expect(energy).to.equal(0); // as fft.freDomain is all zeros
    });
    it('can get energy from playing a file', function (done) {
      let recorder = new p5.SoundRecorder();
      let fft = new p5.FFT();
      let inputSoundFile = new p5.SoundFile();
      inputSoundFile.setBuffer([[1], [1]]);
      const recordingDuration =
        recorder.bufferSize / p5.soundOut.audiocontext.sampleRate;

      const outputSoundFile = new p5.SoundFile();
      inputSoundFile.loop();
      fft.setInput(inputSoundFile);
      recorder.record(outputSoundFile, recordingDuration, function () {
        fft.analyze();
        expect(fft.getEnergy('highMid')).to.not.equal(0); //string param
        expect(fft.getEnergy(1000)).to.not.equal(0); //one param
        expect(fft.getEnergy(100, 20000)).to.not.equal(0); // two params
        expect(fft.getEnergy(1000, 200)).to.not.equal(0);
        outputSoundFile.dispose();
        recorder.dispose();
        inputSoundFile.dispose();
        done();
      });
    });
    it('getEnergy can throw error for invalid inputs', function () {
      let fft = new p5.FFT();
      expect(() => {
        fft.getEnergy();
      }).to.throw;
      expect(() => {
        fft.getEnergy('bad param', 100);
      }).to.throw;
    });

    it('can get centroid', function (done) {
      let recorder = new p5.SoundRecorder();
      let fft = new p5.FFT();
      let inputSoundFile = new p5.SoundFile();
      inputSoundFile.setBuffer([[1], [1]]);
      const recordingDuration =
        recorder.bufferSize / p5.soundOut.audiocontext.sampleRate;

      const outputSoundFile = new p5.SoundFile();
      expect(fft.getCentroid()).to.be.a('number').to.equal(0);
      inputSoundFile.loop();
      fft.setInput(inputSoundFile);
      recorder.record(outputSoundFile, recordingDuration, function () {
        fft.analyze();
        expect(fft.getCentroid()).to.be.a('number').to.not.equal(0);
        outputSoundFile.dispose();
        recorder.dispose();
        inputSoundFile.dispose();
        done();
      });
    });

    it('can get and set smoothing value using smooth function', function () {
      let fft = new p5.FFT();
      expect(fft.smooth()).to.equal(0.8);
      expect(fft.smooth(0.63)).to.equal(0.63);
    });

    it('can get octave bands', function () {
      let fft = new p5.FFT();
      let sqrt2 = Math.pow(2, 1 / 2);
      let i;
      let octaveBands = fft.getOctaveBands(1);
      expect(octaveBands[0].ctr).to.equal(15.625);
      expect(octaveBands[0].lo).to.be.approximately(15.625 / sqrt2, 0.01);
      expect(octaveBands[0].hi).to.be.approximately(15.625 * sqrt2, 0.01);
      for (i = 1; i < octaveBands.length; i++) {
        let prev_ctr = octaveBands[i - 1].ctr;
        let prev_hi = octaveBands[i - 1].hi;
        expect(octaveBands[i].ctr).to.equal(prev_ctr * 2);
        expect(octaveBands[i].lo).to.equal(prev_hi);
        expect(octaveBands[i].hi).to.equal(prev_ctr * 2 * sqrt2);
      }
      expect(octaveBands[i - 1].lo).to.be.lessThan(
        p5.soundOut.audiocontext.sampleRate / 2
      ); //last band lo to be less than sampleRate
      expect(octaveBands[i - 1].hi).to.be.greaterThan(
        p5.soundOut.audiocontext.sampleRate / 2
      );
    });

    it('can get linear and log averages', function (done) {
      let recorder = new p5.SoundRecorder();
      let fft = new p5.FFT();
      let inputSoundFile = new p5.SoundFile();
      inputSoundFile.setBuffer([[1], [1]]);
      const recordingDuration =
        recorder.bufferSize / p5.soundOut.audiocontext.sampleRate;

      const outputSoundFile = new p5.SoundFile();
      inputSoundFile.loop();
      fft.setInput(inputSoundFile);
      recorder.record(outputSoundFile, recordingDuration, function () {
        fft.analyze();
        expect(fft.linAverages().length).to.equal(16);
        expect(fft.linAverages(8).length).to.equal(8);
        let octaveBands = fft.getOctaveBands();
        expect(fft.logAverages(octaveBands).length).to.equal(
          octaveBands.length
        );
        outputSoundFile.dispose();
        recorder.dispose();
        inputSoundFile.dispose();
        done();
      });
    });
  });
});
