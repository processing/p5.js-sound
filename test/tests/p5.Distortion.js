const expect = chai.expect;

describe('p5.Distortion', function () {
  it('can be created and disposed', function () {
    let distortion = new p5.Distortion();
    expect(distortion).to.have.property('input');
    expect(distortion).to.have.property('output');
    expect(distortion).to.have.property('wet');
    expect(distortion).to.have.property('waveShaperNode');
    expect(distortion.waveShaperNode).to.have.property('context').to.not.be
      .null;
    //default case
    expect(distortion.amount).to.equal(0.25);
    expect(distortion.waveShaperNode.oversample).to.equal('2x');

    distortion.dispose();
    expect(distortion.waveShaperNode).to.be.null;
  });

  it('can be created with only amount as a parameter', function () {
    let distortion = new p5.Distortion(0.3);
    expect(distortion.amount).to.equal(0.3);
    expect(distortion.waveShaperNode.oversample).to.equal('2x');

    //non-numerical value
    expect(() => new p5.Distortion('a')).to.throw();
  });
  it('can be created with only oversample as a parameter', function () {
    let distortion = new p5.Distortion(undefined, '4x');
    expect(distortion.amount).to.equal(0.25);
    expect(distortion.waveShaperNode.oversample).to.equal('4x');

    //non-numerical value
    expect(() => new p5.Distortion(undefined, 500)).to.throw();
  });
  it('can be created with both parameters', function () {
    let distortion = new p5.Distortion(0.8, '4x');
    expect(distortion.amount).to.equal(0.8);
    expect(distortion.waveShaperNode.oversample).to.equal('4x');
  });

  describe('methods', function () {
    it('can process a sound source', function () {
      let osc = new p5.SawOsc();
      let distortion = new p5.Distortion();
      //no params
      distortion.process(osc);

      //both params
      distortion.process(osc, 0.62, '4x');
      expect(distortion.amount).to.equal(0.62);
      expect(distortion.waveShaperNode.oversample).to.equal('4x');
    });
    it('can set amount and oversample', function () {
      let distortion = new p5.Distortion();
      //only one param
      distortion.set(0.98);
      expect(distortion.amount).to.equal(0.98);
      expect(distortion.waveShaperNode.oversample).to.equal('2x');
      distortion.set(undefined, '4x');
      expect(distortion.amount).to.equal(0.98);
      expect(distortion.waveShaperNode.oversample).to.equal('4x');

      //both params
      distortion.set(0.14, '2x');
      expect(distortion.amount).to.equal(0.14);
      expect(distortion.waveShaperNode.oversample).to.equal('2x');
    });
    it('can get amount', function () {
      let distortion = new p5.Distortion(0.43, '2x');
      expect(distortion.getAmount()).to.equal(0.43);
    });
    it('can get over sample', function () {
      let distortion = new p5.Distortion(0.43, '4x');
      expect(distortion.getOversample()).to.equal('4x');
    });
  });
});
