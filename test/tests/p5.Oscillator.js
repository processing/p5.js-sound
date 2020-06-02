'use strict';

define(['chai'], function (chai) {
  var expect = chai.expect;

  describe('p5.Oscillator', function () {
    this.timeout(1000);

    var osc = new p5.Oscillator();
    var amp = new p5.Amplitude();

    after(function () {
      osc.dispose();
    });

    it('can be created and disposed', function () {
      var o = new p5.Oscillator();
      o.dispose();
    });

    it('starts and stops', function (done) {
      expect(osc.started).to.equal(false);
      osc.start();
      expect(osc.started).to.equal(true);
      setTimeout(function () {
        osc.stop();
        done();
      }, 100);
    });

    it('can be scheduled to stop', function (done) {
      osc.stop();
      expect(osc.started).to.equal(false);
      osc.start();
      expect(osc.started).to.equal(true);
      osc.stop(0.05);
      setTimeout(function () {
        expect(osc.started).to.equal(false);
        done();
      }, 55);
    });

    it('wont start again before stopping', function (done) {
      expect(osc.started).to.equal(false);
      setTimeout(function () {
        osc.amp(1);
        osc.start();
        osc.stop();
        expect(osc.started).to.equal(false);
        osc.start();
        osc.start();
        amp.setInput(osc);
        amp.getLevel();
        setTimeout(function () {
          expect(osc.started).to.equal(true);
          expect(amp.volMax).not.equal(0.0);
          osc.stop();
          expect(osc.started).to.equal(false);
          done();
        }, 5);
      }, 1);
    });

    // it('can set the frequency', function(done){
    //   var currentFreq = osc.getFreq();
    //   osc.freq(220, 0, 0.15);
    //   osc.start();
    //   expect(osc.getFreq()).to.equal(currentFreq);
    //   setTimeout(function(){
    //     expect(osc.getFreq()).to.equal(220);
    //     osc.stop();
    //     done();
    //   }, 15);
    // });

    it('can start in the future', function (done) {
      expect(osc.started).to.equal(false);
      osc.start(0.05);
      // expect( amp.getLevel() ).to.be.closeTo(0.0, 0.5);
      setTimeout(function () {
        expect(osc.started).to.equal(true);
        // expect( amp.getLevel ).to.not.equal(0.0);
        osc.stop();
        expect(osc.started).to.equal(false);
        done();
      }, 55);
    });
  });
});
