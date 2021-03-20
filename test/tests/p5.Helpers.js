var expect = chai.expect;

describe('Testing helpers function', function () {
  it('p5.prototype.freqToMidi helper function', function () {
    let Midi = p5.prototype.freqToMidi(880);
    expect(Midi).to.equal(81);
  });
  it('p5.prototype.midiToFreq  helper function', function () {
    let Freq = p5.prototype.midiToFreq(720);
    expect(Freq).to.equal(9426054387186970000);
  });
  it('p5.prototype.noteToFreq  helper function', function () {
    let Freq = p5.prototype.noteToFreq('C4');
    expect(Freq).to.equal(261.6255653005986);
  });
});
