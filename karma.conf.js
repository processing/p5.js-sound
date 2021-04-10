
const path = require('path');
let BROWSERS = ["HeadlessChrome"];

const configuration = {

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: __dirname,

    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ["mocha", "chai", "sinon","webpack",],

    // list of files / patterns to load in the browser
    files: [
        "lib/p5.js",
        "lib/p5.sound.js",
        "test/tests.js" ,
        
    ],


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ["dots","coverage"],

    client: {
        mocha: {
            reporter: "html",
            ui: "bdd",
        },
    },
    // plugins
    plugins: [
        "karma-chai",
        "karma-mocha",
        "karma-sinon",
        "karma-webpack",
        "karma-chrome-launcher",
        "karma-firefox-launcher",
        "karma-growl-reporter",
        "karma-coverage"
       
    ],
    preprocessors: {
        // add webpack as preprocessor
        'test/**/*.js': [ 'webpack' ],
        'lib/p5.sound.js' :['coverage']
    },
    coverageReporter: {
      type : 'lcov',
      dir : 'coverage/'
    },
    webpack : {

                    mode: 'development',
                    output: {
                    filename: '[name].js',
                    path: path.join(__dirname, '_karma_webpack_') ,
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
                              loader: 'uglify-loader'
                            }
                          },
                          {
                            test: /\.js$/,
                            exclude: /(node_modules)/,
                            use: {
                              loader: 'babel-loader'
                            }
                          },
                        ]
                      },
                    
    },

   

    // web server port
    port: 9876,

    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // set the inactivity level to longer
    browserNoActivityTimeout: 40000,

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    // logLevel: config.LOG_ERROR,      

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch:true,
    // restartOnFileChange : true,

    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: BROWSERS,

    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true,

    // Concurrency level
    // how many browser should be started simultaneous
    // concurrency: process.env.TRAVIS ? 1 : Infinity,
    concurrency: Infinity,

    // custom launcher for travis
    customLaunchers: {
        HeadlessChrome: {
            base: "ChromeHeadless",
            flags: [
                "--autoplay-policy=no-user-gesture-required"],
        },
        // HeadlessFirefox: {
        //     base: "Firefox",
        //     flags: ["--headless"],
        //     prefs: {
        //         "focusmanager.testmode": true,
        //         "media.navigator.permission.disabled": true,
        //     },
        // },
        // OnlineChrome: {
        //     base: "Chrome",
        //     flags: ["--no-sandbox", "--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream",
        //         "--autoplay-policy=no-user-gesture-required"],
        // },
    },
    // resolve: {
    //     modules: [path.resolve(__dirname, 'src'), 'node_modules']
    //   }

};

module.exports = function(config){

    config.set({
        ...configuration
    })
}


