import React from 'react'
import { connect } from 'react-redux'
import {
  cellAction,
  updateGridBoundaries,
  moveDrawing,
  changeHoveredCell,
  endDrag,
} from '../store/actions/actionCreators'
import GridWrapper from './GridWrapper'
import throttle from '../utils/throttle'
import { ERASER, EYEDROPPER, MOVE } from '../store/reducers/drawingToolStates'

const gridContainerClass = 'grid-container'

class PixelCanvas extends React.Component {
  constructor(props) {
    super(props)
    this.drawHandlers = props.drawHandlersFactory(this)
    this.hoveredCell = props.hoveredCell
  }
  // shouldComponentUpdate(props) {
  //   return false
  // }
  componentDidMount() {
    const { updateGridBoundariesNow } = this.props
    updateGridBoundariesNow()
    window.addEventListener('resize', updateGridBoundariesNow)
    window.addEventListener('scroll', updateGridBoundariesNow)
  }

  componentWillUnmount() {
    const { updateGridBoundariesNow } = this.props
    window.removeEventListener('resize', updateGridBoundariesNow)
    window.removeEventListener('scroll', updateGridBoundariesNow)
  }

  render() {
    const { props } = this
    const cells = props.grid.map((color, i) => ({
      id: i,
      width: 100 / props.columns,
      color,
    }))
    let gridExtraClass = 'cell'
    if (props.eraserOn) {
      gridExtraClass = 'context-menu'
    } else if (props.eyedropperOn) {
      gridExtraClass = 'copy'
    } else if (props.moveOn) {
      gridExtraClass = 'all-scroll'
    }

    return (
      <GridWrapper
        cells={cells}
        classes={`${gridContainerClass} ${gridExtraClass}`}
        drawHandlers={this.drawHandlers}
        activeTool={props.drawingTool}
        nbrColumns={props.columns}
        hoveredCell={this.hoveredCell}
      />
    )
  }
}

const mapStateToProps = (state) => {
  const frames = state.present.get('frames')
  const activeFrameIndex = frames.get('activeIndex')
  const drawingTool = state.present.get('drawingTool')
  const palette = state.present.get('palette')
  const position = palette.get('position')
  const paletteCellPosition = position === -1 ? 0 : position
  return {
    grid: frames.getIn(['list', activeFrameIndex, 'grid']),
    columns: frames.get('columns'),
    rows: frames.get('rows'),
    hoveredIndex: frames.get('hoveredIndex'),
    drawingTool,
    paletteColor: palette.getIn(['grid', paletteCellPosition, 'color']),
    eyedropperOn: drawingTool === EYEDROPPER,
    eraserOn: drawingTool === ERASER,
    moveOn: drawingTool === MOVE,
    gridBoundaries: state.present.get('gridBoundaries'),
  }
}

const mapDispatchToProps = (dispatch) => ({
  cellAction: (cellProps) => dispatch(cellAction(cellProps)),
  updateGridBoundariesNow: () => {
    const gridElement = document.getElementsByClassName(gridContainerClass)[0]
    dispatch(updateGridBoundaries(gridElement))
  },
  updateGridBoundariesThrottle: throttle(() => {
    const gridElement = document.getElementsByClassName(gridContainerClass)[0]
    dispatch(updateGridBoundaries(gridElement))
  }, 500),
  applyMove: (moveDiff) => dispatch(moveDrawing(moveDiff)),
  endDrag: () => dispatch(endDrag()),
  hoveredCell: (cellPosition) => dispatch(changeHoveredCell(cellPosition)),
})

const PixelCanvasContainer = connect(mapStateToProps, mapDispatchToProps)(PixelCanvas)
export default PixelCanvasContainer
