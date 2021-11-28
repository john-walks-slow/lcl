import React, { useEffect } from 'react';
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


export default function ({ dispatch }) {
  useEffect(() => {
    document.body.style.backgroundColor = "white";
  }, []);
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<GamePage dispatch={dispatch} />} />
        <Route path="add" element={<AddPage dispatch={dispatch} />} />
      </Routes>
    </BrowserRouter >
  );
};