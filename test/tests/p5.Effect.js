const expect = chai.expect;

describe('p5.Effect', function () {
  it('can be created and disposed', function () {
    const effect = new p5.Effect();

    expect(effect.input).to.have.property('gain');
    expect(effect.input).to.have.property('context');
    expect(effect.output).to.have.property('gain');
    expect(effect.output).to.have.property('context');
    expect(effect._drywet).to.have.property('fade');
    expect(effect.wet).to.have.property('gain');
    expect(effect.wet).to.have.property('context');

    effect.dispose();
    expect(effect.wet).to.equal(undefined);
    expect(effect._drywet).to.equal(undefined);
    expect(effect.input).to.equal(undefined);
    expect(effect.output).to.equal(undefined);
    expect(effect.ac).to.equal(undefined);
  });

  describe('methods', function () {
    it('can change amp of an effect without any delay or ramp', function (done) {
      const filter = new p5.Filter();
      expect(filter.output.gain.value).to.equal(1);
      filter.amp(0.5);
      setTimeout(() => {
        expect(filter.output.gain.value).to.equal(0.5);
        done();
      }, 10);
    });
    it('can change amp of an effect with ramp', function (done) {
      const filter = new p5.Filter();
      filter.amp(0.53, 0.1);
      setTimeout(() => {
        expect(filter.output.gain.value).to.be.above(0.53);
        expect(filter.output.gain.value).to.be.below(1);
      }, 50);
      setTimeout(() => {
        expect(filter.output.gain.value).to.be.approximately(0.53, 0.001);
        done();
      }, 110);
    });
    it('can change amp of an effect with a delay', function (done) {
      const filter = new p5.Filter();
      filter.amp(0.92, 0, 0.2);
      setTimeout(() => {
        expect(filter.output.gain.value).to.be.approximately(1, 0.001);
      }, 100);
      setTimeout(() => {
        expect(filter.output.gain.value).to.be.approximately(0.92, 0.001);
        done();
      }, 210);
    });

    it('can be connected to p5-sound input and be disconnected', function () {
      const filter = new p5.Filter();
      filter.connect();
      filter.disconnect();
    });
    it('can be connected to an audio node and be disconnected', function () {
      const filter = new p5.Filter();
      const delay = new p5.Delay();
      filter.connect(delay);
      filter.disconnect();
    });

    it('effects can be chained together', function () {
      const filter = new p5.Filter();
      const delay = new p5.Delay();
      const reverb = new p5.Reverb();
      const distortion = new p5.Distortion();
      filter.chain(delay, reverb, distortion);
    });

    it('drywet value can be used as getter and setter', function () {
      const effect = new p5.Effect();
      expect(effect.drywet()).to.equal(1); //initial value
      effect.drywet(0.5);
      expect(effect._drywet.fade.value).to.equal(0.5);
      expect(effect.drywet()).to.equal(0.5);
    });
    it('can execute _onNewInput() hook on connected unit', function (done) {
      const effect = new p5.Effect();
      const gain = new p5.Gain();
      gain._onNewInput = function () {
        done();
      };
      effect.connect(gain);
    });
  });
});
