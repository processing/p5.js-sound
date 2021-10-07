const expect = chai.expect;

describe('p5.Listener3D', function () {
  let listener3d;
  it('can be created', function () {
    listener3d = new p5.Listener3D();
    expect(listener3d).to.have.property('ac');
    expect(listener3d.listener).to.have.property('forwardX');
    expect(listener3d.listener).to.have.property('positionY');
    expect(listener3d.listener).to.have.property('upZ');
  });

  it('can be connected to a source', function () {
    let gain = new p5.Gain();
    listener3d = new p5.Listener3D();
    listener3d.process(gain);
  });

  describe('methods', function () {
    describe('position', function () {
      it('can set positionX, positionY, positionZ without a delay', function () {
        listener3d = new p5.Listener3D();
        expect(listener3d.positionX()).to.equal(0);
        expect(listener3d.positionX(-100)).to.equal(-100);
        expect(listener3d.positionY()).to.equal(0);
        expect(listener3d.positionY(300)).to.equal(300);
        expect(listener3d.positionZ()).to.equal(0);
        expect(listener3d.positionZ(200)).to.equal(200);
      });
      it('can set positionX, positionY, positionZ with a delay', function () {
        //TODO
      });
      it('can set positionX, positionY, positionZ using position function without a delay', function () {
        listener3d = new p5.Listener3D();
        expect(listener3d.position(10, 500, 100)).to.deep.equal([10, 500, 100]);
        expect(listener3d.positionX()).to.equal(10);
        expect(listener3d.positionY()).to.equal(500);
        expect(listener3d.positionZ()).to.equal(100);
      });
      it('can set positionX, positionY, positionZ using position function with a delay', function () {
        //TODO
      });
    });

    describe('orientation forward', function () {
      it('can set forwardX, forwardY, forwardZ without a delay', function () {
        listener3d = new p5.Listener3D();
        expect(listener3d.forwardX()).to.equal(0);
        expect(listener3d.forwardX(400)).to.equal(400);
        expect(listener3d.forwardY()).to.equal(0);
        expect(listener3d.forwardY(700)).to.equal(700);
        expect(listener3d.forwardZ()).to.equal(-1);
        expect(listener3d.forwardZ(-800)).to.equal(-800);
      });
      it('can set forwardX, forwardY, forwardZ with a delay', function () {
        //TODO
      });
      it('can set forwardX, forwardY, forwardZ using orientForward function without a delay', function () {
        listener3d = new p5.Listener3D();
        listener3d.orientForward(-100, 100, 300);
        expect(listener3d.forwardX()).to.equal(-100);
        expect(listener3d.forwardY()).to.equal(100);
        expect(listener3d.forwardZ()).to.equal(300);
      });
      it('can set forwardX, forwardY, forwardZ using orientForward function without a delay', function () {
        //TODO
      });
    });

    describe('orientation up', function () {
      it('can set upX, forwardY, upZ without a delay', function () {
        listener3d = new p5.Listener3D();
        expect(listener3d.upX()).to.equal(0);
        expect(listener3d.upX(900)).to.equal(900);
        expect(listener3d.upY()).to.equal(1);
        expect(listener3d.upY(250)).to.equal(250);
        expect(listener3d.upZ()).to.equal(0);
        expect(listener3d.upZ(-100)).to.equal(-100);
      });
      it('can set upX, forwardY, upZ with a delay', function (done) {
        expect(listener3d.upX()).to.equal(0);
        expect(listener3d.upY()).to.equal(1);
        expect(listener3d.upZ()).to.equal(0);

        listener3d.upX(900, 0.2);
        setTimeout(() => {
          expect(listener3d.upX()).to.not.be.approximately(900, 1);
          setTimeout(() => {
            expect(listener3d.upX()).to.be.approximately(900, 1);
            done();
          }, 200);
        }, 50);

        listener3d.upY(900, 0.2);
        setTimeout(() => {
          expect(listener3d.upY()).to.not.be.approximately(900, 1);
          setTimeout(() => {
            expect(listener3d.upY()).to.be.approximately(900, 1);
            done();
          }, 200);
        }, 50);

        listener3d.upZ(900, 0.2);
        setTimeout(() => {
          expect(listener3d.upZ()).to.not.be.approximately(900, 1);
          setTimeout(() => {
            expect(listener3d.upZ()).to.be.approximately(900, 1);
            done();
          }, 200);
        }, 50);
      });
      it('can set upX, forwardY, upZ using orientup function without a delay', function () {
        listener3d = new p5.Listener3D();
        listener3d.orientUp(-1000, 700, 300);
        expect(listener3d.upX()).to.equal(-1000);
        expect(listener3d.upY()).to.equal(700);
        expect(listener3d.upZ()).to.equal(300);
      });
      it('can set upX, forwardY, upZ using orientup function without a delay', function () {
        //TODO
      });
    });

    describe('orientation', function () {
      it('can set forward orientations by passing 3 params to orient function (without delay) ', function () {
        listener3d = new p5.Listener3D();
        expect(listener3d.orient(450, -987, 123)).to.include(450, -987, 123);
        expect(listener3d.forwardX()).to.equal(450);
        expect(listener3d.forwardY()).to.equal(-987);
        expect(listener3d.forwardZ()).to.equal(123);
      });
      it('can set forward orientations by passing 4 params to orient function (with delay) ', function () {
        //TODO
      });
      it('can set all orientations using orient function without a delay', function () {
        listener3d = new p5.Listener3D();
        listener3d.orient(-300, -200, -100, 0, 100, 200);
        expect(listener3d.forwardX()).to.equal(-300);
        expect(listener3d.forwardY()).to.equal(-200);
        expect(listener3d.forwardZ()).to.equal(-100);
        expect(listener3d.upX()).to.equal(0);
        expect(listener3d.upY()).to.equal(100);
        expect(listener3d.upZ()).to.equal(200);
      });
      it('can set forwardX, forwardY, forwardZ using orientForward function without a delay', function () {
        //TODO
      });
    });
  });
});
