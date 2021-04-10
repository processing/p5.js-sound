// import './tests/p5.Master.js'
// import './tests/p5.Helpers.js' ;
// import './tests/p5.Distortion.js';
// import './tests/p5.Effect.js';
// import './tests/p5.Filter.js';
// import './tests/p5.FFT.js';
// import './tests/p5.Compressor.js';
// import './tests/p5.EQ.js';
// import './tests/p5.AudioIn.js';
// import './tests/p5.AudioVoice.js';
// import './tests/p5.MonoSynth.js';
// import './tests/p5.PolySynth.js';
// import './tests/p5.SoundRecorder.js';
// import './tests/p5.SoundFile.js';
// import './tests/p5.Amplitude.js';
// import './tests/p5.Oscillator.js';

import {expect } from "chai"
let callme ;
let p = new Promise(function(resolve,reject){
    callme = resolve
})

new p5()
window.setup = function(){
    callme()
}


describe('Testing helpers function', function () {
  it('p5.prototype.freqToMidi helper function', function () {
    const midi = p5.prototype.freqToMidi(880);
    expect(midi).to.equal(81);
  });

  it('p5.prototype.midiToFreq helper function', function () {
    const freq = p5.prototype.midiToFreq(100);
    expect(freq).to.equal(2637.0204553029594);
  });

  it('p5.prototype.noteToFreq helper function', function () {
    const freq = p5.prototype.noteToFreq('C4');
    expect(freq).to.equal(261.6255653005986);
  });

  it('p5.prototype.soundFormats helper function', function () {
    // setting file format so that if we don't provide extension
    // our file will be loaded because _checkFileFormats add it for us.

    p5.prototype.soundFormats('mp3');
    const file = p5.prototype._checkFileFormats('a');
    expect(file).to.be.equal('a.mp3');

    // if we don't provide a valid sound format then soundFormats wil throw
    //error
    try {
      p5.prototype.soundFormats('ext');
    } catch (err) {
      expect(err).to.be.equal('ext is not a valid sound format!');
    }
  });
});

describe('p5.Oscillator', function () {
let osc , amp

before( function(done){
    p.then(()=>{
        osc = new p5.Oscillator();
        amp = new p5.Amplitude();
        done()
    })
      
})
 

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

describe('p5.Delay', function () {
    it('can be created and disposed', function () {
      var delay = new p5.Delay();
      delay.dispose();
    });
  
    it('has initial feedback value of 0.5', function () {
      var delay = new p5.Delay();
      expect(delay.feedback()).to.equal(0.5);
    });
  
    it('can set feedback', function () {
      var delay = new p5.Delay();
      delay.feedback(0.7);
      expect(delay.feedback()).to.be.closeTo(0.7, 0.001);
    });
  
    it('drywet value can be changed', function () {
      var effect = new p5.Effect();
      expect(effect.drywet(0.5)).to.equal(0.5);
    });
  });
  


describe('p5.MonoSynth', function () {
    it('can be created and disposed', function () {
      var monoSynth = new p5.MonoSynth();
      monoSynth.dispose();
    });
  
    it('can play a note string', function (done) {
      var monoSynth = new p5.MonoSynth();
      monoSynth.play('A2');
  
      // wait for scheduled value to complete
      setTimeout(function () {
        expect(monoSynth.oscillator.freq().value).to.equal(110);
        monoSynth.dispose();
        done();
      }, 1);
    });
  });
  