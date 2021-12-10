import configurations from "../configurations";

export default class GameCamera extends Phaser.Cameras.Scene2D.Camera {
  constructor(scene) {
    super(0, 0, scene.game.config.width, scene.game.config.height);
    this.scene = scene;
    this.setBackgroundColor(0xFFFFFF);
    // this.setFollowOffset(0, 100);
    this.setAlpha(1);
    this.setDisplay();
    this.fadeIn();
    this.setZoom(0.01);
    this.initAnim.play();
    this.scene.input.keyboard.on('keydown-M', () => { this.toggleZoom(); });
  }
  setDisplay() {
    this.setZoom(configurations.ZOOM_LEVEL);
    this.initAnim = this.scene.tweens.create({
      targets: this,
      props: { 'zoom': configurations.ZOOM_LEVEL, 'alpha': 1 },
      ease: 'Cubic',       // 'Cubic', 'Elastic', 'Bounce', 'Back'
      duration: 3000,
      completeDelay: 0
    });
    this.zoomInAnim = this.scene.tweens.create({
      targets: this,
      props: { 'zoom': configurations.ZOOM_LEVEL, 'alpha': 1 },
      ease: 'Cubic',       // 'Cubic', 'Elastic', 'Bounce', 'Back'
      duration: 500,
      completeDelay: 0
    });
    this.zoomOutAnim = this.scene.tweens.create({
      targets: this,
      props: { 'zoom': configurations.ZOOM_OUT_LEVEL, 'alpha': 0.6 },
      ease: 'Cubic',       // 'Cubic', 'Elastic', 'Bounce', 'Back'
      duration: 1000,
    });
  }
  zoomIn() {
    this.zoomInAnim.play();
  };
  zoomOut() {
    this.zoomOutAnim.play();
  };
  toggleZoom() {
    // this.zoomInAnim.stop(0);
    // this.zoomOutAnim.stop(0);
    // this.initAnim.stop(0);
    this.zoom == configurations.ZOOM_LEVEL && this.zoomOut();
    this.zoom == configurations.ZOOM_OUT_LEVEL && this.zoomIn();
  };
}