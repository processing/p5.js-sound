const webpackConfig = require('./webpack.config.js');

module.exports = function(grunt) {

  const mochaConfig = {
    test: {
      options: {
        urls: [
          'http://localhost:8000/test/headless-test.html',
        ],
        // reporter: reporter,
        run: true,
        log: true,
        logErrors: true,
        timeout: 100000,
        growlOnSuccess: false
      }
    }
  };

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    decomment: {
      any: {
        // remove comments added by webpack from the build
        files: {
            "./lib/p5.sound.js": "./lib/p5.sound.js",
        },
        options: {
          ignore: [
            // keep JSDoc comments (p5.js repo's YUIDoc task parses those for documentation)
            /\/\*\*\s*\n([^\*]|(\*(?!\/)))*\*\//g,
            // keep the version number
            /.*Version.*/
          ]
        }
      }
    },
    // Configure style consistency
    eslint: {
      source: {
        options: {
          configFile: './.eslintrc',
          fix: true
        },
        src: ['src/**/*.js', 'test/tests/**/*.js']
      },
      sourceNofix: {
        options: {
          configFile: './.eslintrc',
          fix: false
        },
        src: ['src/**/*.js', 'test/tests/**/*.js']
      }
    },
    webpack: {
      prod: webpackConfig,
      dev: Object.assign({ watch: true }, webpackConfig)
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
    githooks: {
      all: {
        options:{
          template:"templates/pre-commit-hook.js"
        },
      'pre-commit':'lint-nofix' //runs elint in -nofix mode  before every git commit 
      }
    },

    mocha: mochaConfig,

  mochaChrome: mochaConfig,
  });

  grunt.loadTasks('./test/tasks');

  
  grunt.loadNpmTasks('grunt-webpack');
  grunt.loadNpmTasks('grunt-eslint');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-open');
  grunt.loadNpmTasks('grunt-decomment');
  grunt.loadNpmTasks('grunt-githooks');

  grunt.registerTask('lint', ['eslint:source']);
  grunt.registerTask('lint-nofix', ['eslint:sourceNofix']);
  grunt.registerTask('default', ['webpack:prod', 'decomment']);
  grunt.registerTask('dev', ['eslint','connect','webpack:dev', 'decomment']);
  grunt.registerTask('serve', 'connect:server:keepalive');
  grunt.registerTask('run-tests', ['serve', 'open']);
  grunt.registerTask('test', [
    'connect',
    'webpack:prod',
    'mochaChrome',
    // 'nyc:report'
  ]);
};
