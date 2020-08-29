var expect = chai.expect;

describe('p5.EQ', function () {
  it('can be created and disposed', function () {
    var origSoundArrayLength = p5.soundOut.soundArray.length;
    var eq = new p5.EQ();
    expect(p5.soundOut.soundArray.length).to.not.equal(origSoundArrayLength);
    eq.dispose();
    expect(p5.soundOut.soundArray.length).to.equal(origSoundArrayLength);
    expect(eq.input).to.equal(undefined);
    expect(eq.output).to.equal(undefined);
    expect(eq.bands).to.equal(undefined);
  });

  it('can be only be created with size 3 or 8', function () {
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

  it('a band can be toggled on and off', function () {
    var eq = new p5.EQ(8);
    expect(eq.bands[2].biquad.type).to.equal('peaking');
    eq.bands[2].toggle();
    expect(eq.bands[2].biquad.type).to.equal('allpass');
    eq.bands[2].toggle();
    expect(eq.bands[2].biquad.type).to.equal('peaking');
  });

  it('a bands gain value can be changed', function () {
    var eq = new p5.EQ(8);
    expect(eq.bands[2].gain()).to.equal(0);
    eq.bands[2].gain(30);
    expect(eq.bands[2].gain()).to.equal(30);
  });

  it('a bands freq value can be changed', function () {
    var eq = new p5.EQ(8);
    expect(eq.bands[0].freq()).to.equal(100);
    eq.bands[0].freq(200);
    expect(eq.bands[0].gain()).to.equal(0);
    expect(eq.bands[0].freq()).to.equal(200);
  });

  it('a bands type can be changed', function () {
    var eq = new p5.EQ();
    expect(eq.bands[2]._untoggledType).to.equal('peaking');
    eq.bands[2].setType('highshelf');
    expect(eq.bands[2]._untoggledType).to.equal('highshelf');
  });

  it('drywet value can be changed', function () {
    var eq = new p5.EQ();
    expect(eq.drywet(0.5)).to.equal(0.5);
  });
});
