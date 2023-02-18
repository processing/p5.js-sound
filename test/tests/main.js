const expect = chai.expect;
describe('main output', function () {
  it('can initiate main class', function () {
    expect(p5.soundOut.input).to.have.property('gain');
    expect(p5.soundOut.input).to.have.property('context');
    expect(p5.soundOut.output).to.have.property('gain');
    expect(p5.soundOut.output).to.have.property('context');
    expect(p5.soundOut.limiter.threshold.value).to.equal(-3);
    expect(p5.soundOut.limiter.ratio.value).to.equal(20);
    expect(p5.soundOut.limiter.knee.value).to.equal(1);
    expect(p5.soundOut.audiocontext).to.have.property('audioWorklet');
    expect(p5.soundOut.audiocontext).to.have.property('baseLatency');
    expect(p5.soundOut.meter).to.have.property('gain');
    expect(p5.soundOut.meter).to.have.property('context');
    expect(p5.soundOut.fftMeter).to.have.property('gain');
    expect(p5.soundOut.fftMeter).to.have.property('context');
    expect(p5.soundOut.soundArray).to.be.an('array');
    expect(p5.soundOut.parts).to.be.an('array');
    expect(p5.soundOut.extensions).to.be.an('array');

    expect(p5.soundOut._silentNode).to.have.property('gain');
    expect(p5.soundOut._silentNode).to.have.property('context');
    expect(p5.soundOut._silentNode.gain.value).to.equal(0);

    console.log(p5.soundOut);
  });

  it('can set and return output volume', function (done) {
    p5.prototype.outputVolume(0.6);

    setTimeout(function () {
      expect(p5.prototype.getOutputVolume()).to.be.approximately(0.6, 0.05);
      expect(p5.prototype.outputVolume().value).to.be.approximately(0.6, 0.05);
      done();
    }, 100);
  });
  it('can set output volume after t seconds in future', function (done) {
    let t = 1;
    p5.prototype.outputVolume(0.9, 0, t);

    setTimeout(function () {
      expect(p5.prototype.getOutputVolume()).to.be.approximately(0.9, 0.05);
      done();
    }, 1100);
  });

  it('can create a linear fade effect in output volume ', function (done) {
    let t = 1;
    p5.prototype.outputVolume(1, t, 0);

    setTimeout(function () {
      expect(p5.prototype.getOutputVolume()).to.be.approximately(0.5, 0.5);
      done();
    }, 500);
  });

  it('can connect an audio node to p5sound output', function () {
    let noise = new p5.Noise();
    p5.prototype.outputVolume(noise);
  });
});
