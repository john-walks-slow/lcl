import { fromJS, List, Map } from 'immutable';
import shortid from 'shortid';
import paletteReducer from './paletteReducer';
import framesReducer from './framesReducer';
import activeFrameReducer from './activeFrameReducer';
import drawingToolReducer from './drawingToolReducer';
import * as types from '../actions/actionTypes';
import { initStorage, getDataFromStorage, secureStorage } from '../../utils/storage';

function setInitialState(state) {
  const cellSize = 1;
  // const colorList = List(["#000000", "#FFFFFF"
  // ]).map(color => Map({ color, id: shortid.generate() }));
  // const palette = Map({
  //   grid: colorList,
  //   position: 0
  // });
  let player = secureStorage.getItem('player');
  if (!player) {
    player = {
      palette: [],
      labels: 0,
      fats: 0,
      telescopes: 0,
      batteries: 0,
      boxes: 0
    }
    secureStorage.setItem('player', player)
  }
  const labels = player.labels;
  const boxes = player.boxes;
  const telescopes = player.telescopes;
  const batteries = player.batteries;
  const fats = player.fats;
  const initialState = {
    cellSize,
    loading: false,
    notifications: List(),
    duration: 1,
    player: {
      labels,
      boxes,
      telescopes,
      batteries,
      fats
    }
    // palette,
  };

  return state.merge(initialState);
}

function setDrawing(state, action) {
  return state.set('cellSize', action.cellSize);
}
function updateUsedColors(state) {
  let frameList = state.get('frames').get('list').toJSON();
  console.log(frameList);
  let usedColors = [].concat(frameList.map(v => v.grid))[0].filter((value, index, self) => (self.indexOf(value) === index)).filter((value, index) => (value.length == 7))
  console.log(usedColors);
  return state.set('usedColors', usedColors);
}
function setStorage(state, action) {
  const player = secureStorage.getItem('player')
  secureStorage.setItem('player',
    { ...player, ...action.storage })
  return state.merge({
    player: {
      ...player
    }
  });
}

function setCellSize(state, cellSize) {
  return state.merge({ cellSize });
}

function showSpinner(state) {
  return state.merge({ loading: true });
}

function hideSpinner(state) {
  return state.merge({ loading: false });
}

function sendNotification(state, message) {
  return state.merge({
    notifications: message === '' ? List() : List([{ message, id: 0 }])
  });
}

function setDuration(state, duration) {
  return state.merge({ duration });
}

function updateGridBoundaries(state, action) {
  if (!action.gridElement) { return state; }
  const { x, y, width, height } = action.gridElement.getBoundingClientRect();
  return state.set('gridBoundaries', {
    x,
    y,
    width,
    height
  });
}

function generateDefaultState() {
  return setInitialState(Map(), { type: types.SET_INITIAL_STATE, state: {} });
}

const pipeReducers = reducers => (initialState, action) =>
  reducers.reduce((state, reducer) => reducer(state, action), initialState);

function partialReducer(state, action) {
  switch (action.type) {
    case types.SET_INITIAL_STATE:
      return setInitialState(state);
    case types.SET_DRAWING:
      return setDrawing(state, action);
    case types.SET_STORAGE:
      return setStorage(state, action);
    case types.SET_CELL_SIZE:
      return setCellSize(state, action.cellSize);
    case types.SHOW_SPINNER:
      return showSpinner(state);
    case types.HIDE_SPINNER:
      return hideSpinner(state);
    case types.SEND_NOTIFICATION:
      return sendNotification(state, action.message);
    case types.SET_DURATION:
      return setDuration(state, action.duration);
    case types.NEW_PROJECT:
      return setInitialState(state);
    case types.UPDATE_GRID_BOUNDARIES:
      return updateGridBoundaries(state, action);
    case types.APPLY_PENCIL:
      return updateUsedColors(state);
    case types.APPLY_ERASER:
      return updateUsedColors(state);
    case types.APPLY_BUCKET:
      return updateUsedColors(state);
    case types.MOVE_DRAWING:
      return updateUsedColors(state);
    case types.SET_RESET_GRID:
      return updateUsedColors(state);
    case types.UPDATE_USED_COLORS:
      return updateUsedColors(state);
    default:
  }
  return state;
}

export default function (state = generateDefaultState(), action) {
  return partialReducer(state, action).merge({
    drawingTool: drawingToolReducer(state.get('drawingTool'), action),
    palette: paletteReducer(state.get('palette'), action),
    frames: pipeReducers([framesReducer, activeFrameReducer])(
      state.get('frames'),
      action
    )
  });
}
