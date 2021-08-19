const expect = chai.expect;

describe('p5.Looper', function () {
  it('setBPM sets the BPM for all parts', function () {
    let part1 = new p5.Part();
    let part2 = new p5.Part();
    let part3 = new p5.Part();
    expect(part1.getBPM()).to.equal(120);
    expect(part2.getBPM()).to.equal(120);
    p5.prototype.setBPM(200);
    expect(part1.getBPM()).to.equal(200);
    expect(part2.getBPM()).to.equal(200);
    expect(part3.getBPM()).to.equal(200);
  });
  describe('Phrase', function () {
    it('can be initialized', function () {
      let phrase = new p5.Phrase('bbox', () => {}, [1, 1, 1, 0, 2, 1, 0]);

      expect(phrase.phraseStep).to.equal(0);
      expect(phrase.name).to.equal('bbox');
      expect(phrase.sequence).to.deep.equal([1, 1, 1, 0, 2, 1, 0]);
    });
  });
  describe('Part', function () {
    it('can be initialized', function () {
      let part = new p5.Part();
      expect(part.length).to.equal(0);
      expect(part.partStep).to.equal(0);
      expect(part.phrases).to.be.an('array').that.is.empty;
      expect(part.tatums).to.equal(0.0625);
      part.metro.setBPM(120);
      expect(part.metro).to.have.property('bpm').to.equal(120);
      expect(part.metro).to.have.property('clock');
      expect(part.metro).to.have.property('syncedParts').to.be.an('array');
    });
    it('can be initialized with steps and beat length', function () {
      let part = new p5.Part(16);
      expect(part.length).to.equal(16);
      part = new p5.Part(8, 1 / 16);
      expect(part.length).to.equal(8);
      expect(part.tatums).to.equal(1 / 16);
    });
    describe('methods', function () {
      it('can set BPM to metro', function () {
        let part = new p5.Part();
        part.setBPM(300);
        expect(part.metro).to.have.property('bpm').to.equal(300);
        part.setBPM(150, 0.1);
        expect(part.metro).to.have.property('bpm').to.equal(150);
      });
      it('can get BPM of metro', function () {
        let part = new p5.Part();
        part.setBPM(600);
        expect(part.getBPM()).to.equal(600);
      });
      it('can be started and stopped', function (done) {
        let ticks;
        let part = new p5.Part();
        part.setBPM(600);
        part.start();
        setTimeout(() => {
          ticks = part.metro.metroTicks;
          part.stop();
          expect(part.partStep).to.equal(0);
          expect(ticks).to.not.equal(0);
          setTimeout(() => {
            expect(part.metro.metroTicks).to.equal(ticks);
            done();
          }, 100);
        }, 1000);
      });
      it('can be started and stopped with a delay', function (done) {
        let ticks;
        let part = new p5.Part();
        part.setBPM(600);
        part.start(0.1);
        expect(part.metro.metroTicks).to.be.zero;
        setTimeout(() => {
          ticks = part.metro.metroTicks;
          part.stop(0.15);
          expect(ticks).to.not.equal(0);
          setTimeout(() => {
            expect(part.metro.metroTicks).to.not.equal(ticks);
          }, 140);
          setTimeout(() => {
            ticks = part.metro.metroTicks;
            setTimeout(() => {
              expect(part.metro.metroTicks).to.equal(ticks);
              done();
            }, 100);
          }, 200);
        }, 1000);
      });
      it('can be started and paused', function (done) {
        let ticks;
        let part = new p5.Part();
        part.setBPM(600);
        expect(part.metro.syncedParts.length).to.equal(0);
        part.start();
        expect(part.isPlaying).to.be.true;
        expect(part.metro.syncedParts.length).to.equal(1);
        setTimeout(() => {
          ticks = part.metro.metroTicks;
          part.pause();
          expect(ticks).to.not.equal(0);
          setTimeout(() => {
            expect(part.metro.metroTicks).to.equal(ticks);
            done();
          }, 100);
        }, 1000);
      });
      it('can start and stop looping', function () {
        let part = new p5.Part();
        expect(part.looping).to.be.false;
        part.loop();
        expect(part.looping).to.be.true;
        expect(part.isPlaying).to.be.true;
        part.noLoop();
        expect(part.looping).to.be.false;
      });
      it('can add a phrase with 1 or 3 arguments', function () {
        let part = new p5.Part(1);
        expect(part.length).to.equal(1);
        part.addPhrase('kick', () => {}, [0, 1, 0, 0]);
        expect(part.phrases.length).to.equal(1);
        expect(part.phrases[0].sequence).to.deep.equal([0, 1, 0, 0]);
        expect(part.length).to.equal(4);
        part.addPhrase(new p5.Phrase('snare', () => {}, [0, 1, 0, 1, 1]));
        expect(part.phrases.length).to.equal(2);
        expect(part.phrases[1].sequence).to.deep.equal([0, 1, 0, 1, 1]);
        expect(part.length).to.equal(5);
      });
      it('can remove a phrase', function () {
        let part = new p5.Part();
        part.addPhrase('kick', () => {}, [1, 0, 0]);
        part.addPhrase('bbox', () => {}, [0, 0, 0, 1]);
        part.addPhrase('snare', () => {}, [0, 1, 1, 1]);
        part.addPhrase('kick', () => {}, [0, 1]);
        expect(part.phrases.length).to.equal(4);
        part.removePhrase('kick');
        expect(part.phrases.length).to.equal(2);
        let count = 0;
        for (var i in part.phrases) {
          if (part.phrases[i].name === 'kick') count++;
        }
        expect(count).to.be.zero;
      });
      it('can get a phrase', function () {
        let part = new p5.Part();
        part.addPhrase('bbox', () => {}, [1, 0]);
        part.addPhrase('bass', () => {}, [0, 1, 0, 1, 1]);
        part.addPhrase('kick', () => {}, [0, 0, 1]);
        part.addPhrase('drum', () => {}, [0, 1, 1]);
        part.addPhrase('bass', () => {}, [1, 1]);
        let phrase = part.getPhrase('bass');
        expect(phrase.name).to.equal('bass');
        expect(phrase.sequence).to.deep.equal([0, 1, 0, 1, 1]);
      });
      it('can replace the sequence of a given phrase name', function () {
        let part = new p5.Part();
        part.addPhrase('drum', () => {}, [0, 1]);
        part.addPhrase('kick', () => {}, [0, 0, 0, 0, 1]);
        part.addPhrase('bass', () => {}, [0, 0, 1]);
        part.addPhrase('bbox', () => {}, [1, 0, 0, 0, 1]);
        let phrase = part.getPhrase('drum');
        expect(phrase.sequence).to.deep.equal([0, 1]);
        part.replaceSequence('drum', [1, 0, 1, 0, 1]);
        phrase = part.getPhrase('drum');
        expect(phrase.sequence).to.deep.equal([1, 0, 1, 0, 1]);
      });
      it('can increment step', function (done) {
        let part = new p5.Part(3);
        let count = 0;
        part.onStep((a) => (count += a));
        part.incrementStep(2);
        expect(count).to.equal(2);
        expect(part.partStep).to.equal(1);
        part.incrementStep(3);
        expect(count).to.equal(5);
        expect(part.partStep).to.equal(2);
        part.incrementStep(5);
        expect(count).to.equal(5);
        done();
      });
      it('onended is called on the last incrementStep call', function (done) {
        let part = new p5.Part(2);
        part.onStep(() => {});
        part.incrementStep();
        part.loop();
        part.looping = false;
        part.incrementStep();
        expect(part.partStep).to.equal(0);
        part = new p5.Part(2);
        part.onStep(() => {});
        part.incrementStep();
        part.loop();
        part.noLoop();
        part.incrementStep();
        expect(part.partStep).to.equal(0);
        expect(part.isPlaying).to.be.false;
        done();
      });
    });
  });
  describe('Score', function () {
    it('can be created with no arguments', function () {
      let score = new p5.Score();
      expect(score.looping).to.be.false;
      expect(score.parts).to.be.a('array').that.is.empty;
      expect(score.currentPart).to.be.zero;
    });
    it('can be created with parts as the arguments', function () {
      let sequences = [
        [1, 0, 1],
        [1, 0, 0, 1],
        [1, 0, 0, 0, 1],
      ];
      let part1 = new p5.Part();
      let part2 = new p5.Part();
      let part3 = new p5.Part();
      part1.addPhrase('drum', () => {}, sequences[0]);
      part2.addPhrase('kick', () => {}, sequences[1]);
      part3.addPhrase('bbox', () => {}, sequences[2]);
      let score = new p5.Score(part1, part2, part3);
      expect(score.parts[0].nextPart.phrases[0].sequence).deep.equal(
        sequences[1]
      );
      expect(score.parts[1].nextPart.phrases[0].sequence).deep.equal(
        sequences[2]
      );
    });
    describe('methods', function () {
      it('can be started and stopped', function (done) {
        let part1 = new p5.Part();
        let part2 = new p5.Part();
        let score = new p5.Score(part1, part2);
        let ticks;
        score.start();
        expect(score.parts[0].isPlaying).to.be.true;
        setTimeout(() => {
          ticks = score.parts[0].metro.metroTicks;
          score.stop();
          expect(score.parts[0].partStep).to.equal(0);
          expect(score.currentPart).to.be.zero;
          expect(score.scoreStep).to.be.zero;
          expect(ticks).to.not.equal(0);
          setTimeout(() => {
            expect(score.parts[0].metro.metroTicks).to.equal(ticks);
            done();
          }, 100);
        }, 1000);
      });
      it('can start and stop looping', function (done) {
        let part1 = new p5.Part();
        let part2 = new p5.Part();
        let score = new p5.Score(part1, part2);
        score.loop();
        expect(score.parts[0].isPlaying).to.be.true;
        expect(score.looping).to.be.true;
        score.noLoop();
        expect(score.looping).to.be.false;
        done();
      });
      it('can play next part when ended', function () {
        let part1 = new p5.Part(1);
        let part2 = new p5.Part(1);
        let score = new p5.Score(part1, part2);
        score.start();
        expect(score.currentPart).to.be.zero;
        part1.incrementStep();
        expect(score.scoreStep).to.be.zero;
        expect(score.parts[0].isPlaying).to.be.false;
        expect(score.parts[1].isPlaying).to.be.true;
        expect(score.currentPart).to.equal(1);
        part2.incrementStep();
        expect(score.parts[0].isPlaying).to.be.false;
      });
      it('can be paused', function () {
        let part1 = new p5.Part(1);
        let part2 = new p5.Part(1);
        let score = new p5.Score(part1, part2);
        score.start();
        part1.incrementStep();
        expect(score.parts[0].isPlaying).to.be.false;
        expect(score.parts[1].isPlaying).to.be.true;
        score.pause();
        expect(score.currentPart).to.equal(1);
      });
      it('can reset a part', function () {
        let sequences = [
          [1, 1],
          [1, 0, 1],
        ];
        let part1 = new p5.Part(2);
        part1.addPhrase('drum', () => {}, sequences[0]);
        part1.addPhrase('kick', () => {}, sequences[1]);
        let score = new p5.Score(part1);
        score.start();
        part1.incrementStep();
        part1.phrases[0].phraseStep = 1;
        part1.phrases[1].phraseStep = 2;
        score.resetPart(0);
        expect(part1.partStep).to.be.zero;
        expect(part1.phrases[0].phraseStep).to.be.zero;
        expect(part1.phrases[1].phraseStep).to.be.zero;
      });
      it('can reset all parts', function () {
        let sequences = [
          [1, 1],
          [1, 0, 1],
          [1, 0, 0, 1],
        ];
        let part1 = new p5.Part(2);
        let part2 = new p5.Part(1);
        part1.addPhrase('drum', () => {}, sequences[0]);
        part1.addPhrase('kick', () => {}, sequences[1]);
        part2.addPhrase('bbox', () => {}, sequences[2]);
        let score = new p5.Score(part1, part2);
        score.start();
        part1.incrementStep();
        part1.incrementStep();
        part2.incrementStep();
        part1.phrases[0].phraseStep = 1;
        part1.phrases[1].phraseStep = 2;
        score.resetParts();
        expect(part1.partStep).to.be.zero;
        expect(part1.phrases[0].phraseStep).to.be.zero;
        expect(part1.phrases[1].phraseStep).to.be.zero;
        expect(part2.partStep).to.be.zero;
        expect(part2.phrases[0].phraseStep).to.be.zero;
      });
      it('can setBPM for all parts', function () {
        let part1 = new p5.Part();
        let part2 = new p5.Part();
        let part3 = new p5.Part();
        let score = new p5.Score(part1, part2, part3);
        part1.setBPM(300);
        score.setBPM(150, 0.2);
        expect(part1.metro.bpm).to.equal(150);
        expect(part2.metro.bpm).to.equal(150);
        expect(part3.metro.bpm).to.equal(150);
      });
    });
  });
});
