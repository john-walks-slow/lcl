import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch, connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { setStorage } from '../store/actions/actionCreators';
import feathers from '@feathersjs/feathers';
import rest from '@feathersjs/rest-client';
import App from '../components/App';
import { renderBlob } from '../utils/canvasGIF';
// import Phaser from 'jquery';
import Phaser from 'phaser';

import bgURL from '../assets/game/bg.png'
import newBtnURL from '../assets/game/new.png'
import bagBtnURL from '../assets/game/bag.png'
import mapBtnURL from '../assets/game/map.png'
import infoBtnURL from '../assets/game/info.png'
// import colorURL from '../assets/game/color.png'
import dialogURL from '../assets/game/dialog2.png'
import boxURL from '../assets/game/boxes.png'
import fatURL from '../assets/game/fats.png'
import labelURL from '../assets/game/labels.png'
import telescopeURL from '../assets/game/telescopes.png'
import batteryURL from '../assets/game/batteries.png'
import whiteURL from '../assets/game/white.png'
import { useParams, useNavigate } from "react-router-dom";
import ReadMe from '../../../README.md'
import ReactMarkdown from 'react-markdown'
import { secureStorage } from '../utils/storage';



function xmur3(str) {
  for (var i = 0, h = 1779033703 ^ str.length; i < str.length; i++)
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353),
      h = h << 13 | h >>> 19;
  return function () {
    h = Math.imul(h ^ h >>> 16, 2246822507);
    h = Math.imul(h ^ h >>> 13, 3266489909);
    return (h ^= h >>> 16) >>> 0;
  }
}
function seededRandom(string) {
  let seed = xmur3(string);
  let a = seed();
  let b = seed();
  let c = seed();
  let d = seed();
  a >>>= 0; b >>>= 0; c >>>= 0; d >>>= 0;
  var t = (a + b) | 0;
  a = b ^ b >>> 9;
  b = c + (c << 3) | 0;
  c = (c << 21 | c >>> 11);
  d = d + 1 | 0;
  t = t + d | 0;
  c = c + t | 0;
  return (t >>> 0) / 4294967296;
}


