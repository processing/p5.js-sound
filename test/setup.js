const startTest = () => {
  //dynamic importing the modules , this ensures that tests must run after audioWorklet processors have been loaded properly
  import('./tests.js');

  let test_has_run = false;

  document.getElementById('mocha').innerHTML = 'click to begin tests';

  // chromes autoplay policy requires a user interaction
  // before the audiocontext can activate
  const mousePressed = () => {
    if (!test_has_run) {
      document.getElementById('mocha').innerHTML = '';
      p5.prototype.outputVolume(0);
      p5.prototype.userStartAudio();
      mocha.run();
      test_has_run = true;
    }
  };
  document.addEventListener('click', mousePressed, false);
};

//operating p5 in instance mode ( read more about it here -  https://github.com/processing/p5.js/wiki/Global-and-instance-mode )
const s = (sketch) => {
  sketch.setup = () => {
    mocha.setup('bdd');
    startTest();
  };
};

new p5(s);
