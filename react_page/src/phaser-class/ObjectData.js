import { range } from "../utils/utils";
import configureScene from "./game.config";
export default class ObjectData {
  constructor(list) {
    this.map = [];
    this.itemList = [];
    this.GRID_SIZE = configureScene().GRID_SIZE;
    this.list = list.sort((a, b) => b.birthday - a.birthday).slice(0, 50);

    this.map.getZone = (player, gridSize = this.GRID_SIZE) => {
      return [Math.ceil(player.x / gridSize), Math.ceil(player.y / gridSize)];
    };
    this.map.getNearBy = (zone, scope = 1) => {
      if (!zone) { return []; }
      let results = [];
      range(-scope, scope).forEach((v1) => {
        range(-scope, scope).forEach((v2) => {
          results.push([zone[0] + v1, zone[1] + v2]);
        });
      });
      return results;
    };
    this.map.pushNew = (zone, o) => {
      if (!this.map[zone[0]]) {
        this.map[zone[0]] = [];
      }
      if (!this.map[zone[0]][zone[1]]) {
        this.map[zone[0]][zone[1]] = [];
      }
      this.map[zone[0]][zone[1]].push(o);
    };

  }
}