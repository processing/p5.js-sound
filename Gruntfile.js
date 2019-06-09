const browserify = require('browserify');
const babelify = require('babelify');
const path = require('path');
const derequire = require('derequire');
const deamdify = require('deamdify');

module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    // Configure style consistency
    eslint: {
      source: {
        options: {configFile: './.eslintrc'},
        src: ['src/**/*.js', 'test/tests/**/*.js']
      }
    },
    watch: {
      // p5 dist
      main: {
        files: ['src/**/*.js'],
        tasks: ['browserify:dev'],
        options: {
          livereload: {
            port: 35728
          }
        },
      }
    },
    requirejs: {
      unmin: {
        options: {
          baseUrl: '.',
          findNestedDependencies: true,
          include: ['src/app'],
          onBuildWrite: function( name, path, contents ) {
            if (path.indexOf('node_modules/tone/') > -1) {
              return '/** Tone.js module by Yotam Mann, MIT License 2016  http://opensource.org/licenses/MIT **/\n' +
              require('amdclean').clean({
              'code': contents.replace(/console.log(.*);/g, ''),
                'escodegen': {
                  'comment': false,
                  'skipDirOptimize':true,
                  'format': {
                    'indent': {
                      'style': '  ',
                      'adjustMultiLineComment': true
                    }
                  }
                }
              });
            } else if (path.indexOf('node_modules/startaudiocontext') > -1) {
              // return '/** StartAudioContext.js by Yotam Mann, MIT License 2017 https://github.com/tambien/StartAudioContext http://opensource.org/licenses/MIT **/\n' +
              return require('amdclean').clean({
                code: contents,
                escodegen: {
                  comment: false,
                  format: {
                    indent: {
                      style: '  ',
                      adjustMultiLineComment: true
                    }
                  }
                }
              });
            } else {
              return require('amdclean').clean({
                'code':contents,
                  'escodegen': {
                    'comment': true,
                    'format': {
                      'indent': {
                        'style': '  ',
                        'adjustMultiLineComment': true
                      }
                    }
                  }
                });
            }
          },
          optimize: 'none',
          out: 'lib/p5.sound.js',
          paths: {
            'Tone' : 'node_modules/tone/Tone',
            'StartAudioContext' : 'node_modules/startaudiocontext/StartAudioContext',
            'automation-timeline': 'node_modules/web-audio-automation-timeline/build/automation-timeline-amd',
            'panner' : 'src/panner',
            'shims': 'src/shims',
            'audiocontext': 'src/audiocontext',
            'master': 'src/master',
            'helpers': 'src/helpers',
            'errorHandler': 'src/errorHandler',
            'soundfile': 'src/soundfile',
            'amplitude': 'src/amplitude',
            'fft': 'src/fft',
            'oscillator': 'src/oscillator',
            'pulse': 'src/pulse',
            'noise': 'src/noise',
            'audioin': 'src/audioin',
            'envelope': 'src/envelope',
            'delay': 'src/delay',
            'effect': 'src/effect',
            'panner3d' : 'src/panner3d',
            'listener3d': 'src/listener3d',
            'filter': 'src/filter',
            'reverb': 'src/reverb',
            'eq': 'src/eq',
            'distortion': 'src/distortion',
            'compressor': 'src/compressor',
            'looper': 'src/looper',
            'soundloop': 'src/soundLoop',
            'soundRecorder': 'src/soundRecorder',
            'signal': 'src/signal',
            'metro': 'src/metro',
            'peakdetect': 'src/peakDetect',
            'gain': 'src/gain',
            'audioVoice': 'src/audioVoice',
            'monosynth': 'src/monosynth',
            'polysynth': 'src/polysynth'
          },
          useStrict: true,
          wrap: {
            start: '/*! p5.sound.js v<%= pkg.version %> <%= grunt.template.today("yyyy-mm-dd") %> */\n' + grunt.file.read('./fragments/before.frag'),
            end: grunt.file.read('./fragments/after.frag')
          }
        }
      },
      min: {
        options: {
          baseUrl: '.',
          findNestedDependencies: true,
          include: ['src/app'],
          onBuildWrite: function( name, path, contents ) {
          if (path.indexOf('node_modules/tone/') > -1) {
            return require('amdclean').clean({
              'code':contents.replace(/console.log(.*);/g, ''),
               'escodegen': {
                 'comment': false
               }
            });
          } else {
             return require('amdclean').clean({
                'code':contents,
                 'escodegen': {
                   'comment': false
                 }
              });
           }
          },
          optimize: 'uglify2',
          out: 'lib/p5.sound.min.js',
          paths: '<%= requirejs.unmin.options.paths %>',
          useStrict: true,
          wrap: {
            start: '/*! p5.sound.min.js v<%= pkg.version %> <%= grunt.template.today("yyyy-mm-dd") %> */\n' + grunt.file.read('./fragments/before.frag'),
            end: grunt.file.read('./fragments/after.frag')
          }
        }
      },
    },
    open: {
      testChrome: {
        path: 'http://localhost:8000/test',
        app: 'Chrome'
      },
      testFirefox : {
        path: 'http://localhost:8000/test',
        app: 'Firefox'
      },
      testSafari : {
        path: 'http://localhost:8000/test',
        app: 'Safari'
      }
    },
    connect: {
      server: {
        options: {
          port: 8000,
          livereload: 35727,
          hostname: '*'
        }
      }
    },
    browserify: {
      tasks: ['browserify']
    },
  });


  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-eslint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-open');
  grunt.registerTask('lint', ['eslint:source']);
  grunt.registerTask('default', ['requirejs']);
  grunt.registerTask('dev', ['connect', 'dev', 'watch']);
  grunt.registerTask('browserify-dev', ['connect', 'browserify:dev', 'watch']);
  grunt.registerTask('serve', 'connect:server:keepalive');
  grunt.registerTask('run-tests', ['serve', 'open']);

  grunt.registerTask(
    'browserify',
    'compile source code',
    function (param) {
      const bannerTemplate = '/*! p5.sound.js es6 v<%= pkg.version %> <%= grunt.template.today("yyyy-mm-dd") %> */\n' + grunt.file.read('./fragments/before.frag');
      const banner = grunt.template.process(bannerTemplate);

      // Reading and writing files is asynchronous
      const done = this.async();

      const browserified = browserify('src/app.js', {
        debug: param === 'dev', // sourcemaps
        standalone: 'p5.sound',
        paths: ['./node_modules/tone/', './src/'],
      });

      const bundle = browserified
        .transform(deamdify)
        .transform(babelify, {
          global: true,
          presets: ['@babel/preset-env']
        })
        .bundle()

      const isMin = param === 'min';
      const filename = isMin ? 'p5.sound.pre-min.js' : 'p5.sound.js';

      // This file will not exist until it has been built
      const libFilePath = path.resolve('lib/' + filename);

      // Start the generated output with the banner comment,
      let code = banner + '\n';

      // Then read the bundle into memory so we can run it through derequire
      bundle
        .on('data', function (data) {
          code += data;
        })
        .on('end', function () {
          // "code" is complete: create the distributable UMD build by running
          // the bundle through derequire, then write the bundle to disk.
          // (Derequire changes the bundle's internal "require" function to
          // something that will not interfere with this module being used
          // within a separate browserify bundle.)

          code += grunt.file.read('./fragments/after.frag');
          grunt.file.write(libFilePath, derequire(code));

          // Print a success message
          grunt.log.writeln(
            '>>'.green + ' Bundle ' + ('lib/' + filename).cyan + ' created.'
          );

          // Complete the task
          done();
        });
    }
  );

};
