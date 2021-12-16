import React from 'react'
import { connect } from 'react-redux'
import {
  resetGrid,
  updateUsedColors,
} from '../store/actions/actionCreators'

const Reset = ({ resetGridDispatch }) => (
  <button type="button" className="reset" onClick={resetGridDispatch}>
    清空画布
  </button>
)

const mapDispatchToProps = dispatch => ({
  resetGridDispatch: () => {
    dispatch(resetGrid())
    dispatch(updateUsedColors())
  },
})

const ResetContainer = connect(null, mapDispatchToProps)(Reset)
export default ResetContainer
