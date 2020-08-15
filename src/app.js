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

import Effect from './effect' ;
p5.Effect = Effect;

import './filter';

import EQ from './eq';
p5.EQ = EQ;

import './panner3d';
import './listener3d';
import './delay';
import './reverb';
import './metro';
import './looper';
import './soundLoop';

import Compressor from './compressor';
p5.Compressor = Compressor;

import './soundRecorder';
import './peakDetect';
import './gain';

import Distortion from './distortion';
p5.Distortion = Distortion;

import AudioVoice from './audioVoice';
p5.AudioVoice = AudioVoice;

import MonoSynth from './monosynth';
p5.MonoSynth = MonoSynth;

import './polysynth';
