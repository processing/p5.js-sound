const expect = chai.expect;

describe('p5.Envelope', function () {
  it('can be created and disposed without any arguments', function () {
    let envelope = new p5.Envelope();
    expect(envelope.aTime).to.equal(0.1);
    expect(envelope.aLevel).to.equal(1);
    expect(envelope.dTime).to.equal(0.5);
    expect(envelope.dLevel).to.be.zero;
    expect(envelope.rTime).to.be.zero;
    expect(envelope.rLevel).to.be.zero;
    expect(envelope._rampHighPercentage).to.equal(0.98);
    expect(envelope._rampLowPercentage).to.equal(0.02);
    expect(envelope.isExponential).to.be.false;
    expect(envelope.wasTriggered).to.be.false;
    expect(envelope).to.have.property('control').to.not.be.null;

    envelope.dispose();
    expect(envelope.control).to.be.null;
  });
  describe('methods', function () {
    it('can be initialized', function () {
      let envelope = new p5.Envelope();
      envelope._init();
      expect(envelope.control.value).to.equal(0.00001);

      // to ensure that _setRampAD is being called
      expect(envelope).to.have.property('_rampAttackTC').to.not.be.zero;
      expect(envelope).to.have.property('_rampDecayTC').to.not.be.zero;
    });
    it('can reset envelope using set function', function () {
      let envelope = new p5.Envelope();
      envelope.set(0.2, 0.15);
      expect(envelope.aTime).to.equal(0.2);
      expect(envelope.aLevel).to.equal(0.15);
      envelope.set(0.9, 0.8, 0.7, 0.6, 0.5, 0.4);
      expect(envelope.aTime).to.equal(0.9);
      expect(envelope.aLevel).to.equal(0.8);
      expect(envelope.dTime).to.equal(0.7);
      expect(envelope.dLevel).to.equal(0.6);
      expect(envelope.rTime).to.equal(0.5);
      expect(envelope.rLevel).to.equal(0.4);

      // to ensure that _setRampAD is being called
      expect(envelope).to.have.property('_rampAttackTC').to.not.be.zero;
      expect(envelope).to.have.property('_rampDecayTC').to.not.be.zero;
    });
    it('can use setADSR to set like a traditional ADSR envelope', function () {
      let envelope = new p5.Envelope();
      //only one argument
      envelope.setADSR(0.75);
      expect(envelope.aTime).to.equal(0.75);
      expect(envelope.dTime).to.equal(0);
      expect(envelope.sPercent).to.equal(0);
      expect(envelope.dLevel).to.equal(0);

      envelope.set(1, 0.8, 0.75, 0.3, 0.25, 0.45);
      //using all arguments
      envelope.setADSR(0.5, 0.2, 0.45, 0.7);
      expect(envelope.aTime).to.equal(0.5);
      expect(envelope.dTime).to.equal(0.2);
      expect(envelope.sPercent).to.equal(0.45);
      expect(envelope.dLevel).to.equal(0.6075);

      // to ensure that _setRampAD is being called
      expect(envelope).to.have.property('_rampAttackTC').to.not.be.zero;
      expect(envelope).to.have.property('_rampDecayTC').to.not.be.zero;
    });
    it('can set the range of an envelope using setRange', function () {
      let envelope = new p5.Envelope();
      //no arguments
      envelope.setRange();
      expect(envelope.aLevel).to.equal(1);
      expect(envelope.rLevel).to.equal(0);
      //two arguments
      envelope.setRange(0.75, 0.25);
      expect(envelope.aLevel).to.equal(0.75);
      expect(envelope.rLevel).to.equal(0.25);
    });
    it('can set time constants for ramp using _setRampAD', function () {
      let envelope = new p5.Envelope();
      envelope._setRampAD(0.85, 0.65);
      expect(envelope._rampAttackTime).to.equal(0.85);
      expect(envelope._rampDecayTime).to.equal(0.65);
      expect(envelope._rampAttackTC).to.be.approximately(0.21727, 0.00001);
      expect(envelope._rampDecayTC).to.be.approximately(0.16615, 0.00001);
    });
    it('can set time constants for ramp using setRampPercentages', function () {
      let envelope = new p5.Envelope();
      envelope._setRampAD(0.85, 0.65);
      expect(envelope._rampAttackTime).to.equal(0.85);
      expect(envelope._rampDecayTime).to.equal(0.65);

      envelope.setRampPercentages(0.8, 0.2);
      expect(envelope._rampAttackTC).to.be.approximately(0.52813, 0.00001);
      expect(envelope._rampDecayTC).to.be.approximately(0.40386, 0.00001);

      envelope.setRampPercentages(0.99, 0.01);
      expect(envelope._rampAttackTC).to.be.approximately(0.18457, 0.00001);
      expect(envelope._rampDecayTC).to.be.approximately(0.14114, 0.00001);
    });
    it('can set a single or multiple inputs', function () {
      let envelope = new p5.Envelope();
      let osc1 = new p5.Oscillator();
      let osc2 = new p5.Oscillator();
      envelope.setInput(osc1);

      envelope = new p5.Envelope();
      envelope.setInput(osc1, osc2);
    });
    it('can set ramp to be linear or exponential', function () {
      let envelope = new p5.Envelope();
      expect(envelope.isExponential).to.be.false;
      envelope.setExp(true);
      expect(envelope.isExponential).to.be.true;
      envelope.setExp(false);
      expect(envelope.isExponential).to.be.false;
    });
    it('checkExpInput can be used to protect against zero values', function () {
      let envelope = new p5.Envelope();
      expect(envelope.checkExpInput(0)).to.be.zero;
      expect(envelope.checkExpInput(-1.234)).to.be.zero;
      expect(envelope.checkExpInput(-100)).to.be.zero;
      expect(envelope.checkExpInput(10)).to.equal(10);
    });
    it('can trigger an attack at the present moment', function () {
      let envelope = new p5.Envelope(0.65, 0.75, 0.85, 0.55, 0.95, 0.9);
      let osc = new p5.SinOsc();
      let now = p5.prototype.getAudioContext().currentTime;
      envelope.triggerAttack(osc);
      expect(envelope.lastAttack).to.not.be.zero;
      expect(envelope.wasTriggered).to.be.true;

      expect(envelope.control.getValueAtTime(now + 0.65)).to.equal(0.75);

      expect(envelope.control.getValueAtTime(now + 1.5)).to.equal(0.55);

      expect(envelope.control.getValueAtTime(now + 0.5)).to.not.be.zero;
      expect(envelope.control.getValueAtTime(now + 0.5)).to.be.below(0.75);
      expect(envelope.control.getValueAtTime(now + 1)).to.be.above(0.55);
      expect(envelope.control.getValueAtTime(now + 1)).to.be.below(0.75);
      expect(envelope.control.getValueAtTime(now + 2)).to.equal(0.55);
    });
    it('can trigger an attack few seconds from the present moment', function () {
      let envelope = new p5.Envelope(0.65, 0.75, 0.85, 0.55, 0.95, 0.9);
      let osc = new p5.SinOsc();
      let now = p5.prototype.getAudioContext().currentTime;
      envelope.setExp(true);
      envelope.triggerAttack(osc, 0.3);

      expect(envelope.control.getValueAtTime(now + 0.1)).to.equal(0.00001); // from checkExpInput

      expect(envelope.control.getValueAtTime(now + 0.95)).to.be.approximately(
        0.75,
        0.001
      );

      expect(envelope.control.getValueAtTime(now + 1.8)).to.be.approximately(
        0.55,
        0.001
      );

      expect(envelope.control.getValueAtTime(now + 0.5)).to.be.above(0.00001);
      expect(envelope.control.getValueAtTime(now + 0.5)).to.be.below(0.75);
      expect(envelope.control.getValueAtTime(now + 1.3)).to.be.above(0.55);
      expect(envelope.control.getValueAtTime(now + 1.3)).to.be.below(0.75);
      expect(envelope.control.getValueAtTime(now + 2)).to.equal(0.55);
    });
    it('can return if trigger is released before the attack', function () {
      let envelope = new p5.Envelope(0.85, 0.75, 0.65, 0.55, 0.45, 0.8);
      let osc = new p5.SinOsc();
      let now = p5.prototype.getAudioContext().currentTime;
      envelope.triggerRelease(osc, 0);

      expect(envelope.control.getValueAtTime(now + 0.45)).to.equal(0.00001);
    });
    it('can trigger a release at the present moment', function () {
      let envelope = new p5.Envelope(0.65, 0.75, 0.85, 0.55, 0.95, 0.9);
      let osc = new p5.SinOsc();
      let now = p5.prototype.getAudioContext().currentTime;
      envelope.triggerAttack(osc);
      envelope.triggerRelease(osc);
      expect(envelope.wasTriggered).to.be.false;

      expect(envelope.control.getValueAtTime(now + 0.95)).to.equal(0.9);

      expect(envelope.control.getValueAtTime(now + 0.5)).to.not.be.zero;
      expect(envelope.control.getValueAtTime(now + 1)).to.equal(0.9);
    });
    it('can trigger a release few seconds from the present moment', function () {
      let envelope = new p5.Envelope(0.65, 0.75, 0.85, 0.55, 0.95, 0.9);
      let osc = new p5.SinOsc();
      let now = p5.prototype.getAudioContext().currentTime;
      envelope.setExp(true);
      envelope.triggerAttack(osc);
      envelope.triggerRelease(osc, 0.4);

      expect(envelope.control.getValueAtTime(now + 1.35)).to.be.approximately(
        0.9,
        0.001
      );

      expect(envelope.control.getValueAtTime(now + 1)).to.be.above(0);
      expect(envelope.control.getValueAtTime(now + 1)).to.be.below(0.9);
      expect(envelope.control.getValueAtTime(now + 1.5)).to.equal(0.9);
    });
    it('can be played on an input without any delay', function () {
      let envelope = new p5.Envelope(0.1, 0.65, 0.5, 0.5, 0.35, 0.4);
      let osc = new p5.SinOsc();
      let now = p5.prototype.getAudioContext().currentTime;
      envelope.play(osc);

      expect(envelope.control.getValueAtTime(now + 0.1)).to.equal(0.65);

      expect(envelope.control.getValueAtTime(now + 0.6)).to.equal(0.5);

      expect(envelope.control.getValueAtTime(now + 0.95)).to.equal(0.4);

      expect(envelope.control.getValueAtTime(now + 0.05)).to.not.be.zero;
      expect(envelope.control.getValueAtTime(now + 0.05)).to.be.below(0.65);
      expect(envelope.control.getValueAtTime(now + 0.4)).to.be.above(0.5);
      expect(envelope.control.getValueAtTime(now + 0.4)).to.be.below(0.65);
      expect(envelope.control.getValueAtTime(now + 0.8)).to.above(0.4);
      expect(envelope.control.getValueAtTime(now + 0.8)).to.below(0.5);
      expect(envelope.control.getValueAtTime(now + 1)).to.equal(0.4);
    });
    it('can be played on an input with delay', function () {
      let envelope = new p5.Envelope(0.1, 0.65, 0.5, 0.5, 0.35, 0.4);
      let osc = new p5.SinOsc();
      let now = p5.prototype.getAudioContext().currentTime;
      envelope.play(osc, 0.6);

      expect(envelope.control.getValueAtTime(now + 0.7)).to.be.approximately(
        0.65,
        0.001
      );

      expect(envelope.control.getValueAtTime(now + 1.2)).to.be.approximately(
        0.5,
        0.001
      );

      expect(envelope.control.getValueAtTime(now + 1.55)).to.be.approximately(
        0.4,
        0.001
      );

      expect(envelope.control.getValueAtTime(now + 0.5)).to.not.be.zero;
      expect(envelope.control.getValueAtTime(now + 0.5)).to.be.below(0.65);
      expect(envelope.control.getValueAtTime(now + 1)).to.be.above(0.5);
      expect(envelope.control.getValueAtTime(now + 1)).to.be.below(0.65);
      expect(envelope.control.getValueAtTime(now + 1.4)).to.above(0.4);
      expect(envelope.control.getValueAtTime(now + 1.4)).to.below(0.5);
      expect(envelope.control.getValueAtTime(now + 1.75)).to.equal(0.4);
    });
    it('can ramp to one/two value', function () {
      //todo
    });
    it('can be connected and disconnected', function () {
      let envelope = new p5.Envelope(0.1, 0.65, 0.5, 0.5, 0.35, 0.4);
      let reverb = new p5.Reverb();
      envelope.connect(reverb);
      envelope.disconnect();
      envelope.connect(reverb.output.gain);
      envelope.disconnect();
    });
    it('can execute _onNewInput() hook on connected unit', function (done) {
      let envelope = new p5.Envelope(0.1, 0.65, 0.5, 0.5, 0.35, 0.4);
      const gain = new p5.Gain();
      gain._onNewInput = function () {
        done();
      };
      envelope.connect(gain);
    });

    //todo: signal math
  });
});
