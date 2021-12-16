import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import styled from 'styled-components'
import Picker from './Picker'
import * as actionCreators from '../store/actions/actionCreators'

const PickerWrapper = styled.div``

const Dimensions = props => {
  const changeDimensions = (gridProperty, behaviour) => {
    props.actions.changeDimensions(gridProperty, behaviour)
  }
  const changeBothDimensions = behaviour => {
    props.actions.changeBothDimensions(behaviour)
  }

  const { columns, rows } = props

  return (
    <div className="dimensions">
      {/* <PickerWrapper>
        <Picker type="columns" value={columns} action={changeDimensions} />
      </PickerWrapper>
      <PickerWrapper>
        <Picker type="rows" value={rows} action={changeDimensions} />
      </PickerWrapper> */}
      <PickerWrapper>
        <Picker
          type="columns"
          value={rows}
          action={(type, amount) => {
            changeBothDimensions(amount)
          }}
        />
      </PickerWrapper>
    </div>
  )
}

const mapStateToProps = state => ({
  columns: state.present.getIn(['frames', 'columns']),
  rows: state.present.getIn(['frames', 'rows']),
})

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(actionCreators, dispatch),
})

const DimensionsContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(Dimensions)
export default DimensionsContainer
