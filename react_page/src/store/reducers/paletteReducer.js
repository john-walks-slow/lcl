import { List, Map, fromJS } from 'immutable';
import shortid from 'shortid';
import * as types from '../actions/actionTypes';
import { GRID_INITIAL_COLOR } from './activeFrameReducer';
import { initStorage, getDataFromStorage, secureStorage } from '../../utils/storage';
const PALETTE = [
  "#131313",
  "#1b1b1b",
  "#272727",
  "#3d3d3d",
  "#5d5d5d",
  "#858585",
  "#b4b4b4",
  "#ffffff",
  "#c7cfdd",
  "#92a1b9",
  "#657392",
  "#424c6e",
  "#2a2f4e",
  "#1a1932",
  "#391f21",
  "#5d2c28",
  "#8a4836",
  "#bf6f4a",
  "#e69c69",
  "#f6ca9f",
  "#f9e6cf",
  "#edab50",
  "#e07438",
  "#c64524",
  "#8e251d",
  "#ff5000",
  "#ed7614",
  "#ffa214",
  "#ffc825",
  "#ffeb57",
  "#d3fc7e",
  "#99e65f",
  "#5ac54f",
  "#33984b",
  "#1e6f50",
  "#134c4c",
  "#0c2e44",
  "#00396d",
  "#0069aa",
  "#0098dc",
  "#00cdf9",
  "#0cf1ff",
  "#94fdff",
  "#fdd2ed",
  "#f389f5",
  "#db3ffd",
  "#7a09fa",
  "#3003d9",
  "#0c0293",
  "#03193f",
  "#3b1443",
  "#622461",
  "#93388f",
  "#ca52c9",
  "#c85086",
  "#f68187",
  "#f5555d",
  "#ff0040",
  "#ea323c",
  "#c42430",
  "#891e2b",
  "#571c27",
];
const INITIAL_PALETTE = [
  "#131313", "#FFFFFF", "#858585", "#5d2c28", "#ffa214", "#33984b", "#0098dc", "#db3ffd", "#ff0040"
];
export const REWARD_PALETTE = PALETTE.filter(i => (INITIAL_PALETTE.indexOf(i) == -1));

const getPositionFirstMatchInPalette = (grid, color) =>
  grid.findIndex(gridColor => gridColor.get('color') === color);

const isColorInPalette = (grid, color) =>
  getPositionFirstMatchInPalette(grid, color) !== -1;

const parseColorToString = colorData =>
  typeof colorData === 'string'
    ? colorData
    : `rgba(${colorData.r},${colorData.g},${colorData.b},${colorData.a})`;

const disableColor = (palette, action) => {
  if (action.tool === 'ERASER' || action.tool === 'MOVE') {
    return palette.set('position', -1);
  }
  return palette;
};

const addColorToLastGridCell = (palette, newColor) => {
  const grid = palette.get('grid');
  const lastPosition = grid.size - 1;
  return palette.merge({
    grid: grid.setIn([lastPosition, 'color'], parseColorToString(newColor)),
    position: lastPosition
  });
};

const createPaletteGrid = () => {
  // const colorList = [
  //   'rgba(0, 0, 0, 1)',
  //   'rgba(255, 0, 0, 1)',
  //   'rgba(233, 30, 99, 1)',
  //   'rgba(156, 39, 176, 1)',
  //   'rgba(103, 58, 183, 1)',
  //   'rgba(63, 81, 181, 1)',
  //   'rgba(33, 150, 243, 1)',
  //   'rgba(3, 169, 244, 1)',
  //   'rgba(0, 188, 212, 1)',
  //   'rgba(0, 150, 136, 1)',
  //   'rgba(76, 175, 80, 1)',
  //   'rgba(139, 195, 74, 1)',
  //   'rgba(205, 220, 57, 1)',
  //   'rgba(158, 224, 122, 1)',
  //   'rgba(255, 235, 59, 1)',
  //   'rgba(255, 193, 7, 1)',
  //   'rgba(255, 152, 0, 1)',
  //   'rgba(255, 205, 210, 1)',
  //   'rgba(255, 87, 34, 1)',
  //   'rgba(121, 85, 72, 1)',
  //   'rgba(158, 158, 158, 1)',
  //   'rgba(96, 125, 139, 1)',
  //   'rgba(48, 63, 70, 1)',
  //   'rgba(255, 255, 255, 1)',
  //   'rgba(56, 53, 53, 1)',
  //   'rgba(56, 53, 53, 1)',
  //   'rgba(56, 53, 53, 1)',
  //   'rgba(56, 53, 53, 1)',
  //   'rgba(56, 53, 53, 1)',
  //   'rgba(56, 53, 53, 1)'
  // ];
  let player = secureStorage.getItem('player');
  // Default color
  let colorList = INITIAL_PALETTE;
  if (player && player.palette) {
    colorList = colorList.concat(player.palette);
  }
  return List(colorList).map(color => Map({ color, id: shortid.generate() }));
};


const isColorSelected = palette => palette.get('position') !== -1;

const resetSelectedColorState = palette => palette.set('position', 0);

const createPalette = () =>
  Map({
    grid: createPaletteGrid(),
    position: 0
  });
const setPaletteFromStorage = (action) => (
  Map({
    grid: List(action.palette).map(color => Map({ color, id: shortid.generate() })),
    position: 0
  })
);
const getCellColor = ({ color }) => color || GRID_INITIAL_COLOR;

const eyedropColor = (palette, action) => {
  const cellColor = getCellColor(action);
  const grid = palette.get('grid');

  if (!isColorInPalette(grid, cellColor)) {
    return addColorToLastGridCell(palette, cellColor);
  }
  return palette.set(
    'position',
    getPositionFirstMatchInPalette(grid, cellColor)
  );
};

const preparePalette = palette => {
  if (!isColorSelected(palette)) {
    return resetSelectedColorState(palette);
  }
  return palette;
};

const selectPaletteColor = (palette, action) =>
  palette.set('position', action.position);

const setCustomColor = (palette, { customColor }) => {
  if (!isColorSelected(palette)) {
    return addColorToLastGridCell(palette, customColor);
  }
  const customColorRgba = parseColorToString(customColor);
  return palette.setIn(
    ['grid', palette.get('position'), 'color'],
    customColorRgba
  );
};

const setPalette = (palette, action) => {
  const defaultPalette = action.paletteGridData.length === 0;
  return palette.set(
    'grid',
    fromJS(defaultPalette ? createPaletteGrid() : action.paletteGridData)
  );
};

export default function paletteReducer(palette = createPalette(), action) {
  switch (action.type) {
    case types.SET_INITIAL_STATE:
    case types.NEW_PROJECT:
      return createPalette();
    case types.APPLY_EYEDROPPER:
      return eyedropColor(palette, action);
    case types.APPLY_PENCIL:
    case types.APPLY_BUCKET:
      return preparePalette(palette);
    case types.SELECT_PALETTE_COLOR:
      return selectPaletteColor(palette, action);
    case types.SET_CUSTOM_COLOR:
      return setCustomColor(palette, action);
    case types.SWITCH_TOOL:
      return disableColor(palette, action);
    case types.SET_DRAWING:
      return setPalette(palette, action);
    case types.SET_STORAGE:
      return setPaletteFromStorage(palette, action);
    default:
      return palette;
  }
}
