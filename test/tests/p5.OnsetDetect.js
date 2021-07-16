const expect = chai.expect;

describe('p5.OnsetDetect', function () {
  it('can be initalized ', function () {
    const onsetDetect = new p5.OnsetDetect(40, 120, 0.8, () => {});
    expect(onsetDetect.freqLow).to.equal(40);
    expect(onsetDetect.freqHigh).to.equal(120);
    expect(onsetDetect.treshold).to.equal(0.8);
    expect(onsetDetect.energy).to.equal(0);
  });

  describe('methods', function () {
    //TODO : test update functions by mocking or using a FFT
  });
});
