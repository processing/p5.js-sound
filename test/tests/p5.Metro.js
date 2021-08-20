const expect = chai.expect;
let metro;

describe('p5.Metro', function () {
  beforeEach(function () {
    metro = new p5.Metro();
  });

  it('can be created', function () {
    expect(metro).to.have.property('bpm').to.equal(120);
    expect(metro).to.have.property('clock');
    expect(metro).to.have.property('syncedParts').to.be.an('array');
  });

  it('can be initialised with a beatlength, bpm', function () {
    metro.beatLength(0.0625);
    metro.setBPM(60);
    expect(metro.tatums).to.equal(4);
    expect(metro.tatumTime).to.equal(0.25);
    expect(metro.getBPM()).to.equal(60);
  });

  it('can be started and stopped', function (done) {
    this.timeout = 2000;
    let ticks;
    metro.setBPM(600);
    metro.start();
    setTimeout(() => {
      ticks = metro.metroTicks;
      metro.stop();
      expect(ticks).to.not.equal(0);
      setTimeout(() => {
        expect(metro.metroTicks).to.equal(ticks);
        done();
      }, 100);
    }, 1000);
  });

  it('can be started and stopped with delay', function (done) {
    let ticks;
    metro.setBPM(600);
    metro.start(0.1);
    setTimeout(() => {
      ticks = metro.metroTicks;
      metro.stop(0.2);
      expect(ticks).to.not.equal(0);
      setTimeout(() => {
        expect(metro.metroTicks).to.be.above(ticks);
      }, 100);
      setTimeout(() => {
        ticks = metro.metroTicks;
        setTimeout(() => {
          expect(metro.metroTicks).to.equal(ticks);
          done();
        }, 100);
      }, 200);
    }, 1000);
  });

  it('can sync parts', function () {
    let part = new p5.Part();
    part.addPhrase('snare', () => {}, [0, 0, 1, 0]);
    part.setBPM(60);
    part.noLoop();
    part.start();
    expect(metro.syncedParts.length).to.equal(0);
    metro.resetSync(part);
    expect(metro.syncedParts.length).to.equal(1);
  });

  it('parts can be pushed into syncedParts', function () {
    let phraseAttack = new p5.Phrase('testerAttack', () => {}, [1, 0, 0, 0]);
    let part = new p5.Part();
    part.addPhrase(phraseAttack);
    part.setBPM(60);
    part.start();
    expect(metro.syncedParts.length).to.equal(0);
    metro.pushSync(part);
    expect(metro.syncedParts.length).to.equal(1);
    metro.pushSync(part);
    expect(metro.syncedParts.length).to.equal(2);
    metro.resetSync(part);
    expect(metro.syncedParts.length).to.equal(1);
  });
});
