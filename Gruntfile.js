module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    // Configure style consistency
    eslint: {
      source: {
        options: {configFile: './src/.eslintrc'},
        src: ['src/**/*.js']
      }
    },
    watch: {
      // p5 dist
      main: {
        files: ['src/**/*.js'],
        tasks: ['requirejs'],
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
    }
  });


  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-eslint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-open');

  grunt.registerTask('lint', ['eslint:source']);
  grunt.registerTask('default', ['requirejs']);
  grunt.registerTask('dev', ['connect','requirejs', 'watch']);
  grunt.registerTask('serve', 'connect:server:keepalive');
  grunt.registerTask('run-tests', ['serve', 'open']);
};
