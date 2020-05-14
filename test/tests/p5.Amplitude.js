'use strict';

define(['chai'], function (chai) {
  var expect = chai.expect;

  describe('p5.Amplitude', function () {
    this.timeout(1000);

    var sf, amp, osc, oAmp;

    it('can be created', function () {
      amp = new p5.Amplitude();
    });

    after(function (done) {
      expect(amp.getLevel()).to.not.equal(1.0);
      osc.dispose();
      sf.dispose();
      done();
    });

    it('accepts oscillator input', function () {
      osc = new p5.Oscillator('square');
      osc.amp(1);
      osc.start();
      osc.disconnect();
      oAmp = new p5.Amplitude();
      oAmp.setInput(osc);
    });

    it('gets oscillator level', function () {
      setTimeout(function () {
        // console.log( 'unnormalized: ' + oAmp.getLevel() );
        expect(oAmp.getLevel()).to.be.closeTo(0.55, 0.25);
      }, 100);
    });

    it('gets normalized osc level', function (done) {
      setTimeout(function () {
        oAmp.toggleNormalize(true);
        // console.log( 'normalized: ' + oAmp.getLevel() );
        expect(oAmp.getLevel()).to.be.closeTo(1.0, 0.4);
        done();
      }, 200);
    });

    it('loop a SoundFile with params, disconnected from master, setInput()', function (done) {
      p5.prototype.soundFormats('ogg', 'mp3');
      sf = p5.prototype.loadSound('./testAudio/drum', function () {
        sf.disconnect();
        sf.loop(1, 1, 0.0, 0.05);
        sf.connect(amp);
        setTimeout(function () {
          done();
        }, 100);
      });
    });

    it('stop getting level', function (done) {
      sf.stop();
      setTimeout(function () {
        // console.log( amp.getLevel() );
        done();
      }, 10);
    });
  });
});
