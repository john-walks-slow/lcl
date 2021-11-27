import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
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
import boxURL from '../assets/game/box.png'
import colorURL from '../assets/game/color.png'
import dialogURL from '../assets/game/dialog.png'
import fatURL from '../assets/game/fat.png'
import whiteURL from '../assets/game/white.png'
import labelURL from '../assets/game/label.png'
import telescopeURL from '../assets/game/telescope.png'
import { useParams, useNavigate } from "react-router-dom";
import ReadMe from '../../../README.md'
import ReactMarkdown from 'react-markdown'
const Game = (props) => {

  const navigate = useNavigate();
  const WINDOW_W = window.innerWidth || document.body.clientWidth;
  const WINDOW_H = window.innerHeight || document.body.clientHeight;
  const WINDOW_CENTER_X = WINDOW_W / 2;
  const WINDOW_CENTER_Y = WINDOW_H / 2;
  const PLAYER_TARGET_W = Math.min(WINDOW_W / 9, WINDOW_H / 11 / 44 * 37);
  const PLAYER_TARGET_H = Math.min(WINDOW_W / 9, WINDOW_H / 11 / 44 * 37) / 37 * 44;
  // const PLAYER_TARGET_W = Math.min(WINDOW_W / 15, WINDOW_H / 15 / 44 * 37);
  // const PLAYER_TARGET_H = Math.min(WINDOW_W / 15, WINDOW_H / 15 / 44 * 37) / 37 * 44;
  const OBJECT_W = { XL: PLAYER_TARGET_H * 1.8, L: PLAYER_TARGET_H * 1.3, M: PLAYER_TARGET_H * 0.9, S: PLAYER_TARGET_H * 0.7, XS: PLAYER_TARGET_H * 0.4 }
  // density: target object count in a circle (r=OBJECT_M_W*8)
  const DIALOG_HEIGHT = WINDOW_H / 3.5;
  const TEXT_PADDING_W = Math.min(WINDOW_W / 15, 50);
  const TEXT_PADDING_H = Math.min(WINDOW_H / 25);
  const PADDING_BETWEEN = 10;
  const DIALOG_PADDING_W = Math.min(WINDOW_W / 20, 70);
  const DIALOG_PADDING_H = Math.min(WINDOW_W / 25, 30);
  const FONT_SIZE = Math.max(WINDOW_H / 30, WINDOW_W / 40);
  const FONT_SIZE_HEADER = FONT_SIZE * 1.2;
  // const DIALOG_HEIGHT = FONT_SIZE*2+FONT_SIZE_HEADER+TEXT_PADDING_H*3 +PADDING_BETWEEN;
  const FONT_FAMILY = "pixel"
  const FONT_FAMILY_HEADER = "pixel"
  // const TIME_DELAY = 60 * 60 * 1000;
  const TIME_DELAY = 0;
  const RANDOM_ZONE_W = OBJECT_W.M;
  var DAY_OFFSET = OBJECT_W.S;
  var DENSITY_OFFSET = OBJECT_W.M;
  var ACTIVITY_OFFSET = 1;
  const MOVE_SPEED = PLAYER_TARGET_W * 1.4;
  const ZOOM_OUT_LEVEL = 0.3;
  const GRID_SIZE = Math.max(WINDOW_H, WINDOW_W) / ZOOM_OUT_LEVEL;
  const timestamp = Date.parse(new Date());
  let mainScene;
  const [showInfo, setShowInfo] = useState();

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
        this.scene = scene;
        this.depth = 999;
        this.dialogWindow = this.scene.add.sprite(WINDOW_CENTER_X, WINDOW_H - DIALOG_HEIGHT / 2 - DIALOG_PADDING_H, "dialog").setDisplaySize(WINDOW_W - DIALOG_PADDING_W, DIALOG_HEIGHT);
        this.dialogHeader = this.scene.add.text(DIALOG_PADDING_W + TEXT_PADDING_W, WINDOW_H - DIALOG_HEIGHT - DIALOG_PADDING_H + TEXT_PADDING_H, "???",
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
          } else {
            this.dialogText.setText(this.sentences[this.dialogIndex]);
          }
        }
      }
      showDialog(dialog, name) {
        this.inDialog = true;
        // dialogWindow.on('pointerdown', () => { this.proceedDialog() });
        this.scene.input.on('pointerdown', (e) => { this.proceedDialog() });
        this.scene.input.keyboard.on('keydown-SPACE', () => { this.proceedDialog() });

        this.dialogFadeIn.play();
        this.sentences = dialog;
        this.dialogIndex = 0;
        if (name != "") { this.dialogHeader.setText(name) }
        else {
          this.dialogHeader.setText('???')
        }
        this.dialogText.setText(this.sentences[this.dialogIndex]);
        console.log(this.sentences);
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
        app.configure(restClient.fetch(window.fetch));
        app.service('objects').find({ paginate: false }).then((data) => {
          let objectList = data;
          console.log(objectList);
          this.load.image('bg', bgURL);
          this.load.image('dialog', dialogURL);
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
          objectList.forEach((o) => {
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
            console.log(objectList);
            this.scene.start("MainScene", { "objectList": objectList });
            this.scene.stop("LoadingScene");
          }, this);
          this.load.on('progress', (progress) => {
            console.log(progress);
            this.label.text = 'Now Loading ...' + ".".repeat(Math.round(progress * 15));
          })
          this.load.start();
        })
        this.add.rectangle(WINDOW_CENTER_X, WINDOW_CENTER_Y, WINDOW_W, WINDOW_H, 0x000000);
        this.label = this.add.text(30, WINDOW_CENTER_Y, 'Now Loading ...', { align: "center", color: "#FFFFFF", fontSize: Math.min(WINDOW_W / 20, 40) })
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
        this.player.depth = 1;
        this.camera.startFollow(this.player);
        this.camera.setBackgroundColor(0xFFFFFF);
        this.camera.setFollowOffset(0, -0);
        this.camera.zoomOutLevel = ZOOM_OUT_LEVEL;
        this.camera.setZoom(0.15);
        this.camera.initAnim = this.tweens.create({
          targets: this.camera,
          props: { 'zoom': 1 },
          ease: 'Cubic',       // 'Cubic', 'Elastic', 'Bounce', 'Back'
          duration: 2500,
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
        this.camera.toggleZoom = () => { }
        console.log(PLAYER_TARGET_H);
        this.objectMap = [];
        this.objects = this.physics.add.group();
        this.objects.createCallback = (o) => {
          let collidedObjects = this.physics.overlapRect(o.x - o.displayWidth / 2, o.y - o.displayHeight / 2, o.displayWidth, o.displayHeight);
          collidedObjects = collidedObjects.filter(c => c.gameObject.data.values.id != o.instance.data.values.id);
          if (collidedObjects.length>0) {
            console.log(collidedObjects);
            collidedObjects.forEach((c) => {
              this.physics.world.separate(o.instance.body, c)
            })
          }
        }
        let previousDate = timestamp;
        let offset;
        let dateOffset = 0;
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
          // (o.zFactor > 1) && (o.zFactor =1.4);
          // (o.zFactor < 1) && (o.zFactor =0.6);
          // o.zFactor = (o.zFactor == 1) ? o.zFactor - 0.1 + Math.random() * 0.2 : o.zFactor;
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
            delay: Math.random()*1000,
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
        })
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
          console.log({ prev: previousZones, cur: currentZones });
          console.log({ create: createZones, destroy: destroyZones });
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
              o.instance.body.setImmovable(true);
              o.instance.depth = o.zFactor;
              o.zFactor < 1 && (o.instance.alpha = o.zFactor / 1.5);
              o.instance.setData("id", o._id);
              o.instance.setData("name", o.name);
              o.instance.setData("dialog", o.dialog);
              o.instance.setData("zFactor", o.zFactor);
              o.instance.setData("isBackground", o.isBackground);
              o.instance.setDisplaySize(o.displayWidth, o.displayHeight);
              if (o.isAnimate) {
                o.instance.anims.play('spritesheet' + o._id)
              }
              if (o.dialog.length > 0) {
                let phy = this.physics.add.collider(this.player, o.instance, this.colliderHandler)
                console.log(phy);
                o.instance.setData("collider", phy);
              }
              setTimeout(() => {

              }, 100)
              o.instance.refreshBody();
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
        this.colliderHandler = (o1, o2) => {
          if (this.gameDialog.inDialog) { return; }
          let currentObj;
          if (o1.texture.key == "player") {
            currentObj = o2;
          }
          else {
            currentObj = o1;
          }
          if (currentObj.data.values.dialog.length > 0) {
            this.gameDialog.showDialog(currentObj.data.values.dialog, currentObj.data.values.name)
            if (currentObj.data.values.isBackground) {
              currentObj.data.values.collider.destroy();
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
          // }
        }

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
        this.camera.initAnim.play();
        this.camera.initAnim.on('complete', () => {
          this.camera.toggleZoom = () => {
            console.log('toggle');
            this.camera.zoom == 1 && this.camera.zoomOutAnim.play();
            this.camera.zoom == ZOOM_OUT_LEVEL && this.camera.zoomInAnim.play()
          }
        })

        this.player.moveX = (x) => {
          this.player.setVelocityX(x);
          this.objects.children.each((o) => { o.setVelocityX(- x * (o.data.values.zFactor - 1)) })
        }
        this.player.moveY = (y) => {
          this.player.setVelocityY(y);
          this.objects.children.each((o) => { o.setVelocityY(- y * (o.data.values.zFactor - 1)) })
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


      }

      update() {
        if (this.gameDialog.inDialog) {
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