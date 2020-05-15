'use strict';

define(['chai'], function (chai) {
  var expect = chai.expect;

  describe('p5.AudioIn', function () {
    it('can be created and disposed', function () {
      var mic = new p5.AudioIn();
      mic.dispose();
    });

    it('can be started and stopped', function () {
      var mic = new p5.AudioIn();
      mic.start(function () {
        mic.stop();
      });
    });

    it('can get sources', function (done) {
      var mic = new p5.AudioIn();
      mic.getSources().then(function (sources) {
        console.log(sources);
        expect(sources).to.be.an('array');
        done();
      });
    });

    it('can set source', function (done) {
      var mic = new p5.AudioIn();
      expect(mic.currentSource).to.be.null;

      return mic.getSources().then(function () {
        mic.setSource(0);
        expect(mic.currentSource).to.equal(0);
        done();
      });
    });
  });
});
