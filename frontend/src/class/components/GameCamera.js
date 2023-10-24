import Phaser from 'phaser'

export default class GameCamera extends Phaser.Cameras.Scene2D.Camera {
  /**
   * Creates an instance of GameCamera.
   *
   * @constructor
   * @param {Phaser.Scene} scene
   */
  constructor(scene) {
    super(0, 0, scene.configurations.WINDOW_W, scene.configurations.WINDOW_H)
    this.scene = scene
    this.cameraManager = scene.cameras
    this.cameraManager.addExisting(this)
    this.state = 'zoomIn'
    this.setBackgroundColor(0xffffff)
    // this.setFollowOffset(0, 100);
    this.setAlpha(0)
    // this.setRoundPixels(false);

    this.setDisplay()
    // this.fadeIn()
    this.setZoom(this.scene.configurations.ZOOM_OUT_LEVEL)
  }
  enterDialog() {
    this?.exitAnim?.stop()
    return (this.enterAnim = this.scene.tweens.add({
      targets: this,
      props: { alpha: 0.4 },
      ease: 'Cubic', // 'Cubic', 'Elastic', 'Bounce', 'Back'
      duration: 500,
      completeDelay: 0,
    }))
  }
  exitDialog() {
    this?.enterAnim?.stop()
    return (this.exitAnim = this.scene.tweens.add({
      targets: this,
      props: { alpha: 1 },
      ease: 'Cubic', // 'Cubic', 'Elastic', 'Bounce', 'Back'
      duration: 500,
      completeDelay: 0,
    }))
  }
  setDisplay() {
    // this.setZoom(this.scene.configurations.ZOOM_LEVEL);
    this.setSize(this.scene.configurations.WINDOW_W, this.scene.configurations.WINDOW_H)
    let hour = new Date().getHours()
    let maskAlpha = hour > 7 && hour < 18 ? 0.9 : 0.7
    let maskShape = new Phaser.GameObjects.Graphics(this.scene, {
      x: this.scene.configurations.WINDOW_CENTER_X,
      y: this.scene.configurations.WINDOW_CENTER_Y,
    })
      .fillCircle(0, 0, this.scene.configurations.MASK_RADIUS)
      .setAlpha(maskAlpha)
    this.setMask(new Phaser.Display.Masks.GeometryMask(this.scene, maskShape))
    // this?.maskTween?.stop()
    // this.maskTween = this.scene.tweens.add({
    //   targets: maskShape,
    //   props: { alpha: maskAlpha * 0.9, scale: 1.1 },
    //   // ease: '', // 'Cubic', 'Elastic', 'Bounce', 'Back'
    //   duration: 10000,
    //   yoyo: true,
    //   repeat: -1,
    //   repeatDelay: 2000,
    // })
  }
  initAnim() {
    this.fadeIn()
    return (this.initTween = this.scene.tweens.add({
      targets: this,
      props: { zoom: this.scene.configurations.ZOOM_LEVEL, alpha: 1 },
      ease: 'Cubic', // 'Cubic', 'Elastic', 'Bounce', 'Back'
      duration: 2000,
      completeDelay: 0,
    }))
  }
  zoomIn() {
    console.log('zoom in ')
    if (this?.zoomInAnim?.isPlaying()) return
    if (this?.zoomOutAnim?.isPlaying()) this.zoomOutAnim.stop()
    this.zoomInAnim = this.scene.tweens.add({
      targets: this,
      props: { zoom: this.scene.configurations.ZOOM_LEVEL, alpha: 1 },
      ease: 'Cubic', // 'Cubic', 'Elastic', 'Bounce', 'Back'
      duration: 800,
      completeDelay: 0,
    })
    this.state = 'zoomIn'
    this.scene.setZoomed(false)
  }
  zoomOut() {
    if (this?.zoomOutAnim?.isPlaying()) return
    if (this?.zoomInAnim?.isPlaying()) this.zoomInAnim.stop()
    this.zoomOutAnim = this.scene.tweens.add({
      targets: this,
      props: { zoom: this.scene.configurations.ZOOM_OUT_LEVEL, alpha: 1 },
      ease: 'Cubic', // 'Cubic', 'Elastic', 'Bounce', 'Back'
      duration: 1000,
    })

    this.state = 'zoomOut'
    this.scene.setZoomed(true)
  }
  toggleZoom() {
    // this.zoomInAnim.stop(0);
    // this.zoomOutAnim.stop(0);
    // this.initAnim.stop(0);
    // let result = "unchanged";
    this.zoom == this.scene.configurations.ZOOM_LEVEL && this.zoomOut()
    this.zoom < this.scene.configurations.ZOOM_LEVEL && this.zoomIn()
    // return result;
  }
}
