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
    watch: {
      // p5 dist
      main: {
        files: ['src/**/*.js'],
        tasks: ['jshint', 'requirejs'],
        options: { livereload: true }
      },
      // reference
      reference_build: {
        files: ['docs/yuidoc-p5-theme/**/*'],
        tasks: ['yuidoc'],
        options: { livereload: true, interrupt: true }
      },
      // scripts for yuidoc/reference theme
      yuidoc_theme_build: {
        files: ['docs/yuidoc-p5-theme-src/scripts/**/*'],
        tasks: ['requirejs:yuidoc_theme']
      }
    },
    mocha: {
      test: {
        //src: ['test/*.html'],
        src: ['test/**/*.html'],
        options: {
          // reporter: 'test/reporter/simple.js',
          reporter: 'Nyan',
          run: true,
          log: true,
          logErrors: true
        }
      },
    },
    requirejs: {
      unmin: {
        options: {
          baseUrl: '.',
          findNestedDependencies: true,
          include: ['src/app'],
          onBuildWrite: function( name, path, contents ) {
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
          },
          optimize: 'none',
          out: 'lib/p5.sound.js',
          paths: {
            'sndcore': 'src/sndcore',
            'master': 'src/master',
            'helpers': 'src/helpers',
            'soundfile': 'src/soundfile',
            'amplitude': 'src/amplitude',
            'fft': 'src/fft',
            'oscillator': 'src/oscillator',
            'pulse': 'src/pulse',
            'noise': 'src/noise',
            'audioin': 'src/audioin',
            'env': 'src/env',
            'delay': 'src/delay',
            'filter': 'src/filter',
          },
          useStrict: true,
          wrap: {
            start: '/*! p5.sound.js v<%= pkg.version %> <%= grunt.template.today("yyyy-mm-dd") %> */\n',
            end: ''
          }
        }
      },
      min: {
        options: {
          baseUrl: '.',
          findNestedDependencies: true,
          include: ['src/app'],
          onBuildWrite: function( name, path, contents ) {
           return require('amdclean').clean({
              'code':contents,
               'escodegen': {
                 'comment': false
               }
            });
          },
          optimize: 'uglify2',
          out: 'lib/p5.sound.min.js',
          paths: '<%= requirejs.unmin.options.paths %>',
          useStrict: true,
          wrap: {
            start: '/*! p5.sound.min.js v<%= pkg.version %> <%= grunt.template.today("yyyy-mm-dd") %> */\n',
            end: ''
          }
        }
      },
      yuidoc_theme: {
        options: {
          baseUrl: './docs/yuidoc-p5-theme-src/scripts/',
          mainConfigFile: './docs/yuidoc-p5-theme-src/scripts/config.js',
          name: 'main',
          out: './docs/yuidoc-p5-theme/assets/js/reference.js',
          optimize: 'none',
          generateSourceMaps: true,
          findNestedDependencies: true,
          wrap: true,
          paths: { 'jquery': 'empty:' }
        }
      }
    },
    yuidoc: {
      compile: {
        name: '<%= pkg.name %>',
        description: '<%= pkg.description %>',
        version: '<%= pkg.version %>',
        url: '<%= pkg.homepage %>',
        options: {
          paths: ['src/', 'lib/addons/'],
          //helpers: [],
          themedir: 'docs/yuidoc-p5-theme/',
          outdir: 'docs/reference/'
        }
      }
    }
  });


  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-contrib-yuidoc');
  grunt.registerTask('yui', ['yuidoc']);
  grunt.registerTask('default', ['requirejs']);

};
