import React from 'react'
import PreviewBox from './PreviewBox'
import PixelCanvasContainer from './PixelCanvas'
import CellSizeContainer from './CellSize'
import ColorPickerContainer from './ColorPicker'
import ModalContainer from './Modal'
import DimensionsContainer from './Dimensions'
import KeyBindings from './KeyBindings'
import CssDisplayContainer from './CssDisplay'
import DurationContainer from './Duration'
import EraserContainer from './Eraser'
import BucketContainer from './Bucket'
import MoveContainer from './Move'
import EyedropperContainer from './Eyedropper'
import FramesHandlerContainer from './FramesHandler'
import PaletteGridContainer from './PaletteGrid'
import ResetContainer from './Reset'
import SaveDrawingContainer from './SaveDrawing'
import NewProjectContainer from './NewProject'
import SimpleNotificationContainer from './SimpleNotification'
import SimpleSpinnerContainer from './SimpleSpinner'
import CellsInfo from './CellsInfo'
import UndoRedoContainer from './UndoRedo'
import initialSetup from '../utils/startup'
import drawHandlersProvider from '../utils/drawHandlersProvider'

export default class App extends React.Component {
  constructor() {
    super()
    this.state = {
      modalType: null,
      modalOpen: false,
      helpOn: false,
    }
    Object.assign(this, drawHandlersProvider(this))
  }

  componentDidMount() {
    const { dispatch } = this.props
    initialSetup(dispatch, localStorage)
  }

  changeModalType(type) {
    this.setState({
      modalType: type,
      modalOpen: true,
    })
  }

  closeModal() {
    this.setState({
      modalOpen: false,
    })
  }

  toggleHelp() {
    const { helpOn } = this.state
    this.setState({ helpOn: !helpOn })
  }

  render() {
    const { helpOn, modalType, modalOpen } = this.state
    return (
      <div
        className="app__main"
        onMouseUp={this.onMouseUp}
        onTouchEnd={this.onMouseUp}
        onTouchCancel={this.onMouseUp}
      >
        <PreviewBox />
        <SimpleSpinnerContainer />
        <SimpleNotificationContainer
          fadeInTime={1000}
          fadeOutTime={1500}
          duration={1500}
        />
        <div
          className="app__frames-container"
          data-tooltip={
            helpOn
              ? `Create an awesome animation sequence.
              You can modify the duration of each frame, changing its own value.
              The number indicates where the frame ends in a range from 0 to 100.
              `
              : null
          }
        >
          <FramesHandlerContainer />
        </div>
        <div className="app__central-container">
          <PixelCanvasContainer
            drawHandlersFactory={this.drawHandlersFactory}
          />
          <div className="ToolsCanvasGroup">
            <div className="tools__container">
              <div className="tools__row">
                <div className="app__tools-wrapper">
                  <div
                    data-tooltip={
                      helpOn
                        ? 'It fills an area of the current frame based on color similarity (B)'
                        : null
                    }
                  >
                    <BucketContainer />
                  </div>
                  {/* <div
                      data-tooltip={
                        helpOn ? 'Sample a color from your drawing (O)' : null
                      }
                    >
                      <EyedropperContainer />
                    </div> */}
                  {/* <div
                      data-tooltip={
                        helpOn
                          ? 'Choose a new color that is not in your palette (P)'
                          : null
                      }
                    >
                      <ColorPickerContainer />
                    </div> */}
                  <div
                    data-tooltip={helpOn ? 'Remove colors (E)' : null}
                  >
                    <EraserContainer />
                  </div>
                  <div
                    data-tooltip={
                      helpOn
                        ? 'Move your drawing around the canvas (M)'
                        : null
                    }
                  >
                    <MoveContainer />
                  </div>
                  <UndoRedoContainer />
                </div>

                {/* <div className="app__mobile--group">


            </div> */}
              </div>
              <div className="tools__group-dimensions">
                <DimensionsContainer />
                <ResetContainer />
              </div>
            </div>

            <PaletteGridContainer />
          </div>
        </div>
        <ModalContainer
          type={modalType}
          isOpen={modalOpen}
          close={() => {
            this.closeModal()
          }}
          open={() => {
            this.changeModalType(modalType)
          }}
        />
      </div>
    )
  }
}
