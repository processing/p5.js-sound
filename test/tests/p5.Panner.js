// const expect = chai.expect;

describe('p5.Panner', function () {
  let ac, output, input;
  beforeEach(function () {
    ac = p5.prototype.getAudioContext();
    output = ac.createGain();
    input = ac.createGain();
  });
  it('can be created', function () {
    new p5.Panner(input, output);
  });
  it('can be connected and disconnected', function () {
    let panner = new p5.Panner(input, output);
    panner.connect(input);
    panner.disconnect();
  });
  it('can be panned without a delay', function () {
    let panner = new p5.Panner(input, output);
    panner.pan(0.4);
    panner.pan(0.3, 0);
    //TODO: to check the value of left gain/ right gain (or) the stereoPanner.pan
  });
  it('can be panned with a delay', function () {
    let panner = new p5.Panner(input, output);
    panner.pan(0.4, 10);
  });
  it('can take inputChannels as 1 or 2', function () {
    let panner = new p5.Panner(input, output);
    panner.inputChannels(1);
    panner.inputChannels(2);
  });
});
