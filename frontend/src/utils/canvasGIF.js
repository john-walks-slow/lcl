import GIFEncoder from 'gif-encoder'
// import blobStream from 'blob-stream';
import { saveAs } from 'file-saver'
import randomString from './random'

function fillCanvasWithFrame(canvas, frameInfo) {
  const { frame, cols, cellSize, frameHeight, frameIdx } = frameInfo
  const ctx = canvas
  frame.get('grid').forEach((fillStyle, pixelIdx) => {
    if (!fillStyle) {
      return
    }
    ctx.fillStyle = fillStyle

    const col = pixelIdx % cols
    const row = Math.floor(pixelIdx / cols)
    ctx.fillRect(
      col * cellSize,
      row * cellSize + frameHeight * frameIdx,
      cellSize,
      cellSize
    )
  })
  return ctx
}

function renderImageToCanvas(type, canvasInfo, currentFrameInfo, frames) {
  const { canvas, canvasHeight, canvasWidth } = canvasInfo
  const { frame, frameHeight, frameWidth, cellSize } = currentFrameInfo
  const cols = Math.floor(frameWidth / cellSize)
  let ctx = canvas.getContext('2d')
  ctx.canvas.width = canvasWidth
  ctx.canvas.height = canvasHeight
  switch (type) {
    case 'spritesheet':
      frames.forEach((currentFrame, frameIdx) => {
        ctx = fillCanvasWithFrame(ctx, {
          frame: currentFrame,
          cols,
          cellSize,
          frameHeight,
          frameIdx,
        })
      })
      break
    default:
      ctx = fillCanvasWithFrame(ctx, {
        frame,
        cols,
        cellSize,
        frameHeight,
        frameIdx: 0,
      })
      break
  }
  return ctx.getImageData(0, 0, canvasWidth, canvasHeight).data
}

const saveCanvasToDisk = (blob, fileExtension) => {
  saveAs(blob, `${randomString()}.${fileExtension}`)
}

export function renderBlob(settings, callback) {
  const {
    type,
    frames,
    duration,
    activeFrame,
    rows,
    columns,
    cellSize,
  } = settings

  const durationInMillisecond = duration * 1000
  const frameWidth = columns * cellSize
  const frameHeight = rows * cellSize
  const canvasWidth = frameWidth
  const canvasHeight =
    type === 'spritesheet' ? frameHeight * frames.size : frameHeight

  const canvas = document.createElement('canvas')

  switch (type) {
    case 'single':
    case 'spritesheet':
      renderImageToCanvas(
        type,
        {
          canvas,
          canvasHeight,
          canvasWidth,
        },
        {
          frame: activeFrame,
          frameHeight,
          frameWidth,
          cellSize,
        },
        frames
      )
      canvas.toBlob(function(blob) {
        callback(blob) //png
      })
      break
    default:
  }
}
export function renderFrames(settings) {
  const {
    type,
    frames,
    duration,
    activeFrame,
    rows,
    columns,
    cellSize,
  } = settings

  const durationInMillisecond = duration * 1000
  const frameWidth = columns * cellSize
  const frameHeight = rows * cellSize
  const canvasWidth = frameWidth
  const canvasHeight =
    type === 'spritesheet' ? frameHeight * frames.size : frameHeight

  const canvas = document.createElement('canvas')

  switch (type) {
    case 'single':
    case 'spritesheet':
      renderImageToCanvas(
        type,
        {
          canvas,
          canvasHeight,
          canvasWidth,
        },
        {
          frame: activeFrame,
          frameHeight,
          frameWidth,
          cellSize,
        },
        frames
      )
      canvas.toBlob(function(blob) {
        saveCanvasToDisk(blob, 'png')
      })
      break
    default: {
    }
  }
}
