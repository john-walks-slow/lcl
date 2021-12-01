import React, { useEffect, useState } from 'react';
import { render } from 'react-dom';
import './css/imports.css'; // Import PostCSS files
import configureStore from './store/configureStore';
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";
import AddPage from './pages/AddPage';
import GamePage from './pages/GamePage';
import { useSelector } from 'react-redux';


export default function ({ dispatch }) {
  let pathname = useSelector(state => state.present.get('pathname'));
  const [error, setError] = useState();
  let showGame = pathname == '/';
  let showAdd = pathname == '/add' || pathname == '/add/';
  console.log(pathname);
  // useEffect(() => {
  //   showGame = pathname == '/';
  //   showAdd = pathname == '/add';

  // }, [pathname]);
  useEffect(() => { window.onerror = (message) => { console.log(message); setError(message); }; }, []);
  return (
    // <div>
    //   <GamePage show-{location=='/'||location==''} dispatch={dispatch} />
    //   <AddPage show-{location=='/add'} dispatch={dispatch} />
    // </div>
    <div>
      <div className={"error__div" + (error ? " show" : "")}>{"对不起！出错了。错误代码：" + error} </div>
      <GamePage isShown={showGame} dispatch={dispatch} />
      {showAdd ? <AddPage isShown={showAdd} dispatch={dispatch} /> : ""}
    </div>
  );
};