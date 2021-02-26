var expect = chai.expect;

describe('p5.Reverb', function () {
  it('can be created and disposed', function () {
    var reverb = new p5.Reverb();
    reverb.dispose();
  });

  it('default parmams-> seconds:3, decay: 2, reverse: false', function () {
    var reverb = new p5.Reverb();

    expect(reverb._seconds).to.equal(3);
    expect(reverb._decay).to.equal(2);
    expect(reverb._reverse).to.equal(false);
  });

  it('can set seconds, decayRate, reverse', function () {
    var reverb = new p5.Reverb();
    reverb.set(5, 6, true);
    expect(reverb._seconds).to.equal(5);
    expect(reverb._decay).to.equal(6);
    expect(reverb._reverse).to.equal(true);
  });

  it('drywet value can be changed', function () {
    var effect = new p5.Effect();

    expect(effect.drywet(0.5)).to.equal(0.5);
  });
});
