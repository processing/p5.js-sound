const expect = chai.expect;

p5.prototype.soundFormats('mp3', 'ogg');
let soundFile = p5.prototype.loadSound('./testAudio/drum');

describe('p5.Reverb', function () {
  it('can be created and disposed', function () {
    const reverb = new p5.Reverb();

    expect(reverb.input.gain.value).to.equal(0.5);
    expect(reverb._seconds).to.equal(3);
    expect(reverb._decay).to.equal(2);
    expect(reverb._reverse).to.equal(false);
    //effect initialization
    expect(reverb.input).to.have.property('gain');
    expect(reverb.input).to.have.property('context');
    expect(reverb.output).to.have.property('gain');
    expect(reverb.output).to.have.property('context');
    expect(reverb._drywet).to.have.property('fade');
    expect(reverb.wet).to.have.property('gain');
    expect(reverb.wet).to.have.property('context');

    reverb.dispose();
    expect(reverb.wet).to.equal(undefined);
    expect(reverb._drywet).to.equal(undefined);
    expect(reverb.input).to.equal(undefined);
    expect(reverb.output).to.equal(undefined);
    expect(reverb.ac).to.equal(undefined);
  });

  it('initialization builds and sets a impulse response', function () {
    let reverb = new p5.Reverb();
    // _buildImpulse calls _setBuffer
    expect(reverb.convolverNode.buffer.duration).to.equal(3);
    expect(reverb.convolverNode.buffer.length).to.equal(144000);
    expect(reverb.convolverNode.buffer.numberOfChannels).to.equal(2);
    expect(reverb.convolverNode.buffer.sampleRate).to.equal(48000);
    //_setBuffer calls _initConvolverNode
    expect(reverb.convolverNode).to.have.property('buffer');
    expect(reverb.convolverNode).to.have.property('context');
    expect(reverb.convolverNode).to.have.property('channelCountMode');

    reverb.dispose();
    //dispose calls _teardownConvolverNode
    expect(reverb).to.not.have.property('convolverNode');
  });

  describe('methods', function () {
    it('can connect a source to the reverb', function () {
      let reverb = new p5.Reverb();
      reverb.process(soundFile);
    });
    it('can connect a source to the reverb and process the parameters', function () {
      let reverb = new p5.Reverb();
      reverb.process(soundFile, 7, 80, true);
      expect(reverb._seconds).to.equal(7);
      expect(reverb._decay).to.equal(80);
      expect(reverb._reverse).to.equal(true);
    });

    it('can set the reverb parameters individually', function () {
      let reverb = new p5.Reverb();
      reverb.set(4);
      expect(reverb._seconds).to.equal(4);
      reverb.set(undefined, 18);
      expect(reverb._decay).to.equal(18);
      reverb.set(undefined, undefined, true);
      expect(reverb._reverse).to.equal(true);
    });
    it('can set all the reverb parameters', function () {
      let reverb = new p5.Reverb();
      reverb.set(5, 6, true);
      expect(reverb._seconds).to.equal(5);
      expect(reverb._decay).to.equal(6);
      expect(reverb._reverse).to.equal(true);
    });
    it('setting the duration rebuilds the buffer', function () {
      let reverb = new p5.Reverb();
      reverb.set(2);
      expect(reverb.convolverNode.buffer.duration).to.equal(2);
      expect(reverb.convolverNode.buffer.length).to.equal(96000);
    });
    it('can tear down and rebuild the convolver', function () {
      let reverb = new p5.Reverb();
      reverb._teardownConvolverNode();
      expect(reverb).to.not.have.property('convolverNode');
      reverb._initConvolverNode();
      expect(reverb).to.have.property('convolverNode');
    });
    it('can build an impulse', function () {
      let reverb = new p5.Reverb();
      let buffer = reverb.convolverNode.buffer.getChannelData(0);
      reverb._buildImpulse();
      expect(reverb.convolverNode.buffer.getChannelData(0)).to.not.deep.equal(
        buffer
      );
    });
  });
});

