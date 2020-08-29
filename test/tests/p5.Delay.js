var expect = chai.expect;

describe('p5.Delay', function () {
  it('can be created and disposed', function () {
    var delay = new p5.Delay();
    delay.dispose();
  });

  it('has initial feedback value of 0.5', function () {
    var delay = new p5.Delay();
    expect(delay.feedback()).to.equal(0.5);
  });

  it('can set feedback', function () {
    var delay = new p5.Delay();
    delay.feedback(0.7);
    expect(delay.feedback()).to.be.closeTo(0.7, 0.001);
  });

  it('drywet value can be changed', function () {
    var effect = new p5.Effect();
    expect(effect.drywet(0.5)).to.equal(0.5);
  });
});
