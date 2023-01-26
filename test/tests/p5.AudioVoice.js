const expect = chai.expect;

describe('p5.AudioVoice', function () {
  it('can be created and disposed', function () {
    let av = new p5.AudioVoice();
    let audioContext = av.ac;
    expect(audioContext).to.have.property('baseLatency').to.be.an('number');
    expect(audioContext).to.have.property('destination');
    expect(audioContext).to.have.property('state').to.be.an('string');
    expect(av.output).to.have.property('gain');
    expect(av.output).to.have.property('context');
    av.dispose();
    expect(av).to.not.have.property('output');
  });
  it('can be connected and disconnected', function () {
    let av = new p5.AudioVoice();
    let filter = new p5.Filter();

    //if unit has input property
    av.connect(filter);
    av.disconnect();

    //if unit doesnot have an input property
    av = new p5.AudioVoice();
    av.connect(filter.input);
    av.disconnect();
  });
  it('can execute _onNewInput() hook on connected unit', function (done) {
    let av = new p5.AudioVoice();
    const gain = new p5.Gain();
    gain._onNewInput = function () {
      done();
    };
    av.connect(gain);
  });
});
