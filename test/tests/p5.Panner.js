const expect = chai.expect;

describe('p5.Panner', function () {
  let ac, input;
  beforeEach(function () {
    ac = p5.prototype.getAudioContext();
    input = ac.createGain();
  });
  it('can be created', function () {
    new p5.Panner();
  });
  it('can be connected and disconnected', function () {
    let panner = new p5.Panner();
    panner.connect(input);
    panner.disconnect();
  });
  it('can be panned without a delay', function (done) {
    let panner = new p5.Panner();
    panner.pan(0.4);
    setTimeout(() => {
      expect(panner.getPan()).to.be.approximately(0.4, 0.01);
      done();
    }, 25);
  });
  it('can be panned with a delay', function (done) {
    let panner = new p5.Panner();
    panner.pan(-0.7, 0.1);
    setTimeout(() => {
      expect(panner.getPan()).to.be.approximately(-0.7, 0.01);
      done();
    }, 125);
  });
});
