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


const devMode = process.env.NODE_ENV === 'development';
const store = configureStore(devMode);

render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<GamePage />} />
      <Route path="add" element={<AddPage store={store} />} />
    </Routes>
  </BrowserRouter>
  , document.getElementById('app')
);