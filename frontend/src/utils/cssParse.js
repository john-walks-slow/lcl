import {
  getImageData,
  getImageCssClassOutput,
  getAnimationKeyframes,
  getAnimationCssClassOutput,
} from './boxShadowPixels'

const PIXELART_CSS_CLASS_NAME = 'pixelart-to-css'
const SPREAD_RADIUS = 0.5
export function generatePixelDrawCss(frame, columns, cellSize, type) {
  return getImageData(frame.get('grid'), {
    format: type,
    pSize: cellSize,
    c: columns,
    spreadRadius: SPREAD_RADIUS,
  })
}

export function getCssImageClassOutput(frame, columns, cellSize) {
  return getImageCssClassOutput(frame.get('grid'), {
    format: 'string',
    pSize: cellSize,
    c: columns,
    cssClassName: PIXELART_CSS_CLASS_NAME,
    spreadRadius: SPREAD_RADIUS,
  })
}

export function exportAnimationData(frames, columns, cellSize, duration) {
  return getAnimationCssClassOutput(frames, {
    pSize: cellSize,
    c: columns,
    duration,
    cssClassName: PIXELART_CSS_CLASS_NAME,
    spreadRadius: SPREAD_RADIUS,
  })
}

export function generateAnimationCSSData(frames, columns, cellSize) {
  return getAnimationKeyframes(frames, {
    pSize: cellSize,
    c: columns,
    spreadRadius: SPREAD_RADIUS,
  })
}
