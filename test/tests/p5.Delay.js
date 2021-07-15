const expect = chai.expect;

describe('p5.Delay', function () {
  let noise = new p5.Noise();
  it('can be created', function (done) {
    let delay = new p5.Delay();

    expect(delay._split).to.have.property('channelCount');
    expect(delay._split).to.have.property('context');
    expect(delay._merge).to.have.property('channelCount');
    expect(delay._merge).to.have.property('context');
    expect(delay._split.channelCount).to.equal(2);
    expect(delay._merge.channelCount).to.equal(1);

    expect(delay._leftGain).to.have.property('gain');
    expect(delay._rightGain).to.have.property('gain');

    expect(delay.leftDelay).to.have.property('context');
    expect(delay.leftDelay).to.have.property('delayTime');
    expect(delay.rightDelay).to.have.property('context');
    expect(delay.rightDelay).to.have.property('delayTime');

    expect(delay._maxDelay).to.equal(delay.leftDelay.delayTime.maxValue);

    setTimeout(() => {
      let leftBiquad = delay._leftFilter.biquad;
      let rightBiquad = delay._rightFilter.biquad;
      expect(leftBiquad.frequency.value).to.be.approximately(1200, 1);
      expect(rightBiquad.frequency.value).to.be.approximately(1200, 1);
      expect(leftBiquad.Q.value).to.be.approximately(0.3, 0.01);
      expect(rightBiquad.Q.value).to.be.approximately(0.3, 0.01);
      expect(leftBiquad.gain.value).to.be.approximately(1, 0.01);
      expect(rightBiquad.gain.value).to.be.approximately(1, 0.01);

      done();
    }, 50);
  });

  describe('methods', function () {
    it('drywet value can be changed', function () {
      const effect = new p5.Effect();
      expect(effect.drywet(0.5)).to.equal(0.5);
    });

    describe('process', function () {
      it('can process a source without any properties', function () {
        let delay = new p5.Delay();
        delay.process(noise);
      });

      it('can add delay to an audio signal with only delay as a parameter', function (done) {
        let delay = new p5.Delay();
        delay.process(noise, 0.45);
        setTimeout(() => {
          expect(delay.leftDelay.delayTime.value).to.be.approximately(
            0.45,
            0.01
          );
          expect(delay.rightDelay.delayTime.value).to.be.approximately(
            0.45,
            0.01
          );
          done();
        }, 50);
      });
      it('can rejcet a delay greater than the maximum delay', function () {
        let delay = new p5.Delay();
        let delayTime = delay._maxDelay + 0.01;
        expect(() => delay.process(noise, delayTime)).to.throw();
      });

      it('can add feedback to an audio signal with only feedback as a parameter', function () {
        let delay = new p5.Delay();
        delay.process(noise, undefined, 0.78);
        expect(delay._leftGain.gain.value).to.be.approximately(0.78, 0.01);
        expect(delay._rightGain.gain.value).to.be.approximately(0.78, 0.01);
      });
      it('can rejcet a feedback greater than 1', function () {
        let delay = new p5.Delay();
        expect(() => delay.process(noise, undefined, 1.69)).to.throw();
      });

      it('can set frequency with only frequency as a parameter', function (done) {
        let delay = new p5.Delay();
        delay.process(noise, undefined, undefined, 14525);
        setTimeout(() => {
          expect(delay._leftFilter.freq()).to.be.approximately(14525, 100);
          expect(delay._rightFilter.freq()).to.be.approximately(14525, 100);
          done();
        }, 50);
      });

      it('can process a source with all properties given', function (done) {
        let delay = new p5.Delay();
        delay.process(noise, 0.31, 0.415, 926);

        expect(delay._leftGain.gain.value).to.be.approximately(0.415, 0.01);
        expect(delay._rightGain.gain.value).to.be.approximately(0.415, 0.01);

        setTimeout(() => {
          expect(delay.leftDelay.delayTime.value).to.be.approximately(
            0.31,
            0.01
          );
          expect(delay.rightDelay.delayTime.value).to.be.approximately(
            0.31,
            0.01
          );
          expect(delay._leftFilter.freq()).to.be.approximately(926, 10);
          expect(delay._rightFilter.freq()).to.be.approximately(926, 10);

          done();
        }, 50);
      });
    });

    it('can add delay to an audio signal using delayTime', function (done) {
      let delay = new p5.Delay();
      //non-numerical value
      delay.delayTime(noise);

      //numerical value
      delay = new p5.Delay();
      delay.delayTime(0.7);
      setTimeout(() => {
        expect(delay.leftDelay.delayTime.value).to.be.approximately(0.7, 0.01);
        expect(delay.rightDelay.delayTime.value).to.be.approximately(0.7, 0.01);
        done();
      }, 50);
    });
    it('can add feedback to an audio signal using feedback function', function () {
      let delay = new p5.Delay();
      //non-numerical value
      delay.feedback(noise);

      //numerical value
      delay = new p5.Delay();
      delay.feedback(0.26);
      expect(delay._leftGain.gain.value).to.be.approximately(0.26, 0.01);
      expect(delay._rightGain.gain.value).to.be.approximately(0.26, 0.01);

      //reject greater than or equal to 1 cases
      expect(() => delay.process(noise, undefined, 112)).to.throw();
      expect(() => delay.process(noise, undefined, 1)).to.throw();
    });
    it('can set frequency using filter function', function (done) {
      let delay = new p5.Delay();
      //non-numerical value
      delay.filter(noise);

      //numerical value
      delay = new p5.Delay();
      delay.filter(1234);
      setTimeout(() => {
        expect(delay._leftFilter.freq()).to.be.approximately(1234, 100);
        expect(delay._rightFilter.freq()).to.be.approximately(1234, 100);
        done();
      }, 50);
    });

    it('has initial feedback value of 0.5', function () {
      let delay = new p5.Delay();
      expect(delay.feedback()).to.equal(0.5);
    });

    it('can set types', function () {
      let delay = new p5.Delay();

      delay.setType(1); // goes to pingpong case
      delay.setType(0); // default case
      delay.setType('pingPong'); // goes to pingpong case
    });

    it('can be disposed', function () {
      let delay = new p5.Delay();
      delay.dispose();

      expect(delay._split).to.be.undefined;
      expect(delay._leftFilter).to.be.undefined;
      expect(delay._rightFilter).to.be.undefined;
      expect(delay._merge).to.be.undefined;
      expect(delay._leftGain).to.be.undefined;
      expect(delay._rightGain).to.be.undefined;
      expect(delay.leftDelay).to.be.undefined;
      expect(delay.rightDelay).to.be.undefined;
    });
  });
});
