mocha.setup('bdd');

new p5();
p5._throwValidationErrors = true;
p5.prototype.outputVolume(0);
p5.prototype.userStartAudio();

const expect = chai.expect;