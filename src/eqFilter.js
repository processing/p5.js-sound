import Filter from './filter';
import p5sound from './master';

/**
 *  EQFilter extends p5.Filter with constraints
 *  necessary for the p5.EQ
 *
 *  @private
 */
class EQFilter extends Filter {
  constructor(freq, res) {
    super('peaking');

    this.disconnect();
    this.set(freq, res);
    this.biquad.gain.value = 0;
    delete this.input;
    delete this.output;
    delete this._drywet;
    delete this.wet;
  }

  amp() {
    console.warn('`amp()` is not available for p5.EQ bands. Use `.gain()`');
  }

  drywet() {
    console.warn('`drywet()` is not available for p5.EQ bands.');
  }

  connect(unit) {
    var u = unit || p5.soundOut.input;
    if (this.biquad) {
      this.biquad.connect(u.input ? u.input : u);
    } else {
      this.output.connect(u.input ? u.input : u);
    }
  }
  disconnect() {
    if (this.biquad) {
      this.biquad.disconnect();
    }
  }

  dispose() {
    // remove reference form soundArray
    const index = p5sound.soundArray.indexOf(this);
    p5sound.soundArray.splice(index, 1);
    this.disconnect();
    delete this.biquad;
  }
}

export default EQFilter;
