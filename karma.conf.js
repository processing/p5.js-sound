// Karma configuration
// Generated on Sun Aug 15 2021 13:31:00 GMT+0530 (India Standard Time)

module.exports = function (config) {
    config.set({
      // base path that will be used to resolve all patterns (eg. files, exclude)
      basePath: 'test',
  
      // frameworks to use
      // available frameworks: https://www.npmjs.com/search?q=keywords:karma-adapter
      frameworks: ['mocha'],
  
      // list of files / patterns to load in the browser
      files: [
        '../node_modules/chai/chai.js',
        '../node_modules/sinon/pkg/sinon.js',
        '../node_modules/mocha/mocha.js',
        '../lib/p5.js',
        '../lib/p5.sound.js',
        './setup.js',
  
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
      ],
  
      // list of files / patterns to exclude
      exclude: [],
  
      // preprocess matching files before serving them to the browser
      // available preprocessors: https://www.npmjs.com/search?q=keywords:karma-preprocessor
      preprocessors: {},
  
      // test results reporter to use
      // possible values: 'dots', 'progress'
      // available reporters: https://www.npmjs.com/search?q=keywords:karma-reporter
      reporters: ['progress'],
  
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