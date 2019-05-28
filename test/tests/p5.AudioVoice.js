'use strict';

define(['chai'], function(chai) {
  var expect = chai.expect;

  describe('p5.AudioVoice', function() {

    it('can be created and disposed', function() {
      var av = new p5.AudioVoice();
      av.dispose();
    });
  });

});
