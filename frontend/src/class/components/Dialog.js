import Phaser from 'phaser'
export default class Dialog extends Phaser.GameObjects.Container {
  constructor(scene) {
    super(scene)
    this.scene = scene
    this.configurations = this.scene.configurations
    this.initializeComponents()
    this.setDisplay()
    this.setScrollFactor(0)
    this.setAlpha(0)
    this.dialogIndex = 0
    this.inDialog = false
    this.scene.add.existing(this)
  }
  dialogFadeIn() {
    if (this.fadeOutAnim) {
      this.fadeOutAnim.stop()
    }
    this.fadeInAnim = this.scene.tweens.create({
      targets: this,
      props: { alpha: 1 },
      ease: 'Cubic', // 'Cubic', 'Elastic', 'Bounce', 'Back'
      duration: 500,
      completeDelay: 0,
    })
    return this.fadeInAnim.play()
  }
  dialogFadeOut() {
    if (this.fadeInAnim) {
      this.fadeInAnim.stop()
    }
    this.fadeOutAnim = this.scene.tweens.create({
      targets: this,
      props: { alpha: 0 },
      ease: 'Cubic', // 'Cubic', 'Elastic', 'Bounce', 'Back'
      duration: 500,
      completeDelay: 0,
    })
    return this.fadeOutAnim.play()
  }
  initializeComponents() {
    // this.dialogWindow = this.scene.add.sprite(0, 0, 'dialog')
    this.dialogWindow = this.scene.add.rectangle(0, 0, 10, 10, 0x000000, 0)
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
    Object.assign(this, this.configurations)
    this.DIALOG_HEIGHT = this.WINDOW_H / 2.7
    this.TEXT_PADDING_W = 0
    this.TEXT_PADDING_H = 0
    this.PADDING_BETWEEN = 10 * this.RESOLUTION
    this.DIALOG_PADDING_W = 50 + this.WINDOW_W / 20
    this.DIALOG_PADDING_H = 0
    this.FONT_SIZE = Math.max(this.WINDOW_H / 35, this.WINDOW_W / 45)
    this.FONT_SIZE_HEADER = this.FONT_SIZE * 1.2
    this.FONT_FAMILY = 'pixelCN'
    this.FONT_FAMILY_HEADER = 'pixelCN'
    this.DIALOG_WIDTH = Math.min(Math.min(this.MASK_RADIUS * 2, this.WINDOW_W), this.WINDOW_H * 1.3)
    this.DIALOG_X = this.WINDOW_CENTER_X
    this.DIALOG_Y = this.WINDOW_CENTER_Y
    this.DIALOG_HEADER_X =
      this.DIALOG_X - this.DIALOG_WIDTH / 2 + this.DIALOG_PADDING_W + this.TEXT_PADDING_W
    this.DIALOG_HEADER_Y = this.DIALOG_Y - this.DIALOG_HEIGHT / 2 + this.TEXT_PADDING_H
    this.DIALOG_TEXT_X = this.DIALOG_HEADER_X
    this.DIALOG_TEXT_Y = this.DIALOG_HEADER_Y + this.FONT_SIZE_HEADER + this.PADDING_BETWEEN
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
    // this.dialogHeader.alpha = 0.5
    this.dialogText.setX(this.DIALOG_TEXT_X)
    this.dialogText.setY(this.DIALOG_TEXT_Y)
    this.dialogText.setStyle({
      color: 0xffffff,
      fontSize: `${this.FONT_SIZE}px`,
      fontFamily: this.FONT_FAMILY,
    })
    // this.dialogText.alpha = 0.5
    this.dialogText.setWordWrapWidth(
      Math.max(this.DIALOG_WIDTH - 2 * this.DIALOG_PADDING_W, this.FONT_SIZE * 2),
      true
    )
  }
  proceedDialog() {
    if (this.inDialog) {
      this.dialogIndex++
      if (this.dialogIndex > this.sentences.length - 1) {
        this.dialogFadeOut().on('complete', () => {
          this.inDialog = false
          this.scene.camera.exitDialog()
          this.scene.gamepad.show()
          if (this.dialogCallback) {
            this.dialogCallback.apply()
          }
        })
        // dialogWindow.off('pointerdown');
        this.scene.input.off('pointerdown')
        this.scene.input.keyboard.off('keydown-SPACE')
      } else {
        this.dialogText.setText(this.sentences[this.dialogIndex])
      }
    }
  }
  showDialog(dialog, name, callback) {
    this.dialogCallback = callback || false
    this.inDialog = true
    this.scene.camera.enterDialog()
    this.scene.gamepad.hide()
    // this.scene.camera.shake(100, 0.01);
    // dialogWindow.on('pointerdown', () => { this.proceedDialog() });
    this.scene.input.on('pointerdown', e => {
      this.proceedDialog()
    })
    this.scene.input.keyboard.on('keydown-SPACE', () => {
      this.proceedDialog()
    })

    this.dialogFadeIn()
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
