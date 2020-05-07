// import dependencies via preval.require so that they're available as values at compile time
const processorNames = preval.require('./processorNames');
const RingBuffer = preval.require('./ringBuffer').default;

class RecorderProcessor extends AudioWorkletProcessor {
  constructor(options) {
    super();

    const processorOptions = options.processorOptions || {};
    this.numOutputChannels = options.outputChannelCount || 2;
    this.numInputChannels = processorOptions.numInputChannels || 2;
    this.bufferSize = processorOptions.bufferSize || 1024;
    this.recording = false;

    this.clear();

    this.port.onmessage = (event) => {
      const data = event.data;
      if (data.name === 'start') {
        this.record(data.duration);
      } else if (data.name === 'stop') {
        this.stop();
      }
    };
  }

  process(inputs) {
    if (!this.recording) {
      return true;
    } else if (this.sampleLimit && this.recordedSamples >= this.sampleLimit) {
      this.stop();
      return true;
    }

    const input = inputs[0];

    this.inputRingBuffer.push(input);

    if (this.inputRingBuffer.framesAvailable >= this.bufferSize) {
      this.inputRingBuffer.pull(this.inputRingBufferArraySequence);

      for (let channel = 0; channel < this.numOutputChannels; ++channel) {
        const inputChannelCopy = this.inputRingBufferArraySequence[
          channel
        ].slice();
        if (channel === 0) {
          this.leftBuffers.push(inputChannelCopy);
          if (this.numInputChannels === 1) {
            this.rightBuffers.push(inputChannelCopy);
          }
        } else if (channel === 1 && this.numInputChannels > 1) {
          this.rightBuffers.push(inputChannelCopy);
        }
      }

      this.recordedSamples += this.bufferSize;
    }
    return true;
  }

  record(duration) {
    if (duration) {
      this.sampleLimit = Math.round(duration * sampleRate);
    }
    this.recording = true;
  }

  stop() {
    this.recording = false;
    const buffers = this.getBuffers();
    const leftBuffer = buffers[0].buffer;
    const rightBuffer = buffers[1].buffer;
    this.port.postMessage(
      { name: 'buffers', leftBuffer: leftBuffer, rightBuffer: rightBuffer },
      [leftBuffer, rightBuffer]
    );
    this.clear();
  }

  getBuffers() {
    const buffers = [];
    buffers.push(this.mergeBuffers(this.leftBuffers));
    buffers.push(this.mergeBuffers(this.rightBuffers));
    return buffers;
  }

  mergeBuffers(channelBuffer) {
    let result = new Float32Array(this.recordedSamples);
    let offset = 0;
    let lng = channelBuffer.length;
    for (var i = 0; i < lng; i++) {
      let buffer = channelBuffer[i];
      result.set(buffer, offset);
      offset += buffer.length;
    }
    return result;
  }

  clear() {
    this.leftBuffers = [];
    this.rightBuffers = [];
    this.inputRingBuffer = new RingBuffer(
      this.bufferSize,
      this.numInputChannels
    );
    this.inputRingBufferArraySequence = new Array(this.numInputChannels)
      .fill(null)
      .map(() => new Float32Array(this.bufferSize));
    this.recordedSamples = 0;
    this.sampleLimit = null;
  }
}

registerProcessor(processorNames.recorderProcessor, RecorderProcessor);
