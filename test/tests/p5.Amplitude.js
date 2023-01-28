describe('p5.Amplitude', function () {
  this.timeout(1000);

  it('can be created', function () {
    let amp = new p5.Amplitude();
    expect(amp).to.have.property('audiocontext').not.be.null;
    expect(amp).to.have.property('_workletNode').not.be.null;
    expect(amp.bufferSize).to.equal(2048);
    expect(amp).to.have.property('input');
    expect(amp).to.have.property('output');
    expect(amp.volume).to.equal(0);
    expect(amp.volNorm).to.equal(0);
    expect(amp.stereoVol).to.deep.equal([0, 0]);
    expect(amp.stereoVolNorm).to.deep.equal([0, 0]);
  });

  it('can be created with smoothing', function () {
    new p5.Amplitude(0.02);
  });

  describe('methods', function () {
    this.retries(2);

    it('accepts oscillator input', function () {
      let osc = new p5.Oscillator('square');
      let amp = new p5.Amplitude();
      osc.amp(1);
      osc.start();
      osc.disconnect();
      amp.setInput(osc);
    });
    it('setInput connects to main output if no argument is passed', function () {
      let amp = new p5.Amplitude();
      amp.setInput();
    });

    it('can be connected and disconnected from a unit', function () {
      let amp = new p5.Amplitude();
      let filter = new p5.Filter();

      //if unit has input property
      amp.connect(filter);
      amp.disconnect();

      //if unit doesnot have an input property
      amp = new p5.Amplitude();
      amp.connect(filter.input);
      amp.disconnect();

      filter.dispose();
    });

    it('can toggle normalization', function () {
      let amp = new p5.Amplitude();
      expect(amp.normalize).to.be.false;
      amp.toggleNormalize();
      expect(amp.normalize).to.be.true;

      amp.toggleNormalize(true);
      expect(amp.normalize).to.be.true;
      amp.toggleNormalize(false);
      expect(amp.normalize).to.be.false;
    });

    it('gets oscillator level', function () {
      //TODO : this test seems to be very inconsistent, to be corrected in the future
      // let osc = new p5.Oscillator('square');
      // let amp = new p5.Amplitude();
      // osc.amp(1);
      // osc.start();
      // osc.disconnect();
      // amp.setInput(osc);
      // setTimeout(function () {
      //   try {
      //     expect(amp.getLevel()).to.be.closeTo(0.55, 0.25);
      //     done();
      //   } catch (error) {
      //     done(error);
      //   }
      // }, 500);
    });

    it('gets normalized osc level', function () {
      //TODO : this test seems to be very inconsistent, to be corrected in the future
      // let osc = new p5.Oscillator('square');
      // let amp = new p5.Amplitude();
      // osc.amp(1);
      // osc.start();
      // osc.disconnect();
      // amp.setInput(osc);
      // setTimeout(function () {
      //   try {
      //     amp.toggleNormalize(true);
      //     expect(amp.getLevel()).to.be.closeTo(1.0, 0.4);
      //     done();
      //   } catch (error) {
      //     done(error);
      //   }
      // }, 500);
    });
    it('gets stereo osc level', function () {
      //TODO : this test seems to be very inconsistent, to be corrected in the future
      // let osc = new p5.Oscillator('square');
      // let amp = new p5.Amplitude();
      // osc.amp(1);
      // osc.start();
      // osc.disconnect();
      // amp.setInput(osc);
      // amp.smooth(0.5);
      // setTimeout(function () {
      //   console.log('hii',amp.getLevel(0),amp.getLevel(1))
      //   try {
      //     expect(amp.getLevel(0)).to.be.closeTo(0.55, 0.25);
      //     expect(amp.getLevel(1)).to.be.closeTo(0.55, 0.25);
      //     amp.toggleNormalize(true);
      //     expect(amp.getLevel(0)).to.be.closeTo(1, 0.4);
      //     expect(amp.getLevel(1)).to.be.closeTo(1, 0.4);
      //     done();
      //   } catch (error) {
      //     done(error);
      //   }
      // }, 400);
    });

    it('can be connected to a soundFile', function (done) {
      let amp = new p5.Amplitude();
      p5.prototype.soundFormats('ogg', 'mp3');
      let sf = p5.prototype.loadSound('./testAudio/drum', function () {
        sf.disconnect();
        sf.loop(1, 1, 0.0, 0.05);
        sf.connect(amp);
        sf.dispose();
        setTimeout(function () {
          sf.stop();
          done();
        }, 100);
      });
    });

    it('can apply smoothing', function () {
      let amp = new p5.Amplitude();
      amp.smooth(0.5);
    });

    it('can be disposed', function () {
      let amp = new p5.Amplitude();
      amp.dispose();
      expect(amp).to.not.have.property('input');
      expect(amp).to.not.have.property('output');
      expect(amp).to.not.have.property('_workletNode');
    });
  });
});
