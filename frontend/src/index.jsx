import React, { useEffect } from 'react'
import { render } from 'react-dom'
import './css/imports.css' // Import PostCSS files
import configureStore from './store/configureStore'
import Router from './router'

import { Provider } from 'react-redux'

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
