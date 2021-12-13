import { seededRandom } from "../utils/random";
import { secureStorage } from "../utils/storage";
import { range } from "../utils/utils";
import configurations from "./configurations";

export default class ObjectData {
  constructor(list) {
    this.map = [];
    this.itemList = [];
    this.list = list.sort((a, b) => b.birthday - a.birthday).filter((o) => (configurations.TIMESTAMP - o.birthday > configurations.TIME_DELAY));
    this.map.getZone = (player, gridSize = configurations.GRID_SIZE) => {
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
    this.previousDate = configurations.TIMESTAMP;
    this.offset;
    this.dateOffset = 0;
    this.playerData = secureStorage.getItem('player');
  }
  setupObject(o, i) {
    // if (configurations.TIMESTAMP - o.birthday < configurations.TIME_DELAY) { return; }
    this.dateOffset += Math.min(14, (this.previousDate - o.birthday) / 24 / 60 / 60 / 1000) * configurations.DAY_OFFSET;
    this.previousDate = o.birthday;
    this.offset = (configurations.DENSITY_OFFSET * (i ** 0.5));
    // console.log({ dateOffset, offset });
    // console.log(Math.min(1, (previousDate - o.birthday) / (30 * 24 * 60 * 60)));
    let rad = o.seed[0] * (Math.PI / 180);
    o.isBackground = o.zFactor < 1;
    o.isForeground = o.zFactor > 1;
    o.zFactor == 1 && (o.zFactor = o.zFactor - 0.1 + seededRandom(o._id) * 0.2);
    let zFactorOffset;
    zFactorOffset = (o.zFactor || 1) ** 0.5;
    let distance = (o.seed[1] * configurations.RANDOM_ZONE_W + this.offset + this.dateOffset) * zFactorOffset;
    let minDistance = (configurations.PLAYER_TARGET_H + configurations.OBJECT_W[o.size] / o.zFactor) / 2;
    if (distance < minDistance) {
      distance = minDistance + configurations.PLAYER_TARGET_W;
    }
    o.x = Math.cos(rad) * distance;
    o.y = Math.sin(rad) * distance;

    // (o.zFactor > 1) && (o.zFactor =1.4);
    // (o.zFactor < 1) && (o.zFactor =0.6);
    o.ratio = o.rows / o.columns;
    if (o.ratio < 1) {
      o.displayWidth = configurations.OBJECT_W[o.size] / o.zFactor;
      o.displayHeight = configurations.OBJECT_W[o.size] / o.zFactor * o.ratio;
    } else {
      o.displayWidth = configurations.OBJECT_W[o.size] / o.zFactor / o.ratio;
      o.displayHeight = configurations.OBJECT_W[o.size] / o.zFactor;
    }
    o.displayWidth = Math.max(Math.round(o.displayWidth / o.columns), 1) * o.columns;
    o.displayHeight = Math.max(Math.round(o.displayHeight / o.rows), 1) * o.rows;

    o.zone = [Math.ceil(o.x / configurations.GRID_SIZE), Math.ceil(o.y / configurations.GRID_SIZE)];
    o.type = "object";
    if (o.item) {
      if (!this.playerData.ownItems.includes(o._id)) {
        let i = o.item;
        i._id = o._id;
        this.itemList.push(i);
        let rad = i.seed[0] * (Math.PI / 180);
        // let sizeOffset = (configurations.PLAYER_TARGET_H + configurations.OBJECT_W.M) / 2;
        let minDistance = configurations.PLAYER_TARGET_H + configurations.OBJECT_W[o.size];
        let distance = i.seed[1] * configurations.RANDOM_ZONE_W + this.offset + this.dateOffset;
        if (o.zFactor == 1 && distance < minDistance) { distance = minDistance; }
        i.x = Math.cos(rad) * distance;
        i.y = Math.sin(rad) * distance;
        i.zone = [Math.ceil(i.x / configurations.GRID_SIZE), Math.ceil(i.y / configurations.GRID_SIZE)];
        i.type = "item";
        this.map.pushNew(i.zone, i);
      }
    }

  };
}