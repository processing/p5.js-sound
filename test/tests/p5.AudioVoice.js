'use strict';

define(['chai'], function (chai) {
  describe('p5.AudioVoice', function () {
    it('can be created and disposed', function () {
      var av = new p5.AudioVoice();
      av.dispose();
    });
  });
});
