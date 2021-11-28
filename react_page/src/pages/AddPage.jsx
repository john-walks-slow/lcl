import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import feathers from '@feathersjs/feathers';
import rest from '@feathersjs/rest-client';
import App from '../components/App';
import { renderBlob } from '../utils/canvasGIF';
import { useParams, useNavigate, useLocation, Link, browserHistory } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { secureStorage } from '../utils/storage';
import { connect } from 'react-redux';
import {
  newProject, setStorage
} from '../store/actions/actionCreators';

const Page = ({ dispatch }) => {
  const [name, setName] = useState("");
  const [dialog, setDialog] = useState("");
  const [link, setLink] = useState("");
  const [size, setSize] = useState("M");
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
  const navigate = useNavigate();
  const location = useLocation();
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
    "XL": 2,
    "L": 1,
    "M": 0,
    "S": 1,
    "XS": 1,
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
  const telescopeConsumption = Math.ceil(Math.abs(zFactor - 1) / 0.2);
  const regex = new RegExp(/[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi);
  const error =
    isEmpty || labels < labelConsumption || batteries < batteryConsumption || fats < fatConsumption || (link !== "" && !link.match(regex));
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
    try {
      let result = await objectsService.create({
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
      setSubmitted(true);
      const getColor = Math.round(Math.random()) == 1;
      // let newRewardColor = Array(colorCount).map(i => ((Math.floor(Math.random() * 16777215).toString(16))));
      let newRewardColor = getColor ?
        "#000000".replace(/0/g, function () { return (~~(Math.random() * 16)).toString(16); })
        : false;
      setRewardColor(newRewardColor);
      let currentPlayer = secureStorage.getItem('player');
      currentPlayer.palette = (getColor ?
        [...currentPlayer.palette, newRewardColor] : currentPlayer.palette)
        .filter((c) => (usedColors.indexOf(c) == -1));

      console.log(currentPlayer.palette);
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
    document.title = "New Object";
    setShow(true);
    dispatch(newProject());
    document.body.style.overflow = 'auto';
    let app = feathers();
    // Connect to the same as the browser URL (only in the browser)
    let restClient = rest();
    app.configure(restClient.fetch(window.fetch));
    // Connect to the `http://feathers-api.com/messages` service
    setObjectsService(app.service('objects'));
    setBlobsService(app.service('blobs'));
  }
    , []);
  return (
    <div className={"page__container" + (show ? " show" : "")}>
      <div style={{ "textAlign": "right" }}>
        <button className="page__button-back" onClick={() => { navigate("/"); browserHistory.replace('/'); }}>
          <i class="fas fa-sign-out-alt"></i>
          回到LCL</button>
      </div>
      {submitted ?
        <div className={"page__submitted" + (submitted ? " show" : "")}>
          {errorData ? ("哎呀！出了一点问题。" + errorData.toString()) : "创建成功了！一小时之后，它会出现在世界里"}
          <br />
          {rewardColor ? <div className="page__div-color" style={{ "backgroundColor": rewardColor + "10" }}>
            <span className="page__span-color" style={{ "backgroundColor": rewardColor }}></span>
            哇！找到了一瓶颜料</div>
            : ""}
          <Link to="/add" onClick={() => { dispatch(newProject); setRewardColor(false); setSubmitted(false); }}>再创建一个</Link>


        </div>
        :
        <form className={"page__form" + (submitted ? " hide" : "")}>

          <h1>新对象</h1>
          <label>形象 <sub>画彩色的画会消耗颜料</sub>
          </label>
          <App dispatch={dispatch} color="#000000" animate="false" />
          <label className={"page__label"}>
            对话
            <textarea type="text" value={dialog} onChange={(event) => { setDialog(event.target.value); }} placeholder="注:对话是由回车分割的" className="page__textarea dialog" />
          </label>
          <label className={"page__label"} disabled={labels <= 0}>
            名字 <sub>{labels <= 0 ? "改名字需要便签条" : ("便签条数量：" + labels + (labelConsumption == 0 ? "" : `(-1)`))}</sub>
            <input type="text" value={name} disabled={labels <= 0} onChange={(event) => { setName(event.target.value); }} placeholder="？？？" className="page__input" />
          </label>
          <label className={"page__label"} disabled={boxes <= 0}>
            链接 <sub>{boxes <= 0 ? "添加链接需要箱子" : ("箱子数量：" + boxes + (boxConsumption == 0 ? "" : `(-1)`))}</sub>
            <input type="text" value={link} disabled={boxes <= 0} onChange={(event) => { setLink(event.target.value); }} placeholder="对象可以携带一个超链接" className="page__input link" />
          </label>
          <label className={"page__label"} disabled={fats <= 0}>
            体积 <sub>{fats <= 0 ? "改大小需要肥料" : ("肥料数量：" + fats + (size == "M" ? "" : `(-${fatConsumption})`))}</sub>
            <select value={size} disabled={fats <= 0} onChange={(event) => { setSize(event.target.value); }} className="page__input" >
              <option value="XL">XL</option>
              <option value="L">L</option>
              <option value="M">M</option>
              <option value="S">S</option>
              <option value="XS">XS</option>
            </select>
          </label>
          <label className={"page__label"} disabled={batteries <= 0}>
            运动 <sub>{batteries <= 0 ? "让物体动起来需要电池" : ("电池数量：" + batteries + (movement == "static" ? "" : `(-${batteryConsumption})`))}</sub>
            <select value={movement} disabled={batteries <= 0} onChange={(event) => { setMovement(event.target.value); }} className="page__input" >
              <option value="static">静止</option>
              <option value="float">漂浮</option>
              <option value="bf">来回走</option>
              <option value="flash">闪现</option>
              <option value="wander">游荡</option>
            </select>        </label>

          <label className={"page__label"} disabled={telescopes <= 0}>
            深度 <sub>{telescopes <= 0 ? "设置深度需要镜片" : ("镜片数量：" + telescopes + (zFactor == 1 ? "" : `(-${telescopeConsumption})`))}</sub>
            <input type="range" min="0.5" max="1.5" step="0.1" disabled={telescopes <= 0} value={2 - zFactor} onChange={(event) => { setZFactor(2 - event.target.value); }} placeholder="深度的范围是0.5 - 1.5（近大远小）" className="page__input" />
          </label>

          <input className="page__submit" disabled={error || uploading} type="submit" onClick={(e) => { submit(e); }} value={uploading ? "提交中..." : "提交"} />
        </form>}
    </div >
  );
};


export default Page;
