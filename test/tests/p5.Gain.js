const expect = chai.expect;
let gain;

describe('p5.Gain', function () {
  beforeEach(function () {
    gain = new p5.Gain();
  });

  it('can be created', function () {
    expect(gain.input).to.have.property('gain');
    expect(gain.output).to.have.property('gain');
    let audioContext = gain.ac;
    expect(audioContext).to.have.property('baseLatency').to.be.an('number');
    expect(audioContext).to.have.property('destination');
    expect(audioContext).to.have.property('state').to.be.an('string');
  });
  it('can be created and disposed', function () {
    gain.dispose();
    expect(gain).to.not.have.property('input');
    expect(gain).to.not.have.property('output');
  });

  describe('methods', function () {
    describe('setInput', function () {
      it('can set Input', function () {
        let soundFile = p5.prototype.loadSound('./testAudio/drum.mp3');
        gain.setInput(soundFile);
      });
    });
    describe('connect, disconnect', function () {
      it('connects to p5.soundOut when no arguments are provided', function () {
        gain.connect();
      });
      it('can connect with or without input property', function () {
        let filter = new p5.Filter();
        gain.connect(filter);
        gain.connect(filter.input);
      });
      it('can disconnect', function () {
        let filter = new p5.Filter();
        gain.connect(filter);
        gain.disconnect();
      });
    });
    describe('amp', function () {
      it('can take only volume as input', function () {
        //TODO
      });
    });
  });
});
