define(['chai'],
  function(chai) {

  var expect = chai.expect;

  describe('p5.EQ', function() {

    it('can be created and disposed', function() {
      var eq = new p5.EQ();
      eq.dispose();
    });

    it('can be only be created with size 3 or 8', function() {
      var eq = new p5.EQ();
      expect(eq.bands.length).to.equal(3);
      eq.dispose();
      eq = new p5.EQ(3);
      expect(eq.bands.length).to.equal(3);
      eq.dispose();
      eq = new p5.EQ(8);
      expect(eq.bands.length).to.equal(8);
      eq.dispose();
      eq = new p5.EQ(50);
      expect(eq.bands.length).to.equal(3);
      eq.dispose();
    });

    it('a band can be toggled on and off', function() {
      var eq = new p5.EQ(8);
      eq.setBand(2, "toggle");
      expect(eq.bands[2].type).to.equal('allpass');
      eq.toggleBand(2);
      expect(eq.bands[2].type).to.equal('peaking');
    });

    it('a bands gain value can be changed', function() {
      var eq = new p5.EQ(8);
      expect(eq.bands[2].gain.value).to.equal(0);
      eq.setBand(2, "mod", 30);
      expect(eq.bands[2].gain.value).to.equal(30);
    });

    it('a bands freq value can be changed', function() {
      var eq = new p5.EQ(8);
      expect(eq.bands[2].frequency.value).to.equal(640);
      eq.setBand(2, "mod", null, 800);
      expect(eq.bands[2].gain.value).to.equal(0);
      expect(eq.bands[2].frequency.value).to.equal(800);
    });

    it('a bands type can be changed', function() {
      var eq = new p5.EQ();
      expect(eq.bands[2].type=='peaking');
      eq.bandType(2,'highshelf');
      expect(eq.bands[2].type=='highshelf');
    });
    it('drywet value can be changed', function(){
      var eq = new p5.EQ();
      expect(eq.drywet(0.5)).to.equal(0.5);
    });
  });
});
