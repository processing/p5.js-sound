const expect = chai.expect;
describe('main output', function () {
  it('can set and return output volume', function (done) {
    p5.prototype.outputVolume(0.6);

    setTimeout(function () {
      expect(p5.prototype.getOutputVolume()).to.be.closeTo(0.6, 0.05);
      done();
    }, 100);
  });
  it('can set output volume after t seconds in future', function (done) {
    let t = 1;
    p5.prototype.outputVolume(0.9, 0, t);

    setTimeout(function () {
      expect(p5.prototype.getOutputVolume()).to.be.closeTo(0.9, 0.05);
      done();
    }, 1100);
  });

  it('can create a linear fade effect in output volume ', function (done) {
    let t = 1;
    p5.prototype.outputVolume(1, t, 0);

    setTimeout(function () {
      expect(p5.prototype.getOutputVolume()).to.be.closeTo(0.5, 0.5);
      done();
    }, 500);
  });
});
