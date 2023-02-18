const expect = chai.expect;

describe('p5.SoundFile', function () {
  it('can be created and disposed', function () {
    let sf = new p5.SoundFile();
    expect(sf._onended).to.not.throw();

    expect(sf._looping).to.be.false;
    expect(sf._playing).to.be.false;
    expect(sf._paused).to.be.false;
    expect(sf._pauseTime).to.equal(0);

    expect(sf._cues).to.be.an('array').to.have.length(0);
    expect(sf._cueIDCounter).to.equal(0);
    expect(sf._lastPos).to.equal(0);
    expect(sf._counterNode).to.be.null;
    expect(sf._workletNode).to.be.null;
    expect(sf.bufferSourceNodes).to.be.an('array').to.have.length(0);
    expect(sf.bufferSourceNode).to.be.null;
    expect(sf.buffer).to.be.null;
    expect(sf.playbackRate).to.equal(1);
    expect(sf.input).to.have.property('gain');
    expect(sf.input).to.have.property('context');
    expect(sf.output).to.have.property('gain');
    expect(sf.output).to.have.property('context');

    expect(sf.reversed).to.be.false;
    expect(sf.startTime).to.equal(0);
    expect(sf.endTime).to.be.null;
    expect(sf.pauseTime).to.equal(0);
    expect(sf.mode).to.equal('sustain');
    expect(sf.startMillis).to.be.null;
    expect(sf.getPan()).to.equal(0);
    expect(sf).to.have.property('panner');
    expect(p5.soundOut.soundArray).to.include(sf);

    expect(sf._whileLoading).to.not.throw();
    expect(sf).to.have.property('_clearOnEnd');
    expect(sf).to.have.property('amp');
    expect(sf).to.have.property('fade');

    sf.dispose();
    expect(p5.soundOut.soundArray).to.not.include(sf);
    expect(sf.output).to.be.null;
    expect(sf.panner).to.be.null;
  });

  it('can be created with a path', function (done) {
    expect(() => p5.SoundFile('./testAudio/drum')).to.throw();
    p5.prototype.soundFormats('ogg', 'mp3');

    new p5.SoundFile('./testAudio/drum', function () {
      done();
    });
  });

  it('can load sound using loadSound', function (done) {
    p5.prototype.loadSound(
      './testAudio/bx-spring',
      () => done(),
      () => {},
      (progress) => {
        if (progress && progress !== 'size unknown') {
          expect(progress)
            .to.be.a('number')
            .to.be.greaterThan(0)
            .to.be.lessThan(1);
        }
      }
    );
  });

  describe('methods', function () {
    p5.prototype.soundFormats('ogg', 'mp3');
    it('can load a file with a url', function (done) {
      let sf = new p5.SoundFile();
      sf.url = p5.prototype._checkFileFormats('./testAudio/drum');
      sf.load(function () {
        expect(sf.url).to.include('./testAudio/drum');
        expect(sf.buffer.duration).to.be.approximately(1, 0.01); //length
        expect(sf.buffer.length).to.be.approximately(48000, 1000);
        expect(sf.buffer.numberOfChannels).to.equal(2);
        done();
      });
    });
    it('load can throw', function (done) {
      let sf = new p5.SoundFile();
      sf.url = p5.prototype._checkFileFormats('http://badURL.mp3');
      try {
        sf.load(
          () => {},
          (e) => {
            done();
          }
        );
      } catch (error) {
        console.log(error);
      }
    });

    it('can get the progress of loading a file', function (done) {
      new p5.SoundFile(
        './testAudio/bx-spring',
        () => done(),
        () => {},
        (progress) => {
          if (progress && progress !== 'size unknown') {
            expect(progress)
              .to.be.a('number')
              .to.be.greaterThan(0)
              .to.be.lessThan(1);
          }
        }
      );
    });

    it('isLoaded can return if the file/url is loaded', function (done) {
      let sf = new p5.SoundFile('./testAudio/drum', function () {
        expect(sf.isLoaded()).to.be.true;
        done();
      });
      expect(sf.isLoaded()).to.be.false; // false if done is not yet called
    });

    it('can play a file', function (done) {
      let sf = new p5.SoundFile('./testAudio/drum', function () {
        sf.play();
        expect(sf._pauseTime).to.equal(0);
        expect(sf._playing).to.be.true;
        expect(sf._paused).to.be.false;
        expect(sf.bufferSourceNodes.length).to.equal(1);
        expect(sf.bufferSourceNode.loop).to.be.false;
        expect(sf._counterNode.loop).to.be.false;
        setTimeout(() => {
          expect(sf.bufferSourceNodes.length).to.equal(0); //_clearOnEnd is called
          expect(sf._playing).to.be.false;
          done();
        }, 1100);
      });
    });
    it('can play with some delay', function (done) {
      let sf = new p5.SoundFile('./testAudio/drum', function () {
        sf.play(0.5);
        expect(sf.bufferSourceNodes.length).to.equal(1);
        setTimeout(() => {
          expect(sf.bufferSourceNode._playing).to.not.be.false;
          expect(sf.bufferSourceNodes.length).to.equal(1); //_clearOnEnd is not yet called
          setTimeout(() => {
            expect(sf.bufferSourceNode._playing).to.be.false;
            expect(sf.bufferSourceNodes.length).to.equal(0); //_clearOnEnd is called
            done();
          }, 500);
        }, 1100);
      });
    });
    it('play can deal with negative delay', function (done) {
      let sf = new p5.SoundFile('./testAudio/drum', function () {
        sf.play(-0.13);
        expect(sf._playing).to.be.true;
        setTimeout(() => {
          expect(sf._playing).to.be.false;
          done();
        }, 1100);
      });
    });
    it('play can set rate and amplitude', function (done) {
      let sf = new p5.SoundFile('./testAudio/drum', function () {
        sf.play(0.1, 2, 0.5);
        expect(sf.playbackRate).to.equal(2);
        expect(sf._playing).to.be.true;
        setTimeout(() => {
          expect(sf.output.gain.value).to.equal(0.5);
          expect(sf._playing).to.be.false;
          done();
        }, 700); // as play back is 2, 500ms is enough to complete playing
      });
    });
    it('can play with some cue', function (done) {
      let sf = new p5.SoundFile('./testAudio/drum', function () {
        expect(() => sf.play(0.1, 3, 0.85, 1.5)).to.throw(
          'start time out of range'
        ); // can handle cuetime out of bounds
        sf.play(0.1, 2, 0.4, 0.5);
        expect(sf._playing).to.be.true;
        setTimeout(() => {
          expect(sf._playing).to.be.false;
          done();
        }, 550); // as play back is 2 & cued 500ms , 500ms is enough to complete playing
      });
    });
    it('can play with some given duration', function (done) {
      let sf = new p5.SoundFile('./testAudio/drum', function () {
        sf.play(0.1, 1, 0.4, 0, 0.3);
        expect(sf._playing).to.be.true;
        setTimeout(() => {
          expect(sf._playing).to.be.false;
          done();
        }, 500); // 300ms is the duration
      });
    });
    it('can throw if play is called while the buffer is not loaded', function (done) {
      let sf = new p5.SoundFile('./testAudio/drum');
      expect(() => sf.play()).to.throw(
        'not ready to play file, buffer has yet to load. Try preload()'
      );
      done();
    });
    it('play can handle different play modes', function (done) {
      let sf = new p5.SoundFile('./testAudio/drum', function () {
        sf.mode = 'restart';
        sf.play();
      });
      let sf2 = new p5.SoundFile('./testAudio/drum', function () {
        sf2.play();
        sf2.mode = 'untildone';
        sf2.play();
        // expect(sf._playing).to.be.false;
        setTimeout(() => {
          expect(sf.bufferSourceNodes.length).to.equal(1); // other play is not added
          done();
        }, 10);
      });
    });
    it('handles multiple play calls', function (done) {
      let sf = new p5.SoundFile('./testAudio/drum', function () {
        sf.play(0, 2, 0, 0.5);
        setTimeout(() => {
          expect(sf.bufferSourceNodes.length).to.equal(1);
          sf.play(0, 2, 0.4, 0.1);
          expect(sf.bufferSourceNodes.length).to.equal(2);
          setTimeout(() => {
            //one completes playing but the sound file's is not yet set to false
            expect(sf.bufferSourceNodes.length).to.equal(1);
            expect(sf._playing).to.be.true;
            setTimeout(() => {
              expect(sf.bufferSourceNodes.length).to.equal(0);
              expect(sf._playing).to.be.false;
              done();
            }, 200);
          }, 300);
        }, 100);
      });
    });

    it('can set play modes', function () {
      let sf = new p5.SoundFile();
      sf.playMode('restart');
      expect(sf.mode).to.equal('restart');

      sf.playMode('SUStain'); // to lower case is applied
      expect(sf.mode).to.equal('sustain');

      sf.playMode('untilDone');
      expect(sf.mode).to.equal('untildone');
    });
    it('playMode can throw if given invalid params', function () {
      let sf = new p5.SoundFile();
      let errorMsg = 'Invalid play mode. Must be either "restart" or "sustain"';
      expect(() => sf.playMode('bad param')).to.throw(errorMsg);
      expect(() => sf.playMode(' restart')).to.not.throw(errorMsg); // trim is applied
    });
    it('setting playMode to restart stops all playing buffers', function (done) {
      let sf = new p5.SoundFile('./testAudio/drum', function () {
        sf.play();
        sf.playMode('restart');
        setTimeout(() => {
          expect(sf.bufferSourceNode._playing).to.be.false;
          expect(sf._playing).to.be.false;
          done();
        }, 100);
      });
    });

    it('can pause currently playing buffer', function (done) {
      let sf = new p5.SoundFile('./testAudio/drum', function () {
        sf.play();
        setTimeout(() => {
          sf.pause();
          expect(sf._playing).to.be.false;
          expect(sf._paused).to.be.true;
          expect(sf._pauseTime).to.be.approximately(0.1, 0.01);
          expect(sf.pauseTime).to.be.approximately(0.1, 0.01);
          setTimeout(() => {
            sf.pause();
            expect(sf._pauseTime).to.be.approximately(0, 0.01); // pause on stopped node resets time
            expect(sf.bufferSourceNodes.length).to.equal(0);
            expect(sf.bufferSourceNode._playing).to.be.false;
            done();
          }, 10);
        }, 100);
      });
    });
    it('can be played after pausing', function (done) {
      let sf = new p5.SoundFile('./testAudio/drum', function () {
        sf.play(0, 2, 0, 0.1);
        setTimeout(() => {
          sf.pause();
          setTimeout(() => {
            sf.play(); // takes only 300 more ms to complete
            setTimeout(() => {
              expect(sf.bufferSourceNodes.length).to.equal(0);
              expect(sf._playing).to.be.false;
              done();
            }, 300);
          }, 100);
        }, 200);
      });
    });

    it('can be looped', function (done) {
      let sf = new p5.SoundFile('./testAudio/drum', function () {
        sf.loop(0, 2, 0.1, 0.1, 1);
        expect(sf.bufferSourceNode.loop).to.be.true;
        expect(sf._counterNode.loop).to.be.true;
        expect(sf.bufferSourceNode.loopStart).to.be.approximately(0.1, 0.01);
        expect(sf.bufferSourceNode.loopEnd).to.be.approximately(1, 0.01);
        expect(sf._counterNode.loopStart).to.be.approximately(0.1, 0.01);
        expect(sf._counterNode.loopEnd).to.be.approximately(1, 0.01);
        done();
      });
    });

    it('can set looping to true/false', function () {
      let sf = new p5.SoundFile('./testAudio/drum', function () {
        sf.loop(0, 2, 0.1, 0.1, 0);

        sf.setLoop(true);
        expect(sf.bufferSourceNode.loop).to.be.true;
        expect(sf._counterNode.loop).to.be.true;

        sf.setLoop(false);
        expect(sf.bufferSourceNode.loop).to.be.false;
        expect(sf._counterNode.loop).to.be.false;
        //bad param
        expect(() => sf.setLoop('a')).to.throw(
          'Error: setLoop accepts either true or false'
        );
      });
    });

    it('isLooping can return if the file is looping', function (done) {
      let sf = new p5.SoundFile('./testAudio/drum', function () {
        expect(sf.isLooping()).to.be.false;
        sf.loop(0, 2, 0.1, 0.1, 0.25);
        expect(sf.isLooping()).to.be.true;
        sf.stop();
        expect(sf.isLooping()).to.be.false;
        done();
      });
    });
    it('isPlaying can return if the file is playing', function (done) {
      let sf = new p5.SoundFile('./testAudio/drum', function () {
        expect(sf.isPlaying()).to.be.false;
        sf.play(0, 2, 0.1, 0.1, 0.25);
        expect(sf.isPlaying()).to.be.true;
        setTimeout(() => {
          expect(sf.isPlaying()).to.be.false;
          done();
        }, 500);
      });
    });
    it('isPaused can return if the file is paused', function (done) {
      let sf = new p5.SoundFile('./testAudio/drum', function () {
        expect(sf.isPaused()).to.be.false;
        sf.play(0, 2, 0.1, 0.1, 0.25);
        sf.pause();
        expect(sf.isPaused()).to.be.true;
        sf.play();
        expect(sf.isPaused()).to.be.false;
        done();
      });
    });

    it('can be stopped', function (done) {
      let sf = new p5.SoundFile('./testAudio/drum', function () {
        sf.stop(); // no affect
        sf.play();
        sf.stop();
        expect(sf._playing).to.be.false;
        expect(sf._paused).to.be.false;
        setTimeout(() => {
          expect(sf.bufferSourceNodes.length).to.equal(0); //_clearOnEnd is called
          done();
        }, 10);
      });
    });
    it('can be stopped after a pause', function (done) {
      let sf = new p5.SoundFile('./testAudio/drum', function () {
        sf.play();
        setTimeout(() => {
          sf.pause();
          sf.stop();
          expect(sf._paused).to.be.false;
          expect(sf.pauseTime).to.equal(0);
          done();
        }, 100);
      });
    });
    it('can handle multiple restarts', function (done) {
      let sf = new p5.SoundFile('./testAudio/drum', function () {
        sf.play();
        sf.play();
        sf.stop();
        sf.stop();
        expect(sf.isPlaying()).to.equal(false);
        sf.play();
        expect(sf.isPlaying()).to.equal(true);
        done();
      });
    });
    it('can stop with a delay', function (done) {
      let sf = new p5.SoundFile('./testAudio/drum', function () {
        sf.play();
        sf.stop(0.1);
        expect(sf._playing).to.be.false;
        setTimeout(() => {
          expect(sf.bufferSourceNode._playing).to.not.be.false;
          expect(sf.bufferSourceNodes.length).to.equal(1); //_clearOnEnd is not called
          setTimeout(() => {
            expect(sf.bufferSourceNode._playing).to.be.false;
            expect(sf.bufferSourceNodes.length).to.equal(0); //_clearOnEnd is called
            done();
          }, 100);
        }, 50);
      });
    });
    it('stop can handle different play modes', function (done) {
      let sf = new p5.SoundFile('./testAudio/drum', function () {
        sf.play();
        sf.playMode('sustain'); // deafult
        sf.play();
        sf.stop();
        expect(sf.bufferSourceNodes.length).to.equal(2);
        setTimeout(() => {
          expect(sf.bufferSourceNodes.length).to.equal(0);
          expect(sf._playing).to.be.false;
        }, 10);
      });

      let sf2 = new p5.SoundFile('./testAudio/drum', function () {
        sf2.play();
        sf2.playMode('restart');
        sf2.play();
        setTimeout(() => {
          expect(sf2.bufferSourceNodes.length).to.equal(1);
          sf2.stop();
          setTimeout(() => {
            expect(sf2.bufferSourceNodes.length).to.equal(0);
            expect(sf2._playing).to.be.false;
            done();
          }, 20);
        }, 10);
      });
    });

    it('can stop all buffers at once', function (done) {
      let sf = new p5.SoundFile('./testAudio/drum', function () {
        sf.play();
        setTimeout(() => {
          sf.play();
          setTimeout(() => {
            expect(sf.bufferSourceNodes.length).to.equal(2);
            sf.stopAll();
            setTimeout(() => {
              expect(sf.bufferSourceNodes.length).to.equal(0);
              expect(sf._playing).to.be.false;
              done();
            }, 10);
          }, 10);
        }, 100);
      });
    });
    it('can stop all buffers with a delay', function (done) {
      let sf = new p5.SoundFile('./testAudio/drum', function () {
        sf.play();
        setTimeout(() => {
          sf.play();
          setTimeout(() => {
            expect(sf.bufferSourceNodes.length).to.equal(2);
            sf.stopAll(0.1);
            setTimeout(() => {
              expect(sf.bufferSourceNodes.length).to.equal(2);
              expect(sf._playing).to.be.true;
              setTimeout(() => {
                expect(sf.bufferSourceNodes.length).to.equal(0);
                expect(sf._playing).to.be.false;
                done();
              }, 20);
            }, 90);
          }, 10);
        }, 100);
      });
    });

    it('can get volume', function (done) {
      let sf = new p5.SoundFile('./testAudio/drum', function () {
        sf.play(0.1, 2, 0.73);
        setTimeout(() => {
          expect(sf.output.gain.value).to.be.approximately(0.73, 0.01);
          expect(sf.getVolume()).to.be.approximately(0.73, 0.01);
          done();
        }, 10);
      });
    });

    it('can get and set pan value', function () {
      let sf = new p5.SoundFile();
      expect(sf.getPan()).to.equal(0);
      sf.pan(0.32);
      setTimeout(() => {
        expect(sf.getPan()).to.equal(0.32);
      }, 5);
      //with delay
      let sf2 = new p5.SoundFile();
      sf2.pan(-0.89, 0.1);
      setTimeout(() => {
        expect(sf2.getPan()).to.equal(-0.89);
      }, 100);
    });

    it('can get and set playback rate', function () {
      let sf = new p5.SoundFile('./testAudio/drum', function () {
        expect(sf.rate()).to.equal(1);
        expect(sf.getPlaybackRate()).to.equal(1);
        sf.play();
        sf.rate(0.92);
        expect(sf.playbackRate).to.equal(0.92);
        expect(sf.rate()).to.equal(0.92);
        expect(sf.getPlaybackRate()).to.equal(0.92);
        setTimeout(() => {
          expect(sf.bufferSourceNode.playbackRate.value).to.be.approximately(
            0.92,
            0.01
          );
          expect(sf._counterNode.playbackRate.value).to.be.approximately(
            0.92,
            0.01
          );
        }, 10);
      });
    });
    it('can handle zero rate', function (done) {
      let sf = new p5.SoundFile('./testAudio/drum', function () {
        sf.play();
        sf.rate(0);
        expect(sf.getPlaybackRate()).to.equal(0);
        setTimeout(() => {
          expect(sf.bufferSourceNode.playbackRate.value).to.not.equal(0);
          expect(sf.bufferSourceNode.playbackRate.value).to.be.approximately(
            0,
            0.001
          );
          expect(sf._counterNode.playbackRate.value).to.not.equal(0);
          expect(sf._counterNode.playbackRate.value).to.be.approximately(
            0,
            0.001
          );
          done();
        }, 10);
      });
    });
    it('can handle negative playback rate', function (done) {
      let sf = new p5.SoundFile('./testAudio/drum', function () {
        sf.play();
        expect(sf.rate(-0.45)).to.equal(-0.45);
        setTimeout(() => {
          expect(sf.bufferSourceNode.playbackRate.value).to.be.approximately(
            0.45,
            0.01
          );
          expect(sf._counterNode.playbackRate.value).to.be.approximately(
            0.45,
            0.01
          );
          expect(sf.reversed).to.be.true; // reversed due to -ve rate
          expect(sf.rate(0.55)).to.equal(0.55);
          setTimeout(() => {
            expect(sf.reversed).to.be.false; // applied +ve rate to reversed buffer
            done();
          }, 10);
        }, 10);
      });
    });

    it('can set pitch', function () {
      let sf = new p5.SoundFile();
      sf.setPitch(59);
      let rate = p5.prototype.midiToFreq(59) / p5.prototype.midiToFreq(60);
      expect(sf.getPlaybackRate()).to.be.approximately(rate, 0.001);
    });

    it('can get and set volume', function () {
      let sf = new p5.SoundFile();
      expect(sf.setVolume().value).to.equal(1);
      sf.setVolume(0.22);
      setTimeout(() => {
        expect(sf.setVolume().value).to.be.approximately(0.22, 0.01);
        expect(sf.output.gain.value).to.be.approximately(0.22, 0.01);
      }, 10);

      let amp = new p5.Amplitude();
      sf.setVolume(amp); //connect to audio node
    });
    it('can set volume with ramp time', function (done) {
      let sf = new p5.SoundFile();
      sf.setVolume(0.74, 1);
      setTimeout(() => {
        expect(sf.setVolume().value).to.be.greaterThan(0.74);
        expect(sf.setVolume().value).to.be.lessThan(1);
        setTimeout(() => {
          expect(sf.setVolume().value).to.be.approximately(0.74, 0.01);
          done();
        }, 500);
      }, 500);
    });
    it('can set volume with delay time', function (done) {
      let sf = new p5.SoundFile();
      sf.setVolume(0.492, 0.5, 0.5);
      setTimeout(() => {
        expect(sf.setVolume().value).to.be.approximately(1, 0.01);
        setTimeout(() => {
          expect(sf.setVolume().value).to.be.approximately(0.492, 0.01);
          done();
        }, 500);
      }, 500);
    });

    it('can get the duration', function (done) {
      let sf = new p5.SoundFile();
      expect(sf.duration()).to.equal(0); // if no buffer is loaded

      let sf2 = new p5.SoundFile('./testAudio/bx-spring', () => {
        sf2.play();
        expect(sf2.duration()).to.be.approximately(7.78, 0.01);
        sf2.stop();
        done();
      });
    });
    it('can get current time', function (done) {
      let sf = new p5.SoundFile('./testAudio/bx-spring', () => {
        expect(sf.currentTime()).to.equal(0); // last pos is zero
        sf.play();
        setTimeout(() => {
          expect(sf.currentTime()).to.be.approximately(0.5, 0.01);
          sf.stop();
          done();
        }, 500);
      });
    });
    it('can preserve current time', function (done) {
      let sf = new p5.SoundFile('./testAudio/bx-spring', () => {
        sf.play();
        setTimeout(() => {
          sf.pause();
          expect(sf.currentTime()).to.be.approximately(0.2, 0.01);
          sf.play();
          setTimeout(() => {
            expect(sf.currentTime()).to.be.approximately(0.4, 0.01);
            sf.stop();
            done();
          }, 200);
        }, 200);
      });
    });
    it('can get current time if the file is reversed', function () {
      //todo
      //   let sf = new p5.SoundFile('./testAudio/bx-spring', () => {
      //     sf.play();
      //     setTimeout(() => {
      //       sf.rate(-1);
      //       setTimeout(() => {
      //         sf.play();
      //         setTimeout(() => {
      //           expect(sf.currentTime()).to.be.approximately(0.1, 0.01);
      //           done();
      //         }, 300);
      //       }, 10);
      //     }, 400);
      //   });
    });

    it('can jump playhead to a new position', function () {
      //todo
    });

    it('can get number of channels', function (done) {
      let sf = new p5.SoundFile();
      expect(sf.channels()).to.be.undefined; // no buffer

      let sf2 = new p5.SoundFile('./testAudio/bx-spring', () => {
        sf2.play();
        expect(sf2.channels()).to.equal(2);
        done();
      });
    });
    it('can get sample rate', function (done) {
      let sf = new p5.SoundFile();
      expect(sf.sampleRate()).to.be.undefined; // no buffer

      let sf2 = new p5.SoundFile('./testAudio/bx-spring', () => {
        sf2.play();
        expect(sf2.sampleRate()).to.equal(48000);
        done();
      });
    });
    it('can get number of frames', function (done) {
      let sf = new p5.SoundFile();
      expect(sf.frames()).to.be.undefined; // no buffer

      let sf2 = new p5.SoundFile('./testAudio/bx-spring', () => {
        sf2.play();
        expect(sf2.frames()).to.equal(sf2.buffer.length);
        done();
      });
    });

    it('can get peaks', function () {
      let sf = new p5.SoundFile('./testAudio/bx-spring', () => {
        sf.play();
        let peaks = sf.getPeaks();
        expect(peaks.length).to.equal(window.innerWidth * 5); // default length
        peaks = sf.getPeaks(sf.buffer.length / 4);
        expect(peaks.length).to.be.approximately(sf.buffer.length / 4, 10);
      });

      let sf2 = new p5.SoundFile();
      expect(() => sf2.getPeaks()).to.throw(
        'Cannot load peaks yet, buffer is not loaded'
      );
    });
    it('can reverse the buffer', function (done) {
      let sf = new p5.SoundFile('./testAudio/bx-spring', () => {
        sf.play();
        let buffer = sf.buffer.getChannelData(0);
        sf.reverseBuffer();
        expect(sf.buffer.getChannelData(0).length).to.equal(buffer.length);
        expect(sf.buffer.getChannelData(0).reverse()).to.deep.equal(buffer);
        expect(sf.reversed).to.be.true;
        sf.reverseBuffer();
        expect(buffer).to.deep.equal(sf.buffer.getChannelData(0));
        done();
      });

      let sf2 = new p5.SoundFile();
      expect(() => sf2.reverseBuffer()).to.throw(
        'SoundFile is not done loading'
      );
    });

    it('can set onended function', function (done) {
      let sf = new p5.SoundFile('./testAudio/bx-spring', () => {
        sf.play();
        let isCalled = false;
        sf.onended(() => (isCalled = true));
        expect(isCalled).to.be.false;
        setTimeout(() => {
          sf.stop();
          setTimeout(() => {
            expect(isCalled).to.be.true;
            done();
          }, 10);
        }, 100);
      });
    });

    it('can be connected and disconnected', function () {
      let sf = new p5.SoundFile();
      //to p5sound-input
      sf.connect();
      sf.disconnect();
      let filter = new p5.Filter();
      sf.connect(filter); // to filter.input
      sf.disconnect();
      sf.connect(filter.input);
      sf.disconnect();
    });

    it('can setpath', function (done) {
      let sf = new p5.SoundFile();
      sf.url = p5.prototype._checkFileFormats('./testAudio/drum');
      sf.setPath('./testAudio/bx-spring', () => {
        expect(sf.url).to.include('./testAudio/bx-spring');
        done();
      });
    });

    it('can set buffer', function () {
      let sf = new p5.SoundFile();
      sf.setBuffer([[1], [1]]);
      expect(sf.buffer.getChannelData(0)).to.deep.equal(new Float32Array([1]));
      expect(sf.buffer.length).to.equal(1);
    });

    it('can initialize counter node', function () {
      let sf = new p5.SoundFile('./testAudio/bx-spring', () => {
        let counterNode = sf._initCounterNode();
        expect(counterNode.buffer.duration).to.deep.equal(sf.buffer.duration);
        expect(counterNode.buffer.length).to.deep.equal(sf.buffer.length);
      });
    });

    it('can initialize buffer source node', function () {
      let sf = new p5.SoundFile('./testAudio/bx-spring', () => {
        sf.rate(0.25);
        let bufferSourceNode = sf._initSourceNode();
        expect(bufferSourceNode.buffer.duration).to.deep.equal(
          sf.buffer.duration
        );
        expect(bufferSourceNode.buffer.length).to.deep.equal(sf.buffer.length);
        expect(bufferSourceNode.playbackRate.value).to.equal(0.25);
      });
    });

    it('can add a cue', function () {
      let sf = new p5.SoundFile();
      let isCalled = false;
      sf.addCue(0.45, () => (isCalled = true), 20);
      expect(sf._cues.length).to.equal(1);
      expect(sf._cues[0].time).to.equal(0.45);
      expect(sf._cues[0].id).to.equal(0);
      expect(sf._cues[0].val).to.equal(20);
      expect(isCalled).to.be.false;
      sf._cues[0].callback();
      expect(isCalled).to.be.true;
    });
    it('can remove a cue', function () {
      let sf = new p5.SoundFile();
      sf.addCue(0.45, () => {}, 20);
      sf.addCue(0.75, () => {}, 50);
      expect(sf._cues.length).to.equal(2);
      sf.removeCue(0);
      expect(sf._cues.length).to.equal(1);
      expect(sf._cues[0].time).to.equal(0.75);
      expect(sf._cues[0].id).to.equal(1);
      expect(sf._cues[0].val).to.equal(50);
    });
    it('can clear all cues', function () {
      let sf = new p5.SoundFile();
      sf.addCue(0.45, () => {}, 20);
      sf.addCue(0.75, () => {}, 50);
      expect(sf._cues.length).to.equal(2);
      sf.clearCues();
      expect(sf._cues.length).to.equal(0);
    });
    it('calls the cueCallbacks correct number of times', function (done) {
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
        sf.addCue((audioLength * 6) / 5, callback);

        sf.play();

        sf.onended(() => {
          expect(numberOfCuesCalls).to.equal(4);
          done();
        });
      }
    }); // tests _onTimeUpdate function

    it('can save a buffer to a file', function (done) {
      let writeFileSub = sinon.stub(p5.prototype, 'writeFile');
      let sf = new p5.SoundFile('./testAudio/bx-spring', () => {
        sf.save('testName');
        expect(writeFileSub.called).to.be.true;
        done();
      });
    });

    it('can get blob', function () {
      let sf = new p5.SoundFile('./testAudio/drum', () => {
        expect(sf.getBlob().type).to.equal('audio/wav');
      });
    });

    it('can execute _onNewInput() hook on connected unit', function (done) {
      let sf = new p5.SoundFile();
      const gain = new p5.Gain();
      gain._onNewInput = function () {
        done();
      };
      sf.connect(gain);
    });
  });
});
