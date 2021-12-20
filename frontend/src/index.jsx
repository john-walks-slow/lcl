import React, { useEffect } from 'react'
import { render } from 'react-dom'
import './css/imports.css' // Import PostCSS files
import configureStore from './store/configureStore'
import Router from './router'
import { Provider } from 'react-redux'
// import fallback from 'fallback'

// fallback.load({
//   phaser: [
//     'https://cdn.jsdelivr.net/npm/phaser@3.55.2/dist/phaser.min.js',
//     '/phaser.fallback.bundle.js',
//   ],
//   react: [
//     'https://cdn.jsdelivr.net/npm/react@17.0.2/umd/react.production.min.js',
//     '/react.fallback.bundle.js',
//   ],
//   'react-dom': [
//     'https://cdn.jsdelivr.net/npm/react-dom@17.0.2/umd/react-dom.production.min.js',
//     '/react-dom.fallback.bundle.js',
//   ],
//   // lodash: [
//   //   'https://cdn.jsdelivr.net/npm/lodash@4.17.21/lodash.min.js',
//   //   '/lodash.fallback.bundle.js',
//   // ],
//   tone: ['https://cdn.jsdelivr.net/npm/tone@14.7.77/build/Tone.min.js', '/tone.fallback.bundle.js'],
// })

// fallback.ready(function() {
const devMode = process.env.NODE_ENV === 'development'
const store = configureStore(devMode)
try {
  render(
    <Provider store={store}>
      <Router dispatch={store.dispatch} />
    </Provider>,

    document.getElementById('app')
  )
} catch (error) {
  alert(error)
}
// })
