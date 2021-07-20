const expect = chai.expect;

describe('p5.Filter', function () {
  it('can be created and disposed', function () {
    let filter = new p5.Filter();

    expect(filter.input).to.have.property('gain');
    expect(filter.input).to.have.property('context');
    expect(filter.output).to.have.property('gain');
    expect(filter.output).to.have.property('context');
    expect(filter._drywet).to.have.property('fade');
    expect(filter.wet).to.have.property('gain');
    expect(filter.wet).to.have.property('context');
    expect(filter.biquad).to.have.property('gain');
    expect(filter.biquad).to.have.property('context');

    expect(filter._on).to.be.true;
    expect(filter._untoggledType).to.equal('lowpass'); //default type

    filter.dispose();
    expect(filter.wet).to.equal(undefined);
    expect(filter._drywet).to.equal(undefined);
    expect(filter.input).to.equal(undefined);
    expect(filter.output).to.equal(undefined);
    expect(filter.ac).to.equal(undefined);
    expect(filter.biquad).to.equal(undefined);
  });

  it('can be created with a type', function () {
    let filter = new p5.Filter('highshelf');
    expect(filter._untoggledType).to.equal('highshelf');
    expect(filter.biquad.type).to.equal('highshelf');
  });

  it('can create LowPass subclass', function () {
    let lowpass = new p5.LowPass();
    expect(lowpass.biquad).to.have.property('gain');
    expect(lowpass.biquad).to.have.property('context');
    expect(lowpass._on).to.be.true;
    expect(lowpass._untoggledType).to.equal('lowpass');
  });
  it('can create HighPass subclass', function () {
    let highpass = new p5.HighPass();
    expect(highpass.biquad).to.have.property('gain');
    expect(highpass.biquad).to.have.property('context');
    expect(highpass._on).to.be.true;
    expect(highpass._untoggledType).to.equal('highpass');
  });
  it('can create BandPass subclass', function () {
    let bandpass = new p5.BandPass();
    expect(bandpass.biquad).to.have.property('gain');
    expect(bandpass.biquad).to.have.property('context');
    expect(bandpass._on).to.be.true;
    expect(bandpass._untoggledType).to.equal('bandpass');
  });

  describe('methods', function () {
    it('has initial drywet value of 1', function () {
      const filter = new p5.Filter();
      expect(filter.drywet()).to.equal(1);
    });

    it('audio can be processed', function (done) {
      const filter = new p5.Filter();
      const sound = new p5.SoundFile('./testAudio/drum.mp3');
      filter.process(sound, 500, 5);
      setTimeout(() => {
        expect(filter.biquad.frequency.value).to.be.approximately(500, 1);
        expect(filter.biquad.Q.value).to.be.approximately(5, 0.1);
        done();
      }, 50);
    });
    it('audio can be processed with a delay', function (done) {
      const filter = new p5.Filter();
      const sound = new p5.SoundFile('./testAudio/drum.mp3');
      filter.process(sound, 20000, 0.11, 0.1);
      setTimeout(() => {
        expect(filter.biquad.frequency.value).to.not.be.approximately(20000, 1);
        setTimeout(() => {
          expect(filter.biquad.frequency.value).to.be.approximately(20000, 1);
          expect(filter.biquad.Q.value).to.be.approximately(0.11, 0.1);
          done();
        }, 100);
      }, 50);
    });

    it('can set either one of frequency or resonance of the filter', function (done) {
      let filter = new p5.Filter();
      filter.set();
      //default values
      expect(filter.biquad.frequency.value).to.equal(350, 1);
      expect(filter.biquad.Q.value).to.equal(1, 0.1);
      //det freq
      filter.set(239);
      setTimeout(() => {
        expect(filter.biquad.frequency.value).to.be.approximately(239, 1);
        expect(filter.biquad.Q.value).to.equal(1, 0.1);
      }, 50);
      //set resonance
      let filter2 = new p5.Filter();
      filter2.set(undefined, 0.009);
      setTimeout(() => {
        expect(filter2.biquad.frequency.value).to.equal(350, 1);
        expect(filter2.biquad.Q.value).to.be.approximately(0.009, 0.001);
        done();
      }, 50);
    });
    it('can set both frequency and resonance without any delay', function (done) {
      let filter = new p5.Filter();
      filter.set(1234, 123.45);
      setTimeout(() => {
        expect(filter.biquad.frequency.value).to.be.approximately(1234, 1);
        expect(filter.biquad.Q.value).to.be.approximately(123.45, 0.1);
        done();
      }, 50);
    });
    it('can set both frequency and resonance with delay', function (done) {
      let filter = new p5.Filter();
      filter.set(4321, 43.21, 0.15);
      setTimeout(() => {
        expect(filter.biquad.frequency.value).to.not.be.approximately(4321, 1);
        setTimeout(() => {
          expect(filter.biquad.frequency.value).to.be.approximately(4321, 1);
          expect(filter.biquad.Q.value).to.be.approximately(43.21, 0.1);
        }, 150);
        done();
      }, 50);
    });

    it('can get and set frequency without any delay', function (done) {
      let filter = new p5.Filter();
      expect(filter.freq()).to.equal(350); //default value
      filter.freq(400);
      setTimeout(() => {
        expect(filter.freq()).to.be.approximately(400, 1);
      }, 50);

      let filter2 = new p5.Filter();
      filter2.freq(-1); // lower bound to be 1
      setTimeout(() => {
        expect(filter2.freq()).to.be.approximately(1, 1);
        done();
      }, 50);
    });
    it('can set frequency with delay', function (done) {
      let filter = new p5.Filter();
      filter.freq(3500, 0.2);
      setTimeout(() => {
        expect(filter.freq()).to.not.be.approximately(3500, 1);
        setTimeout(() => {
          expect(filter.freq()).to.be.approximately(3500, 1);
          done();
        }, 200);
      }, 50);
    });
    it('can an audio node to frequency', function () {
      let filter = new p5.Filter();
      let freqEnv = new p5.Envelope();
      filter.freq(freqEnv);
    });

    it('can get and set resonance without any delay', function (done) {
      let filter = new p5.Filter();
      expect(filter.res()).to.equal(1); //default value
      filter.res(100);
      setTimeout(() => {
        expect(filter.res()).to.be.approximately(100, 1);
        done();
      }, 50);
    });
    it('can set resonance with delay', function (done) {
      let filter = new p5.Filter();
      filter.res(432, 0.1);
      setTimeout(() => {
        expect(filter.res()).to.be.approximately(432, 1);
        done();
      }, 150);
    });
    it('can an audio node to resonance', function () {
      let filter = new p5.Filter();
      let freqEnv = new p5.Envelope();
      filter.res(freqEnv);
    });

    it('can get and set gain of biquad without any delay', function (done) {
      let filter = new p5.Filter();
      expect(filter.gain()).to.equal(0); //default value
      filter.gain(1.2);
      setTimeout(() => {
        expect(filter.biquad.gain.value).to.be.approximately(1.2, 0.1);
        expect(filter.gain()).to.be.approximately(1.2, 0.1);
        done();
      }, 50);
    });
    it('can set gain of biquad with delay', function (done) {
      let filter = new p5.Filter();
      filter.gain(1, 0.1);
      setTimeout(() => {
        expect(filter.gain()).to.be.approximately(1, 0.1);
        done();
      }, 150);
    });
    it('can an audio node to gain of biquad', function () {
      let filter = new p5.Filter();
      let freqEnv = new p5.Envelope();
      filter.gain(freqEnv);
    });

    it('can toggle between type and allPass', function () {
      let filter = new p5.Filter('peaking');
      expect(filter._untoggledType).to.equal('peaking');
      expect(filter.biquad.type).to.equal('peaking');
      expect(filter._on).to.be.true;

      filter.toggle();
      expect(filter._untoggledType).to.equal('peaking');
      expect(filter.biquad.type).to.equal('allpass');
      expect(filter._on).to.be.false;

      filter.toggle();
      expect(filter.biquad.type).to.equal('peaking');
      expect(filter._on).to.be.true;
    });

    it('can set type of the filter', function () {
      let filter = new p5.Filter('notch');
      expect(filter._untoggledType).to.equal('notch');
      expect(filter.biquad.type).to.equal('notch');

      filter.setType('lowpass');
      expect(filter._untoggledType).to.equal('lowpass');
      expect(filter.biquad.type).to.equal('lowpass');
    });
  });
});
