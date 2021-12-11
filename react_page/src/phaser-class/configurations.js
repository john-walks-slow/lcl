class Configurations {
  constructor() {
    // this.ZOOM_LEVEL = 1;
    this.PLAYER_TARGET_W = 40;
    this.PLAYER_TARGET_H = 46;
    // this.ZOOM_LEVEL = Math.min(Math.min(this.WINDOW_W / 15, this.WINDOW_H / 15) / this.PLAYER_TARGET_H, 1);
    this.CANVAS_SCALE = 0.6;
    this.ZOOM_LEVEL = 1;
    // this.ZOOM_LEVEL = (this.WINDOW_W < 600 || this.WINDOW_W < 600) ? 0.6 : 1;
    this.ZOOM_OUT_LEVEL = (0.35 * this.ZOOM_LEVEL);
    // this.ZOOM_LEVEL = (Math.max(Math.min(this.WINDOW_W / 18, this.WINDOW_H / 15 / 46 * 40),) / this.PLAYER_TARGET_W);
    this.OBJECT_W = { XXL: this.PLAYER_TARGET_H * 4.5, XL: this.PLAYER_TARGET_H * 3, L: this.PLAYER_TARGET_H * 2, M: this.PLAYER_TARGET_H * 1.5, S: this.PLAYER_TARGET_H, XS: this.PLAYER_TARGET_H * 0.7 };
    this.TIME_DELAY = 60 * 60 * 1000;
    this.RANDOM_ZONE_W = this.OBJECT_W.L;
    this.DAY_OFFSET = this.OBJECT_W.L;
    this.DENSITY_OFFSET = this.OBJECT_W.L;
    this.ACTIVITY_OFFSET = 1;
    this.MOVE_SPEED = (this.DENSITY_OFFSET * 0.4);
    this.OBLIQUE_MOVE_SPEED = (this.MOVE_SPEED * 0.74);
    this.ITEM_LIST = [{ name: "boxes", dialog: "哇！你捡到了一个箱子" }, { name: "fats", dialog: "哇！你捡到了一袋肥料" }, { name: "labels", dialog: "哇！你捡到了一张便签" }, { name: "telescopes", dialog: "哇！你捡到了一块镜片" }, { name: "batteries", dialog: "哇！你捡到了一块电池" },];

    this.updateConfigurations();
    this.GRID_SIZE = Math.max(this.WINDOW_H, this.WINDOW_W) / this.ZOOM_OUT_LEVEL / 2;
    // this.GRID_SIZE = Math.max(this.WINDOW_H, this.WINDOW_W) / this.ZOOM_OUT_LEVEL;

    // this.GRID_SIZE = Math.max(this.WINDOW_H, this.WINDOW_W) / this.ZOOM_OUT_LEVEL;
  }
  updateConfigurations() {

    // Actually the size of the canvas,not the window
    this.RAW_WINDOW_W = (window.innerWidth || document.body.clientWidth);
    this.RAW_WINDOW_H = (window.innerHeight || document.body.clientHeight);
    this.SCALE = Math.min(Math.min(this.RAW_WINDOW_W / 15, this.RAW_WINDOW_H / 15) / this.PLAYER_TARGET_H, 1);
    this.WINDOW_W = this.RAW_WINDOW_W / this.SCALE;
    this.WINDOW_H = this.RAW_WINDOW_H / this.SCALE;
    this.WINDOW_CENTER_X = this.WINDOW_W / 2;
    this.WINDOW_CENTER_Y = this.WINDOW_H / 2;
    this.TIMESTAMP = Date.parse(new Date());
    this.DAY = Math.floor(this.TIMESTAMP / (24 * 60 * 60 * 1000));
    // this.time = timestamp % (24 * 60 * 60 * 1000) ;
    this.IS_MOBILE = (('ontouchstart' in window) ||
      (navigator.maxTouchPoints > 0) ||
      (navigator.msMaxTouchPoints > 0)) && this.WINDOW_W > this.WINDOW_H;
  }
}
export default new Configurations();
