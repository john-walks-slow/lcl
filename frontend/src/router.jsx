import React, { useEffect, useState } from 'react'
import AddPage from './pages/AddPage'
import GamePage from './pages/GamePage'
import { useSelector } from 'react-redux'
import configurations from './class/configurations'

export default function Router({ dispatch }) {
  let pathname = useSelector((state) => state.present.get('pathname'))
  const [error, setError] = useState()
  let showGame = pathname == '/'
  let showAdd = pathname == '/add' || pathname == '/add/'
  console.log(pathname)
  // useEffect(() => {
  //   showGame = pathname == '/';
  //   showAdd = pathname == '/add';

  // }, [pathname]);
  useEffect(() => {
    // if (this.window.location != pathname) dispatch(setPath('/'));
    if (!configurations.DEV_MODE) {
      window.onerror = (message) => {
        console.log(message)
        setError(message)
      }
    }
    // window.onpopstate = (e) => {
    //   dispatch(setPath(window.location.pathname));
    // };
  }, [])
  return (
    // <div>
    //   <GamePage show-{location=='/'||location==''} dispatch={dispatch} />
    //   <AddPage show-{location=='/add'} dispatch={dispatch} />
    // </div>
    <div>
      <div className={'error__div' + (error ? ' show' : '')}>
        {'对不起！出错了。错误代码：' + error} <br />
        <button
          onClick={() => {
            setError(false)
          }}
        >
          Dismiss
        </button>
      </div>
      {showAdd ? <AddPage isShown={showAdd} dispatch={dispatch} /> : ''}
      <GamePage isShown={showGame} dispatch={dispatch} />
    </div>
  )
}
