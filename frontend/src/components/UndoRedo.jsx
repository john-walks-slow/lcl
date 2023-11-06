import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as actionCreators from '../store/actions/actionCreators'

const UndoRedo = (props) => {
  const undo = () => {
    props.actions.undo()
    props.actions.updateUsedColors()
    props.actions.updateGridBoundaries(document.getElementsByClassName('grid-container')[0])
  }

  const redo = () => {
    props.actions.redo()
    props.actions.updateUsedColors()
    props.actions.updateGridBoundaries(document.getElementsByClassName('grid-container')[0])
  }

  return (
    <div className="undo-redo">
      <button
        type="button"
        onClick={() => {
          undo()
        }}
      >
        <span className="undo-redo__icon--undo" />
      </button>
      <button
        type="button"
        onClick={() => {
          redo()
        }}
      >
        <span className="undo-redo__icon--redo" />
      </button>
    </div>
  )
}

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(actionCreators, dispatch),
})

const UndoRedoContainer = connect(null, mapDispatchToProps)(UndoRedo)
export default UndoRedoContainer
