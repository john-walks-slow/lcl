import Dialog from "./Dialog";
export default class ItemDialog extends Dialog {
  constructor(scene) {
    super(scene);
    this.dialogHeader.alpha = 0;
  }
  setDisplay() {
    this.setDisplayParams();
    this.WIDTH = Math.min(this.WINDOW_H / 1.5, this.WINDOW_W * 0.85);
    this.HEIGHT = this.WIDTH * 0.4;
    this.PADDING = this.WIDTH / 8;
    this.PADDING_TOP = this.WIDTH / 9;
    this.dialogWindow.setX(this.WINDOW_CENTER_X);
    this.dialogWindow.setY(this.WINDOW_CENTER_Y);
    this.dialogWindow.setDisplaySize(this.WIDTH, this.HEIGHT);
    this.dialogText.setX(this.WINDOW_CENTER_X - this.WIDTH / 2 + this.PADDING);
    this.dialogText.setY(this.WINDOW_CENTER_Y - this.HEIGHT / 2 + this.PADDING_TOP);
    this.dialogText.wordWrap = { width: Math.max(this.WIDTH - this.PADDING * 2.5, this.FONT_SIZE), useAdvancedWrap: true };
  }
}