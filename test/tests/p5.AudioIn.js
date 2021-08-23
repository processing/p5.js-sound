describe('p5.AudioIn', function () {
  before(function (done) {
    this.timeout(10000);

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
  it('can be created and disposed', function () {
    let mic = new p5.AudioIn();
    expect(mic.input).to.have.property('gain');
    expect(mic.output).to.have.property('gain');
    expect(mic).to.have.property('stream').to.be.null;
    expect(mic).to.have.property('mediaStream').to.be.null;
    expect(mic).to.have.property('currentSource').to.be.null;
    expect(mic).to.have.property('enabled').to.be.false;
    expect(mic.amplitude).to.have.property('audiocontext').not.be.null;
    expect(mic.amplitude).to.have.property('_workletNode').not.be.null;
    expect(mic.amplitude.bufferSize).to.equal(2048);

    mic.dispose();
    expect(mic).to.not.have.property('output');
    expect(mic).to.not.have.property('amplitude');
  });

  describe('methods', function () {
    this.retries(2);

    it('can be started and stopped', function (done) {
      let mic = new p5.AudioIn();
      mic.start(function () {
        mic.stop();
        setTimeout(() => {
          expect(mic).to.not.have.property('stream');
          expect(mic).to.not.have.property('mediaStream');
          mic.dispose();
          done();
        }, 100);
      });
    });

    it('can be connected to an input and can be disconnected', function () {
      let mic = new p5.AudioIn();
      let filter = new p5.Filter();

      //if unit has input property
      mic.connect(filter);
      mic.disconnect();

      //if unit doesnot have an input property
      mic = new p5.AudioIn();
      mic.connect(filter.input);
      mic.disconnect();
      mic.dispose();
    });
    it('can be connected to an analyser and can be disconnected', function () {
      let mic = new p5.AudioIn();
      let fft = new p5.FFT();

      delete fft.input;
      mic.connect(fft);
      mic.disconnect();
      mic.dispose();
    });
    it('can be connected to p5sound input and can be disconnected', function () {
      let mic = new p5.AudioIn();
      mic.connect();
      mic.disconnect();
      mic.dispose();
    });

    it("can get level of the mic's amplitude", function (done) {
      let mic = new p5.AudioIn();
      let osc = new p5.Oscillator('square');
      osc.amp(1);
      osc.start();
      osc.disconnect();
      mic.amplitude.setInput(osc);

      setTimeout(() => {
        try {
          expect(mic.getLevel()).to.be.closeTo(0.55, 0.25);
          mic.amplitude.toggleNormalize(true);
          expect(mic.getLevel(0.01)).to.be.closeTo(1.0, 0.4); //can set smoothing
          mic.dispose();
          done();
        } catch (error) {
          done(error);
        }
      }, 450);
    });

    it('can set amplitude of mic without any ramp', function (done) {
      let mic = new p5.AudioIn();
      mic.amp(0.475);
      setTimeout(() => {
        expect(mic.output.gain.value).to.be.approximately(0.475, 0.01);
        mic.dispose();
        done();
      }, 100);
    });
    it('can set amplitude of mic with ramp', function (done) {
      let mic = new p5.AudioIn();
      mic.amp(0.3, 0.1);
      setTimeout(() => {
        expect(mic.output.gain.value).to.be.approximately(0.3, 0.05);
        mic.dispose();
        done();
      }, 150);
    });

    it('can get sources', function (done) {
      let mic = new p5.AudioIn();
      mic.getSources().then(function (sources) {
        expect(sources).to.be.an('array');
        mic.dispose();
        done();
      });
    });

    it('can set a source', function (done) {
      let mic = new p5.AudioIn();
      expect(mic.currentSource).to.be.null;

      mic.getSources().then(function () {
        mic.setSource(0);
        expect(mic.currentSource).to.equal(0);
        mic.dispose();
        done();
      });
    });
  });
});
