'use strict';

define(['chai'], function (chai) {
  const expect = chai.expect;
  describe('P5.master', function () {
    it('can set and return master volume', function (done) {
      p5.prototype.masterVolume(0.6);

      setTimeout(function () {
        expect(p5.prototype.getMasterVolume()).to.be.closeTo(0.6, 0.05);
        done();
      }, 100);
    });
    it('can set master volume after t seconds in future', function (done) {
      let t = 1;
      p5.prototype.masterVolume(0.9, 0, t);

      setTimeout(function () {
        expect(p5.prototype.getMasterVolume()).to.be.closeTo(0.9, 0.05);
        done();
      }, 1100);
    });

    it('can create a linear fade effect in master volume ', function (done) {
      let t = 1;
      p5.prototype.masterVolume(1, t, 0);

      setTimeout(function () {
        expect(p5.prototype.getMasterVolume()).to.be.closeTo(0.5, 0.5);
        done();
      }, 500);
    });
  });
});
