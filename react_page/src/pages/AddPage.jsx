import feathers from '@feathersjs/feathers';
import rest from '@feathersjs/rest-client';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { objectService } from "../class/feathers-service";
import App from '../components/App';
import {
  newProject, setPath, setStorage, updateUsedColors
} from '../store/actions/actionCreators';
import { REWARD_PALETTE } from "../store/reducers/paletteReducer";
import { renderBlob } from '../utils/canvasGIF';
import { secureStorage } from '../utils/storage';

const Page = ({ dispatch, isShown }) => {
  const [name, setName] = useState("");
  const [dialog, setDialog] = useState("");
  const [link, setLink] = useState("");
  const [size, setSize] = useState("S");
  const [movement, setMovement] = useState("static");
  const [zFactor, setZFactor] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [errorData, setErrorData] = useState();
  const [objectsService, setObjectsService] = useState();
  const [blobsService, setBlobsService] = useState();
  const [uploading, setUploading] = useState(false);
  const [show, setShow] = useState(false);
  const [rewardColor, setRewardColor] = useState(false);
  const player = useSelector(state => state.present.get('player'));
  const labels = player.get("labels");
  const fats = player.get("fats");
  const telescopes = player.get("telescopes");
  const batteries = player.get("batteries");
  const boxes = player.get("boxes");
  const usedColors = useSelector(state => state.present.get('usedColors'));
  const isEmpty = usedColors ? usedColors.length == 0 : true;
  const frames = useSelector(state => state.present.get('frames'));
  const framesList = useSelector(state => state.present.get('frames').get('list'));
  const isAnimate = framesList.size > 1;
  const type = framesList.size > 1 ? 'spritesheet' : 'single';
  const activeFrameIndex = frames.get('activeIndex');
  const activeFrame = frames.getIn(['list', activeFrameIndex]);
  const grid = frames.getIn(['list', activeFrameIndex, 'grid']);
  const columns = frames.get('columns');
  const rows = frames.get('rows');
  const cellSize = 1;
  const duration = useSelector(state => state.present.get('duration'));
  const options = {
    type,
    frames: framesList,
    activeFrame,
    columns,
    rows,
    cellSize: 1,
    duration
  };
  const FAT_CONSUMPTION_MAP = {
    "XXL": 3,
    "XL": 2,
    "L": 1,
    "M": 0,
    "S": 0,
    "XS": 0,
  };
  const BATTERY_CONSUMPTION_MAP = {
    "static": 0,
    "float": 1,
    "flash": 2,
    "wander": 2,
    "bf": 1,
  };
  const labelConsumption = name == "" ? 0 : 1;
  const boxConsumption = link == "" ? 0 : 1;
  const fatConsumption = FAT_CONSUMPTION_MAP[size];
  const batteryConsumption = BATTERY_CONSUMPTION_MAP[movement];
  const telescopeConsumption = Math.floor(Math.abs(zFactor - 1) / 0.25);
  const regex = new RegExp(/[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi);
  const error =
    isEmpty || labels < labelConsumption || batteries < batteryConsumption || fats < fatConsumption || telescopes < telescopeConsumption || (link !== "" && !link.match(regex));
  var blobURI = null;

  function blobToDataURL(blob, callback) {
    var a = new FileReader();
    a.onload = function (e) { callback(e.target.result); };
    a.readAsDataURL(blob);
  }
  const submit = (event) => {
    setUploading(true);
    event.preventDefault();

    renderBlob(options, (b) => {
      blobToDataURL(b, (uri) => {
        blobURI = uri;
        upload();
        // setSubmitted(true);
      });
    });
  };

  const upload = async () => {
    console.log({
      dialog,
      size,
      movement,
      zFactor,
      link
    });
    let currentPlayer = secureStorage.getItem('player');
    console.log(currentPlayer);
    dispatch(setStorage(currentPlayer));
    if (currentPlayer
      && currentPlayer.labels >= labelConsumption
      && currentPlayer.fats >= fatConsumption
      && currentPlayer.telescopes >= telescopeConsumption
      && currentPlayer.batteries >= batteryConsumption
      && currentPlayer.boxes >= boxConsumption) {
      console.log('ok');
    } else {
      setErrorData('道具数量不足！');
      setUploading(false);
      return;
    }
    try {
      let result = await objectService.create({
        name,
        dialog,
        size,
        movement,
        zFactor,
        link,
        isAnimate,
        columns,
        rows,
        blobURI
      });
      console.log(`Data uploaded ${result}`);
      // dispatch(setNewObject(result));
      setSubmitted(true);
      setUploading(false);
      setDialog("");
      setName("");
      setLink("");
      setSize("S");
      setZFactor(1);

      let currentPlayer = secureStorage.getItem('player');
      const getColor = (Math.round(Math.random()) == 1) && dialog.length > 0;
      // let newRewardColor = Array(colorCount).map(i => ((Math.floor(Math.random() * 16777215).toString(16))));
      let newRewardColor = getColor ? REWARD_PALETTE[Math.floor(Math.random() * REWARD_PALETTE.length)] : false;
      if (currentPlayer.palette.indexOf(newRewardColor) > -1) {
        newRewardColor = false;
      }
      setRewardColor(newRewardColor);
      currentPlayer.palette = (getColor ?
        [...currentPlayer.palette, newRewardColor] : currentPlayer.palette)
        .filter((c) => (usedColors.indexOf(c) == -1));
      currentPlayer.labels -= labelConsumption;
      currentPlayer.fats -= fatConsumption;
      currentPlayer.telescopes -= telescopeConsumption;
      currentPlayer.batteries -= batteryConsumption;
      currentPlayer.boxes -= boxConsumption;
      console.log(currentPlayer);
      // setFeatures({player})
      dispatch(setStorage(currentPlayer));
    }
    catch (e) {
      console.log(e);
      setErrorData(e);
      setSubmitted(true);
    }
  };
  useEffect(() => {
    document.body.style.backgroundColor = "white";
    document.title = "白洞 / 创建";
    setShow(true);
    dispatch(newProject());
    dispatch(updateUsedColors());
    // setTimeout(() => {
    document.body.style.overflow = 'auto';
    // }, 500);
    // Connect to the `http://feathers-api.com/messages` service
  }
    , []);
  return (
    <div className={"page__container" + (show ? " show" : "")}>
      <div style={{ "textAlign": "right" }}>
        <button className="page__button-back" onClick={() => { dispatch(setPath("/", true)); }}>
          {/* <i class="fas fa-sign-out-alt"></i> */}
          ⏎ 回到白洞</button>
      </div>
      {(submitted || errorData) ?
        <div className={"page__submitted" + " show"}>
          {errorData ? ("哎呀！出了一点问题。" + errorData.toString()) : "创建成功了！一小时之后，它会出现在世界里"}
          <br />
          {rewardColor ? <div className="page__div-color" style={{ "backgroundColor": rewardColor + "10" }}>
            <span className="page__span-color" style={{ "backgroundColor": rewardColor }}></span>
            哇！找到了一瓶颜料</div>
            : ""}
          {!errorData ?
            (<a className="page__link" onClick={() => {
              dispatch((newProject()));
              setRewardColor(false);
              setErrorData(false);
              setSubmitted(false);
            }}>再创建一个</a>) :
            (
              <a className="page__link" onClick={() => {
                setRewardColor(false);
                setErrorData(false);
                setSubmitted(false);
              }}>返回</a>)}


        </div>
        :
        <form className={"page__form" + (submitted ? " hide" : "")}>

          <h1>新东西</h1>
          <label className={"page__label"}>形象
          </label>
          <App dispatch={dispatch} color="#131313" animate="false" />
          <label className={"page__label"}>
            对话
            <textarea type="text" value={dialog} onChange={(event) => { setDialog(event.target.value); }} placeholder="注:对话是由回车分割的" className="page__textarea dialog" />
          </label>
          <label className={"page__label"}
          // disabled={labels <= 0}
          >
            名字 <sub>{("便签条数量：" + labels + (labelConsumption == 0 ? "" : `(-1)`))}</sub>
            <input type="text" value={name}
              // disabled={labels <= 0}
              onChange={(event) => { setName(event.target.value); }} placeholder="？？？" className="page__input" />
          </label>
          <label className={"page__label"}
          // disabled={boxes <= 0}
          >
            链接 <sub>{("箱子数量：" + boxes + (boxConsumption == 0 ? "" : `(-1)`))}</sub>
            <input type="text" value={link}
              // disabled={boxes <= 0}
              onChange={(event) => { setLink(event.target.value); }} placeholder="它可以携带一个网址" className="page__input link" />
          </label>
          <label className={"page__label"}
          // disabled={fats <= 0}
          >
            体积 <sub>{("肥料数量：" + fats + (fatConsumption == 0 ? "" : `(-${fatConsumption})`))}</sub>
            <select value={size} onChange={(event) => { setSize(event.target.value); }} className="page__input" >
              <option value="XL">XL</option>
              <option value="L">L</option>
              <option value="M">M</option>
              <option value="S">S</option>
              <option value="XS">XS</option>
            </select>
          </label>
          {/* <label className={"page__label"} disabled={batteries <= 0}>
            运动 <sub>{ ("电池数量：" + batteries + (movement == "static" ? "" : `(-${batteryConsumption})`))}</sub>
            <select value={movement} disabled={batteries <= 0} onChange={(event) => { setMovement(event.target.value); }} className="page__input" >
              <option value="static">静止</option>
              <option value="float">漂浮</option>
              <option value="bf">来回走</option>
              <option value="flash">闪现</option>
              <option value="wander">游荡</option>
            </select>        </label> */}

          <label className={"page__label"} disabled={telescopes <= 0}>
            深度 <sub>{("镜片数量：" + telescopes + (telescopeConsumption == 0 ? "" : `(-${telescopeConsumption})`))}</sub>
            <input type="range" min="0.4" max="1.6" step="0.1" value={2 - zFactor} onChange={(event) => { setZFactor(2 - event.target.value); }} placeholder="深度的范围是0.5 - 1.5（近大远小）" className="page__input" />
          </label>

          <input className="page__submit" disabled={error || uploading} type="submit" onClick={(e) => { submit(e); }} value={uploading ? "提交中..." : "提交"} />
        </form>}
    </div >
  );
};


export default Page;
