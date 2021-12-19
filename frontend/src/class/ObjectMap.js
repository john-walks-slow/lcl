import { range } from '../utils/utils'

export default class ObjectMap extends Array {
  constructor(gridSize) {
    super()
    this.getZone = o => {
      return [Math.ceil(o.x / gridSize), Math.ceil(o.y / gridSize)]
    }
    this.getNearBy = (zone, scope = 1) => {
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
