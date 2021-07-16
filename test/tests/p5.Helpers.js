const expect = chai.expect;

describe('Testing helpers function', function () {
  it('p5.prototype.freqToMidi helper function', function () {
    const midi = p5.prototype.freqToMidi(880);
    expect(midi).to.equal(81);
  });

  it('p5.prototype.midiToFreq helper function', function () {
    const freq = p5.prototype.midiToFreq(100);
    expect(freq).to.be.approximately(2637.0204553029594, 0.00000000001);
  });

  it('p5.prototype.noteToFreq helper function', function () {
    const freq = p5.prototype.noteToFreq('C4');
    expect(freq).to.be.approximately(261.6255653005986, 0.00000000001);
  });

  it('p5.prototype.soundFormats helper function', function () {
    // setting file format so that if we don't provide extension
    // our file will be loaded because _checkFileFormats add it for us.

    p5.prototype.soundFormats('mp3');
    const file = p5.prototype._checkFileFormats('a');
    expect(file).to.be.equal('a.mp3');

    // if we don't provide a valid sound format then soundFormats wil throw
    //error
    try {
      p5.prototype.soundFormats('ext');
    } catch (err) {
      expect(err).to.be.equal('ext is not a valid sound format!');
    }
  });
});
