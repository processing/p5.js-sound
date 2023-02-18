const expect = chai.expect;

describe('p5.Amplitude', function () {
  this.timeout(1000);

  let amp;
  let osc = new p5.Oscillator('square');
  osc.amp(1);
  osc.start();
  osc.disconnect();

  beforeEach(function () {
    amp = new p5.Amplitude();
  });

  it('can be created', function () {
    expect(amp).to.have.property('audiocontext').not.be.null;
    expect(amp).to.have.property('_workletNode').not.be.null;
    expect(amp.bufferSize).to.equal(2048);
    expect(amp).to.have.property('input');
    expect(amp).to.have.property('output');
    expect(amp.volume).to.equal(0);
    expect(amp.volNorm).to.equal(0);
    expect(amp.stereoVol).to.deep.equal([0, 0]);
    expect(amp.stereoVolNorm).to.deep.equal([0, 0]);
  });

  after(function (done) {
    osc.dispose();
    done();
  });
  it('can be created with smoothing', function () {
    new p5.Amplitude(0.02);
  });

  describe('methods', function () {
    it('accepts oscillator input', function () {
      amp.setInput(osc);
    });
    it('setInput connects to main output if no argument is passed', function () {
      amp.setInput();
    });

    it('can toggle normalization', function () {
      expect(amp.normalize).to.be.false;
      amp.toggleNormalize();
      expect(amp.normalize).to.be.true;

      amp.toggleNormalize(true);
      expect(amp.normalize).to.be.true;
      amp.toggleNormalize(false);
      expect(amp.normalize).to.be.false;
    });

    it('gets oscillator level', function (done) {
      amp.setInput(osc);
      setTimeout(function () {
        expect(amp.getLevel()).to.be.closeTo(0.55, 0.25);
        done();
      }, 100);
    });

    it('gets normalized osc level', function (done) {
      amp.setInput(osc);
      setTimeout(function () {
        amp.toggleNormalize(true);
        expect(amp.getLevel()).to.be.closeTo(1.0, 0.4);
        done();
      }, 200);
    });
    it('gets stereo osc level', function (done) {
      amp.setInput(osc);
      setTimeout(function () {
        expect(amp.getLevel(0)).to.be.closeTo(0.55, 0.25);
        expect(amp.getLevel(1)).to.be.closeTo(0.55, 0.25);
        amp.toggleNormalize(true);
        expect(amp.getLevel(0)).to.be.closeTo(1, 0.4);
        expect(amp.getLevel(1)).to.be.closeTo(1, 0.4);
        done();
      }, 200);
    });

    it('can be connected to a soundFile', function (done) {
      p5.prototype.soundFormats('ogg', 'mp3');
      let sf = p5.prototype.loadSound('./testAudio/drum', function () {
        sf.disconnect();
        sf.loop(1, 1, 0.0, 0.05);
        sf.connect(amp);
        sf.dispose();
        setTimeout(function () {
          sf.stop();
          done();
        }, 100);
      });
    });

    it('can apply smoothing', function () {
      amp.smooth(0.5);
    });

    it('can be disposed', function () {
      amp.dispose();
      expect(amp).to.not.have.property('input');
      expect(amp).to.not.have.property('output');
      expect(amp).to.not.have.property('_workletNode');
    });
  });
});
