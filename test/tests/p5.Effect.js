var expect = chai.expect;

describe('p5.Effect', function () {
  it('can be created and disposed', function () {
    var effect = new p5.Effect();
    effect.dispose();
    expect(effect.wet).to.equal(undefined);
    expect(effect._drywet).to.equal(undefined);
    expect(effect.input).to.equal(undefined);
    expect(effect.output).to.equal(undefined);
  });

  it('drywet value can be changed', function () {
    var effect = new p5.Effect();
    expect(effect.drywet(0.5)).to.equal(0.5);
  });

  it('drywet value can be used as getter and setter', function () {
    var effect = new p5.Effect();
    expect(effect.drywet(0.5)).to.equal(0.5);
    expect(effect.drywet()).to.equal(0.5);
  });

  it('effects can be chained together', function () {
    var filter = new p5.Filter();
    var delay = new p5.Delay();
    var reverb = new p5.Reverb();
    var distortion = new p5.Distortion();
    filter.chain(delay, reverb, distortion);
  });

  // fails because we set value using timeline, getters do not work
  // it('amp of an effect can be changed', function() {
  //   var reverb = new p5.Reverb();
  //   expect(reverb.output.gain.value).to.equal(1);
  //   reverb.amp(0.5);
  //   expect(reverb.output.gain.value).to.equal(0.5);
  // });
});
