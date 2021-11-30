import { secureStorage } from "../../utils/storage";
import Dialog from "../components/Dialog";
import ItemDialog from "../components/ItemDialog";
import LinkDialog from "../components/LinkDialog";
import GameCamera from "../components/GameCamera";
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
    console.log('init');
    this.objectList = data.objectList;
    this.gameObjectMap = data.gameObjectMap;
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
    //   this.objectList.unshift(o);
    // }
    let resizePending = false;
    if (!listener) {
      listener = window.addEventListener('resize', () => {
        // setTimeout(() => {
        this.configurations = configureScene();
        Object.assign(this, this.configurations);
        this.camera.setDisplay();
        this.gameDialog.setDisplay();
        this.linkDialog.setDisplay();
        this.itemDialog.setDisplay();
        // this.scene.restart({ objectList: this.objectList, gameObjectMap: this.gameObjectMap });
        // }, 20);
      });
    }

  }
  create() {
    this.gameObjects = this.add.layer();
    this.uis = this.add.layer();
    this.camera = new GameCamera(this);
    this.cameras.addExisting(this.camera);
    this.camera.ignore(this.uis);
    this.staticCamera = this.cameras.add();
    this.staticCamera.ignore(this.gameObjects);
    this.staticCamera.inputEnabled = false;
    this.setShowMenu(true);
    this.cursors = this.input.keyboard.createCursorKeys();
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
    this.gameObjects.add(this.player);
    this.objects = this.physics.add.group({
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
      let dialog = this.ITEM_LIST[currentObj.getData('itemId')].dialog;
      let player = secureStorage.getItem('player');
      if (
        !player.ownItems.includes(currentObj.getData('id'))
      ) {
        this.itemDialog.showDialog([dialog]);
        player[this.ITEM_LIST[currentObj.getData('itemId')].name]++;
        player.ownItems.push(currentObj.getData('id'));
        this.dispatch(this.setStorage(player));
      }
      currentObj.fadeOut.play();
      // currentObj.destroy();
      // currentObj.data.values.collider.destroy();
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
      if (currentObj.data.values.dialog.length > 0) {
        this.gameDialog.showDialog(currentObj.data.values.dialog, currentObj.data.values.name,
          () => {
            if (currentObj.getData('link').length > 0) {
              this.linkDialog.showDialog(currentObj.getData('link'));
            }
          });
        if (currentObj.data.values.isBackground || currentObj.data.values.isForeground) {
          currentObj.data.values.collider.destroy();
        } else {
          currentObj.setData("dialog", []);
        }
      }
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
              return;
            }
            // if (movedObjects.find((a) => (a[0] == o.id && a[1] == cg.id))) {
            //   return;
            // }
            let xI = cg.x < o.x ? 1 : -1;
            let yI = cg.y < o.y ? 1 : -1;
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
            movedObjects.push([cg.id, o.id]);
          });
        }
      }, 50);
    };
    this.items = this.physics.add.group({
      immovable: true
    });
    let ownItems = secureStorage.getItem('player').ownItems;

    this.previousZone = null;
    this.objectList.forEach(o => {
      o.isAnimate ? this.anims.create({
        key: 'spritesheet' + o._id,
        frames: 'object' + o._id,
        frameRate: 2,
        delay: Math.random() * 1000,
        repeat: -1,
        repeatDelay: 0
      }) : false;
    });
    this.objects.updateObjects = (previousZone, currentZone) => {
      let previousZones = this.gameObjectMap.getNearBy(previousZone);
      let currentZones = this.gameObjectMap.getNearBy(currentZone);
      let createZones = currentZones.filter(x => !previousZones.toString().includes(x.toString()));
      let destroyZones = previousZones.filter(x => !currentZones.toString().includes(x.toString()));
      // console.log({ prev: previousZones, cur: currentZones });
      // console.log({ create: createZones, destroy: destroyZones });
      createZones.forEach((zone) => {
        // console.log(this.gameObjectMap);
        if (!this.gameObjectMap[zone[0]]) { return; }
        if (!this.gameObjectMap[zone[0]][[zone[1]]]) { return; }
        let os = this.gameObjectMap[zone[0]][zone[1]];
        os.forEach((o) => {
          switch (o.type) {
            case "object":
              // this.physics.overlapRect(o.x-o.displayWidth/2, o.y-o.displayHeight/2, o.displayWidth, o.displayHeight,true,true);
              o.instance = this.objects.create(o.x, o.y, "object" + o._id);
              // o.instance.on('addedtoscene',()=>{
              //   console.log(collidedObjects);
              // })
              // o.instance = this.physics.add.sprite(o.x,o.y,"object"+o.id);
              // console.log(this.objects);
              o.instance.depth = o.zFactor;
              (o.isBackground || o.isForeground) && (o.instance.alpha = o.zFactor / 1.5);
              o.instance.setData("id", o._id);
              o.instance.setData("link", o.link);
              o.instance.setData("name", o.name.length > 0 ? o.name : '???');
              o.instance.setData("dialog", o.dialog);
              o.instance.setData("zFactor", o.zFactor);
              o.instance.setData("isBackground", o.isBackground);
              o.instance.setData("isForeground", o.isForeground);
              o.instance.setDisplaySize(o.displayWidth, o.displayHeight);
              o.instance.body.onOverlap = true;
              if (o.isAnimate) {
                o.instance.anims.play('spritesheet' + o._id);
              }
              if (o.dialog.length > 0) {
                let collider = this.physics.add.collider(this.player, o.instance, this.objectCollideHandler);
                o.instance.setData("collider", collider);
              }
              o.instance.refreshBody();
              this.gameObjects.add(o.instance);
              break;
            case "item":
              o.instance = this.items.create(o.x, o.y, this.ITEM_LIST[o.itemId].name).setDisplaySize(this.OBJECT_W.S, this.OBJECT_W.S);
              o.instance.fadeOut = this.tweens.create({
                targets: o.instance,
                duration: 600,
                props: { alpha: 0 },
                onComplete: () => { o.instance.destroy(); }
              });
              o.instance.alpha = 1;
              o.instance.depth = 1;
              o.instance.setData('id', o._id);
              let collider = this.physics.add.collider(this.player, o.instance, this.itemCollideHandler);
              o.instance.setData('collider', collider);
              o.instance.setData('itemId', o.itemId);
              this.gameObjects.add(o.instance);
              break;
            default:
              break;
          }
        });
      });
      destroyZones.forEach((zone) => {
        if (!this.gameObjectMap[zone[0]]) { return; }
        if (!this.gameObjectMap[zone[0]][[zone[1]]]) { return; }
        let os = this.gameObjectMap[zone[0]][zone[1]];
        os.forEach((o) => {
          switch (o.type) {
            case "object":
              this.objects.remove(o.instance, true, true);
              break;
            case "item":
              if (o.instance.active) {
                this.items.remove(o.instance, true, true);
              }
              break;
            default:
              break;
          }
        });
      });
    };

    // this.objects.updateObjects(false, [0, 0]);
    // this.previousZone = [0, 0];
    this.gameDialog = new Dialog(this);
    this.itemDialog = new ItemDialog(this);
    this.linkDialog = new LinkDialog(this);
    this.uis.add([this.gameDialog, this.itemDialog, this.linkDialog]);

    let reactMenu = document.getElementById('GAME_MENU');
    let gameInfo = document.getElementById('GAME_INFO');
    let gameInventory = document.getElementById('GAME_INVENTORY');
    let gameButtons = document.getElementsByClassName('game__button-menu');
    this.reactComponents = [
      reactMenu, gameInfo, gameInventory, ...gameButtons
    ];
    const handleInput = (e) => {
      // if the click is not on the root react div, we call stopPropagation()
      if (e.target == e.currentTarget) {
        // if (target.className == "game__button-menu") {
        e.stopPropagation();
      }
      // }
    };
    // TODO: Remove input listener after dettached
    this.reactComponents.forEach((c) => {
      c.addEventListener('mousedown', handleInput);
      c.addEventListener('touchstart', handleInput);
    });

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



  }

  update() {

    // console.log(this.player.body);
    let notTouching = this.player.body.touching.none;
    let velocityX = notTouching ? this.player.body.velocity.x : 0;
    let velocityY = notTouching ? this.player.body.velocity.y : 0;
    this.objects.children.each((o) => { o.setVelocityX(-velocityX * (o.data.values.zFactor - 1)); });
    this.objects.children.each((o) => { o.setVelocityY(-velocityY * (o.data.values.zFactor - 1)); });
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
        let currentZone = this.gameObjectMap.getZone(this.player);
        // console.log(currentZone,this.previousZone);
        if (!(this.previousZone && currentZone[0] == this.previousZone[0] && currentZone[1] == this.previousZone[1])) {
          this.objects.updateObjects(this.previousZone, currentZone);
          this.previousZone = currentZone;
        }
        let mousePosX = this.input.activePointer.x - this.WINDOW_CENTER_X;
        let mousePosY = this.WINDOW_CENTER_Y - this.input.activePointer.y;
        // if (this.input.activePointer.isDown && (Math.abs(mousePosX) <= PLAYER_TARGET_W * 0.5 || Math.abs(mousePosY) <= this.PLAYER_TARGET_H * 0.5)){
        // 	camera.toggleZoom();
        // };
        let isMouseMovement = this.input.activePointer.isDown && !this.pointerOnPlayer;
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

}
