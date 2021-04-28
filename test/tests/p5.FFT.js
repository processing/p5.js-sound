const expect = chai.expect;

describe('p5.FFT', function () {
  let fft;

  beforeEach(function () {
    fft = new p5.FFT();
  });

  afterEach(function () {
    fft.dispose();
  });

  it('has default bins of 1024', function () {
    expect(fft.bins).to.equal(1024);
  });

  it('has default smoothing of 0.8', function () {
    expect(fft.smooth()).to.equal(0.8);
    expect(fft.smoothing).to.equal(0.8);
  });

  it('accepts smoothing and bins as args', function () {
    fft.dispose();
    fft = new p5.FFT(0, 128);
    expect(fft.smoothing).to.equal(0);
    expect(fft.bins).to.equal(128);
  });

  it('can set smoothing to zero', function () {
    fft.smooth(0);
    expect(fft.smoothing).to.equal(0);
    expect(fft.smooth()).to.equal(0);
    fft.smooth(0.9);
    expect(fft.smoothing).to.equal(0.9);
    expect(fft.smooth()).to.equal(0.9);
  });

  it('handles smoothing values out of range', function () {
    expect(fft.smooth()).to.equal(0.8);
    try {
      fft.smooth(-1);
      expect.fail();
    } catch (e) {
      expect(e).to.be.an.instanceof(Error);
    }
    expect(fft.smoothing).to.equal(0.8);
    expect(fft.smooth()).to.equal(0.8);
    try {
      fft.smooth('some bad param');
      expect.fail();
    } catch (e) {
      expect(e).to.be.an.instanceof(Error);
    }
    expect(fft.smoothing).to.equal(0.8);
    expect(fft.smooth()).to.equal(0.8);
  });

  let soundFile, oscillator;
  it('can set Oscillator as input', function (done) {
    oscillator = new p5.Oscillator();
    try {
      fft.setInput(oscillator);
    } catch (err) {
      return expect.fail();
    }
    oscillator.start();

    setTimeout(() => {
      let spectrum = fft.analyze();
      const someFrequencyIsNotZero = spectrum.some(
        (frequency) => frequency !== 0
      );
      expect(someFrequencyIsNotZero).to.equal(true);
      oscillator.dispose();
      done();
    }, 500);
  });
  it('can set soundFile  as input', function (done) {
    soundFile = p5.prototype.loadSound('./testAudio/drum.mp3', () => {
      soundFile.disconnect();
      try {
        fft.setInput(soundFile);
      } catch (err) {
        return done(err);
      }
      soundFile.play();
      setTimeout(() => {
        let spectrum = fft.analyze();
        const someFrequencyIsNotZero = spectrum.some(
          (frequency) => frequency !== 0
        );
        expect(someFrequencyIsNotZero).to.equal(true);
        soundFile.dispose();
        done();
      }, 500);
    });
  });
  it('can handle any Unknown sources', function (done) {
    let UnknownSource = { UnknownSource: 'this is a unknown object' };
    try {
      fft.setInput(UnknownSource);
    } catch (err) {
      return done(err);
    }
    setTimeout(() => {
      let spectrum = fft.analyze();
      const someFrequencyIsNotZero = spectrum.some(
        (frequency) => frequency !== 0
      );
      expect(someFrequencyIsNotZero).to.equal(false);
      done();
    }, 500);
  });
});
