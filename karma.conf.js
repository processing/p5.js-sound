// Karma configuration
// Generated on Sun Aug 15 2021 13:31:00 GMT+0530 (India Standard Time)
const path = require('path');

module.exports = function (config) {
  config.set({
    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: 'test',

    // frameworks to use
    // available frameworks: https://www.npmjs.com/search?q=keywords:karma-adapter
    frameworks: ['mocha', 'chai', 'sinon', 'webpack'],

    // list of files / patterns to load in the browser
    files: [
      '../lib/p5.js',
      '../lib/p5.sound.js',
      './setup.js',
      {
        pattern: './testAudio/*.**',
        watched: false,
        included: false,
        served: true,
        nocache: false,
      },

      './tests/main.js',
      './tests/p5.Helpers.js',
      './tests/p5.PeakDetect.js',
      './tests/p5.OnsetDetect.js',
      './tests/p5.Distortion.js',
      './tests/p5.AudioContext.js',
      './tests/p5.Looper.js',
      './tests/p5.Metro.js',
      './tests/p5.Effect.js',
      './tests/p5.Filter.js',
      './tests/p5.Gain.js',
      './tests/p5.FFT.js',
      './tests/p5.SoundLoop.js',
      './tests/p5.Compressor.js',
      './tests/p5.EQ.js',
      './tests/p5.AudioIn.js',
      './tests/p5.AudioVoice.js',
      './tests/p5.MonoSynth.js',
      './tests/p5.PolySynth.js',
      './tests/p5.SoundRecorder.js',
      './tests/p5.SoundFile.js',
      './tests/p5.Amplitude.js',
      './tests/p5.Oscillator.js',
      './tests/p5.Envelope.js',
      './tests/p5.Pulse.js',
      './tests/p5.Noise.js',
      './tests/p5.Panner.js',
      './tests/p5.Panner3d.js',
      './tests/p5.Delay.js',
      './tests/p5.Reverb.js',
      './tests/p5.Listener3d.js',
    ],
    proxies: {
      '/testAudio/': '/base/testAudio/',
    },

    // list of files / patterns to exclude
    exclude: [],

    plugins: [
      require('karma-mocha'),
      require('karma-chai'),
      require('karma-sinon'),
      require('karma-webpack'),
      require('karma-chrome-launcher'),
    ],

    // preprocess matching files before serving them to the browser
    // available preprocessors: https://www.npmjs.com/search?q=keywords:karma-preprocessor
    preprocessors: {
      // webpack as preprocessor
      './tests/*.js': ['webpack'],
    },

    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://www.npmjs.com/search?q=keywords:karma-reporter
    reporters: ['progress'],

    webpack: {
      mode: 'development',
      output: {
        filename: '[name].js',
        path: path.join(__dirname, '_karma_webpack_'),
      },
      stats: {
        modules: false,
        colors: true,
      },
      watch: false,
      module: {
        rules: [
          {
            test: /node_modules(\.*)/,
            use: {
              loader: 'uglify-loader',
            },
          },
          {
            test: /\.js$/,
            exclude: /(node_modules)/,
            use: {
              loader: 'babel-loader',
            },
          },
        ],
      },
    },
    // web server port
    port: 9876,

    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,

    // start these browsers
    // available browser launchers: https://www.npmjs.com/search?q=keywords:karma-launcher
    browsers: ['HeadlessChrome'],

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false,

    // Concurrency level
    // how many browser instances should be started simultaneously
    concurrency: Infinity,

    customLaunchers: {
      HeadlessChrome: {
        base: 'ChromeHeadless',
        flags: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--autoplay-policy=no-user-gesture-required',
          '--allow-file-access',
          '--allow-file-access-from-files',
          '--use-fake-ui-for-media-stream',
          '--use-fake-device-for-media-stream',
          '--use-file-for-fake-audio-capture=test/testAudio/drum.wav',
        ],
      },
    },
  });
};
