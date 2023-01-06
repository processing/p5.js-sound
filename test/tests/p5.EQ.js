const expect = chai.expect;

describe('p5.EQ', function () {
  it('can be created and disposed', function () {
    const origSoundArrayLength = p5.soundOut.soundArray.length;
    const eq = new p5.EQ();
    expect(eq.bands).to.be.an('array');
    expect(p5.soundOut.soundArray.length).to.not.equal(origSoundArrayLength);
    eq.dispose();
    expect(p5.soundOut.soundArray.length).to.equal(origSoundArrayLength);
    expect(eq.input).to.equal(undefined);
    expect(eq.output).to.equal(undefined);
    expect(eq.bands).to.equal(undefined);
  });

  it('can be only be created with size 3 or 8', function () {
    let eq = new p5.EQ();
    expect(eq.bands.length).to.equal(3);
    eq.dispose();
    eq = new p5.EQ(3);
    expect(eq.bands.length).to.equal(3);
    eq.dispose();
    eq = new p5.EQ(8);
    expect(eq.bands.length).to.equal(8);
    eq.dispose();
    eq = new p5.EQ(50);
    expect(eq.bands.length).to.equal(3);
    eq.dispose();
  });

  describe('methods', function () {
    describe('bands', function () {
      describe('filter', function () {
        it('a band can be toggled on and off', function () {
          const eq = new p5.EQ(8);
          expect(eq.bands[2].biquad.type).to.equal('peaking');
          eq.bands[2].toggle();
          expect(eq.bands[2].biquad.type).to.equal('allpass');
          eq.bands[2].toggle();
          expect(eq.bands[2].biquad.type).to.equal('peaking');
        });

        it("a band's gain value can be changed", function () {
          const eq = new p5.EQ(8);
          expect(eq.bands[2].gain()).to.equal(0);
          eq.bands[2].gain(30);
          expect(eq.bands[2].gain()).to.equal(30);
        });

        it('a band has correct default value', function () {
          const eq = new p5.EQ(8);
          setTimeout(() => {
            expect(eq.bands[0].freq()).to.equal(100);
          }, 100);
        });

        it('a bands freq value can be changed', function (done) {
          const eq = new p5.EQ(8);
          setTimeout(() => {
            expect(eq.bands[0].freq()).to.equal(100);
            eq.bands[0].freq(200);
            setTimeout(() => {
              expect(eq.bands[0].gain()).to.equal(0);
              expect(eq.bands[0].freq()).to.equal(200);
              done();
            }, 100);
          }, 50);
        });

        it("a band's type can be changed", function () {
          const eq = new p5.EQ();
          expect(eq.bands[2]._untoggledType).to.equal('peaking');
          eq.bands[2].setType('highshelf');
          expect(eq.bands[2]._untoggledType).to.equal('highshelf');
        });

        describe('EQFilter', function () {
          it('can be created', function () {
            const eq = new p5.EQ(8);
            expect(eq.bands[0].biquad.gain.value).to.equal(0);
            expect(eq.bands[0]).to.not.have.property('input');
            expect(eq.bands[0]).to.not.have.property('output');
            expect(eq.bands[0]).to.not.have.property('_drywet');
            expect(eq.bands[0]).to.not.have.property('wet');

            expect(eq.bands[0].biquad.type).to.equal('peaking');
            expect(eq.bands[0]._untoggledType).to.equal('peaking');
          });
          it('can be connected and disconnected from p5-sound input', function () {
            const eq = new p5.EQ(8);
            eq.bands[0].connect();
            eq.bands[0].disconnect();
          });
          it('can be connected and disconnected from a audio node', function () {
            const eq = new p5.EQ(8);
            let filter = new p5.Filter();
            //if node has input
            eq.bands[0].connect(filter);
            eq.bands[0].disconnect();

            //if node doesnot have input
            eq.bands[1].connect(filter.input);
            eq.bands[1].disconnect();
          });

          it('a band can be disposed', function () {
            const eq = new p5.EQ();
            const origSoundArrayLength = p5.soundOut.soundArray.length;
            eq.bands[0].dispose();
            expect(eq.bands[0]).to.not.have.property('biquad');
            expect(p5.soundOut.soundArray.length).to.equal(
              origSoundArrayLength - 1
            );
          });
        });
      });

      it('can process an input', function () {
        const eq = new p5.EQ();
        let noise = new p5.Noise();

        eq.process(noise);
      });

      it('can throw an error if less arguments are passed to set function', function () {
        let eq = new p5.EQ();
        // less than 6 should throw error
        expect(() => eq.set(1000, 10)).to.throw();
        expect(() => eq.set(1000, 10, 2000, 5)).to.throw();
        expect(() => eq.set(1000, 10, 2000, 5, 3000, 15)).to.not.throw();
        // less than 16 should throw error
        eq = new p5.EQ(8);
        expect(() => eq.set(1000, 10)).to.throw();
        expect(() => eq.set(10, 10, 20, 5)).to.throw();
        expect(() => eq.set(10, 10, 20, 5, 30, 15)).to.throw();
        expect(() => eq.set(10, 10, 20, 5, 30, 15, 40, 1)).to.throw();
        expect(() =>
          eq.set(10, 10, 2000, 5, 30, 15, 40, 1, 424, 23, 632, 12)
        ).to.throw();
        expect(() =>
          eq.set(10, 10, 20, 20, 30, 30, 40, 40, 50, 50, 60, 60, 70, 70)
        ).to.throw();
        expect(() =>
          eq.set(10, 10, 20, 20, 30, 30, 40, 40, 50, 50, 60, 60, 70, 70, 80, 80)
        ).to.not.throw();
      });

      it('can set freq and gain to all bands', function (done) {
        let eq = new p5.EQ();
        eq.set(1000, 10, 2000, 20, 3000, 30);
        setTimeout(() => {
          expect(eq.bands[0].biquad.frequency.value).to.be.approximately(
            1000,
            1
          );
          expect(eq.bands[0].biquad.gain.value).to.be.approximately(10, 1);
          expect(eq.bands[1].biquad.frequency.value).to.be.approximately(
            2000,
            1
          );
          expect(eq.bands[1].biquad.gain.value).to.be.approximately(20, 1);
          expect(eq.bands[2].biquad.frequency.value).to.be.approximately(
            3000,
            1
          );
          expect(eq.bands[2].biquad.gain.value).to.equal(30, 1);
          done();
        }, 100);
      });

      it('drywet value can be changed', function () {
        const eq = new p5.EQ();
        expect(eq.drywet(0.5)).to.equal(0.5);
      });
    });
  });
});
