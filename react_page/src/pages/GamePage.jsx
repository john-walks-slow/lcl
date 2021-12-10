// import Phaser from 'jquery';
import Phaser from 'phaser';
import React, { useEffect, useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { useSelector } from 'react-redux';
import ReadMe from '../../../README.md';
import newBtnURL from '../assets/game/new.png';
import mapBtnURL from '../assets/game/map.png';
import bagBtnURL from '../assets/game/bag.png';
import infoBtnURL from '../assets/game/info.png';
import configurations from '../phaser-class/configurations';
import { setPath, setStorage } from '../store/actions/actionCreators';
import MainScene from '../phaser-class/scenes/MainScene';
import LoadingScene from '../phaser-class/scenes/LoadingScene';
import emoji from 'emoji-dictionary/lib/index';

// function createTestObject(object) {
//   object._id = 3;
//   object.seed = [Math.random() * 360, Math.random() ** 0.5];
//   return object;
// }

const Game = ({ dispatch, isShown }) => {
  const [mainSceneRef, setMainScene] = useState();
  const [gameRef, setGame] = useState();
  const [showInfo, setShowInfo] = useState(false);
  const [showInventory, setShowInventory] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showGame, setShowGame] = useState(true);
  const player = useSelector(state => state.present.get('player')).toJS();
  const newObject = useSelector(state => state.present.get('newObject'));

  // const objects = useSelector(state => state.present.get('objects'));
  const deferredPrompt = window.deferredPrompt;
  function toggleShowInventory() {
    console.log(showInventory);
    setShowInventory(!showInventory);
  };
  function toggleShowInfo() {
    setShowInfo(!showInfo);
    if (mainSceneRef && mainSceneRef.gamepad) {
      !showInfo ? mainSceneRef.gamepad.hide() : mainSceneRef.gamepad.show();
    }
  };
  function navigateToAdd() {
    dispatch(setPath('/add', true));
  }
  function mainSceneHook(mainScene) {
    if (mainScene) {
      mainScene.input.keyboard.off("keydown-B");
      mainScene.input.keyboard.off("keydown-H");
      mainScene.input.keyboard.off("keydown-N");
      mainScene.input.keyboard.on("keydown-B", toggleShowInventory);
      mainScene.input.keyboard.on("keydown-H", toggleShowInfo);
      mainScene.input.keyboard.on("keydown-N", navigateToAdd);
    }
  }
  useEffect(() => {
    mainSceneHook(mainSceneRef);
  }, [showInventory, showInfo]);
  useEffect(() => {

  });
  useEffect(() => {
    if (!isShown && mainSceneRef) {
      setShowMenu(false);
      setShowInventory(false);
      setShowInfo(false);
      setShowGame(false);
      mainSceneRef.scene.pause();
      mainSceneRef.input.keyboard.disableGlobalCapture();
      return;
    }
    if (isShown) {
      setShowGame(true);
      document.title = "LCL";
      document.body.style.overflow = "hidden";
      document.body.style.backgroundColor = "black";
      // if not initial run
      if (mainSceneRef) {
        mainSceneRef.scene.resume();
        setShowMenu(true);
        mainSceneRef.input.keyboard.enableGlobalCapture();
        // mainSceneRef.scene.restart({ objectList: mainSceneRef.objectList, gameObjectMap: mainSceneRef.gameObjectMap });
      }
      // initialize
      else {
        window.addEventListener('resize', () => {
          game.scale.resize(configurations.WINDOW_W, configurations.WINDOW_H);
        });
        // let toggleShowInfoRef = useRef(toggleShowInfo).current;
        // let toggleShowInventoryRef = useRef(toggleShowInventory).current;
        let methods = {
          setShowInfo, setShowInventory, setShowMenu, setStorage, dispatch, mainSceneHook
        };
        var loadingScene = new LoadingScene(methods);
        var mainScene = new MainScene(methods);
        setMainScene(mainScene);
        var config = {
          type: Phaser.AUTO,
          width: configurations.WINDOW_W,
          height: configurations.WINDOW_H,
          physics: {
            default: 'arcade',
            arcade: {
              gravity: { y: 0 },
              debug: false
            }
          },
          // scale: { mode: Phaser.Scale.FIT, },
          parent: "PHASER_ROOT",
          scene: [loadingScene, mainScene],
          pixelArt: true,
          antialias: false, roundPixels: false
        };

        var game = new Phaser.Game(config);
        setGame(game);
      }
    }
  }, [isShown]);
  return (
    <div id="GAME_DIV" className={showGame ? "show" : ""}>
      <div id="PHASER_ROOT" ></div>
      <div id="GAME_MENU" className={showMenu ? "show" : ""} >
        <input className="game__button-menu" type="image" onClick={() => { navigateToAdd(); }} src={newBtnURL} />
        <input className="game__button-menu" type="image" onClick={() => { mainSceneRef.camera.toggleZoom(); }} src={mapBtnURL} />
        <input className="game__button-menu" type="image" onClick={() => { toggleShowInventory(); }} src={bagBtnURL} />
        <input className="game__button-menu" type="image" onClick={() => { toggleShowInfo(); }} src={infoBtnURL} />
      </div>


      <div id="GAME_INVENTORY" className={showInventory ? "show" : ""}>
        {player ? (<div>
          <div >
            <span>
              便签条:{player.labels}
            </span>
          </div>
          <div >
            <span>
              箱子:{player.boxes}
            </span>
          </div>
          <div >
            <span>
              肥料:{player.fats}
            </span>
          </div>
          <div >
            <span>
              电池:{player.batteries}
            </span>
          </div>
          <div >
            <span>
              镜片:{player.telescopes}
            </span>
          </div>
          <div >
            颜料:{player.palette.map(color => <span key={color} className="page__span-color" style={{ "backgroundColor": color }}></span>)}
          </div>
        </div>) : ""}
      </div>
      <div id="GAME_INFO" className={showInfo ? "show" : ""}>
        <button className={"game__button-install" + (deferredPrompt ? " show" : "")} onClick={() => {
          deferredPrompt.prompt();
          deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
              console.log('User accepted the A2HS prompt');
            } else {
              console.log('User dismissed the A2HS prompt');
            }
            deferredPrompt = null;
          });
        }}>安装到桌面</button>
        <ReactMarkdown >{ReadMe.toString().replace(/:\w+:/gi, name => emoji.getUnicode(name))}</ReactMarkdown>

      </div>

    </div >

  );

};
export default Game;