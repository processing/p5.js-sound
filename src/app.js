import 'audioworklet-polyfill';
import './shims';

import { getAudioContext, userStartAudio } from './audiocontext';
p5.prototype.getAudioContext = getAudioContext;
p5.prototype.userStartAudio = userStartAudio;

import './master';
import './helpers';
import './errorHandler';
import './audioWorklet';
import './panner';
import './soundfile';

import Amplitude from './amplitude';
p5.Amplitude = Amplitude;

import FFT from './fft';
p5.FFT = FFT;

import './signal';
import './oscillator';
import './envelope';
import './pulse';
import './noise';

import AudioIn from './audioin';
p5.AudioIn = AudioIn;

import './filter';
import './eq';
import './panner3d';
import './listener3d';
import './delay';
import './reverb';
import './metro';
import './looper';
import './soundLoop';
import './compressor';
import './soundRecorder';
import './peakDetect';
import './gain';
import './distortion';

import AudioVoice from './audioVoice';
p5.AudioVoice = AudioVoice;

import MonoSynth from './monosynth';
p5.MonoSynth = MonoSynth;

import './polysynth';
