import configurations from "../configurations";

export default class GamePad extends Phaser.GameObjects.Sprite {
  constructor(scene) {
    super(scene, 0, 0, "gamepad", 0);
    this.scene = scene;
    this.setDisplay();
    this.setData('input', false);
    this.setInteractive();

    scene.input.on('pointerup', () => { this.padX = false; this.padY = false; });
  }
  setDisplay() {
    this.IS_MOBILE = configurations.IS_MOBILE;
    if (!this.IS_MOBILE) {
      this.alpha = 0;
      this.removeInteractive();
    } else {
      this.alpha = 1;
      this.setInteractive();
    }
    const WIDTH = configurations.WINDOW_W / 6;
    const PADDING = configurations.WINDOW_W / 12;
    this.setDisplaySize(WIDTH, WIDTH);
    this.setX(PADDING + WIDTH / 2);
    this.setY(configurations.WINDOW_H - PADDING - WIDTH / 2);
    let centerX = PADDING + WIDTH / 2;
    let centerY = configurations.WINDOW_H - (PADDING + WIDTH / 2);
    let onInput = (pointer) => {
      this.padX = pointer.x - centerX;
      this.padY = centerY - pointer.y;
    };
    this.off('pointermove');
    this.off('pointerdown');
    this.on('pointermove', onInput);
    this.on('pointerdown', onInput);
  }
  hide() {
    if (!this.IS_MOBILE) {
      return;
    }
    this.scene.tweens.add({
      targets: this,
      alpha: { from: this.alpha, to: 0 },
      // orignX: { from: 0, to: 60 },
      duration: 300

    });
    this.removeInteractive();
  }
  show() {
    if (!this.IS_MOBILE) {
      return;
    }
    this.scene.tweens.add({
      targets: this,
      alpha: { from: this.alpha, to: 1 },
      // originY: { from: 60, to: 0 },
      duration: 300

    });
    this.setInteractive();
  }
}