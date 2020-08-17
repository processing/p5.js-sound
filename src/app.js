import 'audioworklet-polyfill';
import './shims';

import { getAudioContext, userStartAudio } from './audiocontext';
p5.prototype.getAudioContext = getAudioContext;
p5.prototype.userStartAudio = userStartAudio;

import './master';

import { freqToMidi } from './helpers';
p5.prototype.freqToMidi = freqToMidi;

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


import './reverb';

import Metro from './metro';
p5.Metro = Metro;

import './looper';
import './soundLoop';

import Compressor from './compressor';
p5.Compressor = Compressor;

import './soundRecorder';


import peakDetect from './peakDetect';
p5.peakDetect = peakDetect;


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

