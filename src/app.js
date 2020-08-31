import 'audioworklet-polyfill';
import './shims';

import { getAudioContext, userStartAudio } from './audiocontext';
p5.prototype.getAudioContext = getAudioContext;
p5.prototype.userStartAudio = userStartAudio;

import './master';


import {
  sampleRate,
  freqToMidi,
  midiToFreq,
  noteToFreq,
  soundFormats,
  disposeSound,
  _checkFileFormats,
  _mathChain,
  convertToWav,
  interleave,
  writeUTFBytes,
  safeBufferSize,

  saveSound


} from './helpers';
p5.prototype.sampleRate = sampleRate;
p5.prototype.freqToMidi = freqToMidi;
p5.prototype.midiToFreq = midiToFreq;
p5.prototype.noteToFreq = noteToFreq;
p5.prototype.soundFormats = soundFormats;
p5.prototype.disposeSound = disposeSound;
p5.prototype._checkFileFormats = _checkFileFormats;
p5.prototype._mathChain = _mathChain;
p5.prototype.convertToWav = convertToWav;
p5.prototype.interleave = interleave;
p5.prototype.writeUTFBytes = writeUTFBytes;
p5.prototype.safeBufferSize = safeBufferSize;
p5.prototype.saveSound = saveSound;

// register removeSound to dispose of p5sound SoundFiles, Convolvers,
// Oscillators etc when sketch ends
p5.prototype.registerMethod('remove', p5.prototype.disposeSound);


import './errorHandler';
import './audioWorklet';

import Panner from './panner';
p5.Panner = Panner;

import SoundFile, { loadSound } from './soundfile';
p5.SoundFile = SoundFile;
p5.prototype.loadSound = loadSound;
// register preload handling of loadSound
p5.prototype.registerPreloadMethod('loadSound', p5.prototype);


import Amplitude from './amplitude';
p5.Amplitude = Amplitude;

import FFT from './fft';
p5.FFT = FFT;

import './signal';

import Oscillator, { SinOsc, TriOsc, SawOsc, SqrOsc } from './oscillator';
p5.Oscillator = Oscillator;
p5.SinOsc = SinOsc;
p5.TriOsc = TriOsc;
p5.SawOsc = SawOsc;
p5.SqrOsc = SqrOsc;

import './envelope';


import Noise from './noise';
p5.Noise = Noise;

import Pulse from './pulse';
p5.Pulse = Pulse;



import AudioIn from './audioin';
p5.AudioIn = AudioIn;

import Effect from './effect';
p5.Effect = Effect;

import Filter, { LowPass, HighPass, BandPass } from './filter';
p5.Filter = Filter;
p5.LowPass = LowPass;
p5.HighPass = HighPass;
p5.BandPass = BandPass;

import EQ from './eq';
p5.EQ = EQ;

import listener3D from './listener3d';
p5.listener3D = listener3D;

import Panner3D from './panner3d';
p5.Panner3D = Panner3D;

import Delay from './delay';
p5.Delay = Delay;




import { Reverb, Convolver, createConvolver } from './reverb';
p5.Reverb = Reverb;
p5.Convolver = Convolver;
p5.prototype.createConvolver = createConvolver;
p5.prototype.registerPreloadMethod('createConvolver', p5.prototype);



import Metro from './metro';
p5.Metro = Metro;


import { Phrase, Part, Score } from './looper';
p5.Phrase = Phrase;
p5.Part = Part;
p5.Score = Score;


import SoundLoop from './soundLoop';
p5.SoundLoop = SoundLoop;


import Compressor from './compressor';
p5.Compressor = Compressor;



import peakDetect from './peakDetect';
p5.peakDetect = peakDetect;




import SoundRecorder from './soundRecorder';
p5.SoundRecorder = SoundRecorder;

import Distortion from './distortion';
p5.Distortion = Distortion;

import Gain from './gain';
p5.Gain = Gain;

import AudioVoice from './audioVoice';
p5.AudioVoice = AudioVoice;

import MonoSynth from './monosynth';
p5.MonoSynth = MonoSynth;

import OnsetDetect from './onsetDetect';
p5.OnsetDetect = OnsetDetect;

import PolySynth from './polysynth';
p5.PolySynth = PolySynth;
