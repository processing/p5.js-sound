const expect = chai.expect;

describe('p5.SoundLoop', function () {
  it('can be initialized without any arguments', function () {
    let sloop = new p5.SoundLoop();
    expect(sloop._bpm).to.equal(60);
    expect(sloop.musicalTimeMode).to.be.false;
    expect(sloop._interval).to.equal(1);
    expect(sloop._timeSignature).to.equal(4);
    expect(sloop.isPlaying).to.be.false;
  });
  it('can be initialized with all arguments', function () {
    let sloop = new p5.SoundLoop(() => {}, '8n');

    //bpm
    sloop.bpm = 85;
    expect(sloop.bpm).to.equal(85);
    expect(sloop._bpm).to.equal(85);

    //timeSignature
    sloop.timeSignature = 6;
    expect(sloop.timeSignature).to.equal(6);
    expect(sloop._timeSignature).to.equal(6);

    //interval
    sloop.interval = 0.1;
    expect(sloop.interval).to.equal(0.1);
    expect(sloop._interval).to.equal(0.1);
    expect(sloop.musicalTimeMode).to.be.false;

    //iterations
    expect(sloop.iterations).to.equal(0); // cannot set iterations
  });
  describe('methods', function () {
    it('can be started and stopped', function (done) {
      let count = 0;
      let sloop = new p5.SoundLoop(() => count++, '2n');
      let ticks;
      sloop.bpm = 600;
      sloop.start();
      expect(sloop.isPlaying).to.be.true;
      setTimeout(() => {
        ticks = sloop.iterations;
        sloop.stop();
        expect(sloop.isPlaying).to.be.false;
        expect(ticks).to.not.equal(0);
        expect(count).to.be.approximately(ticks, 2);
        done();
      }, 1000);
    });
    it('can be started and stopped with delay', function (done) {
      let count = 0;
      let ticks;
      let sloop = new p5.SoundLoop(() => count++, '6n');
      sloop.bpm = 600;
      sloop.start(0.1);
      setTimeout(() => {
        ticks = sloop.iterations;
        sloop.stop(0.2);
        expect(ticks).to.not.equal(0);
        setTimeout(() => {
          expect(sloop.iterations).to.not.equal(ticks);
        }, 100);
        setTimeout(() => {
          expect(count).to.be.approximately(ticks, 2);
          done();
        }, 200);
      }, 1000);
    });
    it('can be paused and be started again', function (done) {
      let ticks;
      let sloop = new p5.SoundLoop(() => {}, '1m');
      sloop.bpm = 600;
      sloop.start();
      setTimeout(() => {
        ticks = sloop.iterations;
        sloop.pause();
        expect(ticks).to.not.equal(0);
        setTimeout(() => {
          expect(sloop.iterations).to.equal(ticks);
          sloop.start();
          setTimeout(() => {
            expect(sloop.iterations).to.be.at.least(ticks);
            done();
          }, 100);
        }, 100);
      }, 1000);
    });
    it('can be synced with a new loop', function (done) {
      let sloop1 = new p5.SoundLoop(() => {}, '4n');
      let sloop2 = new p5.SoundLoop(() => {}, '4n');
      let count1 = 0;
      sloop1.bpm = 600;
      sloop2.bpm = 600;
      sloop1.start();
      setTimeout(() => {
        sloop1.pause();
        count1 = sloop1.iterations;
        sloop2.syncedStart(sloop1, 0.3);
        setTimeout(() => {
          expect(sloop1.iterations).to.equal(count1 + sloop2.iterations);
          done();
        }, 1000);
      }, 100);
    });
    it('can be synced with a playing loop', function (done) {
      let sloop1 = new p5.SoundLoop(() => {}, '6n');
      let sloop2 = new p5.SoundLoop(() => {}, '6n');
      let count1 = 0;
      sloop1.bpm = 600;
      sloop2.bpm = 600;
      sloop1.start();
      setTimeout(() => {
        count1 = sloop1.iterations;
        sloop2.syncedStart(sloop1, 0.3);
        setTimeout(() => {
          expect(sloop1.iterations).to.equal(count1 + sloop2.iterations);
          done();
        }, 1000);
      }, 100);
    });
    it('can convert notation from musical time format to seconds', function () {
      let sloop = new p5.SoundLoop(() => {}, '1n');
      sloop.timeSignature = 8;
      expect(sloop._convertNotation('2m')).to.equal(16);
      expect(sloop._convertNotation('4n')).to.equal(2);
    });
    it('can calculate frequency for numerical interval', function () {
      let sloop = new p5.SoundLoop(() => {}, '1n');
      sloop.interval = 4;
      expect(sloop._calcFreq()).to.equal(0.25);
      expect(sloop.musicalTimeMode).to.be.false;
    });
    it('can calculate frequency for non-numerical interval', function () {
      let sloop = new p5.SoundLoop(() => {}, '1n');
      sloop.interval = '8m';
      expect(sloop._calcFreq()).to.be.approximately(0.03125, 0.00001);
      expect(sloop.musicalTimeMode).to.be.true;
      sloop.interval = '9n';
      expect(sloop._calcFreq()).to.be.approximately(2.25, 0.01);
      expect(sloop.musicalTimeMode).to.be.true;
    });
    it("can update the clock's frequency", function (done) {
      let sloop = new p5.SoundLoop(() => {}, '2m');
      expect(sloop.clock.frequency.value).to.equal(0.125);

      sloop.interval = 2; //updates via setter
      expect(sloop.clock.frequency.value).to.equal(0.5);

      sloop.interval = '4n'; //updates via setter
      expect(sloop.clock.frequency.value).to.equal(1);

      sloop.timeSignature = 8; //updates via setter
      expect(sloop.clock.frequency.value).to.equal(1);

      sloop.bpm = 300; //updates via setter
      expect(sloop.clock.frequency.value).to.equal(5);
      done();
    });
  });
});
