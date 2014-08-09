/**
 *
 */

var noise, env, analyzer, delay;

function setup() {
  createCanvas(710, 710);
  noise = new p5.Noise('brown'); // other types include 'brown' and 'pink'
  // multiply noise volume by 0
  // (keep it quiet until we're ready to make noise!)
  noise.amp(0);

  noise.start();
  noise.disconnect();

  delay = new p5.Delay();
  delay.process(noise, .12, .7, 2300);
  // delay.setType('pingPong');

  // the Env accepts time / value pairs to
  // create a series of timed fades
  env = new p5.Env(.01, 1, .2, .1);

  // p5.Amplitude will analyze all sound in the sketch
  // unless the setInput() method is used to specify an input.
  analyzer = new p5.Amplitude();
}

function draw() {
  background(0);

  // get volume reading from the p5.Amplitude analyzer
  var level = analyzer.getLevel();

  // use level to draw a green rectangle
  var levelHeight = map(level, 0, .4, 0, height);
  fill(100,250,100);
  rect(0, height, width, - levelHeight);

  var filterFreq = map(mouseX, 0, width, 60, 15000);
  filterFreq = constrain(filterFreq, 60, 15000);
  var filterQ = map(mouseY, 0, height, 3, 0.01);
  filterQ = constrain(filterQ, 0.01, 3);
  delay.filter(filterFreq, filterQ);
  var delTime = map(mouseY, 0, width, .2, .01);
  delTime = constrain(delTime, .01, .2);
  delay.delayTime(delTime);

}

function mousePressed() {
  env.play(noise);
}