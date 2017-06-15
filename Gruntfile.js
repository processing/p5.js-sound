module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      build: {
        options: {jshintrc: '.jshintrc'},
        src: ['Gruntfile.js']
      },
      source: {
        options: {jshintrc: 'src/.jshintrc'},
        src: ['src/**/*.js']
      },
      test: {
        options: {jshintrc: 'test/.jshintrc'},
        src: ['test/unit/**/*.js']
      }
    },
    yuidoc: {
      compile: {
        name: '<%= pkg.name %>',
        description: '<%= pkg.description %>',
        version: '<%= pkg.version %>',
        url: '<%= pkg.homepage %>',
        options: {
          paths: ['src/'],
          //helpers: [],
          themedir: 'docs/yuidoc-p5-theme/',
          outdir: 'docs/reference/'
        }
      }
    },
    watch: {
      // p5 dist
      main: {
        files: ['src/**/*.js'],
        tasks: ['requirejs'],
        options: { livereload: true }
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
            'automation-timeline': 'node_modules/web-audio-automation-timeline/build/automation-timeline-amd',
            'panner' : 'src/panner',
            'sndcore': 'src/sndcore',
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
            'env': 'src/env',
            'delay': 'src/delay',
            'effect': 'src/effect',
            'filter': 'src/filter',
            'reverb': 'src/reverb',
            'eq': 'src/eq',
            'distortion': 'src/distortion',
            'compressor': 'src/compressor',
            'looper': 'src/looper',
            'soundRecorder': 'src/soundRecorder',
            'signal': 'src/signal',
            'metro': 'src/metro',
            'peakdetect': 'src/peakDetect',
            'gain': 'src/gain'
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
          hostname: '*'
        }
      }
    }
  });


  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-contrib-yuidoc');
  grunt.registerTask('yui', ['yuidoc']);

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-open');

  grunt.registerTask('default', ['requirejs']);
  grunt.registerTask('dev', ['connect','requirejs', 'watch']);
  grunt.registerTask('serve', 'connect:server:keepalive');
  grunt.registerTask('run-tests', ['serve', 'open']);
};
