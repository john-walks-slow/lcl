import configurations from '../configurations'

export default class GameCamera extends Phaser.Cameras.Scene2D.Camera {
  constructor(scene) {
    super(0, 0, configurations.WINDOW_W, configurations.WINDOW_H)
    this.cameraManager = scene.cameras
    this.scene = scene
    this.state = 'zoomIn'
    this.setBackgroundColor(0xffffff)
    // this.setFollowOffset(0, 100);
    this.setAlpha(0)
    // this.setRoundPixels(false);
    this.initAnim = this.scene.tweens.create({
      targets: this,
      props: { zoom: configurations.ZOOM_LEVEL, alpha: 1 },
      ease: 'Cubic', // 'Cubic', 'Elastic', 'Bounce', 'Back'
      duration: 1000,
      completeDelay: 0,
    })
    this.setDisplay()
    // this.fadeIn()
    this.setZoom(configurations.ZOOM_OUT_LEVEL)
  }
  setDisplay() {
    // this.setZoom(configurations.ZOOM_LEVEL);
    this.setSize(configurations.WINDOW_W, configurations.WINDOW_H)
    // this.setMask(
    //   new Phaser.Display.Masks.GeometryMask(
    //     this.scene,
    //     new Phaser.GameObjects.Graphics(this.scene, {
    //       x: configurations.WINDOW_CENTER_X,
    //       y: configurations.WINDOW_CENTER_Y,
    //     })
    //       .fillCircle(0, 0, 400)
    //       .setAlpha(1)
    //   )
    // )
  }
  zoomIn() {
    if (this.zoomInAnim && this.zoomInAnim.isPlaying()) {
      return
    }
    if (this.zoomOutAnim && this.zoomOutAnim.isPlaying()) {
      this.zoomOutAnim.stop()
    }
    this.zoomInAnim = this.scene.tweens.create({
      targets: this,
      props: { zoom: configurations.ZOOM_LEVEL, alpha: 1 },
      ease: 'Cubic', // 'Cubic', 'Elastic', 'Bounce', 'Back'
      duration: 800,
      completeDelay: 0,
    })
    this.zoomInAnim.play()
    this.state = 'zoomIn'

    this.scene.setZoomed(false)
  }
  zoomOut() {
    if (this.zoomOutAnim && this.zoomOutAnim.isPlaying()) {
      return
    }
    if (this.zoomInAnim && this.zoomInAnim.isPlaying()) {
      this.zoomInAnim.stop()
    }
    this.zoomOutAnim = this.scene.tweens.create({
      targets: this,
      props: { zoom: configurations.ZOOM_OUT_LEVEL, alpha: 0.6 },
      ease: 'Cubic', // 'Cubic', 'Elastic', 'Bounce', 'Back'
      duration: 1000,
    })

    this.zoomOutAnim.play()
    this.state = 'zoomOut'
    this.scene.setZoomed(true)
  }
  toggleZoom() {
    // this.zoomInAnim.stop(0);
    // this.zoomOutAnim.stop(0);
    // this.initAnim.stop(0);
    // let result = "unchanged";
    this.zoom == configurations.ZOOM_LEVEL && this.zoomOut()
    this.zoom < configurations.ZOOM_LEVEL && this.zoomIn()
    // return result;
  }
}
