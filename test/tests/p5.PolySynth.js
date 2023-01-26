const expect = chai.expect;

describe('p5.PolySynth', function () {
  const audioContext = p5.prototype.getAudioContext();

  it('can be created and disposed', function () {
    const polySynth = new p5.PolySynth();

    expect(polySynth.audiovoices).to.be.an('array').of.length(8); //default maxVoices
    expect(polySynth.notes).to.be.an('object').to.deep.equal({});
    expect(polySynth._newest).to.equal(0);
    expect(polySynth._oldest).to.equal(0);
    expect(polySynth.maxVoices).to.equal(8);
    expect(polySynth.AudioVoice).to.equal(p5.MonoSynth);
    expect(polySynth._voicesInUse).to.have.property('input');
    expect(polySynth._voicesInUse).to.have.property('_events');
    expect(polySynth.output).to.have.property('gain');
    expect(polySynth.output).to.have.property('context');
    expect(p5.soundOut.soundArray).to.include(polySynth);

    polySynth.dispose();
    expect(polySynth).to.not.have.property('output');

    for (let i = 0; i < polySynth.audiovoices.length; i++) {
      const monoSynth = polySynth.audiovoices[i];
      expect(monoSynth).to.not.have.property('output');
      expect(monoSynth.oscillator.oscillator).to.be.null;
      expect(monoSynth.oscillator.panner).to.be.null;
      expect(monoSynth.env.control).to.be.null;
    }
  });

  it('can be created with params', function () {
    const polySynth = new p5.PolySynth(p5.MonoSynth, 3);
    expect(polySynth.maxVoices).to.equal(3);
    polySynth.dispose();
    for (let i = 0; i < 3; i++) {
      const monoSynth = polySynth.audiovoices[i];
      expect(monoSynth).to.not.have.property('output');
      expect(monoSynth.oscillator.oscillator).to.be.null;
      expect(monoSynth.oscillator.panner).to.be.null;
      expect(monoSynth.env.control).to.be.null;
    }
  });

  describe('methods', function () {
    it('can allocate voices', function () {
      let polySynth = new p5.PolySynth(p5.MonoSynth, 6);
      polySynth.audiovoices = [];
      expect(polySynth.audiovoices.length).to.equal(0);
      polySynth._allocateVoices();
      expect(polySynth.audiovoices.length).to.equal(6);
      for (let i = 0; i < 6; i++) {
        const monoSynth = polySynth.audiovoices[i];
        expect(monoSynth.oscillator).to.have.property('oscillator');
        expect(monoSynth.oscillator).to.have.property('panner');
        expect(monoSynth.env).to.have.property('control');
      }
    });

    it('can trigger a note attack at the present moment with only one argument', function (done) {
      let polySynth = new p5.PolySynth(p5.MonoSynth, 3);
      polySynth.noteAttack('G3');
      expect(Object.keys(polySynth.notes).length).to.equal(1);
      expect(
        polySynth._voicesInUse.getValueAtTime(audioContext.currentTime)
      ).to.equal(1);
      expect(polySynth._newest).to.equal(0);
      const osc = polySynth.audiovoices[0].oscillator.oscillator;
      const monoSynth = polySynth.audiovoices[0];
      setTimeout(() => {
        expect(osc.frequency.value).to.be.approximately(195.99, 0.01);
        expect(monoSynth.env.control.value).to.be.approximately(0.1, 0.01); // default value
        done();
      }, 50);
    });
    it('can trigger a note attack with a velocity', function (done) {
      let polySynth = new p5.PolySynth(p5.MonoSynth, 3);
      polySynth.noteAttack('A2', 0.2);
      const osc = polySynth.audiovoices[0].oscillator.oscillator;
      const monoSynth = polySynth.audiovoices[0];
      setTimeout(() => {
        expect(osc.frequency.value).to.be.approximately(110, 0.01);
        expect(monoSynth.env.control.value).to.be.approximately(0.2, 0.01);
        done();
      }, 50);
    });
    it('can trigger a note attack with a delay', function (done) {
      let polySynth = new p5.PolySynth(p5.MonoSynth, 3);
      polySynth.noteAttack('C1', 0.82, 0.1);
      const osc = polySynth.audiovoices[0].oscillator.oscillator;
      const monoSynth = polySynth.audiovoices[0];
      setTimeout(() => {
        expect(osc.frequency.value).to.be.approximately(440, 0.01);
        expect(monoSynth.env.control.value).to.be.approximately(0, 0.01);
        setTimeout(() => {
          expect(osc.frequency.value).to.be.approximately(32.7, 0.01);
          expect(monoSynth.env.control.value).to.be.approximately(0.82, 0.01);
          done();
        }, 100);
      }, 50);
    });
    it('can limit the velocity of a note attack to the maximum range', function (done) {
      let polySynth = new p5.PolySynth(p5.MonoSynth, 5);
      polySynth.noteAttack('C1', 0.14);
      polySynth.noteAttack('C2', 0.24);
      polySynth.noteAttack('C3', 0.7); //max is (1/3) *2 = 0.67
      polySynth.noteAttack('C4', 0.74); //max is (1/4) *2 = 0.5
      let monoSynths = polySynth.audiovoices;
      setTimeout(() => {
        expect(monoSynths[0].env.control.value).to.be.approximately(0.14, 0.01);
        expect(monoSynths[1].env.control.value).to.be.approximately(0.24, 0.01);
        expect(monoSynths[2].env.control.value).to.be.approximately(0.67, 0.01);
        expect(monoSynths[3].env.control.value).to.be.approximately(0.5, 0.01);
        done();
      }, 50);
    });
    it('can replace the oldest note if maxVoices is exceeded', function (done) {
      let polySynth = new p5.PolySynth(p5.MonoSynth, 3);
      polySynth.noteAttack('A1', 0.18); // A1:55
      expect(polySynth._newest).to.equal(0);
      polySynth.noteAttack('A2', 0.28); // A2:110
      expect(polySynth._newest).to.equal(1);
      polySynth.noteAttack('A3', 0.38); // A3:220
      expect(polySynth._oldest).to.equal(0);
      expect(polySynth._newest).to.equal(2);
      setTimeout(() => {
        polySynth.noteAttack('A4', 0.48); // A4:440
        expect(polySynth._oldest).to.equal(1);
        expect(polySynth._newest).to.equal(0);
      }, 100);
      let monoSynths = polySynth.audiovoices;
      let osc = monoSynths.map((mono) => mono.oscillator.oscillator);
      setTimeout(() => {
        expect(osc[0].frequency.value).to.be.approximately(440, 0.01);
        expect(monoSynths[0].env.control.value).to.be.approximately(0.48, 0.01);
        expect(osc[1].frequency.value).to.be.approximately(110, 0.01);
        expect(monoSynths[1].env.control.value).to.be.approximately(0.28, 0.01);
        expect(osc[2].frequency.value).to.be.approximately(220, 0.01);
        expect(monoSynths[2].env.control.value).to.be.approximately(0.38, 0.01);
        done();
      }, 150);
    });

    it('can trigger a note release at the present moment ', function () {
      let polySynth = new p5.PolySynth(p5.MonoSynth, 3);
      polySynth.noteAttack('B2');
      polySynth.noteAttack('B3');
      expect(polySynth._newest).to.equal(1);
      polySynth.noteRelease('B3');
      expect(
        polySynth._voicesInUse.getValueAtTime(audioContext.currentTime)
      ).to.equal(1);
      expect(polySynth._newest).to.equal(0);
      expect(polySynth.notes).to.have.key(
        p5.prototype.noteToFreq('B2').toString()
      );
      expect(polySynth.notes).to.not.have.key(
        p5.prototype.noteToFreq('B3').toString()
      );
    });
    it('can trigger a note release with a delay', function () {
      let polySynth = new p5.PolySynth(p5.MonoSynth, 3);
      polySynth.noteAttack('B2');
      polySynth.noteAttack('B3');
      expect(polySynth._newest).to.equal(1);
      polySynth.noteRelease('B3', 0.1);
      expect(
        polySynth._voicesInUse.getValueAtTime(audioContext.currentTime)
      ).to.equal(2);
      expect(polySynth.notes).to.not.have.key(
        p5.prototype.noteToFreq('B3').toString()
      );
      setTimeout(() => {
        expect(
          polySynth._voicesInUse.getValueAtTime(audioContext.currentTime)
        ).to.equal(1);
      }, 100);
    });
    it('can trigger all notes to relase', function () {
      let polySynth = new p5.PolySynth(p5.MonoSynth, 3);
      polySynth.noteAttack('D1');
      polySynth.noteAttack('D2');
      polySynth.noteAttack('D3');
      expect(
        polySynth._voicesInUse.getValueAtTime(audioContext.currentTime)
      ).to.equal(3);
      polySynth.noteRelease();
      expect(
        polySynth._voicesInUse.getValueAtTime(audioContext.currentTime)
      ).to.equal(0);
      expect(Object.keys(polySynth.notes).length).to.equal(0);
      expect(polySynth._newest).to.equal(0);
      expect(polySynth._oldest).to.equal(0);
    });

    it('can trigger a relase if attack is called on a playing note', function () {
      let polySynth = new p5.PolySynth(p5.MonoSynth, 3);
      polySynth.noteAttack('G1');
      polySynth.noteAttack('G2');
      polySynth.noteAttack('G1'); // relase and then attack is performed
      expect(
        polySynth._voicesInUse.getValueAtTime(audioContext.currentTime)
      ).to.equal(2);
    });

    it('can play a note', function () {
      let polySynth = new p5.PolySynth();
      polySynth.play('A2');
      expect(
        polySynth._voicesInUse.getValueAtTime(audioContext.currentTime)
      ).to.equal(1); //default susTime =1
    });
    it('can play a note with a delay', function (done) {
      let polySynth = new p5.PolySynth();
      polySynth.play('B0', 0.41, 0.1);
      expect(
        polySynth._voicesInUse.getValueAtTime(audioContext.currentTime)
      ).to.equal(0);
      const osc = polySynth.audiovoices[0].oscillator.oscillator;
      const monoSynth = polySynth.audiovoices[0];
      setTimeout(() => {
        expect(
          polySynth._voicesInUse.getValueAtTime(audioContext.currentTime)
        ).to.equal(1);
        expect(osc.frequency.value).to.be.approximately(30.86, 0.01);
        expect(monoSynth.env.control.value).to.be.approximately(0.41, 0.01);
        done();
      }, 150);
    });
    it('can play a note with duration', function () {
      const polySynth = new p5.PolySynth();
      const noteDuration = 0.01;

      const getTriggerTime = () => audioContext.currentTime;
      const getActiveTime = () => getTriggerTime() + noteDuration / 2;
      const getDoneTime = () => getTriggerTime() + noteDuration;

      expect(polySynth._voicesInUse.getValueAtTime(getTriggerTime())).to.equal(
        0
      );

      polySynth.play('A2', 0, 0, noteDuration);
      expect(polySynth._voicesInUse.getValueAtTime(getActiveTime())).to.equal(
        1
      );
      polySynth.play('A3', 0, 0, noteDuration);
      expect(polySynth._voicesInUse.getValueAtTime(getActiveTime())).to.equal(
        2
      );
      polySynth.play('A4', 0, 0, noteDuration);
      expect(polySynth._voicesInUse.getValueAtTime(getActiveTime())).to.equal(
        3
      );

      expect(polySynth._voicesInUse.getValueAtTime(getDoneTime())).to.equal(0);

      polySynth.dispose();
    });

    it('can set a note ADSR of a voice', function () {
      let polySynth = new p5.PolySynth(p5.MonoSynth, 4);
      polySynth.noteAttack('C0');
      let note = p5.prototype.noteToFreq('C0');
      polySynth.noteADSR(note, 0.43, 0.51, 0.35, 0.84);
      const monoSynth = polySynth.audiovoices[0];
      expect(monoSynth.env.aTime).to.equal(0.43);
      expect(monoSynth.env.dTime).to.equal(0.51);
      expect(monoSynth.env.sPercent).to.equal(0.35);
      expect(monoSynth.env.rTime).to.equal(0.84);
      expect(monoSynth.env.dLevel).to.equal(0.35);
    });
    it('can set ADSR of envelopes of all voices', function () {
      let polySynth = new p5.PolySynth(p5.MonoSynth, 4);
      polySynth.setADSR(0.14, 0.25, 0.65, 0.94);
      for (let i = 0; i < 4; i++) {
        const monoSynth = polySynth.audiovoices[i];
        expect(monoSynth.env.aTime).to.equal(0.14);
        expect(monoSynth.env.dTime).to.equal(0.25);
        expect(monoSynth.env.sPercent).to.equal(0.65);
        expect(monoSynth.env.rTime).to.equal(0.94);
        expect(monoSynth.env.dLevel).to.equal(0.65);
      }
    });

    it('can be connected and disconnected from an audio node', function () {
      let polySynth = new p5.PolySynth(p5.MonoSynth, 4);
      let compressor = new p5.Compressor();
      //p5-sound input
      polySynth.connect();
      polySynth.disconnect();

      //to a audio node
      polySynth.connect(compressor);
      polySynth.disconnect();
    });
    it('can execute _onNewInput() hook on connected unit', function (done) {
      let polySynth = new p5.PolySynth(p5.MonoSynth, 4);
      const gain = new p5.Gain();
      gain._onNewInput = function () {
        done();
      };
      polySynth.connect(gain);
    });
  });
});