const Game = ({ dispatch }) => {
  const navigate = useNavigate();
  const WINDOW_W = window.innerWidth || document.body.clientWidth;
  const WINDOW_H = window.innerHeight || document.body.clientHeight;
  const WINDOW_CENTER_X = WINDOW_W / 2;
  const WINDOW_CENTER_Y = WINDOW_H / 2;
  const PLAYER_TARGET_W = Math.min(WINDOW_W / 11, WINDOW_H / 11 / 44 * 37);
  const PLAYER_TARGET_H = Math.min(WINDOW_W / 11, WINDOW_H / 11 / 44 * 37) / 37 * 44;
  // const PLAYER_TARGET_W = Math.min(WINDOW_W / 15, WINDOW_H / 15 / 44 * 37);
  // const PLAYER_TARGET_H = Math.min(WINDOW_W / 15, WINDOW_H / 15 / 44 * 37) / 37 * 44;
  const OBJECT_W = { XL: PLAYER_TARGET_H * 2.5, L: PLAYER_TARGET_H * 2, M: PLAYER_TARGET_H * 1.4, S: PLAYER_TARGET_H * 1, XS: PLAYER_TARGET_H * 0.7 }
  // density: target object count in a circle (r=OBJECT_M_W*8)

  // const TIME_DELAY = 60 * 60 * 1000;
  const TIME_DELAY = 60 * 60 * 1000;
  const RANDOM_ZONE_W = OBJECT_W.L;
  var DAY_OFFSET = OBJECT_W.M;
  var DENSITY_OFFSET = OBJECT_W.L;
  var ACTIVITY_OFFSET = 1;
  const MOVE_SPEED = PLAYER_TARGET_W * 1.4;
  const ZOOM_OUT_LEVEL = 0.3;
  const GRID_SIZE = Math.max(WINDOW_H, WINDOW_W) / ZOOM_OUT_LEVEL;
  const timestamp = Date.parse(new Date());
  let mainScene;
  const [showInfo, setShowInfo] = useState();
  const ITEM_LIST = [{ name: "boxes", dialog: "哇！你捡到了一个箱子" }, { name: "fats", dialog: "哇！你捡到了一袋肥料" }, { name: "labels", dialog: "哇！你捡到了一张便签" }, { name: "telescopes", dialog: "哇！你捡到了一块镜片" }, { name: "batteries", dialog: "哇！你捡到了一块电池" },];

  useEffect(() => {
    document.title = "LCL";
    document.body.style.overflow = "hidden"

    function createTestObject(object) {
      object._id = 3;
      object.seed = [Math.random() * 360, Math.random() ** 0.5];
      return object;
    }

    function vectorAngle(x, y) {
      let mX = Math.sqrt(x.reduce((acc, n) => acc + Math.pow(n, 2), 0));
      let mY = Math.sqrt(y.reduce((acc, n) => acc + Math.pow(n, 2), 0));
      return Math.acos(x.reduce((acc, n, i) => acc + n * y[i], 0) / (mX * mY));
    };

    class Dialog extends Phaser.GameObjects.Container {

      constructor(scene) {
        super(scene);
        const DIALOG_HEIGHT = WINDOW_H / 3.5;
        this.dialogHeight = DIALOG_HEIGHT
        const TEXT_PADDING_W = Math.min(WINDOW_W / 15, 50);
        this.textPaddingW = TEXT_PADDING_W
        const TEXT_PADDING_H = Math.min(WINDOW_H / 25);
        this.textPaddingH = TEXT_PADDING_H
        const PADDING_BETWEEN = 10;
        this.paddingBetween = PADDING_BETWEEN
        const DIALOG_PADDING_W = Math.min(WINDOW_W / 20, 70);
        this.dialogPaddingW = DIALOG_PADDING_W
        const DIALOG_PADDING_H = Math.min(WINDOW_W / 25, 30);
        this.dialogPaddingH = DIALOG_PADDING_H
        const FONT_SIZE = Math.max(WINDOW_H / 30, WINDOW_W / 40);
        this.fontSize = FONT_SIZE
        const FONT_SIZE_HEADER = FONT_SIZE * 1.2;
        this.fontSizeHeader = FONT_SIZE_HEADER
        // const DIALOG_HEIGHT = FONT_SIZE*2+FONT_SIZE_HEADER+TEXT_PADDING_H*3 +PADDING_BETWEEN;
        // this.dialogHeight = DIALOG_HEIGHT
        const FONT_FAMILY = "pixel"
        this.fontFamily = FONT_FAMILY
        const FONT_FAMILY_HEADER = "pixel"
        this.fontFamilyHeader = FONT_FAMILY_HEADER
        this.scene = scene;
        this.depth = 999;
        this.dialogWindow = this.scene.add.sprite(WINDOW_CENTER_X, WINDOW_H - DIALOG_HEIGHT / 2 - DIALOG_PADDING_H, "dialog").setDisplaySize(WINDOW_W - DIALOG_PADDING_W, DIALOG_HEIGHT);
        this.dialogHeader = this.scene.add.text(DIALOG_PADDING_W + TEXT_PADDING_W, WINDOW_H - DIALOG_HEIGHT - DIALOG_PADDING_H + TEXT_PADDING_H, "",
          {
            color: 0xFFFFFF,
            fontStyle: "bold",
            // fixedWidth: WINDOW_W - DIALOG_PADDING_W - TEXT_PADDING*2,
            // fixedHeight: DIALOG_HEIGHT - TEXT_PADDING*2,
            fontFamily: FONT_FAMILY_HEADER,
            fontSize: (FONT_SIZE_HEADER).toString() + "px",
          });
        this.dialogText = this.scene.add.text(DIALOG_PADDING_W + TEXT_PADDING_W, WINDOW_H - DIALOG_HEIGHT - DIALOG_PADDING_H + TEXT_PADDING_H + FONT_SIZE_HEADER + PADDING_BETWEEN, "",
          {
            color: 0xFFFFFF,
            // fixedWidth: WINDOW_W - DIALOG_PADDING_W - TEXT_PADDING*2,
            // fixedHeight: DIALOG_HEIGHT - TEXT_PADDING*2,
            fontFamily: FONT_FAMILY,
            fontSize: FONT_SIZE.toString() + "px",
            wordWrap: { width: WINDOW_W - DIALOG_PADDING_W * 2 - TEXT_PADDING_W * 2 + 10, useAdvancedWrap: true }
          });
        this.add([this.dialogWindow, this.dialogText, this.dialogHeader]);

        this.setScrollFactor(0);
        this.setAlpha(0);
        this.dialogIndex = 0;
        this.inDialog = false;
        this.dialogFadeIn = this.scene.tweens.create({
          targets: this,
          alpha: { from: 0, to: 1 },
          ease: 'Linear',       // 'Cubic', 'Elastic', 'Bounce', 'Back'
          duration: 500,
        });
        this.dialogFadeOut = this.scene.tweens.create({
          targets: this,
          alpha: { from: 1, to: 0 },
          ease: 'Linear',       // 'Cubic', 'Elastic', 'Bounce', 'Back'
          duration: 500,
        });
        this.scene.add.existing(this);
      }
      proceedDialog() {
        if (this.inDialog) {
          this.dialogIndex++;
          if (this.dialogIndex > this.sentences.length - 1) {
            this.dialogFadeOut.play().on("complete", () => { this.inDialog = false; });
            // dialogWindow.off('pointerdown');
            this.scene.input.off('pointerdown');
            this.scene.input.keyboard.off('keydown-SPACE');
            if (this.dialogCallback) {
              this.dialogCallback.apply();
            }
          } else {
            this.dialogText.setText(this.sentences[this.dialogIndex]);
          }
        }
      }
      showDialog(dialog, name, callback) {
        this.dialogCallback = callback || false;
        this.inDialog = true;
        this.scene.camera.shake(100, 0.01)
        // dialogWindow.on('pointerdown', () => { this.proceedDialog() });
        this.scene.input.on('pointerdown', (e) => { this.proceedDialog() });
        this.scene.input.keyboard.on('keydown-SPACE', () => { this.proceedDialog() });

        this.dialogFadeIn.play();
        this.sentences = dialog;
        this.dialogIndex = 0;
        if (name != "") { this.dialogHeader.setText(name) }
        else {
          this.dialogHeader.setText('')
        }
        this.dialogText.setText(this.sentences[this.dialogIndex]);
        console.log(this.sentences);
      }
    }
    class ItemDialog extends Dialog {
      constructor(scene) {
        super(scene);
        const width = Math.min(600, WINDOW_W * 0.85);
        const height = width * 0.4;
        const padding = width / 8;
        const paddingTop = width / 9;
        this.dialogWindow.setX(WINDOW_CENTER_X)
        this.dialogWindow.setY(WINDOW_CENTER_Y)
        this.dialogWindow.setDisplaySize(width, height);
        this.dialogText.setX(WINDOW_CENTER_X - width / 2 + padding)
        this.dialogText.setY(WINDOW_CENTER_Y - height / 2 + paddingTop)
        this.dialogText.wordWrap = { width: width - padding * 2, useAdvancedWrap: true }
      }
    }
    class LinkDialog extends Dialog {
      constructor(scene) {
        super(scene);
        const width = Math.min(600, WINDOW_W * 0.85);
        const height = width * 0.7;
        const padding = width / 10;
        const paddingTop = width / 9;
        this.link = '';
        this.buttonSelected = "#000000"
        this.dialogWindow.setX(WINDOW_CENTER_X)
        this.dialogWindow.setY(WINDOW_CENTER_Y)
        this.dialogWindow.setDisplaySize(width, height);
        this.dialogText.setText("它带着一个箱子，打开看看吗？")
        this.dialogText.setX(WINDOW_CENTER_X - width / 2 + padding)
        this.dialogText.setY(WINDOW_CENTER_Y - height / 2 + paddingTop)
        this.dialogText.setWordWrapWidth(width - padding * 2, true)
        this.selectedOption = 0;
        this.dialogYes = this.scene.add.text(WINDOW_CENTER_X - width / 2 + padding, WINDOW_CENTER_Y + height / 2 - this.fontSizeHeader - paddingTop, " 是 ",
          {
            color: 0xFFFFFF,
            fontFamily: this.fontFamily,
            fontSize: (this.fontSizeHeader).toString() + "px",
          });
        this.dialogYes.buttonId = "yes"
        this.dialogNo = this.scene.add.text(WINDOW_CENTER_X + padding, WINDOW_CENTER_Y + height / 2 - this.fontSizeHeader - paddingTop, " 否 ",
          {
            color: 0xFFFFFF,
            fontFamily: this.fontFamily,
            fontSize: (this.fontSizeHeader).toString() + "px",
          });
        this.dialogNo.buttonId = "no"
        // this.dialogSelection = this.scene.add.rectangle(
        //   WINDOW_CENTER_X - width/2+padding, WINDOW_CENTER_Y+height/2-this.fontSizeHeader-paddingTop,
        //   width/2,this.fontSizeHeader,0x000000,0.3)
        this.add([this.dialogYes, this.dialogNo])
        this.select(1);

      }
      select(i) {
        this.selectedOption = i;
        [this.dialogYes, this.dialogNo][i].setBackgroundColor(this.buttonSelected).setColor("#FFFFFF");
        [this.dialogYes, this.dialogNo][1 - i].setBackgroundColor("").setColor("#000000");
      }
      confirm() {
        this.inDialog = false;
        console.log(this.link);
        if (this.link.length > 0 && this.selectedOption == 0) {
          window.open(this.link);
        }
        this.scene.input.keyboard.off('keydown-LEFT');
        this.scene.input.keyboard.off('keydown-RIGHT');
        this.scene.input.keyboard.off('keydown-SPACE');
        this.scene.input.off('gameobjectdown');
        this.select(1);
        this.dialogFadeOut.play();
        this.link = "";
      }

      showDialog(link) {
        console.log('show link');
        this.link = link;
        this.inDialog = true;
        this.scene.input.on('gameobjectdown', (pointer, o, event) => {
          if (o.buttonId == "yes") { this.selectedOption = 0 }
          if (o.buttonId == "no") { this.selectedOption = 1 }
        })
        this.scene.input.keyboard.on('keydown-LEFT', () => { this.select(0) });
        this.scene.input.keyboard.on('keydown-RIGHT', () => { this.select(1) });
        this.scene.input.keyboard.on('keydown-SPACE', () => { this.confirm() });
        this.dialogFadeIn.play();
      }
    }


    class LoadingScene extends Phaser.Scene {
      constructor() {
        super({
          key: 'LoadingScene',
        })
      }
      preload() { }

      create() {
        var app = feathers();
        // Connect to a different URL
        var restClient = rest();
        // Configure an AJAX library (see below) with that client
        const connectText =
          [new Date(timestamp).toString().split('GMT')[0] + "user@remote"
            + '\n Waiting for server response ...',
            '\n Reading database ...',
            '\n Loading contents ...',
            '.', '.', '.', '.', '.', '.', '.'
          ]
        app.configure(restClient.fetch(window.fetch));
        app.service('objects').find({ paginate: false }).then((data) => {
          let objectList = data;
          this.load.image('bg', bgURL);
          this.load.image('dialog', dialogURL);
          this.load.image('boxes', boxURL);
          this.load.image('fats', fatURL);
          this.load.image('labels', labelURL);
          this.load.image('telescopes', telescopeURL);
          this.load.image('batteries', batteryURL);
          this.load.spritesheet('player', whiteURL, { frameWidth: 37, frameHeight: 44 });
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
          objectList.forEach((o, index) => {
            // if (timestamp - o.birthday < (48 * 60 * 60)) { ACTIVITY_OFFSET += 0.5; }
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
          objectList.sort((a, b) => b.birthday - a.birthday)
          // DENSITY_OFFSET = Math.min(OBJECT_W.L, DENSITY_OFFSET);
          this.load.on("complete", () => {
            this.label.text += `\nStarting ...`
            setTimeout(() => {
              this.scene.start("MainScene", { "objectList": objectList });
              this.scene.stop("LoadingScene");
            }, 300)

          }, this);
          this.load.on('start', (progress) => {
            this.label.text +=
              '\nWaiting for server response ...';
          })
          let loadStart = false;
          this.load.on('filecomplete', (key, type, data) => {
            if (!loadStart) { loadStart = true; this.label.text += '\nLoading Content ...' }
            this.label.text += `\n- Fetching ${key} ..`
          })
          this.load.start();
        })
        this.add.rectangle(WINDOW_CENTER_X, WINDOW_CENTER_Y, WINDOW_W, WINDOW_H, 0x000000);
        this.label = this.add.text(80, 80, new Date(timestamp).toString().split('GMT')[0] + "user@remote", { align: "left", color: "#FFFFFF", fontSize: 20 })
      }
      update() {

      }
    }

    class MainScene extends Phaser.Scene {
      constructor() {
        super({
          key: 'MainScene', active: false
        });
        this.player;
        this.objects;
        this.cursors;
        this.startPosX = 0;
        this.startPosY = 0;
        this.camera;
        this.gameDialog;
        this.pointerOnPlayer = false;
      }

      preload() {
      }
      init(data) {
        this.objectList = data.objectList;
      }
      create() {
        mainScene = this;
        this.cursors = this.input.keyboard.createCursorKeys();
        this.camera = this.cameras.main;
        this.staticCamera = this.cameras.add();
        this.gameObjects = this.add.layer();
        this.uis = this.add.layer();
        // this.add.tileSprite(WINDOW_CENTER_X, WINDOW_CENTER_Y,WINDOW_W,WINDOW_H,'bg');
        // this.add.rectangle(WINDOW_CENTER_X, WINDOW_CENTER_Y, WINDOW_W, WINDOW_H, 0xFFFFFF);
        this.player = this.physics.add.sprite(this.startPosX, this.startPosY, 'player')
          .setDisplaySize(PLAYER_TARGET_W, PLAYER_TARGET_H)
          .refreshBody();
        this.player.setInteractive();
        // this.player.on('pointerdown', () => {
        //   if (this.gameDialog.inDialog) { return };
        //   if (this.camera.zoom == 1) { this.camera.zoomOutAnim.play(); }
        //   if (this.camera.zoom == this.camera.zoomOutLevel) { this.camera.zoomInAnim.play(); }
        // })
        this.player.on('pointerover', () => { this.pointerOnPlayer = true })
        this.player.on('pointerout', () => { this.pointerOnPlayer = false })
        this.player.depth = 0.9;
        this.player.moveX = (x) => {
          this.player.setVelocityX(x);
          // this.player.x += x / 100;
          // this.player.x += x / 100;
          // this.objects.children.each((o) => { o.x -= x / 100 * (o.data.values.zFactor - 1) })
        }
        this.player.moveY = (y) => {
          // this.camera.shake();
          this.player.setVelocityY(y);
          // this.player.y += y / 100;

          // this.objects.children.each((o) => { o.y -= y / 100 * (o.data.values.zFactor - 1) })
        }
        this.player.stopMovement = () => {
          if (this.player.anims.getName() == "runLeft") {
            // player.anims.stopOnFrame(player.anims.currentAnim.frames[1]);
            // player.anims.chain();
            this.player.anims.play('standLeft', true);
          }
          if (this.player.anims.getName() == "runRight") {
            // player.anims.stopOnFrame(player.anims.currentAnim.frames[1]);
            // player.anims.chain();
            // player.anims.chain('standRight');
            this.player.anims.play('standRight', true);

          }
          if (this.player.anims.getName() == "runUp") {
            // player.anims.stopOnFrame(player.anims.currentAnim.frames[1]);
            // player.anims.chain();
            this.player.anims.play('standUp', true);
          }
          if (this.player.anims.getName() == "runDown") {
            // player.anims.stopOnFrame(player.anims.currentAnim.frames[1]);
            // player.anims.chain();
            // player.anims.chain('standDown');
            this.player.anims.play('standDown', true);

          }
          this.player.moveX(0);
          this.player.moveY(0);
        }
        this.gameObjects.add([this.player])
        this.camera.startFollow(this.player, false, 0.2, 0.2);
        this.camera.setBackgroundColor(0xFFFFFF);
        this.camera.setFollowOffset(0, -0);
        this.camera.zoomOutLevel = ZOOM_OUT_LEVEL;
        this.camera.setZoom(0.01);
        // this.camera.setAlpha(0.1);
        this.camera.initAnim = this.tweens.create({
          targets: this.camera,
          props: { 'zoom': 1 },
          ease: 'Cubic',       // 'Cubic', 'Elastic', 'Bounce', 'Back'
          duration: 3000,
        });
        this.camera.zoomOutAnim = this.tweens.create({
          targets: this.camera,
          props: { 'zoom': this.camera.zoomOutLevel },
          ease: 'Cubic',       // 'Cubic', 'Elastic', 'Bounce', 'Back'
          duration: 1000,
        });
        this.camera.zoomInAnim = this.tweens.create({
          targets: this.camera,
          props: { 'zoom': 1 },
          ease: 'Cubic',       // 'Cubic', 'Elastic', 'Bounce', 'Back'
          duration: 300,
        });
        this.camera.zoomIn = () => {
          this.camera.zoomOutAnim.stop()
          this.camera.zoomOutAnim.stop()
          this.camera.zoomInAnim.play()
        }
        this.camera.zoomOut = () => {
          this.camera.zoomInAnim.stop()
          this.camera.zoomOutAnim.play()
        }
        this.camera.toggleZoom = () => { }
        this.objectMap = [];
        this.objects = this.physics.add.group({
          // bounceX:0, bounceY:0
          immovable: true
        });

        this.itemCollideHandler = (o1, o2) => {
          // console.log(this.player.body.velocity);
          // this.player.stopMovement();
          if (this.gameDialog.inDialog || this.itemDialog.inDialog) { return; }
          let currentObj;
          if (o1.texture.key == "player") {
            currentObj = o2;
          }
          else {
            currentObj = o1;
          }
          console.log(currentObj);
          let dialog = ITEM_LIST[currentObj.data.values.type].dialog;
          let player = secureStorage.getItem('player');
          if (
            !player.ownItems.includes(currentObj.getData('id'))
          ) {
            this.itemDialog.showDialog([dialog]);
            player[ITEM_LIST[currentObj.data.values.type].name]++
            player.ownItems.push(currentObj.data.values.id);
            dispatch(setStorage(player));
          }
          currentObj.fadeOut.play();
          // currentObj.destroy();
          // currentObj.data.values.collider.destroy();
          // currentObj.alpha=0;

        }
        this.objectCollideHandler = (o1, o2) => {
          // console.log(this.player.body.velocity);
          // this.player.stopMovement();
          // console.log(this.player.body);

          if (this.gameDialog.inDialog || this.itemDialog.inDialog) { return; }
          let currentObj;
          if (o1.texture.key == "player") {
            currentObj = o2;
          }
          else {
            currentObj = o1;
          }
          if (currentObj.data.values.dialog.length > 0) {
            this.gameDialog.showDialog(currentObj.data.values.dialog, currentObj.data.values.name,
              () => {
                if (currentObj.getData('link').length > 0) {
                  this.linkDialog.showDialog(currentObj.getData('link'));
                }
              })
            if (currentObj.data.values.isBackground) {
              currentObj.data.values.collider.destroy();
            } else {
              // currentObj.setData("dialog", []);
            }
          }
          this.physics.collide(o1, o2);
          let xOverlap = this.player.displayWidth / 2 + currentObj.displayWidth / 2 - Math.abs(this.player.x - currentObj.x)
          let yOverlap = this.player.displayHeight / 2 + currentObj.displayHeight / 2 - Math.abs(this.player.y - currentObj.y)
          // console.log(xOverlap, yOverlap);
          if (xOverlap < 0 || yOverlap < 0) {
            // return;
          }
          if (xOverlap < yOverlap && this.player.x < currentObj.x) {
            this.player.setX(this.player.x + -0.1);
            // console.log('left');
          }
          if (xOverlap < yOverlap && this.player.x > currentObj.x) {
            this.player.setX(this.player.x - -0.1);
            // console.log('right');
          }
          if (xOverlap > yOverlap && this.player.y < currentObj.y) {
            this.player.setY(this.player.y + -0.1);
            // console.log('up');
          }
          if (xOverlap > yOverlap && this.player.y > currentObj.y) {
            this.player.setY(this.player.y - -0.1);
            // console.log('down');
          }
        }
        let movedObjects = [];
        this.objects.createCallback = (o) => {
          setTimeout(() => {
            // console.log(o.body.touching);
            // if (o.body.overlapX != 0 || o.body.overlapY != 0) {
            //   o.x -= o.body.overlapX / 2;
            //   o.y -= o.body.overlapY / 2;
            // }
            if (o.data.values.isBackground) { return; }
            let collidedObjects = this.physics.overlapRect(o.x - o.displayWidth / 2, o.y - o.displayHeight / 2, o.displayWidth, o.displayHeight);
            if (collidedObjects.length > 0) {
              collidedObjects.forEach((c) => {
                let cg = c.gameObject;
                if (cg.data.values.id == o.data.values.id) {
                  return;
                }
                if (cg.data.values.isBackground) {
                  return
                }
                // if (movedObjects.find((a) => (a[0] == o.id && a[1] == cg.id))) {
                //   return;
                // }
                let xI = cg.x < o.x ? 1 : -1;
                let yI = cg.y < o.y ? 1 : -1;
                if (cg.x < o.x) {
                  cg.x -= (cg.displayWidth - Math.abs(o.x - cg.x)) * 1.1
                } else {
                  o.x += (o.displayWidth - Math.abs(o.x - cg.x)) * 1.1
                }
                if (cg.y < o.y) {
                  cg.y -= (cg.displayHeight - Math.abs(o.y - cg.y)) * 1.1
                } else {
                  o.y += (o.displayHeight - Math.abs(o.y - cg.y)) * 1.1
                }
                movedObjects.push([cg.id, o.id]);
              })
            }
          }, 50)
        }
        let previousDate = timestamp;
        let offset;
        let dateOffset = 0;

        this.items = this.physics.add.group({
          immovable: true
        });
        let ownItems = secureStorage.getItem('player').ownItems;

        this.objectList.forEach((o, i) => {
          if (timestamp - o.birthday < TIME_DELAY) { return; }
          dateOffset += Math.min(14, (previousDate - o.birthday) / 24 / 60 / 60 / 1000) * DAY_OFFSET;
          previousDate = o.birthday;
          offset = (DENSITY_OFFSET * (i ** 0.5));
          // console.log({ dateOffset, offset });
          // console.log(Math.min(1, (previousDate - o.birthday) / (30 * 24 * 60 * 60)));
          let rad = o.seed[0] * (Math.PI / 180);
          let sizeOffset = (PLAYER_TARGET_H + OBJECT_W[o.size] / o.zFactor) / 2;
          let distance = o.seed[1] * RANDOM_ZONE_W + offset + dateOffset + sizeOffset;
          o.x = Math.cos(rad) * distance;
          o.y = Math.sin(rad) * distance;
          o.isBackground = o.zFactor != 1;
          (!o.isBackground) && (o.zFactor = o.zFactor - 0.1 + seededRandom(o._id) * 0.2);
          // (o.zFactor > 1) && (o.zFactor =1.4);
          // (o.zFactor < 1) && (o.zFactor =0.6);
          o.ratio = o.rows / o.columns;
          if (o.ratio < 1) {
            o.displayWidth = OBJECT_W[o.size] / o.zFactor;
            o.displayHeight = OBJECT_W[o.size] / o.zFactor * o.ratio
          } else {
            o.displayWidth = OBJECT_W[o.size] / o.zFactor / o.ratio;
            o.displayHeight = OBJECT_W[o.size] / o.zFactor;
          }
          o.zone = [Math.ceil(o.x / GRID_SIZE), Math.ceil(o.y / GRID_SIZE)]
          o.isAnimate ? this.anims.create({
            key: 'spritesheet' + o._id,
            frames: 'object' + o._id,
            frameRate: 2,
            delay: Math.random() * 1000,
            repeat: -1,
            repeatDelay: 0
          }) : false;
          if (!this.objectMap[o.zone[0]]) {
            this.objectMap[o.zone[0]] = []
          }
          if (!this.objectMap[o.zone[0]][o.zone[1]]) {
            this.objectMap[o.zone[0]][o.zone[1]] = []
          }
          this.objectMap[o.zone[0]][o.zone[1]].push(o);
          if (ownItems.includes(o._id)) { return; }
          let itemId = Math.floor(seededRandom(o._id) * 20);
          console.log(itemId);
          if (itemId > 5) { return; }
          let itemRad = seededRandom(o.birthday.toString()) * Math.PI * 2;
          let itemDistance = seededRandom((o.birthday % 100).toString()) * RANDOM_ZONE_W + offset + dateOffset + sizeOffset;
          console.log(itemRad, itemDistance);
          let itemX = Math.cos(itemRad) * itemDistance;
          let itemY = Math.sin(itemRad) * itemDistance;
          let item = this.items.create(itemX, itemY, ITEM_LIST[itemId].name).setDisplaySize(OBJECT_W.S, OBJECT_W.S);
          item.fadeOut = this.tweens.create({
            targets: item,
            duration: 600,
            props: { alpha: 0 },
            onComplete: () => { item.destroy() }
          })
          item.alpha = 1;
          item.depth = 1;

          item.setData('id', o._id)
          let collider = this.physics.add.collider(this.player, item, this.itemCollideHandler);
          item.setData('collider', collider);
          item.setData('type', itemId);
          this.gameObjects.add(item);
        })
        console.log(this.objectList);
        this.objectMap.getZone = (player) => {
          return [Math.ceil(player.x / GRID_SIZE), Math.ceil(player.y / GRID_SIZE)]
        }
        this.objectMap.getNearBy = (zone) => {
          if (!zone) { return [] }
          let results = [];
          [-1, 0, 1].forEach((v1) => {
            [-1, 0, 1].forEach((v2) => {
              results.push([zone[0] + v1, zone[1] + v2])
            })
          })
          return results
        }
        this.previousZone = null;
        this.objects.updateObjects = (previousZone, currentZone) => {
          let previousZones = this.objectMap.getNearBy(previousZone);
          let currentZones = this.objectMap.getNearBy(currentZone);
          let createZones = currentZones.filter(x => !previousZones.toString().includes(x.toString()))
          let destroyZones = previousZones.filter(x => !currentZones.toString().includes(x.toString()))
          // console.log({ prev: previousZones, cur: currentZones });
          // console.log({ create: createZones, destroy: destroyZones });
          createZones.forEach((zone) => {
            // console.log(this.objectMap);
            if (!this.objectMap[zone[0]]) { return; }
            if (!this.objectMap[zone[0]][[zone[1]]]) { return; }
            let os = this.objectMap[zone[0]][zone[1]];
            os.forEach((o) => {
              // this.physics.overlapRect(o.x-o.displayWidth/2, o.y-o.displayHeight/2, o.displayWidth, o.displayHeight,true,true);
              o.instance = this.objects.create(o.x, o.y, "object" + o._id);
              // o.instance.on('addedtoscene',()=>{
              //   console.log(collidedObjects);
              // })
              // o.instance = this.physics.add.sprite(o.x,o.y,"object"+o.id);
              // console.log(this.objects);
              o.instance.depth = o.zFactor;
              o.isBackground && (o.instance.alpha = o.zFactor / 1.5);
              o.instance.setData("id", o._id);
              o.instance.setData("link", o.link);
              o.instance.setData("name", o.name.length > 0 ? o.name : '???');
              o.instance.setData("dialog", o.dialog);
              o.instance.setData("zFactor", o.zFactor);
              o.instance.setData("isBackground", o.isBackground);
              o.instance.setDisplaySize(o.displayWidth, o.displayHeight);
              o.instance.body.onOverlap = true;
              if (o.isAnimate) {
                o.instance.anims.play('spritesheet' + o._id)
              }
              if (o.dialog.length > 0) {
                let collider = this.physics.add.collider(this.player, o.instance, this.objectCollideHandler)
                o.instance.setData("collider", collider);
              }
              o.instance.refreshBody();
              this.gameObjects.add(o.instance);

            })
          })
          destroyZones.forEach((zone) => {
            if (!this.objectMap[zone[0]]) { return; }
            if (!this.objectMap[zone[0]][[zone[1]]]) { return; }
            let os = this.objectMap[zone[0]][zone[1]];
            os.forEach((o) => {
              this.objects.remove(o.instance, true, true)
            })
          })
        }

        // this.objects.updateObjects(false, [0, 0]);
        // this.previousZone = [0, 0];
        this.gameDialog = new Dialog(this);
        this.itemDialog = new ItemDialog(this);
        this.linkDialog = new LinkDialog(this);
        this.uis.add([this.gameDialog, this.itemDialog, this.linkDialog]);

        let reactMenu = document.getElementById('GAME_MENU');
        let gameInfo = document.getElementById('GAME_INFO');
        reactMenu.classList.add("show");
        this.reactComponents = [
          reactMenu, gameInfo
        ]
        const handleInput = (e) => {
          // if the click is not on the root react div, we call stopPropagation()
          let target = e.target;
          console.log(target);
          // if (target.className == "game__button-menu") {
          e.stopPropagation();
          // }
        }
        // TODO: Remove input listener after dettached
        this.reactComponents.forEach((c) => {
          c.addEventListener('mousedown', handleInput)
          c.addEventListener('touchstart', handleInput)
        })

        // TODO: Better collider for background / foreground


        this.anims.create({
          key: 'runLeft',
          frames: this.anims.generateFrameNumbers('player', { start: 8, end: 9 }),
          frameRate: 4,
          repeat: -1,
          repeatDelay: 0
        });
        this.anims.create({
          key: 'runRight',
          frames: this.anims.generateFrameNumbers('player', { start: 6, end: 7 }),
          frameRate: 4,
          repeat: -1,
          repeatDelay: 0
        });
        this.anims.create({
          key: 'runUp',
          frames: this.anims.generateFrameNumbers('player', { start: 3, end: 4 }),
          frameRate: 4,
          repeat: -1,
          repeatDelay: 0
        });
        this.anims.create({
          key: 'runDown',
          frames: this.anims.generateFrameNumbers('player', { start: 0, end: 1 }),
          frameRate: 4,
          repeat: -1,
          repeatDelay: 0
        });
        this.anims.create({
          key: 'standLeft',
          frames: [{ key: 'player', frame: 9 }],
          frameRate: 20,
          repeat: -1,
          repeatDelay: 0
        });

        this.anims.create({
          key: 'standRight',
          frames: [{ key: 'player', frame: 7 }],
          frameRate: 20,
          repeat: -1,
          repeatDelay: 0
        });
        this.anims.create({
          key: 'standUp',
          frames: [{ key: 'player', frame: 5 }],
          frameRate: 20,
          repeat: -1,
          repeatDelay: 0
        });
        this.anims.create({
          key: 'standDown',
          frames: [{ key: 'player', frame: 2 }],
          frameRate: 20,
          repeat: -1,
          repeatDelay: 0
        });
        this.player.anims.play('standRight');
        this.camera.fadeIn();
        this.camera.initAnim.play();
        this.camera.toggleZoom = () => {
          console.log('toggle');
          this.camera.zoom == ZOOM_OUT_LEVEL ?
            this.camera.zoomIn()
            : this.camera.zoomOut();
        }
        this.camera.ignore(this.uis);
        this.staticCamera.ignore(this.gameObjects);

      }

      update() {
        this.objects.children.each((o) => { o.setVelocityX(-this.player.body.velocity.x * (o.data.values.zFactor - 1)) })
        this.objects.children.each((o) => { o.setVelocityY(-this.player.body.velocity.y * (o.data.values.zFactor - 1)) })
        if (this.gameDialog.inDialog || this.itemDialog.inDialog || this.linkDialog.inDialog || !this.player.body.blocked.none) {
          this.player.stopMovement();
        } else {
          // if (
          //   Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
          //   Phaser.Input.Keyboard.JustDown(this.cursors.left) ||
          //   Phaser.Input.Keyboard.JustDown(this.cursors.down) ||
          //   Phaser.Input.Keyboard.JustDown(this.cursors.right)
          // )

          if (true) {
            let currentZone = this.objectMap.getZone(this.player)
            // console.log(currentZone,this.previousZone);
            if (!(this.previousZone && currentZone[0] == this.previousZone[0] && currentZone[1] == this.previousZone[1])) {
              this.objects.updateObjects(this.previousZone, currentZone);
              this.previousZone = currentZone;
            }
            let mousePosX = this.input.activePointer.x - WINDOW_CENTER_X;
            let mousePosY = WINDOW_CENTER_Y - this.input.activePointer.y;
            // if (this.input.activePointer.isDown && (Math.abs(mousePosX) <= PLAYER_TARGET_W * 0.5 || Math.abs(mousePosY) <= PLAYER_TARGET_H * 0.5)){
            // 	camera.toggleZoom();
            // };
            let isMouseMovement = this.input.activePointer.isDown && !this.pointerOnPlayer;
            let mouseAngle = isMouseMovement && vectorAngle([0, 1], [mousePosX, mousePosY]);
            if (this.cursors.left.isDown || this.cursors.right.isDown || this.cursors.up.isDown || this.cursors.down.isDown || isMouseMovement) {
              // camera.setZoom(1);
              this.camera.zoom == this.camera.zoomOutLevel && this.camera.zoomInAnim.play();
            }
            if ((this.cursors.left.isDown && this.cursors.up.isDown) || (isMouseMovement && mousePosX <= 0 && mouseAngle >= Math.PI * 0.125 && mouseAngle <= Math.PI * 0.375)) {
              this.player.moveX(- MOVE_SPEED * 0.75);
              this.player.moveY(- MOVE_SPEED * 0.75);
              this.gameDialog.dialogRetrigger = true;
              this.player.anims.play('runLeft', true);
            }
            else if ((this.cursors.left.isDown && this.cursors.down.isDown) || (isMouseMovement && mousePosX <= 0 && mouseAngle >= Math.PI * 0.625 && mouseAngle <= Math.PI * 0.875)) {
              this.player.moveX(- MOVE_SPEED * 0.75);
              this.player.moveY(MOVE_SPEED * 0.75);
              this.gameDialog.dialogRetrigger = true;
              this.player.anims.play('runLeft', true);
            }
            else if ((this.cursors.right.isDown && this.cursors.up.isDown) || (isMouseMovement && mousePosX > 0 && mouseAngle >= Math.PI * 0.125 && mouseAngle <= Math.PI * 0.375)) {
              this.player.moveX(MOVE_SPEED * 0.75);
              this.player.moveY(- MOVE_SPEED * 0.75);
              this.gameDialog.dialogRetrigger = true;
              this.player.anims.play('runRight', true);
            }
            else if ((this.cursors.right.isDown && this.cursors.down.isDown) || (isMouseMovement && mousePosX > 0 && mouseAngle >= Math.PI * 0.625 && mouseAngle <= Math.PI * 0.875)) {
              this.player.moveX(MOVE_SPEED * 0.75);
              this.player.moveY(MOVE_SPEED * 0.75);
              this.gameDialog.dialogRetrigger = true;
              this.player.anims.play('runRight', true);
            }
            else if ((this.cursors.left.isDown) || (isMouseMovement && mousePosX < 0 && mouseAngle >= Math.PI * 0.375 && mouseAngle <= Math.PI * 0.625)) {
              this.player.moveX(- MOVE_SPEED);
              this.player.moveY(0);
              this.gameDialog.dialogRetrigger = true;
              this.player.anims.play('runLeft', true);
            }
            else if ((this.cursors.right.isDown) || (isMouseMovement && mousePosX > 0 && mouseAngle >= Math.PI * 0.375 && mouseAngle <= Math.PI * 0.625)) {
              this.player.moveX(MOVE_SPEED);
              this.player.moveY(0);
              this.gameDialog.dialogRetrigger = true;
              this.player.anims.play('runRight', true);
            }

            else if ((this.cursors.down.isDown) || (isMouseMovement && mouseAngle >= Math.PI * 0.875)) {
              this.player.moveX(0);
              this.player.moveY(MOVE_SPEED);
              this.gameDialog.dialogRetrigger = true;
              this.player.anims.play('runDown', true);
            }

            else if ((this.cursors.up.isDown) || (isMouseMovement && mouseAngle <= Math.PI * 0.125)) {
              this.player.moveX(0);
              this.player.moveY(- MOVE_SPEED);
              this.gameDialog.dialogRetrigger = true;
              this.player.anims.play('runUp', true);
            }
            else { this.player.stopMovement(); }

          }
        }
      }
    }

    var config = {
      type: Phaser.AUTO,
      width: WINDOW_W,
      height: WINDOW_H,
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 0 },
          debug: false
        }
      },
      parent: "GAME_DIV",
      scene: [LoadingScene, MainScene],
      pixelArt: true
    };

    var game = new Phaser.Game(config);
    return (() => {
      mainScene.input.keyboard.clearCaptures();
      mainScene.scene.stop('MainScene');
    });
  }
    , []);

  return (
    <div>
      <div id="GAME_MENU" >
        <input className="game__button-menu" type="image" onClick={() => { navigate('/add') }} src={newBtnURL} />
        <input className="game__button-menu" type="image" onClick={() => { mainScene.camera.toggleZoom() }} src={mapBtnURL} />
        <input className="game__button-menu" type="image" src={bagBtnURL} />
        <input className="game__button-menu" type="image" onClick={() => { setShowInfo(!showInfo) }} src={infoBtnURL} />
      </div>
      <div id="GAME_INVENTORY"></div>
      <div id="GAME_INFO" className={showInfo ? "show" : ""}>
        <ReactMarkdown>{ReadMe.toString()}</ReactMarkdown>

      </div>
      <div id="GAME_DIV"></div>

    </div>

  )

}
export default Game;