import p5sound from './master';

/**
 *  A gain node is usefull to set the relative volume of sound.
 *  It's typically used to build mixers.
 *
 *  @class p5.Gain
 *  @constructor
 *  @example
 *  <div><code>
 *
 *  // load two soundfile and crossfade beetween them
 *  let sound1,sound2;
 *  let sound1Gain, sound2Gain, masterGain;
 *  function preload(){
 *    soundFormats('ogg', 'mp3');
 *    sound1 = loadSound('assets/Damscray_-_Dancing_Tiger_01');
 *    sound2 = loadSound('assets/beat');
 *  }
 *  function setup() {
 *    let cnv = createCanvas(100, 100);
 *    cnv.mousePressed(startSound);
 *    // create a 'master' gain to which we will connect both soundfiles
 *    masterGain = new p5.Gain();
 *    masterGain.connect();
 *    sound1.disconnect(); // diconnect from p5 output
 *    sound1Gain = new p5.Gain(); // setup a gain node
 *    sound1Gain.setInput(sound1); // connect the first sound to its input
 *    sound1Gain.connect(masterGain); // connect its output to the 'master'
 *    sound2.disconnect();
 *    sound2Gain = new p5.Gain();
 *    sound2Gain.setInput(sound2);
 *    sound2Gain.connect(masterGain);
 *  }
 *  function startSound() {
 *    sound1.loop();
 *    sound2.loop();
 *    loop();
 *  }
 *  function mouseReleased() {
 *    sound1.stop();
 *    sound2.stop();
 *  }
 *  function draw(){
 *    background(220);
 *    textAlign(CENTER);
 *    textSize(11);
 *    fill(0);
 *    if (!sound1.isPlaying()) {
 *      text('tap and drag to play', width/2, height/2);
 *      return;
 *    }
 *    // map the horizontal position of the mouse to values useable for volume    *  control of sound1
 *    var sound1Volume = constrain(map(mouseX,width,0,0,1), 0, 1);
 *    var sound2Volume = 1-sound1Volume;
 *    sound1Gain.amp(sound1Volume);
 *    sound2Gain.amp(sound2Volume);
 *    // map the vertical position of the mouse to values useable for 'master    *  volume control'
 *    var masterVolume = constrain(map(mouseY,height,0,0,1), 0, 1);
 *    masterGain.amp(masterVolume);
 *    text('master', width/2, height - masterVolume * height * 0.9)
 *    fill(255, 0, 255);
 *    textAlign(LEFT);
 *    text('sound1', 5, height - sound1Volume * height * 0.9);
 *    textAlign(RIGHT);
 *    text('sound2', width - 5, height - sound2Volume * height * 0.9);
 *  }
 *</code></div>
 */

class Gain {
  constructor() {
    this.ac = p5sound.audiocontext;

    this.input = this.ac.createGain();
    this.output = this.ac.createGain();

    // otherwise, Safari distorts
    this.input.gain.value = 0.5;
    this.input.connect(this.output);

    // add  to the soundArray
    p5sound.soundArray.push(this);
  }

  /**
   *  Connect a source to the gain node.
   *
   *  @method  setInput
   *  @for p5.Gain
   *  @param  {Object} src     p5.sound / Web Audio object with a sound
   *                           output.
   */

  setInput(src) {
    src.connect(this.input);
  }

  /**
   *  Send output to a p5.sound or web audio object
   *
   *  @method  connect
   *  @for p5.Gain
   *  @param  {Object} unit
   */
  connect(unit) {
    var u = unit || p5.soundOut.input;
    this.output.connect(u.input ? u.input : u);
  }

  /**
   *  Disconnect all output.
   *
   *  @method disconnect
   *  @for p5.Gain
   */
  disconnect() {
    if (this.output) {
      this.output.disconnect();
    }
  }

  /**
   *  Set the output level of the gain node.
   *
   *  @method  amp
   *  @for p5.Gain
   *  @param  {Number} volume amplitude between 0 and 1.0
   *  @param  {Number} [rampTime] create a fade that lasts rampTime
   *  @param  {Number} [timeFromNow] schedule this event to happen
   *                                seconds from now
   */
  amp(vol, rampTime = 0, tFromNow = 0) {
    var now = p5sound.audiocontext.currentTime;
    var currentVol = this.output.gain.value;
    this.output.gain.cancelScheduledValues(now);
    this.output.gain.linearRampToValueAtTime(currentVol, now + tFromNow);
    this.output.gain.linearRampToValueAtTime(vol, now + tFromNow + rampTime);
  }

  dispose() {
    // remove reference from soundArray
    var index = p5sound.soundArray.indexOf(this);
    p5sound.soundArray.splice(index, 1);
    if (this.output) {
      this.output.disconnect();
      delete this.output;
    }
    if (this.input) {
      this.input.disconnect();
      delete this.input;
    }
  }
}

export default Gain;
