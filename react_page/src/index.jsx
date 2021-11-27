import React from 'react';
import { render } from 'react-dom';
import './css/imports.css'; // Import PostCSS files
import configureStore from './store/configureStore';
import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";
import AddPage from './pages/AddPage';
import GamePage from './pages/GamePage';

import { Provider } from 'react-redux';

const devMode = process.env.NODE_ENV === 'development';
const store = configureStore(devMode);

render(
  <BrowserRouter>
    <Provider store={store}>
      <Routes>
        <Route path="/" element={<GamePage dispatch={store.dispatch} />} />
        <Route path="add" element={<AddPage dispatch={store.dispatch} />} />
      </Routes>
    </Provider>

  </BrowserRouter>
  , document.getElementById('app')
);