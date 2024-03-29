import { createStore } from 'redux'
import undoable, { includeAction } from 'redux-undo'
import { fromJS } from 'immutable'
import reducer from './reducers/reducer'
import {
  CHANGE_DIMENSIONS,
  CHANGE_BOTH_DIMENSIONS,
  APPLY_PENCIL,
  APPLY_ERASER,
  APPLY_BUCKET,
  APPLY_EYEDROPPER,
  MOVE_DRAWING,
  SHOW_SPINNER,
  NEW_PROJECT,
  SET_DRAWING,
  SET_CELL_SIZE,
  SET_RESET_GRID,
  SET_INITIAL_STATE,
  END_DRAG,
} from './actions/actionTypes'

const createIncludedActions = () =>
  includeAction([
    CHANGE_DIMENSIONS,
    CHANGE_BOTH_DIMENSIONS,
    END_DRAG,
    APPLY_EYEDROPPER,
    SET_DRAWING,
    SET_CELL_SIZE,
    SET_RESET_GRID,
    NEW_PROJECT,
  ])

const configureStore = (devMode) => {
  let store
  if (devMode) {
    store = createStore(
      undoable(reducer, {
        filter: createIncludedActions(),
        debug: false,
        ignoreInitialState: true,
      })
    )

    store.dispatch({
      type: SHOW_SPINNER,
    })
  } else {
    // const initialState = window.__INITIAL_STATE__;
    // initialState.present = fromJS(initialState.present);

    store = createStore(
      undoable(reducer, {
        filter: createIncludedActions(),
        debug: false,
        ignoreInitialState: true,
      })
    )
  }

  return store
}

export default configureStore
