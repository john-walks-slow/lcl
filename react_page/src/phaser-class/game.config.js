export default function configureScene() {
  let c = {};
  c.WINDOW_W = window.innerWidth || document.body.clientWidth;
  c.WINDOW_H = window.innerHeight || document.body.clientHeight;
  c.WINDOW_CENTER_X = c.WINDOW_W / 2;
  c.WINDOW_CENTER_Y = c.WINDOW_H / 2;
  c.ZOOM_LEVEL = (Math.max(Math.min(c.WINDOW_W / 11, c.WINDOW_H / 13 / 44 * 37), 30) / 1000);
  c.ZOOM_OUT_LEVEL = (0.3 * c.ZOOM_LEVEL);
  c.PLAYER_TARGET_W = 1000;
  c.PLAYER_TARGET_H = 1000 / 37 * 44;
  c.OBJECT_W = { XL: c.PLAYER_TARGET_H * 2.5, L: c.PLAYER_TARGET_H * 2, M: c.PLAYER_TARGET_H * 1.4, S: c.PLAYER_TARGET_H * 1, XS: c.PLAYER_TARGET_H * 0.7 };
  c.TIME_DELAY = 60 * 60 * 1000;
  c.RANDOM_ZONE_W = c.OBJECT_W.L;
  c.DAY_OFFSET = c.OBJECT_W.M;
  c.DENSITY_OFFSET = c.OBJECT_W.L;
  c.ACTIVITY_OFFSET = 1;
  c.MOVE_SPEED = (c.PLAYER_TARGET_W * 1.8);
  c.OBLIQUE_MOVE_SPEED = (c.MOVE_SPEED * 0.75);
  c.GRID_SIZE = Math.max(c.WINDOW_H, c.WINDOW_W) / c.ZOOM_OUT_LEVEL;
  c.timestamp = Date.parse(new Date());
  c.ITEM_LIST = [{ name: "boxes", dialog: "哇！你捡到了一个箱子" }, { name: "fats", dialog: "哇！你捡到了一袋肥料" }, { name: "labels", dialog: "哇！你捡到了一张便签" }, { name: "telescopes", dialog: "哇！你捡到了一块镜片" }, { name: "batteries", dialog: "哇！你捡到了一块电池" },];
  return c;
}