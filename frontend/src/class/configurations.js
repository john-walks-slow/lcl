import { seededRandomKept, customWRandom, customIntRandom } from '../utils/random'
import _ from 'lodash'
class Configurations {
  constructor() {
    this.SETTINGS = {
      mute: false,
      quiet: false,
    }
    this.DEV_MODE = process.env.NODE_ENV == 'development'
    this.TIMESTAMP = Date.parse(new Date())
    this.DAY = {}
    // this.DAY.stamp = Math.floor(this.TIMESTAMP / (24 * 60 * 60 * 1000))
    this.DAY.stamp = this.DEV_MODE
      ? Math.random()
      : Math.floor(this.TIMESTAMP / (24 * 60 * 60 * 1000))
    this.DAY._id = this.DAY.stamp.toString()
    this.DAY.random = seededRandomKept(this.DAY._id)
    this.DAY.wRandom = customWRandom(this.DAY.random)
    this.DAY.intRandom = customIntRandom(this.DAY.random)
    this.DAY_FLOW_SPEED = 1
    this.FLOW_SPEED = 5
    this.DAY.flow = [
      this.DAY.intRandom(-this.DAY_FLOW_SPEED, this.DAY_FLOW_SPEED),
      this.DAY.intRandom(-this.DAY_FLOW_SPEED, this.DAY_FLOW_SPEED),
    ]
    this.RESOLUTION = 1
    this.PLAYER_TARGET_W = 40 * this.RESOLUTION
    this.PLAYER_TARGET_H = 46 * this.RESOLUTION
    // this.ZOOM_LEVEL = Math.min(Math.min(this.WINDOW_W / 15, this.WINDOW_H / 15) / this.PLAYER_TARGET_H, 1);
    this.ZOOM_LEVEL = 1
    // this.ZOOM_LEVEL = (this.WINDOW_W < 600 || this.WINDOW_W < 600) ? 0.6 : 1;
    this.ZOOM_OUT_LEVEL = 0.5 * this.ZOOM_LEVEL
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
    this.DAY_OFFSET = this.PLAYER_TARGET_H * 0.85
    this.MAX_DAY_GAP = 5.5
    this.DENSITY_OFFSET = this.PLAYER_TARGET_H * 1
    this.DENSITY_FACTOR = 0.73
    this.ACTIVITY_OFFSET = 1
    this.MOVE_SPEED = this.PLAYER_TARGET_H
    this.OBLIQUE_MOVE_SPEED = Math.round(this.MOVE_SPEED * 0.74)
    this.ITEM_LIST = [
      { name: 'boxes', dialog: '??????????????????????????????' },
      { name: 'fats', dialog: '??????????????????????????????' },
      { name: 'labels', dialog: '??????????????????????????????' },
      { name: 'telescopes', dialog: '??????????????????????????????' },
      { name: 'batteries', dialog: '??????????????????????????????' },
    ]

    this.updateConfigurations()
    this.SOUND_SIGHT = 25 * this.PLAYER_TARGET_H
    this.OBJECT_SIGHT = 35 * this.PLAYER_TARGET_H
    // this.GRID_SIZE = Math.max(this.WINDOW_H, this.WINDOW_W) / 3
    // this.GRID_SIZE = Math.max(this.WINDOW_H, this.WINDOW_W) / this.ZOOM_OUT_LEVEL/2;

    // this.GRID_SIZE = Math.max(this.WINDOW_H, this.WINDOW_W) / this.ZOOM_OUT_LEVEL;
  }
  calculateDistance(d) {
    return (d * 16) ** this.DENSITY_FACTOR
  }
  updateConfigurations() {
    // Actually the size of the canvas,not the window
    this.RAW_WINDOW_W = window.innerWidth || document.body.clientWidth
    this.RAW_WINDOW_H = window.innerHeight || document.body.clientHeight
    // this.SCALE = Math.min(
    //   Math.min(this.RAW_WINDOW_W / 15, this.RAW_WINDOW_H / 15) / this.PLAYER_TARGET_H,
    //   1
    // )
    this.SCALE = this.RAW_WINDOW_W > 900 ? 0.75 : 0.5
    this.WINDOW_W = this.RAW_WINDOW_W / this.SCALE
    this.WINDOW_H = this.RAW_WINDOW_H / this.SCALE
    this.WINDOW_CENTER_X = this.WINDOW_W / 2
    this.WINDOW_CENTER_Y = this.WINDOW_H / 2
    this.MASK_RADIUS = Math.max(this.WINDOW_H, this.WINDOW_W) * 0.42
    // this.time = timestamp % (24 * 60 * 60 * 1000) ;
    this.IS_MOBILE =
      ('ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        navigator.msMaxTouchPoints > 0) &&
      this.WINDOW_W > this.WINDOW_H
  }
}
export default new Configurations()
