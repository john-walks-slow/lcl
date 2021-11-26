const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const path = require('path');

module.exports = (production) => {
  return {
    mode: production ? "production" : "development",
    devtool: production ? false : 'cheap-module-source-map',
    entry: [
      'babel-polyfill',
      './src/index.jsx',
    ],
    output: {
      path: path.join(__dirname, '../public/'),
      publicPath: '/static/',
      filename: 'bundle.js'
    },
    module: {
      rules: [
        {
          test: /\.md$/,
          use: 'raw-loader'
        },
        {
          test: /\.jsx?$/,
          exclude: /node_modules/,
          use: [
            'babel-loader'
          ]
        },
        {
          test: /\.css$/i,
          use: [
            'style-loader',
            {
              loader: 'css-loader',
              options: {
                importLoaders: 1,
              },
            },
            'postcss-loader'
          ]
        },

        {
          test: /\.(ttf|eot|svg|woff(2)?)(\?v=[\d.]+)?(\?[a-z0-9#-]+)?$/,
          loader: 'url-loader',
          options: {
            limit: 100000,
            name: 'css/[hash].[ext]',
          }
        },
        {
          test: /\.(png|svg|jpg|jpeg|gif)$/i,
          type: 'asset/resource',
          generator: {
            filename: 'assets/[hash].[ext]'
          }
        }
      ]
    },
    resolve: {
      extensions: ['.js', '.jsx'],
      fallback: {
        "fs": false,
        "tls": false,
        "net": false,
        "path": false,
        "zlib": false,
        "http": false,
        "https": false,
        "crypto": false,
        "assert": require.resolve("assert/"),
        "stream": require.resolve("stream-browserify"),
      }
    },
    // devServer: {
    //   contentBase: './build'
    // },
    plugins: [
      new CopyWebpackPlugin([
        { from: 'src/assets/favicons', to: '../public' },
      ]),
      new HtmlWebpackPlugin({
        template: './build/index.html',
        inject: true
      }),
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': production ? '"production"' : '"development"'
      }),
    ],
    optimization: production ? {
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            compress: {
              drop_console: true,
            },
          },
        }),
      ],
    } : {},
    watch: !production,
    target: "web",
    stats: "detailed",
  }
}
