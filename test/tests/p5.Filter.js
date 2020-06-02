'use strict';

define(['chai'], function (chai) {
  var expect = chai.expect;

  describe('p5.Filter', function () {
    it('can be created and disposed', function () {
      var filter = new p5.Filter();
      filter.dispose();
    });

    it('has initial drywet value of 0.5', function () {
      var filter = new p5.Filter();
      expect(filter.drywet(0.5)).to.equal(0.5);
    });

    it('audio can be processed', function () {
      var filter = new p5.Filter();
      var sound = new p5.SoundFile('./testAudio/drum.mp3');
      filter.process(sound, 500, 5);
    });
  });
});
