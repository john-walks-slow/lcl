import generateSceneConfigurations from "../game.config";

generateSceneConfigurations;
export default class Dialog extends Phaser.GameObjects.Container {
  constructor(scene, configurations) {
    super(scene);
    Object.assign(this, configurations);
    this.DIALOG_HEIGHT = this.WINDOW_H / 3.5;
    this.TEXT_PADDING_W = this.WINDOW_W > this.WINDOW_H ? this.WINDOW_W / 15 : 25;
    this.TEXT_PADDING_H = Math.min(this.WINDOW_H / 25);
    this.PADDING_BETWEEN = 10;
    this.DIALOG_PADDING_W = this.WINDOW_W > this.WINDOW_H ? this.WINDOW_W / 7 : 15;
    this.DIALOG_PADDING_H = this.WINDOW_W > this.WINDOW_H ? this.WINDOW_H / 16 : 25;
    this.FONT_SIZE = Math.max(this.WINDOW_H / 30, this.WINDOW_W / 40);
    this.FONT_SIZE_HEADER = this.FONT_SIZE * 1.2;
    this.FONT_FAMILY = "pixel";
    this.FONT_FAMILY_HEADER = "pixel";
    this.scene = scene;
    this.depth = 999;
    this.dialogWindow = this.scene.add.sprite(this.WINDOW_CENTER_X, this.WINDOW_H - this.DIALOG_HEIGHT / 2 - this.DIALOG_PADDING_H, "dialog").setDisplaySize(this.WINDOW_W - this.DIALOG_PADDING_W * 2, this.DIALOG_HEIGHT);
    this.dialogHeader = this.scene.add.text(this.DIALOG_PADDING_W + this.TEXT_PADDING_W, this.WINDOW_H - this.DIALOG_HEIGHT - this.DIALOG_PADDING_H + this.TEXT_PADDING_H, "",
      {
        color: 0xFFFFFF,
        fontStyle: "bold",
        // fixedWidth: this.WINDOW_W - this.DIALOG_PADDING_W - TEXT_PADDING*2,
        // fixedHeight: this.DIALOG_HEIGHT - TEXT_PADDING*2,
        fontFamily: this.FONT_FAMILY_HEADER,
        fontSize: (this.FONT_SIZE_HEADER).toString() + "px",
      });
    this.dialogText = this.scene.add.text(this.DIALOG_PADDING_W + this.TEXT_PADDING_W, this.WINDOW_H - this.DIALOG_HEIGHT - this.DIALOG_PADDING_H + this.TEXT_PADDING_H + this.FONT_SIZE_HEADER + this.PADDING_BETWEEN, "",
      {
        color: 0xFFFFFF,
        // fixedWidth: this.WINDOW_W - this.DIALOG_PADDING_W - TEXT_PADDING*2,
        // fixedHeight: this.DIALOG_HEIGHT - TEXT_PADDING*2,
        fontFamily: this.FONT_FAMILY,
        fontSize: this.FONT_SIZE.toString() + "px",
        wordWrap: { width: this.WINDOW_W - this.DIALOG_PADDING_W * 2 - this.TEXT_PADDING_W * 2 + 10, useAdvancedWrap: true }
      });
    this.add([this.dialogWindow, this.dialogText, this.dialogHeader]);

    this.setScrollFactor(0);
    this.setAlpha(0);
    this.dialogIndex = 0;
    this.inDialog = false;
    this.dialogFadeIn = this.scene.tweens.create({
      targets: this,
      alpha: { from: 0, to: 1 },
      ease: 'Linear',       // 'Cubic', 'Elastic', 'Bounce', 'Back'
      duration: 500,
    });
    this.dialogFadeOut = this.scene.tweens.create({
      targets: this,
      alpha: { from: 1, to: 0 },
      ease: 'Linear',       // 'Cubic', 'Elastic', 'Bounce', 'Back'
      duration: 500,
    });
    this.scene.add.existing(this);
  }
  proceedDialog() {
    if (this.inDialog) {
      this.dialogIndex++;
      if (this.dialogIndex > this.sentences.length - 1) {
        this.dialogFadeOut.play().on("complete", () => { this.inDialog = false; });
        // dialogWindow.off('pointerdown');
        this.scene.input.off('pointerdown');
        this.scene.input.keyboard.off('keydown-SPACE');
        if (this.dialogCallback) {
          this.dialogCallback.apply();
        }
      } else {
        this.dialogText.setText(this.sentences[this.dialogIndex]);
      }
    }
  }
  showDialog(dialog, name, callback) {
    this.dialogCallback = callback || false;
    this.inDialog = true;
    this.scene.camera.shake(100, 0.01);
    // dialogWindow.on('pointerdown', () => { this.proceedDialog() });
    this.scene.input.on('pointerdown', (e) => { this.proceedDialog(); });
    this.scene.input.keyboard.on('keydown-SPACE', () => { this.proceedDialog(); });

    this.dialogFadeIn.play();
    this.sentences = dialog;
    this.dialogIndex = 0;
    if (name != "") { this.dialogHeader.setText(name); }
    else {
      this.dialogHeader.setText('');
    }
    this.dialogText.setText(this.sentences[this.dialogIndex]);
    console.log(this.sentences);
  }
}