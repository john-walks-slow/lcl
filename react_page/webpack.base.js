const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const WorkboxPlugin = require('workbox-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

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
      filename: '[name].bundle.js'
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
          test: /\.(ttf|eot|svg|woff(2)?)(\?v=[\d.]+)?(\?[aZ09#]+)?$/,
          type: 'asset/resource',
          generator: {
            filename: 'fonts/[hash][ext]'
          }
        },
        {
          test: /\.(png|svg|jpg|jpeg|gif)$/i,
          type: 'asset/resource',
          generator: {
            filename: 'assets/[hash][ext]'
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
      production?new CleanWebpackPlugin():()=>{},
      new CopyWebpackPlugin([
        { from: 'src/assets/public_res', to: '../public' },
      ]),
      new WorkboxPlugin.GenerateSW({
        clientsClaim: true,
        skipWaiting: true,
        maximumFileSizeToCacheInBytes: 50000000,
        include: [/\.(ttf|png|html)$/],
      }),
      new HtmlWebpackPlugin({
        template: 'src/assets/index.html',
        inject: true
      }),
      new webpack.DefinePlugin({
        "process.env": JSON.stringify(process.env),
        "process.browser": true
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
