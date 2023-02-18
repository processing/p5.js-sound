import p5sound from './main';

/**
 * Base class for monophonic synthesizers. Any extensions of this class
 * should follow the API and implement the methods below in order to
 * remain compatible with p5.PolySynth();
 *
 * @class p5.AudioVoice
 * @constructor
 */
class AudioVoice {
  constructor() {
    this.ac = p5sound.audiocontext;
    this.output = this.ac.createGain();
    this.connect();
    p5sound.soundArray.push(this);
  }
  play(note, velocity, secondsFromNow, sustime) {}

  triggerAttack(note, velocity, secondsFromNow) {}

  triggerRelease(secondsFromNow) {}

  amp(vol, rampTime) {}

  setADSR(attack, decay, sustain, release) {}

  /**
   * Connect to p5 objects or Web Audio Nodes
   * @method  connect
   * @for p5.AudioVoice
   * @param {Object} unit
   */
  connect(unit) {
    var u = unit || p5sound.input;
    this.output.connect(u.input ? u.input : u);
    if (unit && unit._onNewInput) {
      unit._onNewInput(this);
    }
  }

  /**
   * Disconnect from soundOut
   * @method  disconnect
   * @for p5.AudioVoice
   */
  disconnect() {
    this.output.disconnect();
  }

  /**
   * Dispose the output if it exists
   * @method dispose
   * @for p5.AudioVoice
   */
  dispose() {
    if (this.output) {
      this.output.disconnect();
      delete this.output;
    }
  }
}

export default AudioVoice;
