/**
 *
 */

var Delay = function() {
  this.ac = getAudioContext();

  this.input = this.ac.createGain();
  this.output = this.ac.createGain();

  this._split = this.ac.createChannelSplitter(2);
  this._merge = this.ac.createChannelMerger(2);

  this._leftGain = this.ac.createGain();
  this._rightGain = this.ac.createGain();

  this._leftDelay = this.ac.createDelay();
  this._rightDelay = this.ac.createDelay();

  this._leftFilter = this.ac.createBiquadFilter();
  this._rightFilter = this.ac.createBiquadFilter();
  this._leftFilter.frequency.value = 20000;
  this._rightFilter.frequency.value = 20000;
  this.input.connect(this._split);


  // this._leftGain.connect(this.output);
  // this._rightGain.connect(this.output);

  // this.feedbackNode = this.ac.createGain();
  // this.output.connect(p5.soundOut.input);
  // this.output.connect(this.feedbackNode);
  // this.feedbackNode.connect(this.input);

  // graph routing
  this._leftDelay.connect(this._leftGain);
  this._rightDelay.connect(this._rightGain);
  this._leftGain.connect(this._leftFilter);
  this._rightGain.connect(this._rightFilter);
  this._merge.connect(this.output);
  this.output.connect(p5.soundOut.input);
  var now = this.ac.currentTime;
  this._leftFilter.gain.value = 1;
  this._rightFilter.gain.value = 1;

  // default route
  // this._split.disconnect();
  // this._leftFilter.disconnect();
  // this._rightFilter.disconnect();
  this._leftFilter.connect(this._merge, 0, 0);
  this._rightFilter.connect(this._merge, 0, 1);
  this._split.connect(this._leftDelay, 0);
  this._split.connect(this._rightDelay, 1);
  this._leftFilter.connect(this._leftDelay);
  this._rightFilter.connect(this._rightDelay);


  this._maxDelay = this._leftDelay.delayTime.maxValue;
};

Delay.prototype.process = function(src, _delayTime, _feedback) {
  var feedback = _feedback || 0;
  var delayTime = _delayTime || 0;
  if (feedback >= 1.0) {
    throw new Error('Feedback value will force a positive feedback loop.');
  }
  if (delayTime >= this._maxDelay) {
    throw new Error('Delay Time exceeds maximum delay time of ' + this._maxDelay + ' second.');
  }

  // var effectSend = this.ac.createGain();
  src.connect(this.input);
  var now = this.ac.currentTime;
  this._leftDelay.delayTime.value = delayTime;
  this._rightDelay.delayTime.value = delayTime;
  this._leftGain.gain.value = feedback;
  this._rightGain.gain.value = feedback;
};

Delay.prototype.connect = function(unit) {
  var u = unit || p5.soundOut.input;
  this.output.connect(u);
};

Delay.prototype.disconnect = function() {
  this.output.disconnect();
};

var noise, env, analyzer, delay;

function setup() {
  createCanvas(710, 200);
  noise = new p5.Noise(); // other types include 'brown' and 'pink'
  // multiply noise volume by 0
  // (keep it quiet until we're ready to make noise!)
  noise.amp(0);

  noise.start();

  delay = new Delay();
  delay.process(noise, .22, .6);
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
}

function mousePressed() {
  env.play(noise);
}