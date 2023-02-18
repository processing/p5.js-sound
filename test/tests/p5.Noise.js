const expect = chai.expect;

describe('p5.Noise', function () {
  it('can be created and disposed', function () {
    let noise = new p5.Noise();
    expect(noise).to.not.have.property('f');
    expect(noise).to.not.have.property('oscillator');
    expect(noise).to.have.property('buffer');
    expect(noise.started).to.be.false;
    expect(noise.buffer.type).to.equal('white');

    noise.dispose();
    expect(noise.output).to.be.null;
    expect(noise.panner).to.be.null;
    expect(noise.buffer).to.be.null;
    expect(noise.noise).to.be.null;
  });
  describe('methods', function () {
    it('can get and set type', function (done) {
      let noise = new p5.Noise();
      noise.start();
      noise.setType('brown');
      expect(noise.getType()).to.equal('brown');
      noise.setType();
      expect(noise.getType()).to.equal('white');
      setTimeout(() => {
        expect(noise.started).to.be.true;
        done();
      }, 100);
    });
    it('can be started and stopped', function () {
      let noise = new p5.Noise();
      expect(noise).to.not.have.property('noise');
      noise.start();
      expect(noise).to.have.property('noise');
      expect(noise.noise).to.have.property('buffer');
      expect(noise.noise.loop).to.be.true;
      expect(noise.started).to.be.true;
      noise.stop();
      expect(noise.started).to.be.false;
    });
    //TODO: test noise buffer generator functions
  });
});
