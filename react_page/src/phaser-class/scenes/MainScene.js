import MS from 'teoria';
import * as Tone from 'tone';
import { range } from '../../utils/utils';
import { customIntRandom, customWRandom, seededRandom, seededRandomKept } from "../../utils/random";
import { secureStorage } from "../../utils/storage";
import Dialog from "../components/Dialog";
import GameCamera from "../components/GameCamera";
import GamePad from "../components/GamePad";
import ItemDialog from "../components/ItemDialog";
import LinkDialog from "../components/LinkDialog";
import configureScene from "../game.config";

let listener = false;



function vectorAngle(x, y) {
  let mX = Math.sqrt(x.reduce((acc, n) => acc + Math.pow(n, 2), 0));
  let mY = Math.sqrt(y.reduce((acc, n) => acc + Math.pow(n, 2), 0));
  return Math.acos(x.reduce((acc, n, i) => acc + n * y[i], 0) / (mX * mY));
};

export default class MainScene extends Phaser.Scene {
  constructor(configurations, methods) {
    super({
      key: 'MainScene', active: false,
    });
    Object.assign(this, configurations, methods);
    this.configurations = configurations;
    console.log(this);
    this.player;
    this.objectGroup;
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
    console.log('init');
    this.objectData = data.objectData;
    console.log(this.objectData);
    // if (data.newObject) {
    //   let o = data.newObject;
    //   switch (o.isAnimate) {
    //     case true:
    //       var shardsImg = new Image();
    //       shardsImg.onload = () => {
    //         this.textures.addSpriteSheet("object" + o._id, shardsImg, { frameWidth: o.columns, frameHeight: o.rows });
    //       };
    //       shardsImg.src = o.blobURI;
    //       // this.load.spritesheet("object" + o._id, 'assets/objects/' + o._id + '.png', { frameWidth: o.columns, frameHeight: o.rows });
    //       break;
    //     default:
    //       this.textures.addBase64("object" + o._id, o.blobURI);
    //       // this.load.image("object" + o._id, 'assets/objects/' + o._id + '.png')
    //       break;
    //   }
    //   this.objectData.list.unshift(o);
    // }
    let resizePending = false;
    if (!listener) {
      listener = window.addEventListener('resize', () => {
        // setTimeout(() => {
        this.configurations = configureScene();
        Object.assign(this, this.configurations);
        console.log(this.WINDOW_W, this.WINDOW_H);
        this.camera.setDisplay();
        this.gameDialog.setDisplay();
        this.linkDialog.setDisplay();
        this.itemDialog.setDisplay();
        this.gamepad.setDisplay();
        // this.scene.restart({ list: this.objectData.list, map: this.objectData.map });
        // }, 20);
      });
    }

  }
  create() {
    // console.log(this.input.activePointer);
    this.gameObjectsLayer = this.add.layer();
    this.uiLayer = this.add.layer();
    this.camera = new GameCamera(this);
    this.cameras.addExisting(this.camera, true);
    this.camera.ignore(this.uiLayer);
    this.staticCamera = this.cameras.add();
    this.staticCamera.ignore(this.gameObjectsLayer);
    this.staticCamera.inputEnabled = false;
    this.setShowMenu(true);
    this.cursors = this.input.keyboard.createCursorKeys();
    this.mainSceneHook(this);
    // this.add.tileSprite(this.WINDOW_CENTER_X, this.WINDOW_CENTER_Y,WINDOW_W,WINDOW_H,'bg');
    // this.add.rectangle(this.WINDOW_CENTER_X, this.WINDOW_CENTER_Y, WINDOW_W, WINDOW_H, 0xFFFFFF);
    this.player = this.physics.add.sprite(this.startPosX, this.startPosY, 'player')
      .setDisplaySize(this.PLAYER_TARGET_W, this.PLAYER_TARGET_H);
    // .refreshBody();

    this.player.depth = 0.9;
    this.player.moveX = (x) => {
      this.player.setVelocityX(x);
    };
    this.player.moveY = (y) => {
      this.player.setVelocityY(y);
    };
    this.player.stopMovement = () => {
      if (this.player.anims.getName() == "runLeft") {
        this.player.anims.play('standLeft', true);
      }
      if (this.player.anims.getName() == "runRight") {
        this.player.anims.play('standRight', true);
      }
      if (this.player.anims.getName() == "runUp") {
        this.player.anims.play('standUp', true);
      }
      if (this.player.anims.getName() == "runDown") {
        this.player.anims.play('standDown', true);
      }
      this.player.moveX(0);
      this.player.moveY(0);
    };

    // this.player.setInteractive();
    // this.player.on('pointerover', () => { console.log('over'); this.pointerOnPlayer = true; });
    // this.player.on('pointerout', () => { console.log('out'); this.pointerOnPlayer = false; });
    this.camera.startFollow(this.player);
    this.gameObjectsLayer.add(this.player);
    this.objectGroup = this.physics.add.group({
      pushable: false
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
      let dialog = this.ITEM_LIST[currentObj.itemId].dialog;
      let player = secureStorage.getItem('player');
      if (
        !player.ownItems.includes(currentObj._id)
      ) {
        this.itemDialog.showDialog([dialog]);
        player[this.ITEM_LIST[currentObj.itemId].name]++;
        player.ownItems.push(currentObj._id);
        this.dispatch(this.setStorage(player));
      }
      currentObj.fadeOut.play();
      // currentObj.destroy();
      // currentObj.collider.destroy();
      // currentObj.alpha=0;

    };
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
      if (currentObj.oData.dialog.length > 0) {
        this.gameDialog.showDialog(currentObj.oData.dialog, currentObj.oData.name,
          () => {
            if (currentObj.oData.link.length > 0) {
              this.linkDialog.showDialog(currentObj.oData.link);
            }
          });
        if (currentObj.oData.isBackground || currentObj.oData.isForeground) {
          currentObj.collider.destroy();
        } else {
          currentObj.oData.dialog = [];
        }
      };
      this.physics.collide(o1, o2);
      // let xOverlap = this.player.displayWidth / 2 + currentObj.displayWidth / 2 - Math.abs(this.player.x - currentObj.x);
      // let yOverlap = this.player.displayHeight / 2 + currentObj.displayHeight / 2 - Math.abs(this.player.y - currentObj.y);
      // // console.log(xOverlap, yOverlap);
      // if (xOverlap < 0 || yOverlap < 0) {
      //   // return;
      // }
      // if (xOverlap < yOverlap && this.player.x < currentObj.x) {
      //   this.player.setX(this.player.x + -0.1);
      //   // console.log('left');
      // }
      // if (xOverlap < yOverlap && this.player.x > currentObj.x) {
      //   this.player.setX(this.player.x - -0.1);
      //   // console.log('right');
      // }
      // if (xOverlap > yOverlap && this.player.y < currentObj.y) {
      //   this.player.setY(this.player.y + -0.1);
      //   // console.log('up');
      // }
      // if (xOverlap > yOverlap && this.player.y > currentObj.y) {
      //   this.player.setY(this.player.y - -0.1);
      //   // console.log('down');
      // }
    };

    let movedObjects = [];
    this.objectGroup.createCallback = (o) => {
      setTimeout(() => {
        // console.log(o.body.touching);
        // if (o.body.overlapX != 0 || o.body.overlapY != 0) {
        //   o.x -= o.body.overlapX / 2;
        //   o.y -= o.body.overlapY / 2;
        // }
        if (o.oData.isBackground) { return; }
        let collidedObjects = this.physics.overlapRect(o.x - o.displayWidth / 2, o.y - o.displayHeight / 2, o.displayWidth, o.displayHeight).filter(o => o.oData);
        if (collidedObjects.length > 0) {
          collidedObjects.forEach((c) => {
            // this.physics.collide(c, o);
            let cg = c.gameObject;
            console.log(cg, o);
            if (cg.oData._id == o.oData._id) {
              return;
            }
            if (cg.oData.isBackground) {
              return;
            }
            // if (movedObjects.find((a) => (a[0] == o.id && a[1] == cg.id))) {
            //   return;
            // }
            if (cg.x < o.x) {
              cg.x -= (cg.displayWidth - Math.abs(o.x - cg.x)) * 1.1;
            } else {
              o.x += (o.displayWidth - Math.abs(o.x - cg.x)) * 1.1;
            }
            if (cg.y < o.y) {
              cg.y -= (cg.displayHeight - Math.abs(o.y - cg.y)) * 1.1;
            } else {
              o.y += (o.displayHeight - Math.abs(o.y - cg.y)) * 1.1;
            }
            // movedObjects.push([cg.id, o.id]);
          });
        }
      }, 50);
    };
    this.itemGroup = this.physics.add.group({
      immovable: true
    });
    let ownItems = secureStorage.getItem('player').ownItems;

    this.previousZone = null;
    this.objectData.list.forEach(o => {
      o.isAnimate ? this.anims.create({
        key: 'spritesheet' + o._id,
        frames: 'object' + o._id,
        frameRate: 2,
        delay: Math.random() * 1000,
        repeat: -1,
        repeatDelay: 0
      }) : false;
    });
    this.objectGroup.initSound = () => {
      let createZones = this.objectData.map.getZone(this.player);
      // console.log({ prev: previousZones, cur: currentZones });
      // console.log({ create: createZones, destroy: destroyZones });
      createZones.forEach((zone) => {
        // console.log(this.objectData.map);
        if (!this.objectData.map[zone[0]]) { return; }
        if (!this.objectData.map[zone[0]][[zone[1]]]) { return; }
        let os = this.objectData.map[zone[0]][zone[1]];
        os.forEach((o) => {
          switch (o.type) {
            case "object":
              console.log(o);
              // this.physics.overlapRect(o.x-o.displayWidth/2, o.y-o.displayHeight/2, o.displayWidth, o.displayHeight,true,true);
              if (o.loop) {
                o.loop.start(o.startDelay + Tone.now());
              }
              break;
          }
        });
      });
    };
    this.objectGroup.updateObjects = (previousZone, currentZone) => {
      let previousZones = this.objectData.map.getNearBy(previousZone);
      let currentZones = this.objectData.map.getNearBy(currentZone);
      let createZones = currentZones.filter(x => !previousZones.toString().includes(x.toString()));
      let destroyZones = previousZones.filter(x => !currentZones.toString().includes(x.toString()));
      // console.log({ prev: previousZones, cur: currentZones });
      // console.log({ create: createZones, destroy: destroyZones });
      createZones.forEach((zone) => {
        // console.log(this.objectData.map);
        if (!this.objectData.map[zone[0]]) { return; }
        if (!this.objectData.map[zone[0]][[zone[1]]]) { return; }
        let os = this.objectData.map[zone[0]][zone[1]];
        os.forEach((o) => {
          switch (o.type) {
            case "object":
              // this.physics.overlapRect(o.x-o.displayWidth/2, o.y-o.displayHeight/2, o.displayWidth, o.displayHeight,true,true);
              o.instance = this.objectGroup.create(o.x, o.y, "object" + o._id);
              // o.instance.on('addedtoscene',()=>{
              //   console.log(collidedObjects);
              // })
              // o.instance = this.physics.add.sprite(o.x,o.y,"object"+o.id);
              // console.log(this.objectGroup);
              o.instance.depth = o.zFactor;
              (o.isBackground || o.isForeground) && (o.instance.alpha = o.zFactor / 1.5);
              o.instance.oData = o;
              o.instance.setDisplaySize(o.displayWidth, o.displayHeight);
              o.instance.body.onOverlap = true;
              if (o.isAnimate) {
                o.instance.anims.play('spritesheet' + o._id);
              }
              // if (o.dialog.length > 0) {
              let collider = this.physics.add.collider(this.player, o.instance, this.objectCollideHandler);
              o.instance.collider = collider;
              //  }
              o.instance.refreshBody();
              this.gameObjectsLayer.add(o.instance);
              if (o.loop) {
                o.loop.start(o.startDelay + Tone.now());
              }
              break;
            case "item":
              o.instance = this.itemGroup.create(o.x, o.y, this.ITEM_LIST[o.itemId].name).setDisplaySize(this.OBJECT_W.S, this.OBJECT_W.S);
              o.instance.fadeOut = this.tweens.create({
                targets: o.instance,
                duration: 600,
                props: { alpha: 0 },
                onComplete: () => { o.instance.destroy(); }
              });
              o.instance.alpha = 1;
              o.instance.depth = 1;
              o.instance._id = o._id;
              let itemCollider = this.physics.add.collider(this.player, o.instance, this.itemCollideHandler);
              o.instance.collider = itemCollider;
              o.instance.itemId = o.itemId;
              this.gameObjectsLayer.add(o.instance);
              break;
            default:
              break;
          }
        });
      });
      destroyZones.forEach((zone) => {
        if (!this.objectData.map[zone[0]]) { return; }
        if (!this.objectData.map[zone[0]][[zone[1]]]) { return; }
        let os = this.objectData.map[zone[0]][zone[1]];
        os.forEach((o) => {
          switch (o.type) {
            case "object":
              this.objectGroup.remove(o.instance, true, true);
              if (o.loop) {
                o.loop.stop();
              }
              break;
            case "item":
              if (o.instance.active) {
                this.itemGroup.remove(o.instance, true, true);
              }
              break;
            default:
              break;
          }
        });
      });
      // let seeds = [...Array(Object.keys(FILTER_LIST).length * 2)].map((o, i) => (Math.round(seededRandom(((i + 1) * currentZone[0] * this.day + currentZone[1]).toString()) * 10)) / 10);
      // let RESULT_LIST = Object.assign({}, FILTER_LIST);
      // this.filter = (x, y) => {
      //   let result = "";
      //   let i = 0;
      //   for (const [key, { min, max, unit, probability }] of Object.entries(FILTER_LIST)) {
      //     seeds[i] < probability && (
      //       result += `${key}(${min + (max - min) * Math.min(seeds[i] * Math.abs(x) / this.MOVE_SPEED / 20, 1)}${unit}) `);
      //     i++;
      //     RESULT_LIST[key] = false;
      //   };
      //   i = 0;
      //   for (const [key, { min, max, unit, probability }] of Object.entries(FILTER_LIST)) {
      //     if (!RESULT_LIST[key]) { continue; }
      //     seeds[i] < probability && (
      //       result += `${key}(${min + (max - min) * Math.min(seeds[i] * Math.abs(y) / this.MOVE_SPEED / 20, 1)}${unit}) `);
      //     i++;

      //   };
      //   return `${result}`;
      // };
    };

    // this.objectGroup.updateObjects(false, [0, 0]);
    // this.previousZone = [0, 0];
    this.gameDialog = new Dialog(this);
    this.itemDialog = new ItemDialog(this);
    this.linkDialog = new LinkDialog(this);
    this.uiLayer.add([this.gameDialog, this.itemDialog, this.linkDialog]);

    let reactMenu = document.getElementById('GAME_MENU');
    let gameInfo = document.getElementById('GAME_INFO');
    let gameInventory = document.getElementById('GAME_INVENTORY');
    let gameButtons = document.getElementsByClassName('game__button-menu');
    this.reactComponents = [
      reactMenu, gameInfo, gameInventory, ...gameButtons
    ];
    const handleInput = (e) => {
      // if the click is not on the root react div, we call stopPropagation()
      if (e.target.tagName != "canvas") {
        // if (target.className == "game__button-menu") {
        e.stopPropagation();
      }
      // }
    };
    this.reactComponents.forEach((c) => {
      c.addEventListener('mousedown', handleInput);
      c.addEventListener('touchstart', handleInput);
    });


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
    this.gamepad = new GamePad(this);
    this.uiLayer.add(this.gamepad);
    this.filterUsed = seededRandom(this.day.toString());
    console.log(this.day);
    const FILTER_LIST = {
      'brightness': { min: 1, max: 0.3, unit: '', probability: 0.3 },
      'contrast': { min: 0.3, max: 1, unit: '', probability: 0.3 },
      "hue-rotate": { min: 0, max: 360, unit: 'deg', probability: 0.3 },
      'invert': { min: 0, max: 1, unit: '', probability: 0.3 },
      'sepia': { min: 0, max: 1, unit: '', probability: 0.3 },
    };
    let seeds = [...Array(Object.keys(FILTER_LIST).length * 2)].map((o, i) => (Math.round(seededRandom(((i + 1) * this.day).toString()) * 10)) / 10);
    let RESULT_LIST = Object.assign({}, FILTER_LIST);
    this.filter = (x, y) => {
      let result = "";
      let i = 0;
      for (const [key, { min, max, unit, probability }] of Object.entries(FILTER_LIST)) {
        seeds[i] < probability && (
          result += `${key}(${min + (max - min) * Math.min(seeds[i] * Math.abs(x) / this.MOVE_SPEED / 5, 1)}${unit}) `);
        i++;
        RESULT_LIST[key] = false;
      };
      i = 0;
      for (const [key, { min, max, unit, probability }] of Object.entries(FILTER_LIST)) {
        if (!RESULT_LIST[key]) { continue; }
        seeds[i] < probability && (
          result += `${key}(${min + (max - min) * Math.min(seeds[i] * Math.abs(y) / this.MOVE_SPEED / 5, 1)}${unit}) `);
        i++;

      };
      return `${result}`;
    };

    // this.grayscalePipeline = new Phaser.Renderer.WebGL.Pipelines.PostFXPipeline({
    //   name: "grayscale",
    //   game: this.game,
    //   fragShader: `
    // precision mediump float;
    // uniform sampler2D uMainSampler;
    // varying vec2 outTexCoord;
    // void main(void) {
    // vec4 color = texture2D(uMainSampler, outTexCoord);
    // float gray = dot(color.rgb, vec3(0.299, 0.587, 0.114));
    // gl_FragColor = vec4(vec3(gray), 1.0);
    // }`});
    // this.game.renderer.pipelines.add('grayscale', this.grayscalePipeline);
    // this.camera.setPostPipeline(this.grayscalePipeline);

    // this.Vignette = this.game.renderer.addPipeline('Vignette', new VignetteClass(this.game));
    // this.applyPipeline();

    // this.game.canvas.style.filter = "opacity(0.7) saturate(1.1) sepia(0.2) brightness(0.98) contrast(1.1)";
    // console.log(this.filter(1000, 1000));

    // import Tone from 'Tone';
    // import * as teoria from 'teoria';

    this.bgm();
  }
  updateSound() {
    this.objectGroup.children.each((o) => {
      if (!o.oData.synth) { return; }
      // let width = Phaser.Math.Angle.WrapDegrees(Phaser.Math.Angle.BetweenPoints(this.player, o)) / 180;
      // let distance = Phaser.Math.Distance.BetweenPoints(o, this.player);
      // console.log('width:' + width);
      // console.log('distance:' + distance);
      // o.oData.synth.set({
      //   volume: 0,
      //   width: width
      // });
      let positionX = o.x - this.player.x;
      let positionY = this.player.y - o.y;
      o.oData.panner.set({
        positionX,
        positionY
      });
      o.oData.panner.distance = (positionX ** 2 + positionY ** 2) ** 0.5;
      o.oData.panner.audible = o.oData.panner.distance < o.oData.panner.maxDistance;
    });
  }
  update() {
    this.updateSound();
    // console.log(this.input.activePointer.x, this.input.activePointer.y);
    // console.log(this.gamepad.padX, this.gamepad.padY);

    // this.game.canvas.style.filter = this.filter(this.player.x, this.player.y);
    // console.log(this.filter(this.player.x, this.player.y));
    // console.log(this.player.body);

    let notTouching = this.player.body.touching.none;
    let velocityX = notTouching ? this.player.body.velocity.x : 0;
    let velocityY = notTouching ? this.player.body.velocity.y : 0;
    this.objectGroup.children.each((o) => {
      o.setVelocityX(-velocityX * (o.oData.zFactor - 1));
      o.setVelocityY(-velocityY * (o.oData.zFactor - 1));
    });
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
        let currentZone = this.objectData.map.getZone(this.player);
        // console.log(currentZone,this.previousZone);
        if (!(this.previousZone && currentZone[0] == this.previousZone[0] && currentZone[1] == this.previousZone[1])) {
          this.objectGroup.updateObjects(this.previousZone, currentZone);

          this.previousZone = currentZone;
        }
        let mousePosX;
        let mousePosY;
        let isMouseMovement;

        if (this.isMobile) {
          mousePosX = this.gamepad.padX;
          mousePosY = this.gamepad.padY;
          // console.log(mousePosX, mousePosY);
          // if (this.input.activePointer.isDown && (Math.abs(mousePosX) <= PLAYER_TARGET_W * 0.5 || Math.abs(mousePosY) <= this.PLAYER_TARGET_H * 0.5)){
          // 	camera.toggleZoom();
          // };
          isMouseMovement = mousePosX && mousePosY;
        } else {

          mousePosX = this.input.activePointer.x - this.WINDOW_CENTER_X;
          mousePosY = this.WINDOW_CENTER_Y - this.input.activePointer.y;
          isMouseMovement = this.input.activePointer.isDown && !this.pointerOnPlayer;
        }

        let mouseAngle = isMouseMovement && vectorAngle([0, 1], [mousePosX, mousePosY]);
        if (this.cursors.left.isDown || this.cursors.right.isDown || this.cursors.up.isDown || this.cursors.down.isDown || isMouseMovement) {
          // camera.setZoom(1);
          this.camera.zoom == this.ZOOM_OUT_LEVEL && this.camera.zoomInAnim.play();
        }
        if ((this.cursors.left.isDown && this.cursors.up.isDown) || (isMouseMovement && mousePosX <= 0 && mouseAngle >= Math.PI * 0.125 && mouseAngle <= Math.PI * 0.375)) {
          this.player.moveX(- this.OBLIQUE_MOVE_SPEED);
          this.player.moveY(- this.OBLIQUE_MOVE_SPEED);
          this.gameDialog.dialogRetrigger = true;
          this.player.anims.play('runLeft', true);
        }
        else if ((this.cursors.left.isDown && this.cursors.down.isDown) || (isMouseMovement && mousePosX <= 0 && mouseAngle >= Math.PI * 0.625 && mouseAngle <= Math.PI * 0.875)) {
          this.player.moveX(- this.OBLIQUE_MOVE_SPEED);
          this.player.moveY(this.OBLIQUE_MOVE_SPEED);
          this.gameDialog.dialogRetrigger = true;
          this.player.anims.play('runLeft', true);
        }
        else if ((this.cursors.right.isDown && this.cursors.up.isDown) || (isMouseMovement && mousePosX > 0 && mouseAngle >= Math.PI * 0.125 && mouseAngle <= Math.PI * 0.375)) {
          this.player.moveX(this.OBLIQUE_MOVE_SPEED);
          this.player.moveY(- this.OBLIQUE_MOVE_SPEED);
          this.gameDialog.dialogRetrigger = true;
          this.player.anims.play('runRight', true);
        }
        else if ((this.cursors.right.isDown && this.cursors.down.isDown) || (isMouseMovement && mousePosX > 0 && mouseAngle >= Math.PI * 0.625 && mouseAngle <= Math.PI * 0.875)) {
          this.player.moveX(this.OBLIQUE_MOVE_SPEED);
          this.player.moveY(this.OBLIQUE_MOVE_SPEED);
          this.gameDialog.dialogRetrigger = true;
          this.player.anims.play('runRight', true);
        }
        else if ((this.cursors.left.isDown) || (isMouseMovement && mousePosX < 0 && mouseAngle >= Math.PI * 0.375 && mouseAngle <= Math.PI * 0.625)) {
          this.player.moveX(- this.MOVE_SPEED);
          this.player.moveY(0);
          this.gameDialog.dialogRetrigger = true;
          this.player.anims.play('runLeft', true);
        }
        else if ((this.cursors.right.isDown) || (isMouseMovement && mousePosX > 0 && mouseAngle >= Math.PI * 0.375 && mouseAngle <= Math.PI * 0.625)) {
          this.player.moveX(this.MOVE_SPEED);
          this.player.moveY(0);
          this.gameDialog.dialogRetrigger = true;
          this.player.anims.play('runRight', true);
        }

        else if ((this.cursors.down.isDown) || (isMouseMovement && mouseAngle >= Math.PI * 0.875)) {
          this.player.moveX(0);
          this.player.moveY(this.MOVE_SPEED);
          this.gameDialog.dialogRetrigger = true;
          this.player.anims.play('runDown', true);
        }

        else if ((this.cursors.up.isDown) || (isMouseMovement && mouseAngle <= Math.PI * 0.125)) {
          this.player.moveX(0);
          this.player.moveY(- this.MOVE_SPEED);
          this.gameDialog.dialogRetrigger = true;
          this.player.anims.play('runUp', true);
        }
        else { this.player.stopMovement(); }

      }
    }
  }
  bgm() {


    const start = () => {
      // setup();
      // this.objectGroup.initSound();
      // set this context as the global Context
      Tone.start();
      Tone.getTransport().bpm.value = 35;
      Tone.getTransport().start();
      // setInterval(this.updateSound.bind(this), 300);
      document.removeEventListener('click', start);
      document.removeEventListener('touchend', start);
      document.removeEventListener('keydown', start);
    };
    if (Tone.context.state === "running") {
      // if (true) {
      start();
    } else {
      let clickListener = document.addEventListener('click', start);
      let touchListener = document.addEventListener('touchend', start);
      let keyListener = document.addEventListener('keydown', start);
    }
    // document.querySelector('button')
    //   .addEventListener('click', async () => {
    //     await Tone.start();
    //   });;
  }
}
