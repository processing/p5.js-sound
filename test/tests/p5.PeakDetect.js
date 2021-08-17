const expect = chai.expect;

describe('p5.PeakDetect', function () {
  it('can be initialized without any arguments', function () {
    const peakDetect = new p5.PeakDetect();
    expect(peakDetect.cutoff).to.equal(0);
    expect(peakDetect.framesSinceLastPeak).to.equal(0);
    expect(peakDetect.energy).to.equal(0);
    expect(peakDetect.isDetected).to.equal(false);
  });
  it('can be initialized with arguemts', function () {
    const peakDetect = new p5.PeakDetect(40, 120, 0.8, 20);
    expect(peakDetect.f1).to.equal(40);
    expect(peakDetect.f2).to.equal(120);
    expect(peakDetect.threshold).to.equal(0.8);
    expect(peakDetect.framesPerPeak).to.equal(20);
  });
  describe('methods', function () {
    //TODO : test update, onPeak functions by mocking or using a FFT
  });
});
