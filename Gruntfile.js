const webpackConfig = require('./webpack.config.js');

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
    }
  });


  grunt.loadNpmTasks('grunt-webpack');
  grunt.loadNpmTasks('grunt-eslint');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-open');

  grunt.registerTask('lint', ['eslint:source']);
  grunt.registerTask('default', ['webpack:prod']);
  grunt.registerTask('dev', ['connect','webpack:dev']);
  grunt.registerTask('serve', 'connect:server:keepalive');
  grunt.registerTask('run-tests', ['serve', 'open']);
};
