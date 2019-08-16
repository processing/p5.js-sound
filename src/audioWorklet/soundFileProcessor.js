// import processor name via preval.require so that it's available as a value at compile time
const processorNames = preval.require('./processorNames');

class SoundFileProcessor extends AudioWorkletProcessor {
  process(inputs) {
    const input = inputs[0];
    const inputChannel = input[0];
    const position = inputChannel[inputChannel.length - 1] || 0;

    this.port.postMessage({ name: 'position', position: position });

    return true;
  }
}

registerProcessor(processorNames.soundFileProcessor, SoundFileProcessor);
