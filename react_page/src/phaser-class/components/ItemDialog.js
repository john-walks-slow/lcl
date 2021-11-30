import Dialog from "./Dialog";
export default class ItemDialog extends Dialog {
  constructor(scene, configurations) {
    super(scene);
    Object.assign(this, configurations);
    const width = Math.min(this.WINDOW_H / 1.5, this.WINDOW_W * 0.85);
    const height = width * 0.4;
    const padding = width / 8;
    const paddingTop = width / 9;
    this.dialogWindow.setX(this.WINDOW_CENTER_X);
    this.dialogWindow.setY(this.WINDOW_CENTER_Y);
    this.dialogWindow.setDisplaySize(width, height);
    this.dialogText.setX(this.WINDOW_CENTER_X - width / 2 + padding);
    this.dialogText.setY(this.WINDOW_CENTER_Y - height / 2 + paddingTop);
    this.dialogText.wordWrap = { width: width - padding * 2.5, useAdvancedWrap: true };
  }
}