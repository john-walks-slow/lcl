import { seededRandom } from '../utils/random'
import { secureStorage } from '../utils/storage'
import { range } from '../utils/utils'
import configurations from './configurations'
import GenerativeMusic from './GenerativeMusic'
import ObjectMap from './ObjectMap'
export default class ObjectData {
  constructor(list) {
    this.map = []
    this.soundMap = []
    this.itemList = []
    this.list = list
      .sort((a, b) => b.birthday - a.birthday)
      .filter(o => configurations.TIMESTAMP - o.birthday > configurations.TIME_DELAY)
    this.map = new ObjectMap(configurations.GRID_SIZE)
    this.soundMap = new ObjectMap(configurations.SOUND_GRID_SIZE)
    this.playerData = secureStorage.getItem('player')
  }
  setupObject() {
    console.time('setupObject')
    let previousDate = configurations.TIMESTAMP
    // let offsetIndex = 0
    let densityOffset = 0
    let dateOffset = 0
    this.list.forEach((o, i) => {
      dateOffset +=
        Math.min(14, (previousDate - o.birthday) / 24 / 60 / 60 / 1000) * configurations.DAY_OFFSET
      previousDate = o.birthday
      o.isTrash = o.dialog.length == 0
      if (!o.isTrash) {
        densityOffset += configurations.OBJECT_W[o.size] / 4
      }

      o.rad = o.seed[0] * (Math.PI / 180)
      o.zFactor = o.zFactor || 1
      o.isBackground = o.zFactor < 1
      o.isForeground = o.zFactor > 1
      // o.zFactor != 1 &&
      //   (o.zFactor = o.zFactor - 0.08 + seededRandom(o._id) * 0.04)

      let zFactorOffset = o.zFactor ** 0.5
      // o.distance = (offset + dateOffset) * zFactorOffset ;
      if (o.isBackground) {
        o.displaySize = configurations.OBJECT_W[o.size] * (2 - o.zFactor)
      } else {
        o.displaySize = configurations.OBJECT_W[o.size]
      }
      o.rows <= o.columns &&
        (o.width = o.displaySize) &&
        (o.height = (o.displaySize / o.columns) * o.rows)
      o.rows > o.columns &&
        (o.height = o.displaySize) &&
        (o.width = (o.displaySize / o.rows) * o.columns)
      o.displayWidth = Math.max(Math.round(o.width / o.columns), 1) * o.columns
      o.displayHeight = Math.max(Math.round(o.height / o.rows), 1) * o.rows

      o.distance = Math.max(
        -configurations.RANDOM_ZONE_W / 2 +
          o.seed[1] * configurations.RANDOM_ZONE_W +
          densityOffset +
          dateOffset,
        0
      )
      // *  zFactorOffset
      // o.distance = (o.seed[1] * configurations.RANDOM_ZONE_W + offset + dateOffset) * zFactorOffset * (2 + o.seed[1]) / 3;
      o.distance = (o.distance * 7) ** 0.8

      let minDistance = (configurations.PLAYER_TARGET_H + o.displaySize) / 0.7 / 2
      if (o.distance < minDistance) {
        o.distance = minDistance
      }
      o.x = Math.cos(o.rad) * o.distance
      o.y = Math.sin(o.rad) * o.distance
      o.zone = this.map.getZone(o)
      // (o.zFactor > 1) && (o.zFactor =1.4);
      // (o.zFactor < 1) && (o.zFactor =0.6);
      o.flow = [
        (configurations.DAY.intRandom(-5, 5) + configurations.DAY.flow[0]) * o.zFactor ** 3,
        (configurations.DAY.intRandom(-5, 5) + configurations.DAY.flow[1]) * o.zFactor ** 3,
      ]

      o.type = 'object'
      if (o.item) {
        if (!this.playerData.ownItems.includes(o._id)) {
          let i = o.item
          i._id = o._id
          this.itemList.push(i)
          let rad = i.seed[0] * (Math.PI / 180)
          let distance = i.seed[1] * configurations.RANDOM_ZONE_W + o.distance
          i.x = Math.cos(rad) * distance
          i.y = Math.sin(rad) * distance
          i.zone = this.map.getZone(i)
          i.displayWidth = configurations.OBJECT_W.XS
          i.displayWidth = Math.max(Math.round(i.displayWidth / 17), 1) * 17
          i.type = 'item'
          this.map.pushNew(this.map.getZone(i), i)
        }
      }
      GenerativeMusic.setupSound(o)
      this.map.pushNew(o.zone, o)
      this.soundMap.pushNew(this.soundMap.getZone(o), o)
    })
    console.timeEnd('setupObject')
    console.log(this.map)
  }
}
