define(['chai'],
  function(chai) {

  var expect = chai.expect;

  describe('p5.AudioVoice', function() {

    it('can be created and disposed', function() {
      var av = new p5.AudioVoice();
      av.dispose();
    });

    it('can convert strings to frequency values', function() {
      var av = new p5.AudioVoice();
      var freq = av._setNote("A4");
      expect(freq).to.equal(440);
      av.dispose();
    });
  });

});
