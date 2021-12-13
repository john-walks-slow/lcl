const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const WorkboxPlugin = require('workbox-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
  .BundleAnalyzerPlugin;

const path = require('path');

module.exports = (() => {
  let production = process.env.NODE_ENV == 'production';
  let platform = process.env.BUILD_PLATFORM;
  let outputPath;
  switch (platform) {
    case 'web':
      outputPath = path.join(__dirname, '../public/');
      break;
    case 'app':
      outputPath = path.join(__dirname, '../cordova/www');
      break;
    default:
      break;
  }
  return {
    mode: production ? 'production' : 'development',
    devtool: production ? false : 'cheap-module-source-map',
    entry: ['babel-polyfill', './src/index.jsx', './src/libs.js'],
    output: {
      path: outputPath,
      publicPath: '/',
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
          use: ['babel-loader']
        },
        {
          test: /\.css$/i,
          use: [
            'style-loader',
            {
              loader: 'css-loader',
              options: {
                importLoaders: 1
              }
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
      extensions: ['.js', '.jsx', '.json'],

      fallback: {
        fs: false,
        tls: false,
        net: false,
        path: false,
        zlib: false,
        http: false,
        https: false,
        crypto: false,
        assert: require.resolve('assert/'),
        stream: require.resolve('stream-browserify')
      }
    },
    // devServer: {
    //   contentBase: './build'
    // },
    externals: production
      ? {
        phaser: 'Phaser',
        react: 'React',
        'react-dom': 'ReactDOM',
        tone: 'Tone',
        lodash: '_'
      }
      : {
        // phaser: 'Phaser',
        // react: 'React',
        // 'react-dom': 'ReactDOM',
        // 'tone': 'Tone',
        // 'lodash': '_',
      },
    plugins: [
      production ? new CleanWebpackPlugin() : new BundleAnalyzerPlugin(),
      new CopyWebpackPlugin([
        { from: 'src/assets/public_res', to: outputPath }
      ]),
      new WorkboxPlugin.GenerateSW({
        clientsClaim: true,
        skipWaiting: true,
        maximumFileSizeToCacheInBytes: 50000000,
        include: [/\.(ttf|png|webmanifest|ico|html)$/],
        additionalManifestEntries: [
          'https://cdn.jsdelivr.net/npm/phaser@3.55.2/dist/phaser.min.js',
          'https://cdn.jsdelivr.net/npm/react@17.0.2/umd/react.production.min.js',
          'https://cdn.jsdelivr.net/npm/react-dom@17.0.2/umd/react-dom.production.min.js',
          'https://cdn.jsdelivr.net/npm/lodash@4.17.21/lodash.min.js',
          'https://cdn.jsdelivr.net/npm/tone@14.7.77/build/Tone.min.js'
        ],
        runtimeCaching: [
          {
            // Match any request that ends with .png, .jpg, .jpeg or .svg.
            urlPattern: /\.(?:js)$/,
            // Apply a cache-first strategy.
            handler: 'NetworkFirst',
            options: {
              // Use a custom cache name.
              cacheName: 'app'
              // Only cache 10 images.
            }
          },
          {
            urlPattern: /objects$/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'object'
            }
          }
        ]
      }),
      new HtmlWebpackPlugin({
        template: 'src/assets/index.html',
        inject: true
      }),
      new webpack.DefinePlugin({
        'process.env': JSON.stringify(process.env),
        'process.browser': true
      })
    ],
    optimization: {
      splitChunks: {
        chunks: 'all'
      },

      minimizer: production
        ? [
          new TerserPlugin({
            terserOptions: {
              compress: {
                drop_console: true
              }
            }
          })
        ]
        : []
    },
    // watch: false,
    watch: !production,
    target: 'web',
    stats: 'detailed'
  };
})();
