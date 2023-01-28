const expect = chai.expect;

describe('p5.Oscillator', function () {
  this.timeout(1000);

  // const osc = new p5.Oscillator();
  // const amp = new p5.Amplitude();

  // after(function () {
  //   osc.dispose();
  // });

  it('can be created and disposed', function (done) {
    let osc = new p5.Oscillator();

    expect(osc.phaseAmount).to.be.undefined;
    expect(osc.oscillator).to.have.property('context');
    expect(osc.oscillator).to.have.property('detune');
    expect(osc.f).to.equal(440);
    expect(osc.oscillator.type).to.equal('sine'); //default value
    expect(osc.output).to.have.property('context');
    expect(osc.output).to.have.property('gain');
    expect(osc._freqMods).to.be.an('array').of.length(0);
    expect(osc.output.gain.value).to.equal(0.5);
    expect(osc.panPosition).to.equal(0);
    expect(osc.connection).to.have.property('context');
    expect(osc.connection).to.have.property('gain');
    expect(osc.panner).to.have.property('input');
    expect(osc.mathOps).to.be.an('array').of.length(1);
    expect(osc.mathOps[0]).to.have.property('context');
    expect(osc.mathOps[0]).to.have.property('gain');

    expect(p5.soundOut.soundArray).to.include(osc);

    setTimeout(() => {
      expect(osc.oscillator.frequency.value).to.equal(440); //default value
      osc.dispose();
      expect(p5.soundOut.soundArray).to.not.include(osc);
      expect(osc.panner).to.be.null;
      expect(osc.oscillator).to.be.null;
      done();
    }, 50);
  });

  it('can be created using one argument', function () {
    //string as an argument
    let osc = new p5.Oscillator('sawtooth');
    expect(osc.f).to.equal(440);
    expect(osc.oscillator.type).to.equal('sawtooth');
    //number as an argument
    let osc2 = new p5.Oscillator(350);
    expect(osc2.f).to.equal(350);
    expect(osc2.oscillator.type).to.equal('sine');
  });
  it('can be created using two arguments', function () {
    //string as an argument
    let osc = new p5.Oscillator(125, 'square');
    expect(osc.f).to.equal(125);
    expect(osc.oscillator.type).to.equal('square');
    //number as an argument
    let osc2 = new p5.Oscillator('triangle', 200);
    expect(osc2.f).to.equal(200);
    expect(osc2.oscillator.type).to.equal('triangle');
  });

  it('can construct different oscillators', function () {
    let osc = new p5.SinOsc(4205);
    expect(osc.f).to.equal(4205);
    expect(osc.oscillator.type).to.equal('sine');

    osc = new p5.TriOsc(2255);
    expect(osc.f).to.equal(2255);
    expect(osc.oscillator.type).to.equal('triangle');

    osc = new p5.SawOsc(2400);
    expect(osc.f).to.equal(2400);
    expect(osc.oscillator.type).to.equal('sawtooth');

    osc = new p5.SqrOsc(-6473);
    expect(osc.f).to.equal(-6473);
    expect(osc.oscillator.type).to.equal('square');
  });

  describe('methods', function () {
    it('can be started', function () {
      let osc = new p5.Oscillator(460);
      osc.start();
      expect(osc.freqNode).to.not.be.undefined;
      expect(osc.freqNode.value).to.equal(460);
      expect(osc.started).to.be.true;

      //with a given frequency
      osc.start(0, 234);
      expect(osc.freqNode.value).to.equal(234);
      //with a delay
      osc.start(0.5, 400);
      expect(osc.freqNode.value).to.equal(400);
    });
    it('can be stopped', function (done) {
      let osc = new p5.Oscillator();
      osc.start();
      osc.stop();
      expect(osc.started).to.be.false;
      //with a delay
      osc.stop(0.5);
      setTimeout(() => {
        expect(osc.started).to.be.false;
        done();
      }, 50);
    });
    it('wont start again before stopping', function (done) {
      let osc = new p5.Oscillator();
      const amp = new p5.Amplitude();
      osc.amp(1);
      osc.start();
      osc.start();
      amp.setInput(osc);
      setTimeout(function () {
        expect(osc.started).to.equal(true);
        expect(amp.volMax).not.equal(0.0);
        osc.stop();
        done();
      }, 5);
    });

    it('can set and get amplitude with no delay or ramp time', function (done) {
      let osc = new p5.Oscillator();
      expect(osc.amp().value).to.equal(0.5); //default value
      osc.amp(0.7);
      setTimeout(() => {
        expect(osc.amp().value).to.be.approximately(0.7, 0.01);
        expect(osc.getAmp()).to.be.approximately(0.7, 0.01);
        expect(osc.output.gain.value).to.be.approximately(0.7, 0.01);
        done();
      }, 50);

      let osc2 = new p5.Oscillator();
      let distortion = new p5.Distortion(1, '4x');
      //audio node
      osc2.amp(distortion);
    });
    it('can set amplitude with a delay/ramp time', function (done) {
      let osc = new p5.Oscillator();
      // no delay
      osc.amp(0.42, 0.1);
      setTimeout(() => {
        expect(osc.getAmp()).to.lessThan(1);
        expect(osc.getAmp()).to.greaterThan(0.42);
        setTimeout(() => {
          expect(osc.getAmp()).to.be.approximately(0.42, 0.01);
        }, 100);
      }, 50);

      // with delay
      osc.amp(0.42, 0.1, 0.1);
      setTimeout(() => {
        expect(osc.getAmp()).to.lessThan(1);
        expect(osc.getAmp()).to.greaterThan(0.42);
        setTimeout(() => {
          expect(osc.getAmp()).to.be.approximately(0.42, 0.01);
          done();
        }, 200);
      }, 50);
    });

    it('can set and get frequency with no delay or ramp time', function (done) {
      let osc = new p5.Oscillator();
      expect(osc.freq().value).to.equal(440); //default value
      osc.freq(2250, 1);
      osc.start();
      setTimeout(() => {
        expect(osc.freq().value).to.be.approximately(2250, 1);
        expect(osc.getFreq()).to.be.approximately(2250, 1);
        expect(osc.oscillator.frequency.value).to.be.approximately(2250, 1);
        done();
      }, 500);
    });
    it('can connect an audio node to the frequency', function () {
      let osc = new p5.Oscillator();
      let distortion = new p5.Distortion(1, '4x');
      //audio node
      osc.freq(distortion);
      osc.freq(distortion.output);
      expect(osc._freqMods.length).to.equal(2);

      osc.start(); //connect every _ferqMod to freq
    });
    it('can set frequency with a delay/ramp time', function () {
      //TODO
    });

    it('can get and set the type of the oscillator', function () {
      let osc = new p5.Oscillator('triangle');
      expect(osc.getType()).to.equal('triangle');
      osc.setType('square');
      expect(osc.getType()).to.equal('square');
    });

    it('can be connected and be disconnected to a node', function () {
      let osc = new p5.Oscillator();
      let distortion = new p5.Distortion(1, '2x');

      osc.connect(); // to p5-sound input
      expect(osc.connection).to.equal(p5.soundOut.input);
      osc.disconnect();

      osc.connect(distortion); // to a unit with input
      expect(osc.connection).to.equal(distortion.input);
      osc.disconnect();

      osc.connect(distortion.input); // to a unit with input
      expect(osc.connection).to.equal(distortion.input);
      osc.disconnect();
    });

    it('can be panned without any delay', function (done) {
      let osc = new p5.Oscillator();
      let panner = osc.panner;
      expect(osc.getPan()).to.equal(0);
      osc.pan(-0.3);
      if (typeof p5.soundOut.audiocontext.createStereoPanner !== 'undefined') {
        setTimeout(() => {
          expect(panner.stereoPanner.pan.value).to.be.approximately(-0.3, 0.01);
          done();
        }, 50);
      } else {
        setTimeout(() => {
          expect(panner.left.gain.value).to.be.approximately(0.522, 0.001);
          expect(panner.right.gain.value).to.be.approximately(0.852, 0.001);
          done();
        }, 50);
      }
    });
    it('can be panned with delay', function (done) {
      let osc = new p5.Oscillator();
      osc.pan(0.7, 0.1);
      let panner = osc.panner;
      if (typeof p5.soundOut.audiocontext.createStereoPanner !== 'undefined') {
        setTimeout(() => {
          expect(panner.stereoPanner.pan.value).to.not.be.approximately(
            0.7,
            0.01
          );
          setTimeout(() => {
            expect(panner.stereoPanner.pan.value).to.be.approximately(
              0.7,
              0.01
            );
            done();
          }, 60);
        }, 50);
      } else {
        setTimeout(() => {
          expect(osc.panner.left.gain.value).to.not.be.approximately(
            0.972,
            0.001
          );
          expect(osc.panner.right.gain.value).to.not.be.approximately(
            0.233,
            0.001
          );
          setTimeout(() => {
            expect(panner.left.gain.value).to.be.approximately(0.972, 0.001);
            expect(panner.right.gain.value).to.be.approximately(0.233, 0.001);
            done();
          }, 60);
        }, 50);
      }
    });

    it('can set the phase of the oscillator', function (done) {
      let osc = new p5.Oscillator();

      expect(osc.dNode).to.be.undefined;
      osc.phase(0.92);
      expect(osc.phaseAmount).to.equal(0.92);
      expect(osc.dNode).to.have.property('context');
      expect(osc.dNode).to.have.property('delayTime');
      setTimeout(() => {
        let value = p5.prototype.map(0.92, 0, 1.0, 0, 1 / osc.f);
        expect(osc.dNode.delayTime.value).to.be.approximately(value, 0.01);
        done();
      }, 50);
    });

    it('can perform math ops', function () {
      let osc = new p5.Oscillator('square');
      osc.disconnect();
      osc.amp(1);
      osc.freq(4);
      osc.start();
      osc.add(3).mult(5).scale(0, 1, 0, 4);
      expect(osc.mathOps).to.be.an('array').of.length(3);
      expect(osc.mathOps[0].toString()).to.include('Add');
      expect(osc.mathOps[0]).to.have.property('value', 3);
      expect(osc.mathOps[1].toString()).to.include('Mult');
      expect(osc.mathOps[1]).to.have.property('value', 5);
      expect(osc.mathOps[2].toString()).to.include('Scale');
      expect(osc.mathOps[2]).to.have.property('min', 0);
      expect(osc.mathOps[2]).to.have.property('max', 4);
      osc.scale(-0.5, 1.5, 2, 6).mult(6).add(4);
      expect(osc.mathOps).to.be.an('array').of.length(3);
      expect(osc.mathOps[0].toString()).to.include('Add');
      expect(osc.mathOps[0]).to.have.property('value', 4);
      expect(osc.mathOps[1].toString()).to.include('Mult');
      expect(osc.mathOps[1]).to.have.property('value', 6);
      expect(osc.mathOps[2].toString()).to.include('Scale');
      expect(osc.mathOps[2]).to.have.property('min', 3);
      expect(osc.mathOps[2]).to.have.property('max', 5);
      // TODO: Assert using the name property rather than using toString
      // after upgrading Tone.js.
    });

    it('can execute _onNewInput() hook on connected unit', function (done) {
      let osc = new p5.Oscillator();
      const gain = new p5.Gain();
      gain._onNewInput = function () {
        done();
      };
      osc.connect(gain);
    });
  });
});
