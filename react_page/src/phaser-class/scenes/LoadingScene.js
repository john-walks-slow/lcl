import configureScene from "../game.config";
import feathers from "@feathersjs/feathers";
import rest from "@feathersjs/rest-client";
import bgURL from '../../assets/game/bg.png';
import dialogURL from '../../assets/game/dialog2.png';
import boxURL from '../../assets/game/boxes.png';
import fatURL from '../../assets/game/fats.png';
import labelURL from '../../assets/game/labels.png';
import telescopeURL from '../../assets/game/telescopes.png';
import batteryURL from '../../assets/game/batteries.png';
import whiteURL from '../../assets/game/white.png';
import gamepadURL from '../../assets/game/gamepad.png';
import { setObjects } from "../../store/actions/actionCreators";
import { seededRandom } from "../../utils/random";
import { secureStorage } from "../../utils/storage";
export default class LoadingScene extends Phaser.Scene {
  constructor(configurations, methods) {
    super({
      key: 'LoadingScene',
    });
    Object.assign(this, configurations);
    this.dispatch = methods.dispatch;
  }
  preload() { }

  create() {
    var app = feathers();
    // Connect to a different URL
    var restClient = rest();
    // Configure an AJAX library (see below) with that client
    app.configure(restClient.fetch(window.fetch));
    app.service('objects').find({ paginate: false }).then((data) => {
      this.dispatch(setObjects(data));
      this.objectList = data;
      this.itemList = [];
      this.gameObjectMap = [];

      this.load.image('bg', bgURL);
      this.load.image('dialog', dialogURL);
      this.load.image('boxes', boxURL);
      this.load.image('fats', fatURL);
      this.load.image('labels', labelURL);
      this.load.image('telescopes', telescopeURL);
      this.load.image('batteries', batteryURL);
      this.load.spritesheet('player', whiteURL, { frameWidth: 37, frameHeight: 44 });
      this.load.spritesheet('gamepad', gamepadURL, { frameWidth: 16, frameHeight: 16 });
      // [...Array(10000)].forEach(() => {
      //   objectList.push(createTestObject({
      //     "birthday": 1637818994985,
      //     "movement": "static",
      //     "size": "L",
      //     "columns": 18,
      //     "rows": 18,
      //     "zFactor": 1,
      //     "isAnimate": false,
      //     "dialog": "我是量产机1号。\n量产机只有我。\n我曾经统治过世界！\n你不信？我可是作者钦定的。你没发现我长得和你很像吗？\n写代码不容易，一直在查来查去解决琐碎的问题，会有积累吗？".split("\n"),
      //     "link": null
      //   }))
      // });
      this.gameObjectMap.getZone = (player) => {
        return [Math.ceil(player.x / this.GRID_SIZE), Math.ceil(player.y / this.GRID_SIZE)];
      };
      this.gameObjectMap.getNearBy = (zone) => {
        if (!zone) { return []; }
        let results = [];
        [-1, 0, 1].forEach((v1) => {
          [-1, 0, 1].forEach((v2) => {
            results.push([zone[0] + v1, zone[1] + v2]);
          });
        });
        return results;
      };
      this.gameObjectMap.pushNew = (zone, o) => {
        if (!this.gameObjectMap[zone[0]]) {
          this.gameObjectMap[zone[0]] = [];
        }
        if (!this.gameObjectMap[zone[0]][zone[1]]) {
          this.gameObjectMap[zone[0]][zone[1]] = [];
        }
        this.gameObjectMap[zone[0]][zone[1]].push(o);
      };
      let previousDate = this.timestamp;
      let offset;
      let dateOffset = 0;
      let player = secureStorage.getItem('player');

      this.objectList = this.objectList.sort((a, b) => b.birthday - a.birthday);
      this.objectList.forEach((o, i) => {
        if (this.timestamp - o.birthday < this.TIME_DELAY) { return; }
        dateOffset += Math.min(14, (previousDate - o.birthday) / 24 / 60 / 60 / 1000) * this.DAY_OFFSET;
        previousDate = o.birthday;
        offset = (this.DENSITY_OFFSET * (i ** 0.5));
        // console.log({ dateOffset, offset });
        // console.log(Math.min(1, (previousDate - o.birthday) / (30 * 24 * 60 * 60)));
        let rad = o.seed[0] * (Math.PI / 180);
        let sizeOffset = (this.PLAYER_TARGET_H + this.OBJECT_W[o.size] / o.zFactor) / 2;
        let distance = o.seed[1] * this.RANDOM_ZONE_W + offset + dateOffset + sizeOffset;
        o.x = Math.cos(rad) * distance;
        o.y = Math.sin(rad) * distance;
        o.isBackground = o.zFactor > 1;
        o.isForeground = o.zFactor < 1;
        o.zFactor == 1 && (o.zFactor = o.zFactor - 0.1 + seededRandom(o._id) * 0.2);
        // (o.zFactor > 1) && (o.zFactor =1.4);
        // (o.zFactor < 1) && (o.zFactor =0.6);
        o.ratio = o.rows / o.columns;
        if (o.ratio < 1) {
          o.displayWidth = this.OBJECT_W[o.size] / o.zFactor;
          o.displayHeight = this.OBJECT_W[o.size] / o.zFactor * o.ratio;
        } else {
          o.displayWidth = this.OBJECT_W[o.size] / o.zFactor / o.ratio;
          o.displayHeight = this.OBJECT_W[o.size] / o.zFactor;
        }
        o.zone = [Math.ceil(o.x / this.GRID_SIZE), Math.ceil(o.y / this.GRID_SIZE)];
        o.type = "object";
        this.gameObjectMap.pushNew(o.zone, o);
        if (o.item) {
          if (!player.ownItems.includes(o._id)) {
            let i = o.item;
            i._id = o._id;
            this.itemList.push(i);
            let rad = i.seed[0] * (Math.PI / 180);
            let sizeOffset = (this.PLAYER_TARGET_H + this.OBJECT_W.M) / 2;
            let distance = i.seed[1] * this.RANDOM_ZONE_W + offset + dateOffset + sizeOffset;
            i.x = Math.cos(rad) * distance;
            i.y = Math.sin(rad) * distance;
            i.zone = [Math.ceil(i.x / this.GRID_SIZE), Math.ceil(i.y / this.GRID_SIZE)];
            i.type = "item";
            console.log(i);
            this.gameObjectMap.pushNew(i.zone, i);
          }
        }
        switch (o.isAnimate) {
          case true:
            var shardsImg = new Image();
            shardsImg.onload = () => {
              this.textures.addSpriteSheet("object" + o._id, shardsImg, { frameWidth: o.columns, frameHeight: o.rows });
            };
            shardsImg.src = o.blobURI;
            // this.load.spritesheet("object" + o._id, 'assets/objects/' + o._id + '.png', { frameWidth: o.columns, frameHeight: o.rows });
            break;
          default:
            this.textures.addBase64("object" + o._id, o.blobURI);
            // this.load.image("object" + o._id, 'assets/objects/' + o._id + '.png')
            break;
        }
      });
      // DENSITY_OFFSET = Math.min(OBJECT_W.L, DENSITY_OFFSET);
      this.load.on("complete", () => {
        this.label.text += `\nStarting ...`;


        console.log(this.objectList);
        console.log(this.gameObjectMap);
        // setTimeout(() => {
        this.scene.start("MainScene", { "objectList": this.objectList, "gameObjectMap": this.gameObjectMap });
        console.log("mainscene start");
        this.scene.stop("LoadingScene");
        // }, 300);

      }, this);
      this.load.on('start', (progress) => {
        this.label.text +=
          '\nFetching assets ...';
      });
      let loadStart = false;
      this.load.on('filecomplete', (key, type, data) => {
        if (!loadStart) { loadStart = true; this.label.text += '\nLoading Content ...'; }
        this.label.text += `\n- Fetching ${key} ..`;
      });
      this.load.start();
    });
    this.add.rectangle(this.WINDOW_CENTER_X, this.WINDOW_CENTER_Y, this.WINDOW_W, this.WINDOW_H, 0x111023);
    this.label = this.add.text(this.WINDOW_W / 20, 80,
      new Date(this.timestamp).toString().split('GMT')[0] + "user@remote" + '\n Fetching object list...',
      { align: "left", color: "#FFFFFF", fontSize: 16, wordWrap: { width: this.WINDOW_W * 0.9, useAdvancedWrap: true } });
  }
  update() {

  }
}