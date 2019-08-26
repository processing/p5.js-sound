// import dependencies via preval.require so that they're available as values at compile time
const processorNames = preval.require('./processorNames');
const RingBuffer = preval.require('./ringBuffer').default;

class SoundFileProcessor extends AudioWorkletProcessor {
  constructor(options) {
    super();

    const processorOptions = options.processorOptions || {};
    this.bufferSize = processorOptions.bufferSize || 256;
    this.inputRingBuffer = new RingBuffer(this.bufferSize, 1);
    this.inputRingBufferArraySequence = [new Float32Array(this.bufferSize)];
  }

  process(inputs) {
    const input = inputs[0];
    // we only care about the first input channel, because that contains the position data
    this.inputRingBuffer.push([input[0]]);

    if (this.inputRingBuffer.framesAvailable >= this.bufferSize) {
      this.inputRingBuffer.pull(this.inputRingBufferArraySequence);
      const inputChannel = this.inputRingBufferArraySequence[0];
      const position = inputChannel[inputChannel.length - 1] || 0;

      this.port.postMessage({ name: 'position', position: position });
    }

    return true;
  }
}

registerProcessor(processorNames.soundFileProcessor, SoundFileProcessor);
