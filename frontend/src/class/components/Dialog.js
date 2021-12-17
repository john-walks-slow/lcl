import configurations from '../configurations'

export default class Dialog extends Phaser.GameObjects.Container {
  constructor(scene) {
    super(scene)
    this.scene = scene
    this.initializeComponents()
    this.setDisplay()
    this.depth = 999
    this.setScrollFactor(0)
    this.setAlpha(0)
    this.dialogIndex = 0
    this.inDialog = false
    this.dialogFadeIn = this.scene.tweens.create({
      targets: this,
      alpha: { from: 0, to: 1 },
      ease: 'Linear', // 'Cubic', 'Elastic', 'Bounce', 'Back'
      duration: 500,
    })
    this.dialogFadeOut = this.scene.tweens.create({
      targets: this,
      alpha: { from: 1, to: 0 },
      ease: 'Linear', // 'Cubic', 'Elastic', 'Bounce', 'Back'
      duration: 500,
    })
    this.scene.add.existing(this)
  }
  initializeComponents() {
    this.dialogWindow = this.scene.add.sprite(0, 0, 'dialog')
    this.dialogHeader = this.scene.add.text(0, 0, '', {
      color: 0xffffff,
      fontStyle: 'bold',
      // fixedWidth: this.WINDOW_W - this.DIALOG_PADDING_W - TEXT_PADDING*2,
      // fixedHeight: this.DIALOG_HEIGHT - TEXT_PADDING*2,
      fontFamily: this.FONT_FAMILY_HEADER,
    })
    this.dialogText = this.scene.add.text(0, 0, '', {
      color: 0xffffff,
      // fixedWidth: this.WINDOW_W - this.DIALOG_PADDING_W - TEXT_PADDING * 2,
      // fixedHeight: this.DIALOG_HEIGHT - TEXT_PADDING * 2,
      fontFamily: this.FONT_FAMILY,
    })
    this.add([this.dialogWindow, this.dialogText, this.dialogHeader])
  }
  setDisplayParams() {
    Object.assign(this, configurations)
    this.DIALOG_HEIGHT = this.WINDOW_H / 3.5
    this.TEXT_PADDING_W = this.WINDOW_W > this.WINDOW_H ? this.WINDOW_W / 15 : 50 * this.RESOLUTION
    this.TEXT_PADDING_H = Math.min(this.WINDOW_H / 25)
    this.PADDING_BETWEEN = 10 * this.RESOLUTION
    this.DIALOG_PADDING_W = this.WINDOW_W > this.WINDOW_H ? this.WINDOW_W / 7 : 15 * this.RESOLUTION
    this.DIALOG_PADDING_H =
      this.WINDOW_W > this.WINDOW_H ? this.WINDOW_H / 16 : 25 * this.RESOLUTION
    this.FONT_SIZE = Math.max(this.WINDOW_H / 35, this.WINDOW_W / 45)
    this.FONT_SIZE_HEADER = this.FONT_SIZE * 1.2
    this.FONT_FAMILY = 'pixelChinese'
    this.FONT_FAMILY_HEADER = 'pixelChinese'
    this.DIALOG_WIDTH = this.WINDOW_W - this.DIALOG_PADDING_W * 2
    this.DIALOG_X = this.WINDOW_CENTER_X
    this.DIALOG_Y = this.WINDOW_H - this.DIALOG_PADDING_H - this.DIALOG_HEIGHT / 2
    this.DIALOG_HEADER_X = this.DIALOG_PADDING_W + this.TEXT_PADDING_W
    this.DIALOG_HEADER_Y =
      this.WINDOW_H - this.DIALOG_HEIGHT - this.DIALOG_PADDING_H + this.TEXT_PADDING_H
    this.DIALOG_TEXT_X = this.DIALOG_PADDING_W + this.TEXT_PADDING_W
    this.DIALOG_TEXT_Y =
      this.WINDOW_H -
      this.DIALOG_HEIGHT -
      this.DIALOG_PADDING_H +
      this.TEXT_PADDING_H +
      this.FONT_SIZE_HEADER +
      this.PADDING_BETWEEN
  }
  setDisplay() {
    this.setDisplayParams()
    this.dialogWindow.setDisplaySize(this.DIALOG_WIDTH, this.DIALOG_HEIGHT)
    this.dialogWindow.setX(this.DIALOG_X)
    this.dialogWindow.setY(this.DIALOG_Y)
    this.dialogHeader.setX(this.DIALOG_HEADER_X)
    this.dialogHeader.setY(this.DIALOG_HEADER_Y)
    this.dialogHeader.setStyle({
      color: 0xffffff,
      fontSize: `${this.FONT_SIZE_HEADER}px`,
      fontFamily: this.FONT_FAMILY_HEADER,
    })
    this.dialogText.setX(this.DIALOG_TEXT_X)
    this.dialogText.setY(this.DIALOG_TEXT_Y)
    this.dialogText.setStyle({
      color: 0xffffff,
      fontSize: `${this.FONT_SIZE}px`,
      fontFamily: this.FONT_FAMILY,
    })
    this.dialogText.setWordWrapWidth(
      Math.max(
        this.WINDOW_W - this.DIALOG_PADDING_W * 2 - this.TEXT_PADDING_W * 2 + 10,
        this.FONT_SIZE
      ),
      true
    )
  }
  proceedDialog() {
    if (this.inDialog) {
      this.dialogIndex++
      if (this.dialogIndex > this.sentences.length - 1) {
        this.dialogFadeOut.play().on('complete', () => {
          this.inDialog = false
          this.scene.gamepad.show()
        })
        // dialogWindow.off('pointerdown');
        this.scene.input.off('pointerdown')
        this.scene.input.keyboard.off('keydown-SPACE')
        if (this.dialogCallback) {
          this.dialogCallback.apply()
        }
      } else {
        this.dialogText.setText(this.sentences[this.dialogIndex])
      }
    }
  }
  showDialog(dialog, name, callback) {
    this.dialogCallback = callback || false
    this.inDialog = true
    this.scene.gamepad.hide()
    // this.scene.camera.shake(100, 0.01);
    // dialogWindow.on('pointerdown', () => { this.proceedDialog() });
    this.scene.input.on('pointerdown', e => {
      this.proceedDialog()
    })
    this.scene.input.keyboard.on('keydown-SPACE', () => {
      this.proceedDialog()
    })

    this.dialogFadeIn.play()
    this.sentences = dialog
    this.dialogIndex = 0
    if (name != '') {
      this.dialogHeader.setText(name)
    } else {
      this.dialogHeader.setText('???')
    }
    this.dialogText.setText(this.sentences[this.dialogIndex])
    console.log(this.sentences)
  }
}
