import { seededRandom } from '../utils/random'
import { secureStorage } from '../utils/storage'
import { range } from '../utils/utils'
import configurations from './configurations'

export default class ObjectData {
  constructor(list) {
    this.map = []
    this.itemList = []
    this.list = list
      .sort((a, b) => b.birthday - a.birthday)
      .filter(o => configurations.TIMESTAMP - o.birthday > configurations.TIME_DELAY)
    this.map.getZone = (player, gridSize = configurations.GRID_SIZE) => {
      return [Math.ceil(player.x / gridSize), Math.ceil(player.y / gridSize)]
    }
    this.map.getNearBy = (zone, scope = 1) => {
      if (!zone) {
        return []
      }
      let results = []
      range(-scope, scope).forEach(v1 => {
        range(-scope, scope).forEach(v2 => {
          results.push([zone[0] + v1, zone[1] + v2])
        })
      })
      return results
    }
    this.map.pushNew = (zone, o) => {
      if (!this.map[zone[0]]) {
        this.map[zone[0]] = []
      }
      if (!this.map[zone[0]][zone[1]]) {
        this.map[zone[0]][zone[1]] = []
      }
      this.map[zone[0]][zone[1]].push(o)
    }
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
        o.size = configurations.OBJECT_W[o.size] * (2 - o.zFactor)
      } else {
        o.size = configurations.OBJECT_W[o.size]
      }
      o.rows <= o.columns && (o.width = o.size) && (o.height = (o.size / o.columns) * o.rows)
      o.rows > o.columns && (o.height = o.size) && (o.width = (o.size / o.rows) * o.columns)
      o.displayWidth = Math.max(Math.round(o.width / o.columns), 1) * o.columns
      o.displayHeight = Math.max(Math.round(o.height / o.rows), 1) * o.rows

      o.distance =
        -configurations.RANDOM_ZONE_W / 2 +
        o.seed[1] * configurations.RANDOM_ZONE_W +
        densityOffset +
        dateOffset
      // *  zFactorOffset
      // o.distance = (o.seed[1] * configurations.RANDOM_ZONE_W + offset + dateOffset) * zFactorOffset * (2 + o.seed[1]) / 3;
      o.distance = (o.distance * 7) ** 0.8

      let minDistance = configurations.PLAYER_TARGET_H + o.size
      if (o.distance < minDistance) {
        o.distance = minDistance + configurations.PLAYER_TARGET_W
      }
      o.x = Math.cos(o.rad) * o.distance
      o.y = Math.sin(o.rad) * o.distance

      // (o.zFactor > 1) && (o.zFactor =1.4);
      // (o.zFactor < 1) && (o.zFactor =0.6);

      o.zone = [
        Math.ceil(o.x / configurations.GRID_SIZE),
        Math.ceil(o.y / configurations.GRID_SIZE),
      ]

      o.flow = [
        (configurations.DAY.intRandom(-10, 10) + configurations.DAY.flow[0]) * o.zFactor ** 3,
        (configurations.DAY.intRandom(-10, 10) + configurations.DAY.flow[1]) * o.zFactor ** 3,
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
          i.displayWidth = configurations.OBJECT_W.XS
          i.displayWidth = Math.max(Math.round(i.displayWidth / 17), 1) * 17
          i.zone = [
            Math.ceil(i.x / configurations.GRID_SIZE),
            Math.ceil(i.y / configurations.GRID_SIZE),
          ]
          i.type = 'item'
          this.map.pushNew(i.zone, i)
        }
      }
      this.map.pushNew(o.zone, o)
    })
    console.timeEnd('setupObject')
    console.log(this.map)
  }
}
