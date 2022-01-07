import lineclip from 'lineclip'
let previousEv

const fromPositionToId = (posX, posY, grid, columns) => {
  const id = posX + columns * posY
  return id < grid.size && posX >= 0 && posX < columns && posY >= 0 ? id : null
}
var Vector = function(x, y) {
  this.x = x
  this.y = y
}

Vector.prototype.normalize = function(length) {
  var distance = this.distance() //calculating length
  if (distance == 0) {
    return this
  }
  this.x = (this.x / distance) * length //assigning new value to x (dividing x by length of the vector)
  this.y = (this.y / distance) * length //assigning new value to y
  return this
}
Vector.prototype.distance = function() {
  return Math.sqrt(this.x * this.x + this.y * this.y) //calculating length
}

const fromEventToIds = (ev, props) => {
  ev.persist()
  let { clientX, clientY, touches } = ev
  console.log(ev)
  clientX = ev.clientX = clientX || touches[0].clientX
  clientY = ev.clientY = clientY || touches[0].clientY
  if (!clientX || !clientY) {
    return
  }
  console.log(ev)
  // console.log(ev.target.id.value)
  const {
    columns,
    grid,
    gridBoundaries: { x, y, width, height },
  } = props
  // lineclip(
  //   [
  //     [clientX, clientY],
  //     [previousEv.clientX, previousEv.clientY],
  //   ],
  //   [x, y, width, height]
  // )
  previousEv = previousEv || ev
  let stepVector = new Vector(clientX - previousEv.clientX, clientY - previousEv.clientY)
  let isZero = stepVector.distance() == 0
  let resolution = width / columns
  let stepDistance = isZero
    ? 0
    : stepVector.distance() / Math.ceil(stepVector.distance() / resolution)
  stepVector = stepVector.normalize(stepDistance)
  let currentPoint = new Vector(previousEv.clientX, previousEv.clientY)
  let finalPoint = new Vector(clientX, clientY)
  let positions = []
  previousEv = ev
  do {
    console.log(currentPoint, finalPoint)
    currentPoint.x += stepVector.x
    currentPoint.y += stepVector.y
    let position = [
      Math.floor(((currentPoint.x - x) * columns) / width),
      Math.floor(((currentPoint.y - y) * columns) / height),
    ]
    if (positions.indexOf(position) == -1) {
      positions.push(position)
    }
  } while (
    !isZero &&
    (currentPoint.x - finalPoint.x) * stepVector.x <= 0 &&
    (currentPoint.y - finalPoint.y) * stepVector.y <= 0
  )
  let ids = positions.map(position => fromPositionToId(position[0], position[1], grid, columns))
  return ids
}

const getCellActionProps = (props, id) => ({
  color: props.grid.get(id),
  id,
  ...props,
})

const getCellCoordinates = (id, columnsCount) => {
  const y = Math.trunc(Math.abs(id / columnsCount))
  const x = id - columnsCount * y
  return { x: x + 1, y: y + 1 }
}

const drawHandlersProvider = rootComponent => ({
  onMouseUp() {
    rootComponent.setState({
      dragging: false,
    })
  },
  drawHandlersFactory(gridComponent) {
    return {
      onMouseDown(ev) {
        if (!rootComponent.state.dragging) {
          const { props } = gridComponent
          props.updateGridBoundariesNow()
          // let {
          //   gridBoundaries: { x, y, width, height },
          //   columns,
          // } = props
          // let { pageX, pageY } = ev.targetTouches[0]
          // let column = Math.floor((pageX - x) / (width / columns))
          // let row = Math.floor((pageY - y) / (height / columns))
          // let id = row * columns + column
          if (props.drawingTool !== 'MOVE') {
            const ids = fromEventToIds(ev, props)
            ids.forEach(id => {
              const actionProps = getCellActionProps(props, id)
              props.cellAction(actionProps)
            })
          } else {
            this.onMoveMouseDown(ev)
          }
          rootComponent.setState({
            dragging: true,
          })
        }
        ev.preventDefault()
      },
      onMouseUp(ev) {
        const { props } = gridComponent
        // const ids = fromEventToIds(ev, props)
        if (
          props.drawingTool == 'PENCIL' ||
          props.drawingTool == 'ERASER' ||
          props.drawingTool == 'BUCKET' ||
          props.drawingTool == 'MOVE'
        ) {
          props.endDrag()
          previousEv = false
        }
      },
      onMouseMove(ev) {
        if (rootComponent.state.dragging) {
          const { props } = gridComponent
          if (props.drawingTool !== 'MOVE') {
            const ids = fromEventToIds(ev, props)
            ids.forEach(id => {
              const actionProps = getCellActionProps(props, id)
              if (id !== null) {
                props.cellAction(actionProps)
              }
            })

            // if (id != previousId) {

            // }
          } else {
            this.onMoveMouseMove(ev)
          }
        }
        ev.preventDefault()
      },
      onMoveMouseMove(ev) {
        ev.preventDefault()
        const { props } = gridComponent
        if (props.drawingTool === 'MOVE') {
          const { draggingCoord } = rootComponent.state
          const { dragging } = rootComponent.state
          let clientX, clientY
          if (ev.touches) {
            ;({ clientX, clientY } = ev.touches[0])
          } else {
            ;({ clientX, clientY } = ev)
          }
          const xDiff = draggingCoord ? clientX - draggingCoord.clientX : 0
          const yDiff = draggingCoord ? clientY - draggingCoord.clientY : 0
          const cellWidth = ev.target.clientWidth
          if (dragging && (Math.abs(xDiff) > cellWidth || Math.abs(yDiff) > cellWidth)) {
            rootComponent.setState({
              draggingCoord: { clientX: clientX, clientY: clientY },
            })
            props.applyMove({ xDiff, yDiff, cellWidth })
          }
        }
      },

      onMoveMouseDown(ev) {
        ev.preventDefault()
        const { props } = gridComponent
        if (props.drawingTool === 'MOVE') {
          let clientX, clientY
          if (ev.touches) {
            ;({ clientX, clientY } = ev.touches[0])
          } else {
            ;({ clientX, clientY } = ev)
          }
          rootComponent.setState({
            dragging: true,
            draggingCoord: { clientX, clientY },
          })
        }
      },
    }
  },
})

export default drawHandlersProvider
