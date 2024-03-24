import { fromJS, List, Map } from 'immutable'
import shortid from 'shortid'
import paletteReducer from './paletteReducer'
import framesReducer from './framesReducer'
import activeFrameReducer from './activeFrameReducer'
import drawingToolReducer from './drawingToolReducer'
import * as types from '../actions/actionTypes'
import { initStorage, getDataFromStorage, secureStorage } from '../../utils/storage'
import { navigate, navigateWithoutHistory } from '../../utils/history'
let playerDefault = {
  palette: [],
  labels: 0,
  fats: 0,
  telescopes: 0,
  batteries: 0,
  boxes: 0,
  ownItems: [],
}
function setInitialState(state) {
  const cellSize = 1
  // const colorList = List(["#131313", "#FFFFFF"
  // ]).map(color => Map({ color, id: shortid.generate() }));
  // const palette = Map({
  //   grid: colorList,
  //   position: 0
  // });
  let player = secureStorage.getItem('player')

  player = Object.assign(playerDefault, player)
  secureStorage.setItem('player', player)
  const labels = player.labels
  const boxes = player.boxes
  const telescopes = player.telescopes
  const batteries = player.batteries
  const palette = player.palette
  const fats = player.fats
  const initialState = Map({
    cellSize,
    loading: false,
    notifications: List(),
    duration: 1,
    pathname: window.location.pathname,
    player: {
      labels,
      boxes,
      telescopes,
      batteries,
      fats,
      palette,
    },
    location: undefined,
    world: 'default',
    // objects: {}
  })
  return state.merge(initialState)
}

function setDrawing(state, action) {
  return state.set('cellSize', action.cellSize)
}
function setNewObject(state, action) {
  return state.set('newObject', action.newObject)
}
function setObjects(state, action) {
  return state.set('objects', action.objects)
}
function setWorld(state, action) {
  return state.set('world', action.world)
}
function setLocation(state, action) {
  return state.set('location', action.location)
}
function setPath(state, action) {
  if (action.pathname != window.location.pathname) {
    if (action.withoutHistory) {
      navigateWithoutHistory(action.pathname)
    } else {
      navigate(action.pathname)
    }
  }
  return state.set('pathname', action.pathname)
}
function updateUsedColors(state) {
  let frameList = state.get('frames').get('list').toJS()
  let usedColors = []
    .concat(frameList.map((v) => v.grid))[0]
    .filter((value, index, self) => self.indexOf(value) === index)
    .filter((value, index) => value.length == 7)
  return state.set('usedColors', usedColors)
}
function setStorage(state, action) {
  const player = secureStorage.getItem('player') || playerDefault
  let result = { ...player, ...action.storage }
  secureStorage.setItem('player', result)
  return state.merge({
    player: result,
  })
}

function setCellSize(state, cellSize) {
  return state.merge({ cellSize })
}

function showSpinner(state) {
  return state.merge({ loading: true })
}

function hideSpinner(state) {
  return state.merge({ loading: false })
}

function sendNotification(state, message) {
  return state.merge({
    notifications: message === '' ? List() : List([{ message, id: 0 }]),
  })
}

function setDuration(state, duration) {
  return state.merge({ duration })
}

function updateGridBoundaries(state, action) {
  if (!action.gridElement) {
    return state
  }
  const { x, y, width, height } = action.gridElement.getBoundingClientRect()
  return state.set('gridBoundaries', {
    x,
    y,
    width,
    height,
  })
}

function generateDefaultState() {
  return setInitialState(Map(), {
    type: types.SET_INITIAL_STATE,
    state: {},
  })
}

const pipeReducers = (reducers) => (initialState, action) =>
  reducers.reduce((state, reducer) => reducer(state, action), initialState)

function partialReducer(state, action) {
  switch (action.type) {
    case types.SET_INITIAL_STATE:
      return setInitialState(state)
    case types.SET_DRAWING:
      return setDrawing(state, action)
    case types.SET_STORAGE:
      return setStorage(state, action)
    case types.SET_CELL_SIZE:
      return setCellSize(state, action.cellSize)
    case types.SHOW_SPINNER:
      return showSpinner(state)
    case types.HIDE_SPINNER:
      return hideSpinner(state)
    case types.SEND_NOTIFICATION:
      return sendNotification(state, action.message)
    case types.SET_DURATION:
      return setDuration(state, action.duration)
    case types.NEW_PROJECT:
      return setInitialState(state)
    case types.UPDATE_GRID_BOUNDARIES:
      return updateGridBoundaries(state, action)
    case types.APPLY_PENCIL:
      return updateUsedColors(state)
    case types.APPLY_ERASER:
      return updateUsedColors(state)
    case types.APPLY_BUCKET:
      return updateUsedColors(state)
    case types.MOVE_DRAWING:
      return updateUsedColors(state)
    case types.SET_RESET_GRID:
      return updateUsedColors(state)
    case types.UPDATE_USED_COLORS:
      return updateUsedColors(state)
    case types.SET_PATH:
      return setPath(state, action)
    case types.SET_NEW_OBJECT:
      return setNewObject(state, action)
    case types.SET_OBJECTS:
      return setObjects(state, action)
    case types.SET_WORLD:
      return setWorld(state, action)
    case types.SET_LOCATION:
      return setLocation(state, action)
    default:
  }
  return state
}

export default function (state = generateDefaultState(), action) {
  return partialReducer(state, action).merge({
    drawingTool: drawingToolReducer(state.get('drawingTool'), action),
    palette: paletteReducer(state.get('palette'), action),
    frames: pipeReducers([framesReducer, activeFrameReducer])(state.get('frames'), action),
  })
}
