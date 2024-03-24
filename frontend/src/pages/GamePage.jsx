// import Phaser from 'jquery';
import Phaser from 'phaser'
import * as Tone from 'tone'
import React, { useEffect, useState, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import { useSelector } from 'react-redux'
import ReadMe from '../../../README.md'
import newImg from '../assets/game/new.png'
import mapImg from '../assets/game/map.png'
import bagImg from '../assets/game/bag.png'
import infoImg from '../assets/game/info.png'
import moreImg from '../assets/game/more.png'
import musicOffImg from '../assets/game/musicOff.png'
import musicImg from '../assets/game/music.png'
import worldImg from '../assets/game/world.png'
import locationImg from '../assets/game/location.png'
import configurations from '../class/configurations'
import { setPath, setStorage, setLocation } from '../store/actions/actionCreators'
import MainScene from '../class/scenes/MainScene'
import LoadingScene from '../class/scenes/LoadingScene'
import emoji from 'emoji-dictionary/lib/index'
import { secureStorage } from '../utils/storage'
import generativeMusic from '../class/GenerativeMusic'
import { joinPath } from '../utils/utils'

// function createTestObject(object) {
//   object._id = 3;
//   object.seed = [Math.random() * 360, Math.random() ** 0.5];
//   return object;
// }

const Game = ({ dispatch, isShown }) => {
  const [mainSceneRef, setMainScene] = useState()
  const [gameRef, setGame] = useState()
  const [showInfo, setShowInfo] = useState(false)
  const [showInventory, setShowInventory] = useState(false)
  const [showUI, setShowUI] = useState(false)
  const [hideMenu, setHideMenu] = useState(false)
  const [showGame, setShowGame] = useState(true)
  const [showWorldDialog, setShowWorldDialog] = useState(false)
  const [showLocDialog, setShowLocDialog] = useState(false)
  const [muted, setMuted] = useState(false)
  const [zoomed, setZoomed] = useState(false)
  const [date, setDate] = useState(false)
  const location = useSelector((state) => state.present.get('location'))
  const dispatchLocation = (location) => {
    dispatch(setLocation(location))
  }
  const world = useSelector((state) => state.present.get('world'))
  const player = useSelector((state) => state.present.get('player'))
  const newObject = useSelector((state) => state.present.get('newObject'))
  // const objects = useSelector(state => state.present.get('objects'));
  let deferredPrompt = window.deferredPrompt
  function toggleShowInventory() {
    console.log(showInventory)
    setShowInventory(!showInventory)
  }
  function toggleHideMenu() {
    setHideMenu(!hideMenu)
  }
  function toggleShowUI() {
    setShowUI(!showUI)
  }
  function toggleMuted() {
    if (!muted) {
      localStorage.setItem('muted', 'true')
    } else {
      localStorage.setItem('muted', 'false')
    }
    setMuted(!muted)
    muted ? generativeMusic.fadeIn() : generativeMusic.fadeOut()
  }

  function toggleShowInfo() {
    setShowInfo(!showInfo)
    if (!showInfo) {
      secureStorage.setItem('haveReadInfo', 'true')
    }
    if (mainSceneRef && mainSceneRef.gamepad) {
      !showInfo ? mainSceneRef.gamepad.hide() : mainSceneRef.gamepad.show()
    }
  }
  function navigateToAdd() {
    // if (secureStorage.getItem('haveReadInfo')) {
    dispatch(setPath(joinPath(window.location.pathname, 'add')))
    // } else {
    // alert('请看看帮助中的“规则”')
    // }
  }

  function updateUIMethod(mainScene) {
    mainScene.toggleShowInventory = toggleShowInventory
    mainScene.toggleHideMenu = toggleHideMenu
    mainScene.toggleShowUI = toggleShowUI
    mainScene.toggleShowInfo = toggleShowInfo
  }
  useEffect(() => {
    mainSceneRef && updateUIMethod(mainSceneRef)
  }, [showInventory, showInfo, hideMenu, showUI])
  useEffect(() => {
    setDate(new Date())
    let timer = setInterval(() => setDate(new Date()), 1000)
    return () => {
      clearInterval(timer)
    }
  }, [])
  useEffect(() => {
    if (!isShown && mainSceneRef) {
      setShowUI(false)
      setShowInventory(false)
      setShowInfo(false)
      setShowGame(false)
      console.log('pause')
      mainSceneRef.pause()
      return
    }
    if (isShown) {
      setShowGame(true)
      document.title = '白洞'
      document.body.style.overflow = 'hidden'
      document.body.style.backgroundColor = '#131313'

      // if not initial run
      if (mainSceneRef) {
        setShowUI(true)
        console.log('resume')
        mainSceneRef.resume()
        // mainSceneRef.scene.restart({ objectList: mainSceneRef.objectList, gameObjectMap: mainSceneRef.gameObjectMap });
      }
      // initialize
      else {
        console.log('initial run')
        configurations.updateConfigurations()
        window.addEventListener('resize', () => {
          configurations.updateConfigurations()
          console.log(configurations.WINDOW_W, configurations.WINDOW_H)
          game.scale.resize(configurations.WINDOW_W, configurations.WINDOW_H)
          game.scale.setZoom(configurations.SCALE)
        })
        // let toggleShowInfoRef = useRef(toggleShowInfo).current;
        // let toggleShowInventoryRef = useRef(toggleShowInventory).current;
        let methods = {
          toggleShowInfo,
          toggleShowInventory,
          toggleShowUI,
          toggleMuted,
          setZoomed,
          toggleHideMenu,
          setShowUI,
          dispatchLocation,
          setStorage,
          setMuted,
          dispatch,
          updateUIMethod,
          navigateToAdd,
        }
        var loadingScene = new LoadingScene(methods, world)
        var mainScene = new MainScene(methods, location)
        setMainScene(mainScene)
        if (localStorage.getItem('muted') === 'true') {
          setMuted(true)
        }
        var config = {
          type: Phaser.CANVAS,
          width: configurations.WINDOW_W,
          height: configurations.WINDOW_H,
          scale: {
            zoom: configurations.SCALE,
            // autoCenter: Phaser.Scale.CENTER_BOTH
          },
          audio: {
            // disableWebAudio: true,
            // noAudio: true,
            context: Tone.context.rawContext._nativeContext,
          },
          // zoom: configurations.ZOOM,
          physics: {
            default: 'arcade',
            arcade: {
              gravity: { y: 0 },
              debug: false,
            },
          },
          // scale: { mode: Phaser.Scale.FIT, },
          parent: 'PHASER_ROOT',
          scene: [loadingScene, mainScene],
          // fps: 30,
          disableContextMenu: true,
          render: {
            antialias: false,
            roundPixels: true,
          },
        }

        var game = new Phaser.Game(config)
        game.canvas.style.imageRendering = 'auto'

        setGame(game)
        // game.scale.autoRound = true;
        // game.scale.setMaxZoom();
      }
    }
  }, [isShown])
  return (
    <div id="GAME_DIV" className={showGame ? 'show' : ''}>
      <div id="PHASER_ROOT"></div>
      <div id="GAME_UI" className={showUI ? 'show' : ''}>
        {/* <div id="WORLD_DIALOG" className={showWorldDialog ? 'show' : ''}>
          <input placeholder="输入要前往的世界"></input>
          <button>前往</button>
        </div> */}
        {/* <div id="LOC_DIALOG" className={showLocDialog ? 'show' : ''}></div> */}
        <div id="GAME_DATE" className="game__div-ui">
          {date ? date.toLocaleTimeString() : ''}
        </div>
        <div id="GAME_SUBMENU" className={'game__div-ui' + (hideMenu ? ' hide' : '')}>
          <button
            className="game__button-menu"
            onClick={() => {
              // setShowWorldDialog(!showWorldDialog)
              let targetWorld = prompt('输入要前往的世界', world)
              if (targetWorld === null) return
              if (targetWorld !== world) {
                if (
                  targetWorld.includes('.') ||
                  targetWorld.includes('/') ||
                  targetWorld.includes('\\')
                ) {
                  alert('不合法的世界名')
                  return
                }
                let targetUrl =
                  targetWorld === '' || targetWorld === 'default' ? '/' : '/world/' + targetWorld
                window.open(targetUrl, '_self')
              }
            }}
          >
            <img src={worldImg} />
          </button>
          <button
            className="game__button-menu"
            onClick={() => {
              let targetLoc = prompt(
                '输入要前往的坐标',
                `${location[0].toFixed(2)},${location[1].toFixed(1)}`
              )
              if (targetLoc === null) return
              const locMatches = targetLoc.match(/^(-?[0-9.]+),(-?[0-9.]+)$/)
              if (locMatches) {
                mainSceneRef &&
                  mainSceneRef.setPlayerLoc([parseFloat(locMatches[1]), parseFloat(locMatches[2])])
              } else {
                alert('不合法的坐标')
              }
            }}
          >
            <img src={locationImg} />
          </button>
          <button
            className="game__button-menu"
            onClick={() => {
              toggleMuted()
            }}
          >
            <img src={muted ? musicOffImg : musicImg} />
          </button>
        </div>
        <div id="GAME_LOCATION" className="game__div-ui">
          {`(${location?.[0]?.toFixed(2)},${location?.[1]?.toFixed(1)})`}
        </div>
        <div id="GAME_MENU" className={'game__div-ui' + (hideMenu ? ' hide' : '')}>
          <div className="">
            {/* <input className="game__button-menu" type="image" onClick={() => { navigateToAdd(); }} src={newBtnURL} /> */}
            {/* <input className="game__button-menu" type="image" onClick={() => { mainSceneRef.camera.toggleZoom(); }} src={mapBtnURL} /> */}
            {/* <input className="game__button-menu" type="image" onClick={() => { toggleShowInventory(); }} src={bagBtnURL} /> */}
            {/* <input className="game__button-menu" type="image" onClick={() => { toggleShowInfo(); }} src={infoBtnURL} /> */}
            <button
              className="game__button-menu"
              onClick={() => {
                navigateToAdd()
              }}
            >
              <u>N</u>ew
            </button>
            <button
              className={'game__button-menu' + (zoomed ? ' selected' : '')}
              onClick={() => {
                mainSceneRef && mainSceneRef.camera.toggleZoom()
              }}
            >
              <u>M</u>ap
            </button>
            <button
              className={'game__button-menu' + (showInventory ? ' selected' : '')}
              onClick={() => {
                toggleShowInventory()
              }}
            >
              <u>B</u>ag
            </button>
            <button
              className={'game__button-menu' + (showInfo ? ' selected' : '')}
              onClick={() => {
                toggleShowInfo()
              }}
            >
              <u>H</u>elp
            </button>
            {/* <button
              className="game__button-menu game__button-hide"
              onClick={() => {
                toggleHideMenu()
              }}
            >
              H<u>i</u>de
            </button> */}
          </div>
        </div>

        <div id="GAME_INVENTORY" className={showInventory ? 'show' : ''}>
          {player ? (
            <div>
              <div>
                <span>便签条:{player.labels}</span>
              </div>
              <div>
                <span>箱子:{player.boxes}</span>
              </div>
              <div>
                <span>肥料:{player.fats}</span>
              </div>
              <div>
                <span>电池:{player.batteries}</span>
              </div>
              <div>
                <span>镜片:{player.telescopes}</span>
              </div>
              <div>
                颜料:
                {player.palette.map((color) => (
                  <span
                    key={color}
                    className="page__span-color"
                    style={{ backgroundColor: color }}
                  ></span>
                ))}
              </div>
            </div>
          ) : (
            ''
          )}
        </div>
        <div id="GAME_INFO" className={showInfo ? 'show' : ''}>
          <button
            className={'game__button-install' + (deferredPrompt ? ' show' : '')}
            onClick={() => {
              deferredPrompt.prompt()
              deferredPrompt.userChoice.then((choiceResult) => {
                if (choiceResult.outcome === 'accepted') {
                  console.log('User accepted the A2HS prompt')
                } else {
                  console.log('User dismissed the A2HS prompt')
                }
                deferredPrompt = null
              })
            }}
          >
            安装到桌面
          </button>
          <button
            className="game__button-close-info"
            onClick={() => {
              toggleShowInfo()
            }}
          >
            ×
          </button>
          <ReactMarkdown>
            {ReadMe.toString()
              .replace(/:\w+:/gi, (name) => emoji.getUnicode(name))
              .replaceAll('[ ]', '☐')
              .replaceAll('[x]', '☑')}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  )
}
export default Game
