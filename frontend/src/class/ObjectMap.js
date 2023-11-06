import { range } from '../utils/utils'

// A grid for quickly read/write object
export default class ObjectMap extends Array {
  constructor(sight) {
    super()
    this.SCOPE = 5
    this.gridSize = sight / (2 * this.SCOPE + 1)
    // Zone = [x,y]
    // return the zone of an object with x,y
    this.getZone = o => {
      return [
        Math.ceil((o.x + this.gridSize / 2) / this.gridSize),
        Math.ceil((o.y + this.gridSize / 2) / this.gridSize),
      ]
    }
    // return nearby zones
    this.getNearBy = (zone, scope = this.SCOPE) => {
      if (!zone) {
        return []
      }
      let results = []
      range(-scope, scope).forEach(v1 => {
        range(-scope, scope).forEach(v2 => {
          this?.[zone[0] + v1]?.[zone[1] + v2] && results.push([zone[0] + v1, zone[1] + v2])
        })
      })
      return results
    }
    this.pushNew = (zone, o) => {
      if (!this[zone[0]]) {
        this[zone[0]] = []
      }
      if (!this[zone[0]][zone[1]]) {
        this[zone[0]][zone[1]] = []
      }
      this[zone[0]][zone[1]].push(o)
    }
  }
}
