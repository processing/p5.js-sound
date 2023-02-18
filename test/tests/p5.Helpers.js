const expect = chai.expect;

describe('Helpers functions', function () {
  it('sampleRate can get sample rate', function () {
    expect(p5.prototype.sampleRate()).to.be.a('number');
  });

  it('freqToMidi can convert frequency to MIDI value', function () {
    const midi = p5.prototype.freqToMidi(880);
    expect(midi).to.equal(81);
  });

  it('midiToFreq can convert MIDI value to frequency', function () {
    const freq = p5.prototype.midiToFreq(100);
    expect(freq).to.be.approximately(2637.0204553029594, 0.00000000001);
  });

  it('noteToFreq can get frequency of a note', function () {
    const freq = p5.prototype.noteToFreq('C4');
    expect(freq).to.be.approximately(261.6255653005986, 0.00000000001);
  });

  it('soundFormats can set the formats', function () {
    // setting file format so that if we don't provide extension
    // our file will be loaded because _checkFileFormats add it for us.

    p5.prototype.soundFormats('mp3');
    const file = p5.prototype._checkFileFormats('a');
    expect(file).to.be.equal('a.mp3');
    expect(p5.soundOut.extensions).to.contain('mp3');

    // if we don't provide a valid sound format then soundFormats wil throw
    //error
    expect(() => p5.prototype.soundFormats('ext')).to.throw(
      'ext is not a valid sound format!'
    );

    p5.prototype.soundFormats('mp3', 'wav', 'aac');
    expect(p5.soundOut.extensions).to.contain('mp3');
    expect(p5.soundOut.extensions).to.contain('aac');
    expect(p5.soundOut.extensions).to.contain('wav');
  });

  it('disposeSound can dispose sound', function () {
    let amp = new p5.Amplitude();
    let gain = new p5.Gain();
    let noise = new p5.Noise();
    p5.prototype.disposeSound();

    expect(amp).to.not.have.property('input');
    expect(amp).to.not.have.property('output');

    expect(gain).to.not.have.property('input');
    expect(gain).to.not.have.property('output');

    expect(noise.panner).to.be.null;
    expect(noise.output).to.be.null;
    expect(noise.noise).to.be.null;
    expect(noise.buffer).to.be.null;
  });

  it('_checkFileFormats can check string file formats with no extension provided', function () {
    p5.prototype.soundFormats('mp3', 'aac', 'wav');
    if (p5.prototype.isFileSupported('mp3')) {
      expect(p5.prototype._checkFileFormats('./drum')).to.equal('./drum.mp3');
    } else if (p5.prototype.isFileSupported('aac')) {
      expect(p5.prototype._checkFileFormats('../files/drum')).to.equal(
        '../files/drum.aac'
      );
    } else if (p5.prototype.isFileSupported('wav')) {
      expect(p5.prototype._checkFileFormats('../files/beat')).to.equal(
        '../files/beat.wav'
      );
    }
  });
  it('_checkFileFormats can check string file formats with an extension provided', function () {
    //if provided extension is supported
    if (p5.prototype.isFileSupported('mp3')) {
      expect(p5.prototype._checkFileFormats('./drum.mp3')).to.equal(
        './drum.mp3'
      );
    } else if (p5.prototype.isFileSupported('aac')) {
      expect(p5.prototype._checkFileFormats('../files/drum.aac')).to.equal(
        '../files/drum.aac'
      );
    } else if (p5.prototype.isFileSupported('wav')) {
      expect(p5.prototype._checkFileFormats('../files/beat.wav')).to.equal(
        '../files/beat.wav'
      );
    }
    //if provided extension is not supported
    //TODO
  });
  it("_checkFileFormats can check array of strings's file formats", function () {
    let array = [
      '../files/beat.mc4',
      '../files/drum.mp3',
      '../files/snare.wav',
    ];
    if (p5.prototype.isFileSupported('mp3')) {
      expect(p5.prototype._checkFileFormats(array)).to.equal(
        '../files/drum.mp3'
      );
    } else if (p5.prototype.isFileSupported('wav')) {
      expect(p5.prototype._checkFileFormats(array)).to.equal(
        '../files/snare.wav'
      );
    }
  });

  it('_mathChain'); //TODO

  it('convertToWav'); //TODO

  it('interleave can interleave two channels/arrays', function () {
    let arr1 = [1, 2, 5, 7];
    let arr2 = [2, 4, 6, 8];
    let arr = p5.prototype.interleave(arr1, arr2);
    let out = new Float32Array([1, 2, 2, 4, 5, 6, 7, 8]);
    expect(arr).to.deep.equal(out);
  });

  it('writeUTFBytes writes into bytes', function () {
    var buffer = new window.ArrayBuffer(44);
    var view = new window.DataView(buffer);
    p5.prototype.writeUTFBytes(view, 0, 'RIFF');
    p5.prototype.writeUTFBytes(view, 8, 'WAVE');
    expect(view.getUint8(0)).to.equal(82);
    expect(view.getUint8(1)).to.equal(73);
    expect(view.getUint8(2)).to.equal(70);
    expect(view.getUint8(3)).to.equal(70);
    expect(view.getUint8(8)).to.equal(87);
    expect(view.getUint8(9)).to.equal(65);
    expect(view.getUint8(10)).to.equal(86);
    expect(view.getUint8(11)).to.equal(69);
  });

  it('safeBufferSize returns a size', function () {
    expect(p5.prototype.safeBufferSize(2048)).to.be.a('number');
  });
});