describe('p5.Convolver', function () {
  it('can be created and disposed', function () {
    const cVerb = new p5.Convolver();

    expect(cVerb.input.gain.value).to.equal(0.5); //from reverb
    expect(cVerb._seconds).to.equal(3);
    expect(cVerb._decay).to.equal(2);
    expect(cVerb._reverse).to.equal(false);
    expect(cVerb.convolverNode.buffer.duration).to.equal(3);
    expect(cVerb.convolverNode.buffer.length).to.equal(144000);
    expect(cVerb.convolverNode.buffer.numberOfChannels).to.equal(2);
    expect(cVerb.convolverNode.buffer.sampleRate).to.equal(48000);
    expect(cVerb.convolverNode).to.have.property('context');

    expect(cVerb.impulses).to.be.an('array').to.have.length(0);
    expect(cVerb.set).to.be.null;

    cVerb.dispose();
    expect(cVerb.ac).to.equal(undefined);
    expect(cVerb).to.not.have.property('convolverNode');
  });

  it('can be created with a given path', function () {
    try {
      const cVerb = new p5.Convolver(
        './testAudio/bx-spring',
        () => {
          expect(cVerb.convolverNode.buffer.duration).to.be.approximately(
            7.765,
            0.001
          ); //file length
          expect(cVerb.convolverNode.buffer.length).to.equal(372736);
          expect(cVerb.convolverNode.buffer.numberOfChannels).to.equal(2);
          expect(cVerb.convolverNode.buffer.sampleRate).to.equal(48000);
          expect(cVerb.impulses.length).to.equal(1);
          expect(cVerb.impulses[0]).to.have.property('audioBuffer');
          expect(cVerb.impulses[0]).to.have.property('name');
        },
        () => {}
      );
    } catch (error) {
      console.log(error);
    }
  });

  describe('methods', function () {
    it('load buffer can throw', function (done) {
      try {
        new p5.Convolver(
          'http://badURL.mp3',
          () => {},
          () => {
            done();
          }
        );
      } catch (error) {
        console.log(error);
      }
    });
    it('can connect a source to the convolver', function () {
      const cVerb = new p5.Convolver();
      cVerb.process(soundFile);
    });
    it('can add an impulse', function (done) {
      try {
        const cVerb = new p5.Convolver(
          './testAudio/bx-spring',
          () => {
            cVerb.addImpulse('./testAudio/drum', () => {
              expect(cVerb.convolverNode.buffer.duration).to.equal(1); //file length
              expect(cVerb.convolverNode.buffer.length).to.equal(48000);
              expect(cVerb.impulses.length).to.equal(2);
              expect(cVerb.impulses[1].name).to.include('drum');

              cVerb.dispose(); // dispose removes all impulses
              expect(cVerb.impulses.length).to.equal(2);
              expect(cVerb.impulses[0]).to.be.null;
              expect(cVerb.impulses[1]).to.be.null;
              done();
            });
          },
          () => {}
        );
      } catch (error) {
        console.log(error);
      }
    });
    it('can reset impulse', function (done) {
      try {
        const cVerb = new p5.Convolver(
          './testAudio/bx-spring',
          () => {
            cVerb.resetImpulse('./testAudio/drum', () => {
              expect(cVerb.convolverNode.buffer.duration).to.equal(1); //file length
              expect(cVerb.convolverNode.buffer.length).to.equal(48000);
              expect(cVerb.impulses.length).to.equal(1);
              expect(cVerb.impulses[0].name).to.include('drum');
              done();
            });
          },
          () => {}
        );
      } catch (error) {
        console.log(error);
      }
    });
    it('can toggle impulses', function (done) {
      try {
        const cVerb = new p5.Convolver(
          './testAudio/bx-spring',
          () => {
            cVerb.addImpulse('./testAudio/drum', () => {
              expect(cVerb.convolverNode.buffer.duration).to.equal(1); // initially drum
              //toggle using id/position in impulses array
              cVerb.toggleImpulse(0);
              expect(cVerb.convolverNode.buffer.duration).to.be.approximately(
                7.765,
                0.001
              ); // bx-spring

              //using filename
              cVerb.toggleImpulse('drum.mp3');
              cVerb.toggleImpulse('drum.ogg');
              expect(cVerb.convolverNode.buffer.duration).to.equal(1); // toggled back to drum
              done();
            });
          },
          () => {}
        );
      } catch (error) {
        console.log(error);
      }
    });
  });

  it('can be created using createConvolver', function (done) {
    const cVerb = p5.prototype.createConvolver();
    expect(cVerb.impulses).to.be.an('array').to.have.length(0);
    expect(cVerb.set).to.be.null;

    try {
      let cVerb = p5.prototype.createConvolver(
        './testAudio/bx-spring',
        () => {
          expect(cVerb.convolverNode.buffer.duration).to.be.approximately(
            7.765,
            0.001
          ); //file length
          expect(cVerb.convolverNode.buffer.length).to.equal(372736);
          expect(cVerb.impulses.length).to.equal(1);
          done();
        },
        () => {}
      );
    } catch (error) {
      console.log(error);
    }
  });
});
