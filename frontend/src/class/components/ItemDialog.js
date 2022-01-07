import Dialog from './Dialog'
export default class ItemDialog extends Dialog {
  constructor(scene) {
    super(scene)
    this.dialogHeader.alpha = 0
    // this.alpha = 1;
  }
  setDisplay() {
    this.setDisplayParams()
    this.WIDTH = 12 * this.FONT_SIZE
    this.HEIGHT = this.FONT_SIZE * 4
    this.PADDING = 0
    this.PADDING_TOP = this.FONT_SIZE * 1.3
    this.X = this.WINDOW_CENTER_X
    this.Y = this.WINDOW_CENTER_Y - this.FONT_SIZE / 2
    this.dialogWindow.setX(this.X)
    this.dialogWindow.setY(this.Y)
    this.dialogWindow.setDisplaySize(this.WIDTH, this.HEIGHT)
    this.dialogText.setStyle({
      color: 0xffffff,
      fontSize: `${this.FONT_SIZE}px`,
      fontFamily: this.FONT_FAMILY,
    })
    this.dialogText.setX(this.X - this.WIDTH / 2)
    this.dialogText.setY(this.Y - this.HEIGHT / 2 + this.PADDING_TOP)
    this.dialogText.wordWrap = {
      width: Math.max(this.WIDTH - this.PADDING * 2.5, this.FONT_SIZE),
      useAdvancedWrap: true,
    }
  }
}
