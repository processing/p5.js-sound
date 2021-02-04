var expect = chai.expect;

describe('p5.Distortion', function () {
  this.timeout(1000);

  var dist = new p5.Distortion();

  it('can be created and disposed', function () {
    var d = new p5.Distortion();
    d.dispose();
  });

  it('can set the amount and oversample', function () {
    var initialAmt = dist.getAmount();
    var initialOS = dist.getOversample();
    dist.set(1000, '4x');
    expect(dist.getAmount()).not.equal(initialAmt);
    expect(dist.getOversample()).not.equal(initialOS);
  });
});
