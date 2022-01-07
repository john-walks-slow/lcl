import React, { useRef } from 'react'

const GRID_INITIAL_COLOR = 'rgba(256,256,256, 1)'
const PixelCell = React.memo(
  props => {
    const {
      cell: { color, width },
      id,
      drawHandlers: { onMouseDown, onMouseOver, onMouseUp },
    } = props
    const styles = {
      width: `${width}%`,
      height: `${width}%`,
      boxSizing: 'border-box',
      paddingBottom: `${width}%`,
      backgroundColor: color || GRID_INITIAL_COLOR,
      pointerEvent: 'none',
    }
    // this.ref = React.useRef()
    return (
      <div
        // ref={ref}
        id={`cell-${id}`}
        // onMouseDown={ev => onMouseDown(id, ev)}
        // onMouseOver={ev => onMouseOver(id, ev)}
        // onMouseUp={ev => onMouseUp(id, ev)}
        // onFocus={ev => onMouseOver(id, ev)}
        // onTouchStart={ev => onMouseDown(id, ev)}
        // onTouchEnd={ev => onMouseUp(id, ev)}
        style={styles}
      />
    )
  },
  (prevProps, nextProps) => {
    const keys = ['color', 'width']
    const isSame = keys.every(key => prevProps.cell[key] === nextProps.cell[key])
    return isSame
  }
)

export default PixelCell
