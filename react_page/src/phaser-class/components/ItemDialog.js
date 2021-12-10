import Dialog from "./Dialog";
export default class ItemDialog extends Dialog {
  constructor(scene) {
    super(scene);
    this.dialogHeader.alpha = 0;
  }
  setDisplay() {
    super.setDisplay();
    const WIDTH = Math.min(this.WINDOW_H / 1.5, this.WINDOW_W * 0.85);
    const HEIGHT = WIDTH * 0.4;
    const PADDING = WIDTH / 8;
    const PADDING_TOP = WIDTH / 9;
    this.dialogWindow.setX(this.WINDOW_CENTER_X);
    this.dialogWindow.setY(this.WINDOW_CENTER_Y);
    this.dialogWindow.setDisplaySize(WIDTH, HEIGHT);
    this.dialogText.setX(this.WINDOW_CENTER_X - WIDTH / 2 + PADDING);
    this.dialogText.setY(this.WINDOW_CENTER_Y - HEIGHT / 2 + PADDING_TOP);
    this.dialogText.wordWrap = { width: Math.max(WIDTH - PADDING * 2.5, this.FONT_SIZE), useAdvancedWrap: true };
  }
}