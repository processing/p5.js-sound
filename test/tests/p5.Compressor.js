const expect = chai.expect;

describe('p5.Compressor', function () {
  it('can be created and disposed', function () {
    let compressor = new p5.Compressor();
    expect(compressor.compressor).to.have.property('attack');
    expect(compressor.compressor).to.have.property('context');
    expect(compressor.compressor).to.have.property('knee');
    expect(compressor.compressor).to.have.property('ratio');
    expect(compressor.compressor).to.have.property('release');
    expect(compressor.compressor).to.have.property('threshold');
    compressor.dispose();
    expect(compressor).to.not.have.property('compressor');
  });

  describe('methods', function () {
    it('can be connected to a sound file using process', function (done) {
      let compressor = new p5.Compressor();
      p5.prototype.soundFormats('ogg', 'mp3');
      let sf = p5.prototype.loadSound('./testAudio/drum', function () {
        sf.disconnect();
        sf.loop(1, 1, 0.0, 0.05);
        compressor.process(sf);
        sf.dispose();
        setTimeout(function () {
          sf.stop();
          done();
        }, 100);
      });
    });

    it('can set params', function () {
      let compressor = new p5.Compressor();
      compressor.set(0.5, 20, 15, -50, 0.75);
      expect(compressor.attack()).be.approximately(0.5, 0.01);
      expect(compressor.knee()).be.approximately(20, 1);
      expect(compressor.ratio()).be.approximately(15, 1);
      expect(compressor.threshold()).be.approximately(-50, 1);
      expect(compressor.release()).be.approximately(0.75, 0.01);
    });
    it('can set params without all arguments', function () {
      let compressor = new p5.Compressor();
      compressor.set();
      compressor.set(0.45, undefined, 14, undefined, 0.52);
      expect(compressor.attack()).be.approximately(0.45, 0.01);
      expect(compressor.knee()).be.approximately(30, 1);
      expect(compressor.ratio()).be.approximately(14, 1);
      expect(compressor.threshold()).be.approximately(-24, 1);
      expect(compressor.release()).be.approximately(0.52, 0.01);
      compressor.set(undefined, 12, undefined, -73);
      expect(compressor.knee()).be.approximately(12, 1);
      expect(compressor.threshold()).be.approximately(-73, 1);
    });

    it('can set attack', function () {
      let compressor = new p5.Compressor();
      compressor.attack(0.74);
      expect(compressor.compressor.attack.value).to.be.approximately(
        0.74,
        0.01
      );
      expect(compressor.attack()).to.be.approximately(0.74, 0.01);

      //can pass a node to connect
      let osc = new p5.SawOsc();
      compressor.attack(osc);
    });
    it('can set knee', function () {
      let compressor = new p5.Compressor();
      compressor.knee(34);
      expect(compressor.compressor.knee.value).to.be.approximately(34, 1);
      expect(compressor.knee()).to.be.approximately(34, 1);

      //can pass a node to connect
      let noise = new p5.Noise();
      compressor.knee(noise);
    });
    it('can set ratio', function () {
      let compressor = new p5.Compressor();
      compressor.ratio(13);
      expect(compressor.compressor.ratio.value).to.be.approximately(13, 1);
      expect(compressor.ratio()).to.be.approximately(13, 1);

      //can pass a node to connect
      let osc = new p5.Oscillator();
      compressor.ratio(osc);
    });
    it('can set threshold', function () {
      let compressor = new p5.Compressor();
      compressor.threshold(-28);
      expect(compressor.compressor.threshold.value).to.be.approximately(-28, 1);
      expect(compressor.threshold()).to.be.approximately(-28, 1);

      //can pass a node to connect
      let gain = new p5.Gain();
      compressor.threshold(gain);
    });
    it('can set release', function () {
      let compressor = new p5.Compressor();
      compressor.release(0.63);
      expect(compressor.compressor.release.value).to.be.approximately(
        0.63,
        0.01
      );
      expect(compressor.release()).to.be.approximately(0.63, 0.01);

      //can pass a node to connect
      let poly = new p5.PolySynth();
      compressor.release(poly);
    });
    it('can return reduction value', function () {
      let compressor = new p5.Compressor();
      let reduction = compressor.reduction();
      expect(reduction).to.not.be.null;
    });
    it('wet dry value can be changed', function () {
      const compressor = new p5.Compressor();
      expect(compressor.drywet(0.5)).to.equal(0.5);
    });
  });
});
