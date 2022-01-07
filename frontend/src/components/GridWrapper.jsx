import React from 'react'
import PixelGrid from './PixelGrid'

export default class GridWrapper extends React.Component {
  shouldComponentUpdate(newProps) {
    const { cells } = this.props
    // return false
    return newProps.cells !== cells
  }
  onMoveMouseOver(ev) {
    const { activeTool, drawHandlers } = this.props
    if (activeTool === 'MOVE') {
      drawHandlers.onMoveMouseOver(ev)
    }
  }

  onMoveMouseDown(ev) {
    const { activeTool, drawHandlers } = this.props
    if (activeTool === 'MOVE') {
      drawHandlers.onMoveMouseDown(ev)
    }
  }

  onMoveTouchStart(ev) {
    const { activeTool, drawHandlers } = this.props
    if (activeTool === 'MOVE') {
      drawHandlers.onMoveTouchStart(ev)
    }
  }

  onMoveTouchMove(ev) {
    const { activeTool, drawHandlers } = this.props
    if (activeTool === 'MOVE') {
      drawHandlers.onMoveTouchMove(ev)
    }
  }

  render() {
    const { props } = this
    return (
      <div
        // onMouseOver={ev => this.onMouseOver(ev)}
        // onFocus={ev => this.onMouseOver(ev)}
        // onMouseDown={ev => this.onMouseDown(ev)}
        // // onMouseUp={ev => onMouseUp(id, ev)}
        // onTouchStart={ev => this.onTouchStart(ev)}
        // onTouchMove={ev => this.onTouchMove(ev)}
        onMouseDown={ev => props.drawHandlers.onMouseDown(ev)}
        onMouseUp={ev => props.drawHandlers.onMouseUp(ev)}
        onMouseMove={ev => props.drawHandlers.onMouseMove(ev)}
        onTouchStart={ev => props.drawHandlers.onMouseDown(ev)}
        onTouchEnd={ev => props.drawHandlers.onMouseUp(ev)}
        onTouchMove={ev => props.drawHandlers.onMouseMove(ev)}
      >
        <PixelGrid
          cells={props.cells}
          drawHandlers={props.drawHandlers}
          classes={props.classes}
          nbrColumns={props.nbrColumns}
          hoveredCell={props.hoveredCell}
        />
      </div>
    )
  }
}
