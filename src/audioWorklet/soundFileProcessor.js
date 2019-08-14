// import processor name via preval.require so that it's available as a value at compile time
const processorNames = preval.require('./processorNames');

class SoundFileProcessor extends AudioWorkletProcessor {
  constructor() {
    super();

    this.paused = false;

    this.port.onmessage = (event) => {
      const data = event.data;
      if (data.name === 'play') {
        this.paused = false;
      } else if (data.name === 'pause') {
        this.paused = true;
      }
    };
  }

  process(inputs) {
    const input = inputs[0];
    const inputChannel = input[0];
    const position = inputChannel[inputChannel.length - 1] || 0;

    if (!this.paused) {
      this.port.postMessage({ name: 'position', position: position });
    }

    return true;
  }
}

registerProcessor(processorNames.soundFileProcessor, SoundFileProcessor);
