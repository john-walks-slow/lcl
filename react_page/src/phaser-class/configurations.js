class Configurations {
  constructor() {
    this.updateConfigurations();
  }
  updateConfigurations() {
    Object.assign(this, this.getConfigurations());
  }
  getConfigurations() {
    let c = {};
    c.WINDOW_W = (window.innerWidth || document.body.clientWidth);
    c.WINDOW_H = (window.innerHeight || document.body.clientHeight);
    c.WINDOW_CENTER_X = c.WINDOW_W / 2;
    c.WINDOW_CENTER_Y = c.WINDOW_H / 2;
    // c.ZOOM_LEVEL = 1;
    c.PLAYER_TARGET_W = 40;
    c.PLAYER_TARGET_H = 46;
    c.ZOOM_LEVEL = Math.min(Math.min(c.WINDOW_W / 15, c.WINDOW_H / 15) / c.PLAYER_TARGET_H, 1);
    // c.ZOOM_LEVEL = (c.WINDOW_W < 600 || c.WINDOW_W < 600) ? 0.6 : 1;
    c.ZOOM_OUT_LEVEL = (0.2 * c.ZOOM_LEVEL);
    // c.ZOOM_LEVEL = (Math.max(Math.min(c.WINDOW_W / 18, c.WINDOW_H / 15 / 46 * 40),) / c.PLAYER_TARGET_W);
    c.OBJECT_W = { XXL: c.PLAYER_TARGET_H * 4.5, XL: c.PLAYER_TARGET_H * 3, L: c.PLAYER_TARGET_H * 2, M: c.PLAYER_TARGET_H * 1.5, S: c.PLAYER_TARGET_H, XS: c.PLAYER_TARGET_H * 0.7 };
    c.TIME_DELAY = 60 * 60 * 1000;
    c.RANDOM_ZONE_W = c.OBJECT_W.L;
    c.DAY_OFFSET = c.OBJECT_W.XL;
    c.DENSITY_OFFSET = c.OBJECT_W.L;
    c.ACTIVITY_OFFSET = 1;
    c.MOVE_SPEED = (c.DENSITY_OFFSET * 0.4);
    c.OBLIQUE_MOVE_SPEED = (c.MOVE_SPEED * 0.74);
    c.GRID_SIZE = Math.max(c.WINDOW_H, c.WINDOW_W) / c.ZOOM_OUT_LEVEL;
    // c.GRID_SIZE = Math.max(c.WINDOW_H, c.WINDOW_W) / c.ZOOM_OUT_LEVEL;
    c.TIMESTAMP = Date.parse(new Date());
    c.DAY = Math.floor(c.TIMESTAMP / (24 * 60 * 60 * 1000));
    // c.time = timestamp % (24 * 60 * 60 * 1000) ;
    c.ITEM_LIST = [{ name: "boxes", dialog: "哇！你捡到了一个箱子" }, { name: "fats", dialog: "哇！你捡到了一袋肥料" }, { name: "labels", dialog: "哇！你捡到了一张便签" }, { name: "telescopes", dialog: "哇！你捡到了一块镜片" }, { name: "batteries", dialog: "哇！你捡到了一块电池" },];
    c.IS_MOBILE = (('ontouchstart' in window) ||
      (navigator.maxTouchPoints > 0) ||
      (navigator.msMaxTouchPoints > 0)) && c.WINDOW_W > c.WINDOW_H;
    return c;
  }
}
export default new Configurations();
