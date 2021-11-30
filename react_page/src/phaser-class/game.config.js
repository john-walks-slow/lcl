export default function generateSceneConfigurations() {
  let configuration = {};
  configuration.WINDOW_W = window.innerWidth || document.body.clientWidth;
  configuration.WINDOW_H = window.innerHeight || document.body.clientHeight;
  configuration.WINDOW_CENTER_X = configuration.WINDOW_W / 2;
  configuration.WINDOW_CENTER_Y = configuration.WINDOW_H / 2;
  configuration.PLAYER_TARGET_W = Math.min(configuration.WINDOW_W / 11, configuration.WINDOW_H / 13 / 44 * 37);
  configuration.PLAYER_TARGET_H = Math.min(configuration.WINDOW_W / 11, configuration.WINDOW_H / 13 / 44 * 37) / 37 * 44;
  configuration.OBJECT_W = { XL: configuration.PLAYER_TARGET_H * 2.5, L: configuration.PLAYER_TARGET_H * 2, M: configuration.PLAYER_TARGET_H * 1.4, S: configuration.PLAYER_TARGET_H * 1, XS: configuration.PLAYER_TARGET_H * 0.7 };
  configuration.TIME_DELAY = 60 * 60 * 1000;
  configuration.RANDOM_ZONE_W = configuration.OBJECT_W.L;
  configuration.DAY_OFFSET = configuration.OBJECT_W.M;
  configuration.DENSITY_OFFSET = configuration.OBJECT_W.L;
  configuration.ACTIVITY_OFFSET = 1;
  configuration.MOVE_SPEED = configuration.PLAYER_TARGET_W * 1.6;
  configuration.ZOOM_OUT_LEVEL = 0.3;
  configuration.GRID_SIZE = Math.max(configuration.WINDOW_H, configuration.WINDOW_W) / configuration.ZOOM_OUT_LEVEL;
  configuration.timestamp = Date.parse(new Date());
  configuration.ITEM_LIST = [{ name: "boxes", dialog: "哇！你捡到了一个箱子" }, { name: "fats", dialog: "哇！你捡到了一袋肥料" }, { name: "labels", dialog: "哇！你捡到了一张便签" }, { name: "telescopes", dialog: "哇！你捡到了一块镜片" }, { name: "batteries", dialog: "哇！你捡到了一块电池" },];
  return configuration;
}