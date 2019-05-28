'use strict';

define(['chai'], function(chai) {
  var expect = chai.expect;

  describe('p5.SoundRecorder', function() {
    var recorder;
    var inputSoundFile;
    var originalWriteFile;
    var writeFileCalled;

    before(function(done) {
      // clean up audio nodes from other test suites
      p5.soundOut.soundArray.length = 0;

      // mock p5.prototype.writeFile
      originalWriteFile = p5.prototype.writeFile;
      p5.prototype.writeFile = function() {
        writeFileCalled = true;
      };

      inputSoundFile = p5.prototype.loadSound('./testAudio/constant.wav', function() {
        done();
      });
    });

    after(function() {
      inputSoundFile.dispose();
      p5.prototype.writeFile = originalWriteFile;
    });

    beforeEach(function() {
      recorder = new p5.SoundRecorder();
      inputSoundFile.disconnect();
      inputSoundFile.stop();
      writeFileCalled = false;
    });

    afterEach(function() {
      recorder.dispose();
    });

    it('can record input from a microphone', function(done) {
      var recordingDuration = 100;

      // need to enable master volume to test recording from the microphone
      p5.prototype.masterVolume(1);

      var mic = new p5.AudioIn();
      mic.start(function() {
        var outputSoundFile = new p5.SoundFile();
        recorder.record(outputSoundFile);

        setTimeout(function() {
          recorder.stop();
          expect(outputSoundFile.duration()).to.be.closeTo(recordingDuration / 1000, 0.1);

          var outputChannel = outputSoundFile.buffer.getChannelData(0);
          expect(outputChannel[0]).to.not.eq(0);

          outputSoundFile.dispose();
          mic.dispose();
          p5.prototype.masterVolume(0);
          done();
        }, recordingDuration);
      });
    });

    it('can record input from a sound file', function(done) {
      // TODO: why does a sampleIndex of 0 break this test?
      var sampleIndex = 1000;
      var recordingDuration = 100;
      var inputChannel = inputSoundFile.buffer.getChannelData(0);
      // input SoundFile should contain all 1s
      expect(inputChannel[sampleIndex]).to.eq(1);

      var outputSoundFile = new p5.SoundFile();
      inputSoundFile.play();
      recorder.setInput(inputSoundFile);
      recorder.record(outputSoundFile);

      setTimeout(function() {
        recorder.stop();
        expect(outputSoundFile.duration()).to.be.closeTo(recordingDuration / 1000, 0.1);

        var outputChannel = outputSoundFile.buffer.getChannelData(0);
        expect(outputChannel[sampleIndex]).to.eq(1);

        outputSoundFile.dispose();
        done();
      }, recordingDuration);
    });

    it('can record the master output of a sketch', function(done) {
      var recordingDuration = 100;
      var inputChannel = inputSoundFile.buffer.getChannelData(0);
      // input SoundFile should contain all 1s
      expect(inputChannel[0]).to.eq(1);

      // need to enable master volume to test recording from master output
      p5.prototype.masterVolume(1);

      var outputSoundFile = new p5.SoundFile();
      inputSoundFile.connect();
      inputSoundFile.play();
      recorder.setInput();
      recorder.record(outputSoundFile);

      setTimeout(function() {
        recorder.stop();
        expect(outputSoundFile.duration()).to.be.closeTo(recordingDuration / 1000, 0.1);

        var outputChannel = outputSoundFile.buffer.getChannelData(0);
        expect(outputChannel[0]).to.not.eq(0);

        outputSoundFile.dispose();
        p5.prototype.masterVolume(0);
        done();
      }, recordingDuration);
    });

    it('can save a recorded buffer to a .wav file', function(done) {
      var recordingDuration = 100;

      var outputSoundFile = new p5.SoundFile();
      inputSoundFile.play();
      recorder.setInput(inputSoundFile);
      recorder.record(outputSoundFile);

      setTimeout(function() {
        recorder.stop();
        expect(outputSoundFile.duration()).to.be.closeTo(recordingDuration / 1000, 0.1);

        p5.prototype.saveSound(outputSoundFile, 'test.wav');
        expect(writeFileCalled).to.be.true;

        outputSoundFile.dispose();
        done();
      }, recordingDuration);
    });
  });
});
