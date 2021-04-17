const expect = chai.expect;

describe('p5.Envelope', function () {
  it('can be created and disposed', function () {
    const envelope = new p5.Envelope();
    envelope.dispose();
  });

  it('Testing setRange', function () {
    const envelope = new p5.Envelope();
    envelope.setRange(5, 6);
    expect(envelope.aLevel).to.be.equal(5);
    expect(envelope.rLevel).to.be.equal(6);
    envelope.dispose();
  });

  it('Testing setExp', function () {
    const envelope = new p5.Envelope();
    expect(envelope.isExponential).to.be.equal(false);
    envelope.setExp(true);
    expect(envelope.isExponential).to.be.equal(true);
    envelope.dispose();
  });

  it('Testing checkExpInput', function () {
    const envelope = new p5.Envelope();
    expect(envelope.checkExpInput(5)).to.be.equal(5);
    expect(envelope.checkExpInput(-5)).to.be.equal(0.00000001);
    envelope.dispose();
  });
  it('Testing connect and disconnect function', function () {
    const osc = new p5.Oscillator('square');
    const envelope = new p5.Envelope();
    envelope.connect(osc);
    envelope.disconnect();
    envelope.dispose();
  });
});
