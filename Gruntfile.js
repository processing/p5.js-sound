const webpackConfig = require('./webpack.config.js');

module.exports = function(grunt) {

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
      'pre-commit':'lint' //runs linting test  before every git commit 
      }
      }
  });

  
  grunt.loadNpmTasks('grunt-webpack');
  grunt.loadNpmTasks('grunt-eslint');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-open');
  grunt.loadNpmTasks('grunt-decomment');
  grunt.loadNpmTasks('grunt-githooks');

  grunt.registerTask('lint', ['eslint:source']);
  grunt.registerTask('default', ['webpack:prod', 'decomment']);
  grunt.registerTask('dev', ['eslint','connect','webpack:dev', 'decomment']);
  grunt.registerTask('serve', 'connect:server:keepalive');
  grunt.registerTask('run-tests', ['serve', 'open']);
};
