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

  this._leftFilter.frequency.setValueAtTime(1200, this.ac.currentTime);
  this._rightFilter.frequency.setValueAtTime(1200, this.ac.currentTime);
  this._leftFilter.Q.setValueAtTime(0.3, this.ac.currentTime);
  this._rightFilter.Q.setValueAtTime(0.3, this.ac.currentTime);

  // graph routing
  this.input.connect(this._split);
  this._leftDelay.connect(this._leftGain);
  this._rightDelay.connect(this._rightGain);
  this._leftGain.connect(this._leftFilter);
  this._rightGain.connect(this._rightFilter);
  this._merge.connect(this.output);
  this.output.connect(p5.soundOut.input);

  this._leftFilter.gain.setValueAtTime(1, this.ac.currentTime);
  this._rightFilter.gain.setValueAtTime(1, this.ac.currentTime);

  // default routing
  this.setType(0);

  this._maxDelay = this._leftDelay.delayTime.maxValue;
};

Delay.prototype.process = function(src, _delayTime, _feedback, _filter) {
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
  // var now = this.ac.currentTime;
  this._leftDelay.delayTime.setValueAtTime(delayTime, this.ac.currentTime);
  this._rightDelay.delayTime.setValueAtTime(delayTime, this.ac.currentTime);
  this._leftGain.gain.setValueAtTime(feedback, this.ac.currentTime);
  this._rightGain.gain.setValueAtTime(feedback, this.ac.currentTime);

  if (_filter) {
    this._leftFilter.frequency.value = _filter;
    this._rightFilter.frequency.value = _filter;
  }
};

Delay.prototype.connect = function(unit) {
  var u = unit || p5.soundOut.input;
  this.output.connect(u);
};

Delay.prototype.disconnect = function() {
  this.output.disconnect();
};

Delay.prototype.setType = function(t) {
  if (t === 1) {
    t = 'pingPong';
  }
  this._split.disconnect();
  this._leftFilter.disconnect();
  this._rightFilter.disconnect();
  this._split.connect(this._leftDelay, 0);
  this._split.connect(this._rightDelay, 1);
  switch(t) {
    case 'pingPong':
      this._leftFilter.connect(this._merge, 0, 0);
      this._rightFilter.connect(this._merge, 0, 1);
      this._leftFilter.connect(this._rightDelay);
      this._rightFilter.connect(this._leftDelay);
      break
    default:
      this._leftFilter.connect(this._merge, 0, 0);
      this._rightFilter.connect(this._merge, 0, 1);
      this._leftFilter.connect(this._leftDelay);
      this._rightFilter.connect(this._rightDelay);
  }
};

Delay.prototype.setFilter = function(freq, q) {
  this._leftFilter.frequency.cancelScheduledValues(this.ac.currentTime);
  this._rightFilter.frequency.cancelScheduledValues(this.ac.currentTime);
  this._leftFilter.frequency.exponentialRampToValueAtTime(freq, this.ac.currentTime);
  this._rightFilter.frequency.exponentialRampToValueAtTime(freq, this.ac.currentTime);
  if (q) {
    this._leftFilter.Q.cancelScheduledValues(this.ac.currentTime);
    this._rightFilter.Q.cancelScheduledValues(this.ac.currentTime);
    this._leftFilter.Q.exponentialRampToValueAtTime(q, this.ac.currentTime);
    this._rightFilter.Q.exponentialRampToValueAtTime(q, this.ac.currentTime);
  }
};

Delay.prototype.setTime = function(t) {
  this._leftDelay.delayTime.cancelScheduledValues(this.ac.currentTime);
  this._rightDelay.delayTime.cancelScheduledValues(this.ac.currentTime);  
  this._leftDelay.delayTime.exponentialRampToValueAtTime(t, this.ac.currentTime);
  this._rightDelay.delayTime.exponentialRampToValueAtTime(t, this.ac.currentTime);
};

Delay.prototype.setFeedback = function(f) {
  this._leftGain.gain.exponentialRampToValueAtTime(f, this.ac.currentTime);
  this._rightGain.gain.exponentialRampToValueAtTime(f, this.ac.currentTime);
};

var noise, env, analyzer, delay;

function setup() {
  createCanvas(710, 710);
  noise = new p5.Noise(); // other types include 'brown' and 'pink'
  // multiply noise volume by 0
  // (keep it quiet until we're ready to make noise!)
  noise.amp(0);

  noise.start();
  noise.disconnect();

  delay = new Delay();
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
  delay.setFilter(filterFreq, filterQ);
  var delTime = map(mouseY, 0, width, .2, .01);
  delTime = constrain(delTime, .01, .2);
  delay.setTime(delTime);

}

function mousePressed() {
  env.play(noise);
}