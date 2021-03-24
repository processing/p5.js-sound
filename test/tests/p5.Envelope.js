let expect = chai.expect;

describe('p5.Envelop', function () {
  let sf;

  it('can be created and disposed', function () {
    let envelope = new p5.Envelope();
    envelope.dispose();
  });

  it('Testing setRange', function () {
    let envelope = new p5.Envelope();
    envelope.setRange(5, 6);
    expect(envelope.aLevel).to.be.equal(5);
    expect(envelope.rLevel).to.be.equal(6);
    envelope.dispose();
  });

  it('Testing _setRampAD and setRampPercentages ', function () {
    let envelope = new p5.Envelope();
    envelope._setRampAD(5, 6);
    envelope.setRampPercentages(5, 6);
    expect(envelope._rampAttackTime).to.be.equal(5);
    expect(envelope._rampDecayTime).to.be.equal(6);
    expect(envelope._rampHighPercentage).to.be.equal(5);
    expect(envelope._rampLowPercentage).to.be.equal(6);
    expect(envelope._rampAttackTC).to.be.equal(0.27143405118953234);
    expect(envelope._rampDecayTC).to.be.equal(600000000);

    envelope.dispose();
  });

  it('Testing setExp', function () {
    let envelope = new p5.Envelope();
    envelope.setExp(true);
    expect(envelope.isExponential).to.be.equal(true);
    envelope.dispose();
  });

  it('Testing checkExpInput', function () {
    let envelope = new p5.Envelope();
    expect(envelope.checkExpInput(5)).to.be.equal(5);
    expect(envelope.checkExpInput(-5)).to.be.equal(0.00000001);
  });
  it('Testing connect and disconnect function', function (done) {
    p5.prototype.soundFormats('ogg', 'mp3');
    let envelope = new p5.Envelope();
    sf = p5.prototype.loadSound('./testAudio/drum', function () {
      envelope.connect(sf);
      envelope.disconnect();
      setTimeout(function () {
        done();
      }, 100);
    });
  });
});
