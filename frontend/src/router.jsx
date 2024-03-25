import React, { useEffect, useState } from 'react'
import AddPage from './pages/AddPage'
import GamePage from './pages/GamePage'
import { useSelector } from 'react-redux'
import { setWorld } from './store/actions/actionCreators'
import configurations from './class/configurations'
import { setLocation } from './store/actions/actionCreators'

export default function Router({ dispatch }) {
  let pathname = useSelector((state) => state.present.get('pathname'))
  const [error, setError] = useState()
  const [showAdd, setShowAdd] = useState(false)
  const [showGame, setShowGame] = useState(false)
  useEffect(() => {
    var params = new URLSearchParams(window.location.search)
    let loc = params.get('loc')
    if (loc) {
      const locMatches = loc.match(/^(-?[0-9.]+),(-?[0-9.]+)$/)
      if (locMatches) {
        dispatch(setLocation([parseFloat(locMatches[1]), parseFloat(locMatches[2])]))
      }
    }
    if (!configurations.DEV_MODE) {
      window.onerror = (message) => {
        console.log(message)
        setError(message)
      }
    }
  }, [])
  useEffect(matchWorld, [pathname])

  function matchWorld() {
    const worldRegex = /^\/(?:world\/([^./]+))?\/?(?:add)?$/
    let matches = pathname.match(worldRegex)
    if (matches) {
      console.log(matches)
      dispatch(setWorld(pathname.match(worldRegex)?.[1] || 'default'))
      setShowAdd(pathname.endsWith('/add'))
      setShowGame(!pathname.endsWith('/add'))
    } else {
      error || setError('Invalid URL')
    }
  }

  return (
    <div>
      <div className={'error__div' + (error ? ' show' : '')}>
        {'对不起！出错了。' + error} <br />
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
