import {
  PENCIL,
  ERASER,
  BUCKET,
  EYEDROPPER
} from '../reducers/drawingToolStates';

export const SET_INITIAL_STATE = 'SET_INITIAL_STATE';
export const CHANGE_DIMENSIONS = 'CHANGE_DIMENSIONS';
export const SET_GRID_DIMENSION = 'SET_GRID_DIMENSION';
export const SELECT_PALETTE_COLOR = 'SELECT_PALETTE_COLOR';
export const SET_CUSTOM_COLOR = 'SET_CUSTOM_COLOR';
export const APPLY_PENCIL = `APPLY_${PENCIL}`;
export const APPLY_ERASER = `APPLY_${ERASER}`;
export const APPLY_BUCKET = `APPLY_${BUCKET}`;
export const APPLY_EYEDROPPER = `APPLY_${EYEDROPPER}`;
export const MOVE_DRAWING = 'MOVE_DRAWING';
export const SET_DRAWING = 'SET_DRAWING';
export const END_DRAG = 'END_DRAG';
export const SWITCH_TOOL = 'SWITCH_TOOL';
export const SET_CELL_SIZE = 'SET_CELL_SIZE';
export const SET_RESET_GRID = 'SET_RESET_GRID';
export const SHOW_SPINNER = 'SHOW_SPINNER';
export const HIDE_SPINNER = 'HIDE_SPINNER';
export const SEND_NOTIFICATION = 'SEND_NOTIFICATION';
export const CHANGE_ACTIVE_FRAME = 'CHANGE_ACTIVE_FRAME';
export const REORDER_FRAME = 'REORDER_FRAME';
export const CREATE_NEW_FRAME = 'CREATE_NEW_FRAME';
export const DELETE_FRAME = 'DELETE_FRAME';
export const DUPLICATE_FRAME = 'DUPLICATE_FRAME';
export const SET_DURATION = 'SET_DURATION';
export const CHANGE_FRAME_INTERVAL = 'CHANGE_FRAME_INTERVAL';
export const NEW_PROJECT = 'NEW_PROJECT';
export const UPDATE_GRID_BOUNDARIES = 'UPDATE_GRID_BOUNDARIES';
export const CHANGE_HOVERED_CELL = 'CHANGE_HOVERED_CELL';
export const UPDATE_USED_COLORS = 'UPDATE_USED_COLORS';
export const SET_STORAGE = 'SET_STORAGE';