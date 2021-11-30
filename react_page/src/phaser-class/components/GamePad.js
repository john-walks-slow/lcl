import configureScene from "../game.config";

export default class GamePad extends Phaser.GameObjects.Sprite {
  constructor(scene) {
    super(scene, 0, 0, "gamepad", 0);
    this.setDisplay();
    this.setData('input', false);
    this.setInteractive();
    this.on('pointermove', this.onInput);
    this.on('pointerdown', this.onInput);
    scene.input.on('pointerup', () => { this.padX = false; this.padY = false; });
  }
  setDisplay() {
    let c = configureScene();
    this.isMobile = c.isMobile;
    if (!c.isMobile) {
      this.alpha = 0;
      this.removeInteractive();
    } else {
      this.alpha = 1;
      this.setInteractive();
    }
    const WIDTH = c.WINDOW_W / 6;
    this.setDisplaySize(WIDTH, WIDTH);
    this.setX(WIDTH * 1);
    this.setY(c.WINDOW_H - WIDTH * 1);
    this.onInput = (pointer) => {
      this.padX = pointer.x - WIDTH;
      this.padY = -pointer.y + c.WINDOW_H - WIDTH * 1;
    };
  }
  hide() {
    if (!this.isMobile) {
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
    if (!this.isMobile) {
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