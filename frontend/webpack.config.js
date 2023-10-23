const webpack = require('webpack')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const WorkboxPlugin = require('workbox-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
var HtmlWebpackSkipAssetsPlugin = require('html-webpack-skip-assets-plugin')
  .HtmlWebpackSkipAssetsPlugin
const fs = require('fs')
const path = require('path')

const BIG_CHUNKS = {
  phaser: 'https://cdn.jsdelivr.net/npm/phaser@3.55.2/dist/phaser.min.js',
  react: 'https://cdn.jsdelivr.net/npm/react@17.0.2/umd/react.production.min.js',
  'react-dom': 'https://cdn.jsdelivr.net/npm/react-dom@17.0.2/umd/react-dom.production.min.js',
  // lodash: 'https://cdn.jsdelivr.net/npm/lodash@4.17.21/lodash.min.js',
  tone: 'https://cdn.jsdelivr.net/npm/tone@14.7.77/build/Tone.min.js',
}

const APP_PATTERN = /(main|game)\.bundle\.js/
const PUBLIC_RES_PATH = path.join(__dirname, 'src/assets/public_res')
let production = process.env.NODE_ENV == 'production'
let platform = process.env.BUILD_PLATFORM
// const publicRes = [
//   '/android-chrome-192x192.png',
//   '/android-chrome-256x256.png',
//   '/apple-touch-icon.png',
//   '/browserconfig.xml',
//   '/favicon-16x16.png',
//   '/favicon-32x32.png',
//   '/favicon.ico',
//   '/manifest.json',
//   '/mstile-150x150.png',
//   '/safari-pinned-tab.svg',
// ]
let additionalResources = []
function* walkSync(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true })
  for (const file of files) {
    if (file.isDirectory()) {
      yield* walkSync(path.join(dir, file.name))
    } else {
      yield path.join(dir, file.name)
    }
  }
}
if (production) {
  for (const filePath of walkSync(PUBLIC_RES_PATH)) {
    additionalResources.push({
      url: filePath.slice(filePath.indexOf('public_res') + 10).replaceAll('\\', '/'),
      revision: fs.statSync(filePath).mtime.toUTCString(),
    })
  }
  console.log(additionalResources)
}
// let publicRes = glob.sync(publicResPath + '/**/*').map(r => r.slice(r.indexOf('public_res') + 10))

module.exports = (() => {
  let outputPath = path.join(__dirname, '../frontend/dist')
  switch (platform) {
    case 'web':
      outputPath = path.join(__dirname, '../frontend/dist')
      break
    case 'app':
      outputPath = path.join(__dirname, '../cordova/www')
      break
    default:
      break
  }
  return {
    mode: production ? 'production' : 'development',
    devtool: false ? false : 'eval-cheap-source-map',
    entry: {
      polyfill: 'babel-polyfill',
      main: './src/index.jsx',
    },
    output: {
      path: outputPath,
      publicPath: '/',
      filename: '[name].bundle.js',
    },
    module: {
      rules: [
        {
          test: /\.md$/,
          use: 'raw-loader',
        },
        {
          test: /\.jsx?$/,
          exclude: /node_modules/,
          use: ['babel-loader'],
        },
        {
          test: /\.ts$/,
          use: ['babel-loader'],
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
            'postcss-loader',
          ],
        },
        {
          test: /\.(ttf|eot|svg|woff(2)?)(\?v=[\d.]+)?(\?[aZ09#]+)?$/,
          type: 'asset/resource',
          generator: {
            filename: 'fonts/[hash][ext]',
          },
        },
        {
          test: /\.(png|svg|jpg|jpeg|gif)$/i,
          type: 'asset/resource',
          generator: {
            filename: 'assets/[hash][ext]',
          },
        },
      ],
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
        stream: require.resolve('stream-browserify'),
      },
    },
    // devServer: {
    //   contentBase: './build'
    // },
    externals: production
      ? {
          // phaser: 'Phaser',
          // react: 'React',
          // 'react-dom': 'ReactDOM',
          // tone: 'Tone',
          // lodash: '_'
        }
      : {
          // phaser: 'Phaser',
          // react: 'React',
          // 'react-dom': 'ReactDOM',
          // 'tone': 'Tone',
          // 'lodash': '_',
        },
    plugins: [
      true ? false : new BundleAnalyzerPlugin(),
      production ? new CleanWebpackPlugin() : false,
      new CopyWebpackPlugin([{ from: PUBLIC_RES_PATH, to: outputPath }]),
      production
        ? new WorkboxPlugin.GenerateSW({
            clientsClaim: true,
            skipWaiting: true,
            maximumFileSizeToCacheInBytes: 50000000,
            include: [/\.(ttf|png|json|ico|html|js|xml|mp3|ogg)$/],
            exclude: [APP_PATTERN],
            // additionalManifestEntries: [...publicRes].map(r => ({ url: r, revision: '20220108' })),
            additionalManifestEntries: additionalResources,
            runtimeCaching: [
              {
                urlPattern: APP_PATTERN,
                handler: 'NetworkFirst',
                options: {
                  cacheName: 'app',
                },
              },
              {
                urlPattern: /objects$/,
                handler: 'NetworkFirst',
                options: {
                  cacheName: 'object',
                },
              },
            ],
          })
        : false,
      new HtmlWebpackPlugin({
        excludeAssets: [/.*\.fallback\.bundle\.js/],
        template: 'src/assets/index.html',
        inject: true,
        minify: 'auto',
      }),
      new HtmlWebpackSkipAssetsPlugin(),

      new webpack.DefinePlugin({
        'process.env': JSON.stringify(process.env),
        'process.browser': true,
      }),
    ].filter(Boolean),
    optimization: {
      // removeAvailableModules: production,
      // removeEmptyChunks: production,
      // runtimeChunk: !production,
      splitChunks: true
        ? {
            chunks: 'all',
            // maxInitialRequests: Infinity,
            // minSize: 0,
            cacheGroups: {
              bigChunks: {
                test: module => {
                  const packageName = module?.context?.match(
                    /[\\/]node_modules[\\/](.*?)([\\/]|$)/
                  )?.[1]
                  return packageName && Object.keys(BIG_CHUNKS).includes(packageName)
                },
                name(module) {
                  // get the name. E.g. node_modules/packageName/not/this/part.js
                  // or node_modules/packageName
                  const packageName = module.context.match(
                    /[\\/]node_modules[\\/](.*?)([\\/]|$)/
                  )[1]

                  // npm package names are URL-safe, but some servers don't like @ symbols
                  return `${packageName.replace('@', '')}`
                },
                enforce: true,
              },
              game: {
                test: /[\\/]src[\\/]class[\\/].*$/,
                filename: 'game.bundle.js',
              },
            },
          }
        : false,
      minimizer: false
        ? [
            new TerserPlugin({
              terserOptions: {
                compress: {
                  drop_console: true,
                },
              },
            }),
          ]
        : [],
    },
    output: {
      pathinfo: false,
    },
    // watch: false,
    watch: !production,
    target: 'web',
    stats: 'normal',
    experiments: {
      // lazyCompilation: {
      //   entries: false,
      //   imports: true,
      // },
    },
  }
})()
