import { ActionCreators } from 'redux-undo'
import * as types from './actionTypes'

export function setInitialState(options) {
  return {
    type: types.SET_INITIAL_STATE,
    options,
  }
}

export function changeDimensions(gridProperty, increment) {
  return {
    type: types.CHANGE_DIMENSIONS,
    gridProperty,
    increment,
  }
}
export function changeBothDimensions(increment) {
  return {
    type: types.CHANGE_BOTH_DIMENSIONS,
    increment,
  }
}

export function updateGridBoundaries(gridElement) {
  return {
    type: types.UPDATE_GRID_BOUNDARIES,
    gridElement,
  }
}
export function updateUsedColors() {
  return {
    type: types.UPDATE_USED_COLORS,
  }
}

export function selectPaletteColor(position) {
  return {
    type: types.SELECT_PALETTE_COLOR,
    position,
  }
}

export function setCustomColor(customColor) {
  return {
    type: types.SET_CUSTOM_COLOR,
    customColor,
  }
}

export function cellAction({ id, drawingTool, color, paletteColor, columns, rows }) {
  return {
    type: `APPLY_${drawingTool}`,
    id,
    color,
    paletteColor,
    columns,
    rows,
  }
}

export function moveDrawing({ xDiff, yDiff, cellWidth }) {
  return {
    type: 'MOVE_DRAWING',
    moveDiff: { xDiff, yDiff, cellWidth },
  }
}

export function setDrawing(frames, paletteGridData, cellSize, columns, rows, hoveredIndex) {
  return {
    type: types.SET_DRAWING,
    frames,
    paletteGridData,
    cellSize,
    columns,
    rows,
    hoveredIndex,
  }
}
export function setStorage(storage) {
  return {
    type: types.SET_STORAGE,
    storage,
  }
}

export function endDrag() {
  return {
    type: types.END_DRAG,
  }
}

export function switchTool(tool) {
  return {
    type: types.SWITCH_TOOL,
    tool,
  }
}

export function setCellSize(cellSize) {
  return {
    type: types.SET_CELL_SIZE,
    cellSize,
  }
}

export function resetGrid() {
  return {
    type: types.SET_RESET_GRID,
  }
}

export function showSpinner() {
  return {
    type: types.SHOW_SPINNER,
  }
}

export function hideSpinner() {
  return {
    type: types.HIDE_SPINNER,
  }
}

export function sendNotification(message) {
  return {
    type: types.SEND_NOTIFICATION,
    message,
  }
}

export function changeActiveFrame(frameIndex) {
  return {
    type: types.CHANGE_ACTIVE_FRAME,
    frameIndex,
  }
}

export function reorderFrame(selectedIndex, destinationIndex) {
  return {
    type: types.REORDER_FRAME,
    selectedIndex,
    destinationIndex,
  }
}

export function createNewFrame() {
  return {
    type: types.CREATE_NEW_FRAME,
  }
}

export function deleteFrame(frameId) {
  return {
    type: types.DELETE_FRAME,
    frameId,
  }
}

export function duplicateFrame(frameId) {
  return {
    type: types.DUPLICATE_FRAME,
    frameId,
  }
}

export function setDuration(duration) {
  return {
    type: types.SET_DURATION,
    duration,
  }
}

export function changeFrameInterval(frameIndex, interval) {
  return {
    type: types.CHANGE_FRAME_INTERVAL,
    frameIndex,
    interval,
  }
}

export function newProject() {
  return {
    type: types.NEW_PROJECT,
  }
}

export function changeHoveredCell(cell) {
  return {
    type: types.CHANGE_HOVERED_CELL,
    cell,
  }
}
export function setNewObject(newObject) {
  return {
    type: types.SET_NEW_OBJECT,
    newObject,
  }
}

export function setObjects(objects) {
  return {
    type: types.SET_OBJECTS,
    objects,
  }
}

export function setWorld(world) {
  return {
    type: types.SET_WORLD,
    world,
  }
}
export function setLocation(location) {
  return {
    type: types.SET_LOCATION,
    location,
  }
}

export function setPath(pathname, withoutHistory = false) {
  console.log(pathname)
  return {
    type: types.SET_PATH,
    pathname,
    withoutHistory,
  }
}

export function undo() {
  return ActionCreators.undo()
}

export function redo() {
  return ActionCreators.redo()
}
