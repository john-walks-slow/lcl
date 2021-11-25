import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import feathers from '@feathersjs/feathers';
import rest from '@feathersjs/rest-client';
import App from './App';
import { renderBlob } from '../utils/canvasGIF';

import { connect } from 'react-redux';
import {
  cellAction,
  updateGridBoundaries,
  moveDrawing,
  changeHoveredCell
} from '../store/actions/actionCreators';

const Root = ({ dispatch }) => {
  const [name, setName] = useState("")
  const [dialog, setDialog] = useState("")
  const [link, setLink] = useState("")
  const [size, setSize] = useState("M")
  const [movement, setMovement] = useState("static")
  const [zFactor, setZFactor] = useState("1")
  const [submitted, setSubmitted] = useState(false)
  const [errorData, setErrorData] = useState()
  const [objectsService, setObjectsService] = useState();
  const [blobsService, setBlobsService] = useState();
  const [uploading, setUploading] = useState(false);
  const labels = useSelector(state => state.present.get('labels'));
  const fats = useSelector(state => state.present.get('fats'));
  const telescopes = useSelector(state => state.present.get('telescopes'));
  const batteries = useSelector(state => state.present.get('batteries'));
  const boxes = useSelector(state => state.present.get('boxes'));
  const usedColors = useSelector(state => state.present.get('usedColors'));
  const frames = useSelector(state => state.present.get('frames'));
  const framesList = useSelector(state => state.present.get('frames').get('list'));
  const type = framesList.length > 1 ? 'spritesheet' : 'single';
  const activeFrameIndex = frames.get('activeIndex');
  const activeFrame = frames.getIn(['list', activeFrameIndex]);
  const grid = frames.getIn(['list', activeFrameIndex, 'grid']);
  const columns = frames.get('columns');
  const rows = frames.get('rows');
  const cellSize = 1;
  const duration = useSelector(state => state.present.get('duration'));
  const options = {
    type,
    framesList,
    activeFrame,
    columns,
    rows,
    cellSize: 1,
    duration
  }
  const FAT_CONSUMPTION_MAP = {
    "XL": 2,
    "L": 1,
    "M": 0,
    "S": 1,
    "XS": 1,
  }
  const BATTERY_CONSUMPTION_MAP = {
    "static": 0,
    "float": 1,
    "flash": 2,
    "wander": 2,
    "bf": 1,
  }
  const labelConsumption = name == "" ? 0 : 1;
  const boxConsumption = link == "" ? 0 : 1;
  const fatConsumption = FAT_CONSUMPTION_MAP[size];
  const batteryConsumption = BATTERY_CONSUMPTION_MAP[movement];
  const telescopeConsumption = Math.ceil(Math.abs(zFactor - 1) / 0.2);
  const regex = new RegExp(/[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi);
  const error =
    labels < labelConsumption || batteries < batteryConsumption || fats < fatConsumption || dialog == "" || (link !== "" && !link.match(regex));
  var blob = null;
  var blobURI = null;
  function blobToDataURL(blob, callback) {
    var a = new FileReader();
    a.onload = function (e) { callback(e.target.result); }
    a.readAsDataURL(blob);
  }
  const submit = (event) => {
    setUploading(true);
    event.preventDefault();
    renderBlob(options, (b) => {
      blobToDataURL(b, (uri) => {
        blobURI = uri;
        upload();
      })
    });
  }

  const upload = async () => {
    console.log({
      dialog,
      size,
      movement,
      zFactor,
      link
    });
    try {
      console.log(blob);
      var result = await blobsService.create({ uri: blobURI });
      console.log(`image uploaded ${result}`);
      let _id = result.id.split('.')[0];
      result = await objectsService.create({
        _id,
        name,
        dialog,
        size,
        movement,
        zFactor,
        link,
      });
      console.log(`Data uploaded ${result}`);
      setSubmitted(true);
    }
    catch (e) {
      console.log(e);
      setErrorData(e);
      setSubmitted(true);
    }
  }
  useEffect(() => {
    console.log(grid);

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
    <div className="page__container">

      <div className={"page__submitted" + (submitted ? " show" : "")}>{errorData?("哎呀！出了一点问题。"+errorData.toString()):"创建成功了！过一会儿它就会出现在世界里"}</div>
      {submitted ? "" : <form className={"page__form" + (submitted ? " hide" : "")}>
        <h1>新对象</h1>
        <label>形象 <sub>(画彩色的画需要颜料)</sub>
        </label>
        <App dispatch={dispatch} color="#000000" animate="false" />
        <label className={"page__label"}>
          名字 <sub>{labels <= 0 ? "(改名字需要便签条)" : ("便签条数量：" + labels + (labelConsumption == 0 ? "" : `(-1)`))}</sub>
          <input type="text" value={name} disabled={labels <= 0} onChange={(event) => { setName(event.target.value) }} placeholder="？？？" className="page__input" />
        </label>
        <label className={"page__label"}>
          对话
          <textarea type="text" value={dialog} onChange={(event) => { setDialog(event.target.value) }} placeholder="注:对话是由回车分割的" className="page__textarea dialog" />
        </label>
        <label className={"page__label"}>
          链接 <sub>{boxes <= 0 ? "(添加链接需要盒子)" : ("盒子数量：" + boxes + (boxConsumption == 0 ? "" : `(-1)`))}</sub>
          <input type="text" value={link} onChange={(event) => { setLink(event.target.value) }} placeholder="对象可以携带一个超链接" className="page__input link" />
        </label>
        <label className={"page__label"}>
          体积 <sub>{fats <= 0 ? "(改大小需要肥料)" : ("肥料数量：" + fats + (size == "M" ? "" : `(-${fatConsumption})`))}</sub>
          <select value={size} onChange={(event) => { setSize(event.target.value) }} className="page__input" >
            <option value="XL">XL</option>
            <option value="L">L</option>
            <option value="M">M</option>
            <option value="S">S</option>
            <option value="XS">XS</option>
          </select>
        </label>
        <label className={"page__label"}>
          运动 <sub>{batteries <= 0 ? "(让物体动起来需要电池)" : ("电池数量：" + batteries + (movement == "static" ? "" : `(-${batteryConsumption})`))}</sub>
          <select value={movement} disabled={batteries <= 0} onChange={(event) => { setMovement(event.target.value) }} className="page__input" >
            <option value="static">静止</option>
            <option value="float">漂浮</option>
            <option value="bf">来回走</option>
            <option value="flash">闪现</option>
            <option value="wander">游荡</option>
          </select>        </label>

        <label className={"page__label"}   >
          深度 <sub>{telescopes <= 0 ? "(设置深度需要望远镜)" : ("望远镜数量：" + telescopes + (zFactor == 1 ? "" : `(-${telescopeConsumption})`))}</sub>
          <input type="range" min="0.4" max="1.6" step="0.1" disabled={telescopes <= 0} value={2 - zFactor} onChange={(event) => { setZFactor(2 - event.target.value) }} placeholder="深度的范围是0.5 - 1.5（近大远小）" className="page__input" />
        </label>

        <input className="page__submit" disabled={error||uploading} type="submit" onClick={(e) => { submit(e); }} value={uploading?"提交中...":"提交"} />
      </form>}
    </div>
  );
}


export default Root;
