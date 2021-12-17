import React from 'react'

const PaletteColor = props => {
  const { positionInPalette, width, color, selected, selectPaletteColor } = props

  const handleClick = () => selectPaletteColor(positionInPalette)

  const cellColor = color
  const styles = {
    // padding: `${width}px`,
    width: `${width * 2}px`,
    height: `${width * 2}px`,
    boxSizing: `border-box`,
    backgroundColor: cellColor,
  }

  return (
    <button
      type="button"
      aria-label="Color Palette"
      className={`palette-color
        ${selected ? 'selected' : ''}`}
      style={styles}
      onClick={handleClick}
    />
  )
}

export default PaletteColor
