const expect = chai.expect;

describe('p5.MonoSynth', function () {
  it('can be created and disposed', function () {
    const monoSynth = new p5.MonoSynth();
    monoSynth.dispose();
  });

  it('can play a note string', function (done) {
    const monoSynth = new p5.MonoSynth();
    monoSynth.play('A2');

    // wait for scheduled value to complete
    setTimeout(function () {
      expect(monoSynth.oscillator.freq().value).to.equal(110);
      monoSynth.dispose();
      done();
    }, 10);
  });
});
