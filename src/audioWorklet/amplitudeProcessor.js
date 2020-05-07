// import dependencies via preval.require so that they're available as values at compile time
const processorNames = preval.require('./processorNames');
const RingBuffer = preval.require('./ringBuffer').default;

class AmplitudeProcessor extends AudioWorkletProcessor {
  constructor(options) {
    super();

    const processorOptions = options.processorOptions || {};
    this.numOutputChannels = options.outputChannelCount || 1;
    this.numInputChannels = processorOptions.numInputChannels || 2;
    this.normalize = processorOptions.normalize || false;
    this.smoothing = processorOptions.smoothing || 0;

    this.bufferSize = processorOptions.bufferSize || 2048;
    this.inputRingBuffer = new RingBuffer(
      this.bufferSize,
      this.numInputChannels
    );
    this.outputRingBuffer = new RingBuffer(
      this.bufferSize,
      this.numOutputChannels
    );
    this.inputRingBufferArraySequence = new Array(this.numInputChannels)
      .fill(null)
      .map(() => new Float32Array(this.bufferSize));

    this.stereoVol = [0, 0];
    this.stereoVolNorm = [0, 0];

    this.volMax = 0.001;

    this.port.onmessage = (event) => {
      const data = event.data;
      if (data.name === 'toggleNormalize') {
        this.normalize = data.normalize;
      } else if (data.name === 'smoothing') {
        this.smoothing = Math.max(0, Math.min(1, data.smoothing));
      }
    };
  }

  // TO DO make this stereo / dependent on # of audio channels
  process(inputs, outputs) {
    const input = inputs[0];
    const output = outputs[0];
    const smoothing = this.smoothing;

    this.inputRingBuffer.push(input);

    if (this.inputRingBuffer.framesAvailable >= this.bufferSize) {
      this.inputRingBuffer.pull(this.inputRingBufferArraySequence);

      for (let channel = 0; channel < this.numInputChannels; ++channel) {
        const inputBuffer = this.inputRingBufferArraySequence[channel];
        const bufLength = inputBuffer.length;

        let sum = 0;
        for (var i = 0; i < bufLength; i++) {
          const x = inputBuffer[i];
          if (this.normalize) {
            sum +=
              Math.max(Math.min(x / this.volMax, 1), -1) *
              Math.max(Math.min(x / this.volMax, 1), -1);
          } else {
            sum += x * x;
          }
        }

        // ... then take the square root of the sum.
        const rms = Math.sqrt(sum / bufLength);

        this.stereoVol[channel] = Math.max(
          rms,
          this.stereoVol[channel] * smoothing
        );
        this.volMax = Math.max(this.stereoVol[channel], this.volMax);
      }

      // calculate stero normalized volume and add volume from all channels together
      let volSum = 0;
      for (let index = 0; index < this.stereoVol.length; index++) {
        this.stereoVolNorm[index] = Math.max(
          Math.min(this.stereoVol[index] / this.volMax, 1),
          0
        );
        volSum += this.stereoVol[index];
      }

      // volume is average of channels
      const volume = volSum / this.stereoVol.length;

      // normalized value
      const volNorm = Math.max(Math.min(volume / this.volMax, 1), 0);

      this.port.postMessage({
        name: 'amplitude',
        volume: volume,
        volNorm: volNorm,
        stereoVol: this.stereoVol,
        stereoVolNorm: this.stereoVolNorm,
      });

      // pass input through to output
      this.outputRingBuffer.push(this.inputRingBufferArraySequence);
    }

    // pull 128 frames out of the ring buffer
    // if the ring buffer does not have enough frames, the output will be silent
    this.outputRingBuffer.pull(output);

    return true;
  }
}

registerProcessor(processorNames.amplitudeProcessor, AmplitudeProcessor);
