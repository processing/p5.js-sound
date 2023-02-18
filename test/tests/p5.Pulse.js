const expect = chai.expect;

describe('p5.Pulse', function () {
  it('can be created without any arguments', function () {
    let pulse = new p5.Pulse();
    expect(pulse.w).to.be.zero;
    expect(pulse.oscillator.type).to.equal('sawtooth');
    expect(pulse.f).to.equal(440);
    expect(pulse.osc2).to.have.property('connection');
    expect(pulse.osc2).to.have.property('oscMods');
    expect(pulse.osc2).to.have.property('oscillator');
    expect(pulse.dcOffset).to.have.property('buffer');
    expect(pulse.dcOffset).to.have.property('channelCount');
    expect(pulse.dcGain).to.have.property('gain');
    expect(pulse.output.gain.value).to.equal(1);
  });
  it('can be with arguments', function () {
    let pulse = new p5.Pulse(220, 0.4);
    expect(pulse.w).to.equal(0.4);
    expect(pulse.f).to.equal(220);
    expect(pulse.dNode.delayTime.value).to.be.approximately(0.0009, 0.00001);
    expect(pulse.dcGain.gain.value).to.be.approximately(0.17, 0.001);
  });
  describe('methods', function () {
    it('can set width', function (done) {
      let pulse = new p5.Pulse();
      pulse.width(0.3);
      expect(pulse.dNode.delayTime.value).to.be.approximately(0.00068, 0.00001);
      expect(pulse.dcGain.gain.value).to.be.approximately(0.34, 0.001);

      //can take non-numerical value
      let osc = new p5.Oscillator();
      pulse.width(osc);
      done();
    });
    it('can be started and stopped', function (done) {
      let pulse = new p5.Pulse(444, 0.1);
      expect(pulse.started).to.be.false;
      pulse.start(221, 0.1);
      setTimeout(() => {
        expect(pulse.oscillator.frequency.value).to.equal(221);
        expect(pulse.oscillator.type).to.equal('sawtooth');
        expect(pulse.osc2.oscillator.type).to.equal('sawtooth');
        done();
      }, 500);
      expect(pulse.started).to.be.true;
      expect(pulse.osc2.started).to.be.true;
      pulse.stop();
      expect(pulse.started).to.be.false;
      expect(pulse.osc2.started).to.be.false;
    });
    it('can set frequency', function () {
      //TODO
    });
  });
});
