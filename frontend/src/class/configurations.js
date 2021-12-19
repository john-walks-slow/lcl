import { seededRandomKept, customWRandom, customIntRandom } from '../utils/random'

class Configurations {
  constructor() {
    this.SETTINGS = {
      mute: false,
      quiet: false,
    }
    this.DEV_MODE = process.env.NODE_ENV == 'development'
    this.TIMESTAMP = Date.parse(new Date())
    this.DAY = {}
    this.DAY.stamp = Math.floor(this.TIMESTAMP / (24 * 60 * 60 * 1000))
    // this.DAY.stamp = this.DEV_MODE
    // ? Math.random()
    // : Math.floor(this.TIMESTAMP / (24 * 60 * 60 * 1000))
    this.DAY._id = this.DAY.stamp.toString()
    this.DAY.random = seededRandomKept(this.DAY._id)
    this.DAY.wRandom = customWRandom(this.DAY.random)
    this.DAY.intRandom = customIntRandom(this.DAY.random)
    this.DAY.flow = [this.DAY.intRandom(-4, 4), this.DAY.intRandom(-4, 4)]

    this.RESOLUTION = 1
    this.PLAYER_TARGET_W = 40 * this.RESOLUTION
    this.PLAYER_TARGET_H = 46 * this.RESOLUTION
    // this.ZOOM_LEVEL = Math.min(Math.min(this.WINDOW_W / 15, this.WINDOW_H / 15) / this.PLAYER_TARGET_H, 1);
    this.ZOOM_LEVEL = 1
    // this.ZOOM_LEVEL = (this.WINDOW_W < 600 || this.WINDOW_W < 600) ? 0.6 : 1;
    this.ZOOM_OUT_LEVEL = 0.35 * this.ZOOM_LEVEL
    // this.ZOOM_LEVEL = (Math.max(Math.min(this.WINDOW_W / 18, this.WINDOW_H / 15 / 46 * 40),) / this.PLAYER_TARGET_W);
    this.OBJECT_W = {
      XXL: this.PLAYER_TARGET_H * 5,
      XL: this.PLAYER_TARGET_H * 3.5,
      L: this.PLAYER_TARGET_H * 2.5,
      M: this.PLAYER_TARGET_H * 1.8,
      S: this.PLAYER_TARGET_H * 1.2,
      XS: this.PLAYER_TARGET_H * 0.8,
    }
    this.TIME_DELAY = 60 * 60 * 1000
    this.RANDOM_ZONE_W = this.PLAYER_TARGET_H * 5
    this.DAY_OFFSET = this.PLAYER_TARGET_H * 1
    this.DENSITY_OFFSET = this.PLAYER_TARGET_H * 1
    this.DENSITY_FACTOR = 0.72
    this.ACTIVITY_OFFSET = 1
    this.MOVE_SPEED = this.PLAYER_TARGET_H * 1.3
    this.OBLIQUE_MOVE_SPEED = Math.round(this.MOVE_SPEED * 0.74)
    this.ITEM_LIST = [
      { name: 'boxes', dialog: '哇！你捡到了一个箱子' },
      { name: 'fats', dialog: '哇！你捡到了一袋肥料' },
      { name: 'labels', dialog: '哇！你捡到了一张便签' },
      { name: 'telescopes', dialog: '哇！你捡到了一块镜片' },
      { name: 'batteries', dialog: '哇！你捡到了一块电池' },
    ]

    this.updateConfigurations()
    this.SOUND_GRID_SIZE = 30 * this.PLAYER_TARGET_H
    this.GRID_SIZE = 50 * this.PLAYER_TARGET_H
    // this.GRID_SIZE = Math.max(this.WINDOW_H, this.WINDOW_W) / 3
    // this.GRID_SIZE = Math.max(this.WINDOW_H, this.WINDOW_W) / this.ZOOM_OUT_LEVEL/2;

    // this.GRID_SIZE = Math.max(this.WINDOW_H, this.WINDOW_W) / this.ZOOM_OUT_LEVEL;
  }
  calculateDistance(d) {
    return (d * 15) ** this.DENSITY_FACTOR
  }
  updateConfigurations() {
    // Actually the size of the canvas,not the window
    this.RAW_WINDOW_W = window.innerWidth || document.body.clientWidth
    this.RAW_WINDOW_H = window.innerHeight || document.body.clientHeight
    this.SCALE = Math.min(
      Math.min(this.RAW_WINDOW_W / 12, this.RAW_WINDOW_H / 15) / this.PLAYER_TARGET_H,
      1
    )
    this.WINDOW_W = this.RAW_WINDOW_W / this.SCALE
    this.WINDOW_H = this.RAW_WINDOW_H / this.SCALE
    this.WINDOW_CENTER_X = this.WINDOW_W / 2
    this.WINDOW_CENTER_Y = this.WINDOW_H / 2

    // this.time = timestamp % (24 * 60 * 60 * 1000) ;
    this.IS_MOBILE =
      ('ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        navigator.msMaxTouchPoints > 0) &&
      this.WINDOW_W > this.WINDOW_H
  }
}
export default new Configurations()
