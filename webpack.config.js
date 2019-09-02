const webpack = require('webpack');
const path = require('path');
const fs = require('fs');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const WebpackAutoInject = require('webpack-auto-inject-version');

const autoInjectVersionConfig = {
  SILENT: true,
  SHORT: 'p5.sound',
  components: {
    AutoIncreaseVersion: false,
    InjectAsComment: true,
    InjectByTag: false
  },
  componentsOptions: {
    InjectAsComment: {
      tag: 'Version: {version} - {date}',
      dateFormat: 'yyyy-mm-dd',
      multiLineCommentType: true,
    },
  }
};

module.exports = {
  context: __dirname + '/src',
  entry: {
    'p5.sound': './app.js',
    'p5.sound.min': './app.js'
  },
  output: {
    // where we want to output built files
    path: __dirname + "/lib"
  },
  mode: 'production',
  devtool: 'source-map',
  optimization: {
    runtimeChunk: true,
  },
  plugins: [
    new webpack.NormalModuleReplacementPlugin(/Tone(\.*)/, function(resource) {
      resource.request = path.join(__dirname, './node_modules/tone/', resource.request);
    }),
    new webpack.BannerPlugin({
      banner: fs.readFileSync('./fragments/before.frag').toString(),
      raw: true,
    }),
    new WebpackAutoInject(autoInjectVersionConfig)
  ],
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
  optimization: {
    minimize: true,
    minimizer: [
      new UglifyJsPlugin({
        include: [/\.min\.js$/],
        cache: true,
        parallel: true,
        uglifyOptions: {
          compress: {
            drop_console: true
          },
          ecma: 6,
          mangle: true,
          output: {
            comments: false
          }
        },
        sourceMap: true,
      })
    ]
  },
  resolve: {
    modules: [path.resolve(__dirname, 'src'), 'node_modules']
  }
}
