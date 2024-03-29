// const path = require('path')
// const favicon = require('serve-favicon')
const compress = require('compression')
const helmet = require('helmet')
const cors = require('cors')
const logger = require('./logger')

const feathers = require('@feathersjs/feathers')
const configuration = require('@feathersjs/configuration')
const express = require('@feathersjs/express')
// const socketio = require('@feathersjs/socketio')

const middleware = require('./middleware')
const services = require('./services')
const appHooks = require('./app.hooks')
const channels = require('./channels')

const mongodb = require('./mongodb')

const app = express(feathers())
// var history = require('connect-history-api-fallback');

// Load app configuration
app.configure(configuration())
// Enable security, CORS, compression, favicon and body parsing
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
)
app.use(cors())
app.use(compress())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ limit: '10mb', extended: true }))
// app.use(favicon(path.join(app.get('public'), 'favicon.ico')));
// Host the public folder
// app.use(history());
// Set up Plugins and providers
app.configure(express.rest())
app.configure(mongodb)
// app.configure(socketio());

// Configure other middleware (see `middleware/index.js`)
app.configure(middleware)
// Set up our services (see `services/index.js`)
app.configure(services)
// Set up event channels (see channels.js)
app.configure(channels)
app.use(express.static(app.get('public')))

// 任何无后缀的，都route到index
app.get(/\/[^.]*$/, function (req, res) {
  res.sendFile('index.html', { root: app.get('public') })
})
// app.use('/*', express.static(app.get('public')))
// app.get('/objects', function (req, res) {
//   res.sendFile('index.html', { root: app.get('public') })
// })

// Configure a middleware for 404s and the error handler
// app.use(express.notFound());
app.use(express.errorHandler({ logger }))
// app.use(logger)
app.hooks(appHooks)

module.exports = app
