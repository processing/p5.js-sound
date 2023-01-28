const expect = chai.expect;

describe('p5.MonoSynth', function () {
  it('can be created and disposed', function () {
    const monoSynth = new p5.MonoSynth();

    expect(monoSynth.oscillator).to.have.property('oscillator');
    expect(monoSynth.oscillator).to.have.property('panner');
    expect(monoSynth.env).to.have.property('control');

    expect(monoSynth.env.aLevel).to.equal(1);
    expect(monoSynth.env.rLevel).to.equal(0);
    expect(monoSynth.env.isExponential).to.be.true;
    expect(monoSynth.oscillator.output.gain.value).to.equal(1);
    expect(p5.soundOut.soundArray).to.include(monoSynth);

    monoSynth.dispose();
    expect(monoSynth).to.not.have.property('output');
    expect(monoSynth.oscillator.oscillator).to.be.null;
    expect(monoSynth.oscillator.panner).to.be.null;
    expect(monoSynth.env.control).to.be.null;
  });

  describe('getters and setters', function () {
    it('can get and set attack time', function () {
      let monosynth = new p5.MonoSynth();

      //default value
      expect(monosynth.attack).to.equal(0.02);
      monosynth.attack = 0.2;
      expect(monosynth.env.aTime).to.equal(0.2);
      expect(monosynth.attack).to.equal(0.2);
    });
    it('can get and set decay time', function () {
      let monosynth = new p5.MonoSynth();

      //default value
      expect(monosynth.decay).to.equal(0.25);
      monosynth.decay = 0.6;
      expect(monosynth.env.dTime).to.equal(0.6);
      expect(monosynth.decay).to.equal(0.6);
    });
    it('can get and set sustain value', function () {
      let monosynth = new p5.MonoSynth();

      //default value
      expect(monosynth.sustain).to.equal(0.05);
      monosynth.sustain = 0.43;
      expect(monosynth.env.sPercent).to.equal(0.43);
      expect(monosynth.sustain).to.equal(0.43);
    });
    it('can get and set release time', function () {
      let monosynth = new p5.MonoSynth();

      //default value
      expect(monosynth.release).to.equal(0.35);
      monosynth.release = 0.7;
      expect(monosynth.env.rTime).to.equal(0.7);
      expect(monosynth.release).to.equal(0.7);
    });
  });

  describe('methods', function () {
    it('can trigger an attack at the present moment', function (done) {
      let monosynth = new p5.MonoSynth();
      let osc = monosynth.oscillator.oscillator;
      //only note
      monosynth.triggerAttack('C4');
      setTimeout(() => {
        expect(osc.frequency.value).to.be.approximately(261.63, 0.01);
        expect(monosynth.env.control.value).to.be.approximately(0.1, 0.01); // default value
        done();
      }, 50);
    });
    it('can trigger an attack few seconds from the present moment', function (done) {
      let monosynth = new p5.MonoSynth();
      let osc = monosynth.oscillator.oscillator;
      monosynth.triggerAttack('D2', 0.34, 0.1);
      setTimeout(() => {
        expect(osc.frequency.value).to.be.approximately(440, 0.1); // default value
        expect(monosynth.env.control.value).to.be.approximately(0, 0.01); // default value
        setTimeout(() => {
          expect(osc.frequency.value).to.be.approximately(73.42, 0.01);
          expect(monosynth.env.control.value).to.be.approximately(0.34, 0.01);
          done();
        }, 100);
      }, 50);
    });

    it('can trigger a release at the present moment', function (done) {
      let monosynth = new p5.MonoSynth();
      monosynth.triggerRelease();
      setTimeout(() => {
        expect(monosynth.env.control.value).to.be.approximately(0, 0.01);
        done();
      }, 50);
    });
    it('can trigger a release few seconds from the present moment', function (done) {
      let monosynth = new p5.MonoSynth();
      monosynth.triggerAttack('A4', 0.4);
      monosynth.triggerRelease(0.1);
      setTimeout(() => {
        expect(monosynth.env.control.value).to.be.approximately(0.4, 0.01);

        setTimeout(() => {
          expect(monosynth.env.control.value).to.be.lessThan(0.4);
          done();
        }, 150);
      }, 50);
    });

    it('can play a note at the present moment', function (done) {
      let monosynth = new p5.MonoSynth();
      let osc = monosynth.oscillator.oscillator;
      let control = monosynth.env.control;
      monosynth.play('B2', 0.54);
      setTimeout(() => {
        expect(osc.frequency.value).to.be.approximately(123.47, 0.01);
        expect(control.value).to.be.approximately(0.54, 0.01);
        setTimeout(() => {
          expect(control.value).to.be.lessThan(0.54);
          done(); // default sus time : 0.15
        }, 150);
      }, 50);
    });

    it('can play a note at a few seconds from the present moment ', function (done) {
      let monosynth = new p5.MonoSynth();
      let osc = monosynth.oscillator.oscillator;
      let control = monosynth.env.control;
      monosynth.play('F3', 0.93, 1, 0.1);
      setTimeout(() => {
        expect(osc.frequency.value).to.be.approximately(440, 0.1); // default value
        expect(control.value).to.be.approximately(0, 0.01); // default value
        setTimeout(() => {
          expect(osc.frequency.value).to.be.approximately(174.61, 0.01);
          expect(control.value).to.be.approximately(0.93, 0.01);
          setTimeout(() => {
            expect(control.value).to.be.lessThan(0.93);
            done();
          }, 100);
        }, 1000);
      }, 50);
    });

    it('can setADSR to set ADSR values', function () {
      let monosynth = new p5.MonoSynth();

      //only one argument
      monosynth.setADSR(0.5);
      expect(monosynth.env.aTime).to.equal(0.5);
      expect(monosynth.env.dTime).to.equal(0);
      expect(monosynth.env.sPercent).to.equal(0);
      expect(monosynth.env.dLevel).to.equal(0);

      monosynth.env.set(1, 0.6, 0.5, 0.53, 0.45, 0.5);
      //using all arguments
      monosynth.setADSR(0.54, 0.32, 0.65, 0.74);
      expect(monosynth.env.aTime).to.equal(0.54);
      expect(monosynth.env.dTime).to.equal(0.32);
      expect(monosynth.env.sPercent).to.equal(0.65);
      expect(monosynth.env.dLevel).to.equal(0.565);
    });

    it('can setType and getType of oscillator', function () {
      let monosynth = new p5.MonoSynth();
      //defaults to sine
      expect(monosynth.getType()).to.equal('sine');
      monosynth.setType('square');
      expect(monosynth.getType()).to.equal('square');
    });

    it("can use amp to get and set osc's amp value", function (done) {
      let monosynth = new p5.MonoSynth();

      expect(monosynth.amp()).to.equal(1);
      //no ramp time
      monosynth.amp(0.62);
      setTimeout(() => {
        expect(monosynth.amp()).to.be.approximately(0.62, 0.01);
        expect(monosynth.oscillator.amp().value).to.be.approximately(
          0.62,
          0.01
        );
      }, 50);

      let monosynth2 = new p5.MonoSynth();
      //ramp time
      monosynth2.amp(0.87, 0.1);
      setTimeout(() => {
        expect(monosynth2.amp()).to.not.be.approximately(0.87, 0.01);
        setTimeout(() => {
          expect(monosynth2.amp()).to.be.approximately(0.87, 0.01);
          done();
        }, 100);
      }, 10);
    });

    it('can be connected to an audio node or to p5-sound input', function () {
      let monosynth = new p5.MonoSynth();
      let compressor = new p5.Compressor();

      // to p5-sound input
      monosynth.connect();
      monosynth.disconnect();
      //to an audio node
      monosynth.connect(compressor);
      monosynth.disconnect();
    });
    it('can execute _onNewInput() hook on connected unit', function (done) {
      let monosynth = new p5.MonoSynth();
      const gain = new p5.Gain();
      gain._onNewInput = function () {
        done();
      };
      monosynth.connect(gain);
    });
  });
});
