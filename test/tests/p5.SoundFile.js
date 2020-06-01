'use strict';

define(['chai'], function (chai) {
  var expect = chai.expect;

  describe('p5.SoundFile', function () {
    this.timeout(1000);

    var sf;
    var a = new p5.Amplitude();

    after(function (done) {
      sf.dispose();
      done();
    });

    it('loads a file with soundFormats', function (done) {
      p5.prototype.soundFormats('ogg', 'mp3');
      sf = p5.prototype.loadSound('./testAudio/drum', function () {
        done();
      });
    });

    it('can be created and disposed', function () {
      var p = new p5.SoundFile('./testAudio/drum', function () {
        p.dispose();
      });
    });

    it('plays a file', function () {
      sf.play();
      expect(sf.isPlaying()).to.equal(true);
    });

    it('stops playing a file', function () {
      sf.stop();
      expect(sf.isPlaying()).to.equal(false);
    });

    it('pauses a file', function () {
      sf.play();
      sf.pause();
      expect(sf.isPlaying()).to.equal(false);
      expect(sf.isPaused()).to.equal(true);
    });

    it('has a duration', function () {
      expect(sf.duration()).to.be.closeTo(1.0, 0.01);
    });

    it('can change playback rate', function () {
      sf.rate(0.5);
      expect(sf.playbackRate).to.equal(0.5);
    });

    it('can set panning', function () {
      sf.pan(-1);
      expect(sf.panPosition).to.equal(-1);
    });

    it('can play again and keep currentTime', function () {
      sf.play();
      expect(sf.isPaused()).to.equal(false);
      expect(sf.isPlaying()).to.equal(true);

      setTimeout(function () {
        expect(sf.currentTime()).not.equal(0.0);
      }, 100);
    });

    var peaks, firstPeak;
    it('can get peaks', function () {
      peaks = sf.getPeaks(sf.buffer.length);
      expect(peaks.length).to.equal(sf.buffer.length);
      firstPeak = peaks[0];
    });

    it('can reverse buffer with playbackRate', function () {
      sf.rate(-1);
      var reversePeaks = sf.getPeaks(sf.buffer.length);
      expect(reversePeaks[reversePeaks.length - 1]).to.equal(firstPeak);
    });

    it('can revert buffer to normal with positive playbackRate', function () {
      sf.rate(1);
      var revertPeaks = sf.getPeaks(sf.buffer.length);
      expect(revertPeaks[0]).to.equal(firstPeak);
    });

    it('can handle multiple restarts', function () {
      expect(sf.isPlaying()).to.equal(true);
      sf.play();
      sf.play();
      sf.stop();
      sf.stop();
      expect(sf.isPlaying()).to.equal(false);
      sf.play();
      a.setInput(sf);
      expect(sf.isPlaying()).to.equal(true);
    });

    it('can make noise', function (done) {
      setTimeout(function () {
        expect(a.getLevel()).to.not.equal(0.0);
        done();
      }, 50);
    });

    it('can set volume', function (done) {
      sf.stop();
      sf.play();
      sf.setVolume(0);
      setTimeout(function () {
        expect(a.getLevel()).to.be.closeTo(0.0, 0.3);
        done();
      }, 100);
    });
    it('calls the cueCallbacks correct number of times', function (done) {
      this.timeout(2000);
      let sf = new p5.SoundFile('./testAudio/drum', onloaded);

      function onloaded() {
        let audioLength = sf.duration();
        let numberOfCuesCalls = 0;

        let callback = () => {
          numberOfCuesCalls++;
        };

        sf.addCue(audioLength / 5, callback);
        sf.addCue((audioLength * 2) / 5, callback);
        sf.addCue((audioLength * 3) / 5, callback);
        sf.addCue((audioLength * 4) / 5, callback);

        sf.play();

        sf.onended(() => {
          expect(numberOfCuesCalls).to.equal(4);
          done();
        });
      }
    });
  });
});
