define(['chai'],
  function(chai) {

  var expect = chai.expect;

  describe('p5.Effect', function() {

    it('can be created and disposed', function() {
      var effect = new p5.Effect();
      effect.dispose();
    });



    it('drywet value can be changed', function(){
      var effect = new p5.Effect();

      expect(effect.drywet(0.5)).to.equal(0.5);
    });
  });
});
