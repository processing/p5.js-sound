const expect = chai.expect;

describe('p5.AudioIn', function () {
  let mic;
  beforeEach(function () {
    mic = new p5.AudioIn();
  });
  afterEach(function () {
    mic.dispose();
  });
  it('can be created and disposed', function () {
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
    it('can be started and stopped', function (done) {
      let success = false;
      mic.start(function () {
        success = true;
        mic.stop();
      });
      setTimeout(() => {
        expect(success).to.be.true;
        expect(mic).to.not.have.property('stream');
        expect(mic).to.not.have.property('mediaStream');
        done();
      }, 100);
    });

    it('can be connected to an input and can be disconnected', function () {
      let filter = new p5.Filter();

      //if unit has input property
      mic.connect(filter);
      mic.disconnect();

      //if unit doesnot have an input property
      mic = new p5.AudioIn();
      mic.connect(filter.input);
      mic.disconnect();
    });
    it('can be connected to an analyser and can be disconnected', function () {
      let fft = new p5.FFT();

      delete fft.input;
      mic.connect(fft);
      mic.disconnect();
    });
    it('can be connected to p5sound input and can be disconnected', function () {
      mic.connect();
      mic.disconnect();
    });

    it("can get level of the mic's amplitude", function (done) {
      let osc = new p5.Oscillator('square');
      osc.amp(1);
      osc.start();
      osc.disconnect();
      mic.amplitude.setInput(osc);

      setTimeout(() => {
        expect(mic.getLevel()).to.be.closeTo(0.55, 0.25);
        mic.amplitude.toggleNormalize(true);
        expect(mic.getLevel(0.01)).to.be.closeTo(1.0, 0.4); //can set smoothing
        done();
      }, 100);
    });

    it('can set amplitude of mic without any ramp', function (done) {
      mic.amp(0.475);
      setTimeout(() => {
        expect(mic.output.gain.value).to.be.approximately(0.475, 0.01);
        done();
      }, 100);
    });
    it('can set amplitude of mic with ramp', function (done) {
      mic.amp(0.3, 0.1);
      setTimeout(() => {
        expect(mic.output.gain.value).to.be.approximately(0.3, 0.05);
        done();
      }, 100);
    });

    it('can get sources', function (done) {
      mic.getSources().then(function (sources) {
        expect(sources).to.be.an('array');
        done();
      });
    });

    it('can set a source', function (done) {
      expect(mic.currentSource).to.be.null;

      return mic.getSources().then(function () {
        mic.setSource(0);
        expect(mic.currentSource).to.equal(0);
        done();
      });
    });

    it('can execute _onNewInput() hook on connected unit', function (done) {
      const gain = new p5.Gain();
      gain._onNewInput = function () {
        done();
      };
      mic.connect(gain);
    });
  });
});
