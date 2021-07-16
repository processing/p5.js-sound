const expect = chai.expect;

describe('p5.Panner3d', function () {
  it('can be created and disposed', function () {
    let panner3d = new p5.Panner3D();
    expect(panner3d).to.have.property('ac');
    expect(panner3d).to.have.property('input');
    expect(panner3d).to.have.property('output');
    expect(panner3d).to.have.property('panner');
    panner3d.dispose();
    expect(panner3d).to.have.property('ac');
    expect(panner3d).to.not.have.property('panner');
  });

  it('can be connected to a source', function () {
    let gain = new p5.Gain();
    let panner3d = new p5.Panner3D();
    panner3d.connect(gain);
  });
  describe('methods', function () {
    describe('position', function () {
      it('can set positionX, positionY, positionZ without a delay', function () {
        let panner3d = new p5.Panner3D();
        expect(panner3d.positionX()).to.equal(0);
        expect(panner3d.positionX(100)).to.equal(100);
        expect(panner3d.positionY()).to.equal(0);
        expect(panner3d.positionY(-100)).to.equal(-100);
        expect(panner3d.positionZ()).to.equal(0);
        expect(panner3d.positionZ(200)).to.equal(200);
      });
      it('can set positionX, positionY, positionZ with a delay', function () {
        //TODO
      });
      it('can set positionX, positionY, positionZ using set function without a delay', function () {
        let panner3d = new p5.Panner3D();
        expect(panner3d.set(200, 300, -100)).to.deep.equal([200, 300, -100]);
        expect(panner3d.positionX()).to.equal(200);
        expect(panner3d.positionY()).to.equal(300);
        expect(panner3d.positionZ()).to.equal(-100);
      });
      it('can set positionX, positionY, positionZ using set function with a delay', function () {
        //TODO
      });
    });
    describe('orientation', function () {
      it('can set orientationX, orientationY, orientationZ without a delay', function () {
        let panner3d = new p5.Panner3D();
        expect(panner3d.orientX()).to.equal(1);
        expect(panner3d.orientX(100)).to.equal(100);
        expect(panner3d.orientY()).to.equal(0);
        expect(panner3d.orientY(-100)).to.equal(-100);
        expect(panner3d.orientZ()).to.equal(0);
        expect(panner3d.orientZ(200)).to.equal(200);
      });
      it('can set orientationX, orientationY, orientationZ with a delay', function () {
        //TODO
      });
      it('can set orientationX, orientationY, orientationZ using orient function without a delay', function () {
        let panner3d = new p5.Panner3D();

        expect(panner3d.orient(200, 300, -100)).to.deep.equal([200, 300, -100]);
        expect(panner3d.orientX()).to.equal(200);
        expect(panner3d.orientY()).to.equal(300);
        expect(panner3d.orientZ()).to.equal(-100);
      });
      it('can set orientationX, orientationY, orientationZ using orient function with a delay', function () {
        //TODO
      });
    });
    it('can get and set rolloffFactor using rolloff', function () {
      let panner3d = new p5.Panner3D();
      expect(panner3d.rolloff()).to.equal(1);
      expect(panner3d.rolloff(0.4)).to.equal(0.4);
      expect(panner3d.panner.rolloffFactor).to.equal(0.4);
    });
    it('can get and set maxDistance using maxDist', function () {
      let panner3d = new p5.Panner3D();
      expect(panner3d.maxDist()).to.equal(10000);
      expect(panner3d.maxDist(5500)).to.equal(5500);
      expect(panner3d.panner.maxDistance).to.equal(5500);
    });
    it('can set maxDistance and rolloffFactor using setFalloff', function () {
      let panner3d = new p5.Panner3D();
      panner3d.setFalloff(4000, 0.6);
      expect(panner3d.maxDist()).to.equal(4000);
      expect(panner3d.rolloff()).to.equal(0.6);
    });
  });
});
