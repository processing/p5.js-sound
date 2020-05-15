'use strict';

define(['chai'], function (chai) {
  var expect = chai.expect;

  describe('p5.Compressor', function () {
    it('can be created and disposed', function () {
      var compressor = new p5.Compressor();
      compressor.dispose();
    });

    it('wet dry value can be changed', function () {
      var compressor = new p5.Compressor();
      expect(compressor.drywet(0.5)).to.equal(0.5);
    });

    it('can set params', function () {
      var compressor = new p5.Compressor();
      compressor.set(0.5, 20, 15, -50, 0.75);
      expect(compressor.attack()).to.equal(0.5);
      expect(compressor.knee()).to.equal(20);
      expect(compressor.ratio()).to.equal(15);
      expect(compressor.threshold()).to.equal(-50);
      expect(compressor.release()).to.equal(0.75);
    });
  });
});
