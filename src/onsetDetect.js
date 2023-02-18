/**
 *  Listen for onsets (a sharp increase in volume) within a given
 *  frequency range.
 *
 *  @class p5.OnsetDetect
 *  @constructor
 *  @param {Number} freqLow     Low frequency
 *  @param {Number} freqHigh     High frequency
 *  @param {Number} threshold   Amplitude threshold between 0 (no energy) and 1 (maximum)
 *  @param {Function} callback  Function to call when an onset is detected
 */
class OnsetDetect {
  constructor(freqLow, freqHigh, threshold, callback) {
    this.isDetected = false;
    this.freqLow = freqLow;
    this.freqHigh = freqHigh;
    this.treshold = threshold;
    this.energy = 0;
    this.penergy = 0;

    // speed of decay
    this.sensitivity = 500;

    this.callback = callback;
  }

  // callback here too?
  update(fftObject, callback) {
    this.energy = fftObject.getEnergy(this.freqLow, this.freqHigh) / 255;

    if (this.isDetected === false) {
      if (this.energy - this.penergy > this.treshold) {
        this.isDetected = true;

        if (this.callback) {
          this.callback(this.energy);
        } else if (callback) {
          callback(this.energy);
        }

        var self = this;
        setTimeout(function () {
          self.isDetected = false;
        }, this.sensitivity);
      }
    }

    this.penergy = this.energy;
  }
}

export default OnsetDetect;
