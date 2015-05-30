YUI.add("yuidoc-meta", function(Y) {
   Y.YUIDoc = { meta: {
    "classes": [
        "p5.Amplitude",
        "p5.AudioIn",
        "p5.Convolver",
        "p5.Delay",
        "p5.Env",
        "p5.FFT",
        "p5.Filter",
        "p5.Noise",
        "p5.OnsetDetect",
        "p5.Oscillator",
        "p5.Part",
        "p5.PeakDetect",
        "p5.Phrase",
        "p5.Pulse",
        "p5.Reverb",
        "p5.Score",
        "p5.Signal",
        "p5.SoundFile",
        "p5.SoundRecorder",
        "p5.sound"
    ],
    "modules": [
        "p5.sound"
    ],
    "allModules": [
        {
            "displayName": "p5.sound",
            "name": "p5.sound",
            "description": "p5.sound extends p5 with <a href=\"http://caniuse.com/audio-api\"\ntarget=\"_blank\">Web Audio</a> functionality including audio input,\nplayback, analysis and synthesis.\n<br/><br/>\n<a href=\"#/p5.SoundFile\"><b>p5.SoundFile</b></a>: Load and play sound files.<br/>\n<a href=\"#/p5.Amplitude\"><b>p5.Amplitude</b></a>: Get the current volume of a sound.<br/>\n<a href=\"#/p5.AudioIn\"><b>p5.AudioIn</b></a>: Get sound from an input source, typically\n  a computer microphone.<br/>\n<a href=\"#/p5.FFT\"><b>p5.FFT</b></a>: Analyze the frequency of sound. Returns\n  results from the frequency spectrum or time domain (waveform).<br/>\n<a href=\"#/p5.Oscillator\"><b>p5.Oscillator</b></a>: Generate Sine,\n  Triangle, Square and Sawtooth waveforms. Base class of\n  <a href=\"#/p5.Noise\">p5.Noise</a> and <a href=\"#/p5.Pulse\">p5.Pulse</a>.\n  <br/>\n<a href=\"#/p5.Env\"><b>p5.Env</b></a>: An Envelope is a series\n  of fades over time. Often used to control an object's\n  output gain level as an \"ADSR Envelope\" (Attack, Decay,\n  Sustain, Release). Can also modulate other parameters.<br/>\n<a href=\"#/p5.Delay\"><b>p5.Delay</b></a>: A delay effect with\n  parameters for feedback, delayTime, and lowpass filter.<br/>\n<a href=\"#/p5.Filter\"><b>p5.Filter</b></a>: Filter the frequency range of a\n  sound.\n<br/>\n<a href=\"#/p5.Reverb\"><b>p5.Reverb</b></a>: Add reverb to a sound by specifying\n  duration and decay. <br/>\n<b><a href=\"#/p5.Convolver\">p5.Convolver</a>:</b> Extends\n<a href=\"#/p5.Reverb\">p5.Reverb</a> to simulate the sound of real\n  physical spaces through convolution.<br/>\n<b><a href=\"#/p5.SoundRecorder\">p5.SoundRecorder</a></b>: Record sound for playback \n  / save the .wav file.\n<b><a href=\"#/p5.Phrase\">p5.Phrase</a></b>, <b><a href=\"#/p5.Part\">p5.Part</a></b> and\n<b><a href=\"#/p5.Score\">p5.Score</a></b>: Compose musical sequences.\n<br/><br/>\np5.sound is on <a href=\"https://github.com/therewasaguy/p5.sound/\">GitHub</a>.\nDownload the latest version \n<a href=\"https://github.com/therewasaguy/p5.sound/blob/master/lib/p5.sound.js\">here</a>."
        }
    ]
} };
});