import MS from 'teoria'
import * as Tone from 'tone'
import { range } from '../../utils/utils'
import { customIntRandom, customWRandom, seededRandom, seededRandomKept } from '../../utils/random'
import { secureStorage } from '../../utils/storage'
import Dialog from '../components/Dialog'
import GameCamera from '../components/GameCamera'
import GamePad from '../components/GamePad'
import ItemDialog from '../components/ItemDialog'
import LinkDialog from '../components/LinkDialog'
import configurations from '../configurations'
import ObjectGroup from '../ObjectGroup'
import generativeMusic from '../GenerativeMusic'
import GenerativeMusic from '../GenerativeMusic'

let listener = false

function vectorAngle(x, y) {
  let mX = Math.sqrt(x.reduce((acc, n) => acc + Math.pow(n, 2), 0))
  let mY = Math.sqrt(y.reduce((acc, n) => acc + Math.pow(n, 2), 0))
  return Math.acos(x.reduce((acc, n, i) => acc + n * y[i], 0) / (mX * mY))
}

export default class MainScene extends Phaser.Scene {
  constructor(methods) {
    super({
      key: 'MainScene',
      active: false,
    })

    Object.assign(this, methods)
  }
  preload() {}
  init(data) {
    console.log('init')
    this.objectData = data.objectData
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
    window.addEventListener('resize', () => {
      this.setDisplay()
    })
  }
  setDisplay() {
    configurations.updateConfigurations()
    this.camera.setDisplay()
    this.gameDialog.setDisplay()
    this.linkDialog.setDisplay()
    this.itemDialog.setDisplay()
    this.gamepad.setDisplay()
  }
  create() {
    // this.location.setText()
    console.log('create')
    // console.log(this.input.activePointer);
    this.startPosX = 0
    this.startPosY = 0
    this.pointerOnPlayer = false
    this.objectGroup = new ObjectGroup(this)
    this.gameObjectsLayer = this.add.layer()
    this.gameObjectsLayer.depth = 0
    this.uiLayer = this.add.layer()
    this.uiLayer.depth = 100
    this.cameras.remove(this.cameras.main)
    this.camera = new GameCamera(this)
    this.cameras.addExisting(this.camera, false)
    this.camera.ignore(this.uiLayer)
    this.staticCamera = this.cameras.add()
    this.staticCamera.ignore(this.gameObjectsLayer)
    // this.staticCamera.inputEnabled = false;
    this.cursors = this.input.keyboard.createCursorKeys()
    this.updateUIMethod(this)
    this.location = this.add.text(15, 15, '', {
      color: 0xffffff,
      fontFamily: 'pixelJP',
    })
    setTimeout(() => {
      this.location.setText('...')
    }, 100)
    this.location.updateLocation = () => {
      this.location.rad =
        Math.round(Phaser.Math.Angle.Between(0, 0, this.player.x, this.player.y) * 100) / 100
      this.location.distance =
        Math.round(
          ((this.objectData.zeroDistance ** (1 / configurations.DENSITY_FACTOR) -
            Phaser.Math.Distance.Between(0, 0, this.player.x, this.player.y) **
              (1 / configurations.DENSITY_FACTOR)) /
            5000) *
            10
        ) / 10
      this.location.setText(`(${this.location.rad}, ${this.location.distance})`)
    }
    this.uiLayer.add(this.location)
    // this.add.tileSprite(configurations.WINDOW_CENTER_X, configurations.WINDOW_CENTER_Y,WINDOW_W,WINDOW_H,'bg');
    // this.add.rectangle(configurations.WINDOW_CENTER_X, configurations.WINDOW_CENTER_Y, WINDOW_W, WINDOW_H, 0xFFFFFF);
    this.player = this.physics.add
      .sprite(this.startPosX, this.startPosY, 'player')
      .setDisplaySize(configurations.PLAYER_TARGET_W, configurations.PLAYER_TARGET_H)
    // .refreshBody();

    this.player.depth = 0.9
    this.player.move = (x, y) => {
      this.player.setVelocity(x, y)
    }
    this.player.moveX = x => {
      this.player.setVelocityX(x)
    }
    this.player.moveY = y => {
      this.player.setVelocityY(y)
    }
    // let flow = [
    //   -1 + configurations.DAY.intRandom(0, 1) * configurations.DAY.intRandom(1, 6),
    //   -1 + configurations.DAY.intRandom(0, 1) * configurations.DAY.intRandom(1, 6),
    // ]
    this.player.stopMovement = () => {
      if (this.player.anims.getName() == 'runLeft') {
        this.player.anims.play('standLeft', true)
      }
      if (this.player.anims.getName() == 'runRight') {
        this.player.anims.play('standRight', true)
      }
      if (this.player.anims.getName() == 'runUp') {
        this.player.anims.play('standUp', true)
      }
      if (this.player.anims.getName() == 'runDown') {
        this.player.anims.play('standDown', true)
      }
      this.player.move(0, 0)
      if (configurations.DEV_MODE) {
        this.player.move(configurations.DAY.flow[0] * 3, configurations.DAY.flow[1] * 3)
      }
    }

    this.player.setInteractive()
    this.player.on('pointerover', () => {
      this.pointerOnPlayer = true
    })
    this.player.on('pointerout', () => {
      this.pointerOnPlayer = false
    })
    this.camera.startFollow(this.player, false)
    this.gameObjectsLayer.add(this.player)

    this.itemCollideHandler = (o1, o2) => {
      // console.log(this.player.body.velocity);
      // this.player.stopMovement();
      if (this.gameDialog.inDialog || this.itemDialog.inDialog) {
        return
      }
      let currentObj
      if (o1.texture.key == 'player') {
        currentObj = o2
      } else {
        currentObj = o1
      }
      let dialog = configurations.ITEM_LIST[currentObj.itemId].dialog
      let player = secureStorage.getItem('player')
      if (!player.ownItems.includes(currentObj._id)) {
        if (configurations.SETTINGS.quiet || this.camera.state == 'zoomOut') {
        } else {
          this.itemDialog.showDialog([dialog])
        }
        player[configurations.ITEM_LIST[currentObj.itemId].name]++
        player.ownItems.push(currentObj._id)
        this.dispatch(this.setStorage(player))
      }
      console.log(currentObj)
      currentObj.fadeOut.play()
      // currentObj.destroy();
      // currentObj.collider.destroy();
      // currentObj.alpha=0;
    }
    this.objectCollideHandler = (o1, o2) => {
      // console.log(this.player.body.velocity);
      // this.player.stopMovement();
      // console.log(this.player.body);
      this.physics.collide(o1, o2)
      if (this.player.isStopping) {
        return
      }
      if (this.gameDialog.inDialog || this.itemDialog.inDialog) {
        return
      }
      let currentObj
      if (o1.texture.key == 'player') {
        currentObj = o2
      } else {
        currentObj = o1
      }
      if (currentObj.oData.dialog.length > 0) {
        if (configurations.SETTINGS.quiet || this.camera.state == 'zoomOut') {
        } else {
          this.gameDialog.showDialog(currentObj.oData.dialog, currentObj.oData.name, () => {
            if (currentObj.oData.link.length > 0) {
              this.linkDialog.showDialog(currentObj.oData.link)
            }
          })
        }
      }
      if (currentObj.oData.isBackground || currentObj.oData.isForeground) {
        currentObj.collider.destroy()
      } else {
        currentObj.oData.dialog = []
      }
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
    }

    let movedObjects = []

    this.itemGroup = this.physics.add.staticGroup({
      immovable: true,
    })
    let ownItems = secureStorage.getItem('player').ownItems

    this.objectData.list.forEach(o => {
      o.isAnimate
        ? this.anims.create({
            key: 'spritesheet' + o._id,
            frames: 'object' + o._id,
            frameRate: 2,
            delay: Math.random() * 1000,
            repeat: -1,
            repeatDelay: 0,
          })
        : false
    })

    // this.objectGroup.updateObjects(false, [0, 0])
    // this.previousZone = [0, 0];
    this.gameDialog = new Dialog(this)
    this.itemDialog = new ItemDialog(this)
    this.linkDialog = new LinkDialog(this)
    this.uiLayer.add([this.gameDialog, this.itemDialog, this.linkDialog])

    let reactMenu = document.getElementById('GAME_MENU')
    let gameInfo = document.getElementById('GAME_INFO')
    let gameInventory = document.getElementById('GAME_INVENTORY')
    let gameButtons = document.getElementsByClassName('game__button-menu')
    this.reactComponents = [reactMenu, gameInfo, gameInventory, ...gameButtons]
    const handleInput = e => {
      // if the click is not on the root react div, we call stopPropagation()
      if (e.target.tagName != 'canvas') {
        // if (target.className == "game__button-menu") {
        e.stopPropagation()
      }
      // }
    }
    this.reactComponents.forEach(c => {
      c.addEventListener('mousedown', handleInput)
      c.addEventListener('touchstart', handleInput)
    })

    this.anims.create({
      key: 'runLeft',
      frames: this.anims.generateFrameNumbers('player', {
        start: 8,
        end: 9,
      }),
      frameRate: 4,
      repeat: -1,
      repeatDelay: 0,
    })
    this.anims.create({
      key: 'runRight',
      frames: this.anims.generateFrameNumbers('player', {
        start: 6,
        end: 7,
      }),
      frameRate: 4,
      repeat: -1,
      repeatDelay: 0,
    })
    this.anims.create({
      key: 'runUp',
      frames: this.anims.generateFrameNumbers('player', {
        start: 3,
        end: 4,
      }),
      frameRate: 4,
      repeat: -1,
      repeatDelay: 0,
    })
    this.anims.create({
      key: 'runDown',
      frames: this.anims.generateFrameNumbers('player', {
        start: 0,
        end: 1,
      }),
      frameRate: 4,
      repeat: -1,
      repeatDelay: 0,
    })
    this.anims.create({
      key: 'standLeft',
      frames: [{ key: 'player', frame: 9 }],
      frameRate: 20,
      repeat: -1,
      repeatDelay: 0,
    })
    this.anims.create({
      key: 'standRight',
      frames: [{ key: 'player', frame: 7 }],
      frameRate: 20,
      repeat: -1,
      repeatDelay: 0,
    })
    this.anims.create({
      key: 'standUp',
      frames: [{ key: 'player', frame: 5 }],
      frameRate: 20,
      repeat: -1,
      repeatDelay: 0,
    })
    this.anims.create({
      key: 'standDown',
      frames: [{ key: 'player', frame: 2 }],
      frameRate: 20,
      repeat: -1,
      repeatDelay: 0,
    })
    this.player.anims.play('standRight')
    this.gamepad = new GamePad(this)
    this.uiLayer.add(this.gamepad)
    this.filterUsed = seededRandom(configurations.DAY._id)
    const FILTER_LIST = {
      brightness: { min: 1, max: 0.3, unit: '', probability: 0.3 },
      contrast: { min: 0.3, max: 1, unit: '', probability: 0.3 },
      'hue-rotate': {
        min: 0,
        max: 360,
        unit: 'deg',
        probability: 0.3,
      },
      invert: { min: 0, max: 1, unit: '', probability: 0.3 },
      sepia: { min: 0, max: 1, unit: '', probability: 0.3 },
    }
    let seeds = [...Array(Object.keys(FILTER_LIST).length * 2)].map(
      (o, i) => Math.round(seededRandom(((i + 1) * configurations.DAY.stamp).toString()) * 10) / 10
    )
    let RESULT_LIST = Object.assign({}, FILTER_LIST)
    this.filter = (x, y) => {
      let result = ''
      let i = 0
      for (const [key, { min, max, unit, probability }] of Object.entries(FILTER_LIST)) {
        seeds[i] < probability &&
          (result += `${key}(${min +
            (max - min) *
              Math.min((seeds[i] * Math.abs(x)) / configurations.MOVE_SPEED / 5, 1)}${unit}) `)
        i++
        RESULT_LIST[key] = false
      }
      i = 0
      for (const [key, { min, max, unit, probability }] of Object.entries(FILTER_LIST)) {
        if (!RESULT_LIST[key]) {
          continue
        }
        seeds[i] < probability &&
          (result += `${key}(${min +
            (max - min) *
              Math.min((seeds[i] * Math.abs(y)) / configurations.MOVE_SPEED / 5, 1)}${unit}) `)
        i++
      }
      return `${result}`
    }

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

    // configurations.Vignette = this.game.renderer.addPipeline('Vignette', new VignetteClass(this.game));
    // this.applyPipeline();

    // this.game.canvas.style.filter = "opacity(0.7) saturate(1.1) sepia(0.2) brightness(0.98) contrast(1.1)";
    // console.log(this.filter(1000, 1000));

    // import Tone from 'Tone';
    // import * as teoria from 'teoria';
    this.setupKeyboard()
    this.setShowMenu(true)
    generativeMusic.startBgm(this)
    // this.setDisplay();
    // this.gameDialog.showDialog('testtest', 'test');
    // this.itemDialog.showDialog(['哇！你捡到了一个箱子'], 'test');
    // this.linkDialog.showDialog();
    // setTimeout(() => {
    //   this.scale.resize(configurations.WINDOW_W, configurations.WINDOW_H);
    //   this.scale.setZoom(configurations.SCALE);
    //   console.log('resize');
    // }, 3000);
    // let particles = this.add.particles('boxes');
    // this.gameObjectsLayer.add(particles);
    // particles.depth = 999999;
    // let emitter = particles.createEmitter();
    // // emitter.setBlendMode(Phaser.BlendModes.ADD);
    // emitter.setQuantity(1);
    // emitter.setFrequency(500);
    // emitter.setSpeedY(100);
    // emitter.setGravity(0, 100);
    // emitter.setEmitZone(
    //   new Phaser.GameObjects.Particles.Zones.RandomZone(
    //     new Phaser.Geom.Rectangle(0, 0, configurations.WINDOW_W, configurations.WINDOW_H / 10)
    //   )
    // );
    // emitter.gravity = 0;
    // emitter.width = configurations.WINDOW_W * 1.5;
    // emitter.minRotation = 0;
    // emitter.maxRotation = 40;
    // emitter.start();
    setInterval(() => {
      this.objectGroup.updateObjects()
    }, 50)
    setInterval(() => {
      GenerativeMusic.updateSound(150)
    }, 150)
  }
  setupKeyboard() {
    this.input.keyboard.on('keydown-B', () => {
      this.toggleShowInventory()
    })
    this.input.keyboard.on('keydown-H', () => {
      this.toggleShowInfo()
    })
    this.input.keyboard.on('keydown-I', () => {
      this.toggleHideMenu()
    })
    this.input.keyboard.on('keydown-N', () => {
      this.navigateToAdd()
    })
    this.input.keyboard.on('keydown-M', () => {
      this.camera.toggleZoom()
    })
  }

  update(time, delta) {
    // console.log(this.input.activePointer.x, this.input.activePointer.y);
    // console.log(this.gamepad.padX, this.gamepad.padY);

    // this.game.canvas.style.filter = this.filter(this.player.x, this.player.y);
    // console.log(this.filter(this.player.x, this.player.y));
    // console.log(this.player.body);
    this.location.updateLocation()
    let notTouching = this.player.body.touching.none
    let velocityX = notTouching ? this.player.body.velocity.x : 0
    let velocityY = notTouching ? this.player.body.velocity.y : 0
    this.visibleObjects = this.physics.overlapRect(
      this.player.x - configurations.WINDOW_W / 2,
      this.player.y - configurations.WINDOW_H / 2,
      configurations.WINDOW_W,
      configurations.WINDOW_H
    )
    this.visibleObjects.forEach(({ gameObject }) => {
      if (gameObject.oData && gameObject.oData.type == 'object') {
        try {
          gameObject.setVelocity(0, 0)
        } catch (error) {
          console.log(gameObject, error)
        }
        // if (this.player.body.velocity.x == 0 && this.player.body.velocity.y == 0) {
        //   return
        // }
        if (this.gameDialog.inDialog || this.itemDialog.inDialog || this.linkDialog.inDialog) {
          return
        }
        gameObject.x -=
          ((gameObject.oData.flow[0] +
            this.player.body.velocity.x * (gameObject.oData.zFactor - 1)) /
            1000) *
          delta
        gameObject.y -=
          ((gameObject.oData.flow[1] +
            this.player.body.velocity.y * (gameObject.oData.zFactor - 1)) /
            1000) *
          delta
        // GenerativeMusic.updateSound(this, gameObject.oData, delta)
      }
    })
    // this.objectGroup.children.each(o => {
    //   GenerativeMusic.updateSound(this, o.oData, delta)
    // })

    if (
      this.gameDialog.inDialog ||
      this.itemDialog.inDialog ||
      this.linkDialog.inDialog ||
      !this.player.body.blocked.none
    ) {
      this.player.stopMovement()
    } else {
      // if (
      //   Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
      //   Phaser.Input.Keyboard.JustDown(this.cursors.left) ||
      //   Phaser.Input.Keyboard.JustDown(this.cursors.down) ||
      //   Phaser.Input.Keyboard.JustDown(this.cursors.right)
      // )

      let mousePosX
      let mousePosY
      let isMouseMovement

      if (configurations.IS_MOBILE) {
        mousePosX = this.gamepad.padX
        mousePosY = this.gamepad.padY
        // console.log(mousePosX, mousePosY);
        // if (this.input.activePointer.isDown && (Math.abs(mousePosX) <= PLAYER_TARGET_W * 0.5 || Math.abs(mousePosY) <= configurations.PLAYER_TARGET_H * 0.5)){
        // 	camera.toggleZoom();
        // };
        isMouseMovement = mousePosX && mousePosY
      } else {
        mousePosX = this.input.activePointer.x - configurations.WINDOW_CENTER_X
        mousePosY = configurations.WINDOW_CENTER_Y - this.input.activePointer.y
        isMouseMovement = this.input.activePointer.isDown && !this.pointerOnPlayer
      }

      let mouseAngle = isMouseMovement && vectorAngle([0, 1], [mousePosX, mousePosY])
      if (
        this.cursors.left.isDown ||
        this.cursors.right.isDown ||
        this.cursors.up.isDown ||
        this.cursors.down.isDown ||
        isMouseMovement
      ) {
        // camera.setZoom(1);
        this.player.isStopping = false
        this.camera.zoom == configurations.ZOOM_OUT_LEVEL && this.camera.zoomIn()
      }
      if (
        (this.cursors.left.isDown && this.cursors.up.isDown) ||
        (isMouseMovement &&
          mousePosX <= 0 &&
          mouseAngle >= Math.PI * 0.125 &&
          mouseAngle <= Math.PI * 0.375)
      ) {
        this.player.move(-configurations.OBLIQUE_MOVE_SPEED, -configurations.OBLIQUE_MOVE_SPEED)
        this.gameDialog.dialogRetrigger = true
        this.player.anims.play('runLeft', true)
      } else if (
        (this.cursors.left.isDown && this.cursors.down.isDown) ||
        (isMouseMovement &&
          mousePosX <= 0 &&
          mouseAngle >= Math.PI * 0.625 &&
          mouseAngle <= Math.PI * 0.875)
      ) {
        this.player.move(-configurations.OBLIQUE_MOVE_SPEED, configurations.OBLIQUE_MOVE_SPEED)
        this.gameDialog.dialogRetrigger = true
        this.player.anims.play('runLeft', true)
      } else if (
        (this.cursors.right.isDown && this.cursors.up.isDown) ||
        (isMouseMovement &&
          mousePosX > 0 &&
          mouseAngle >= Math.PI * 0.125 &&
          mouseAngle <= Math.PI * 0.375)
      ) {
        this.player.move(configurations.OBLIQUE_MOVE_SPEED, -configurations.OBLIQUE_MOVE_SPEED)
        this.gameDialog.dialogRetrigger = true
        this.player.anims.play('runRight', true)
      } else if (
        (this.cursors.right.isDown && this.cursors.down.isDown) ||
        (isMouseMovement &&
          mousePosX > 0 &&
          mouseAngle >= Math.PI * 0.625 &&
          mouseAngle <= Math.PI * 0.875)
      ) {
        this.player.move(configurations.OBLIQUE_MOVE_SPEED, configurations.OBLIQUE_MOVE_SPEED)
        this.gameDialog.dialogRetrigger = true
        this.player.anims.play('runRight', true)
      } else if (
        this.cursors.left.isDown ||
        (isMouseMovement &&
          mousePosX < 0 &&
          mouseAngle >= Math.PI * 0.375 &&
          mouseAngle <= Math.PI * 0.625)
      ) {
        this.player.move(-configurations.MOVE_SPEED, 0)
        this.gameDialog.dialogRetrigger = true
        this.player.anims.play('runLeft', true)
      } else if (
        this.cursors.right.isDown ||
        (isMouseMovement &&
          mousePosX > 0 &&
          mouseAngle >= Math.PI * 0.375 &&
          mouseAngle <= Math.PI * 0.625)
      ) {
        this.player.move(configurations.MOVE_SPEED, 0)
        this.gameDialog.dialogRetrigger = true
        this.player.anims.play('runRight', true)
      } else if (this.cursors.down.isDown || (isMouseMovement && mouseAngle >= Math.PI * 0.875)) {
        this.player.move(0, configurations.MOVE_SPEED)
        this.gameDialog.dialogRetrigger = true
        this.player.anims.play('runDown', true)
      } else if (this.cursors.up.isDown || (isMouseMovement && mouseAngle <= Math.PI * 0.125)) {
        this.player.move(0, -configurations.MOVE_SPEED)
        this.gameDialog.dialogRetrigger = true
        this.player.anims.play('runUp', true)
      } else {
        this.player.isStopping = true
        this.player.stopMovement()
      }
    }
  }

  resume() {
    this.scene.resume(this)
    this.game.scale.resize(configurations.WINDOW_W, configurations.WINDOW_H)
    this.game.scale.setZoom(configurations.SCALE)
    this.setDisplay()
    this.input.keyboard.enableGlobalCapture()
  }
  pause() {
    this.scene.pause(this)
    this.input.keyboard.disableGlobalCapture()

    // mainScene.input.keyboard.off("keydown-B");
    // mainScene.input.keyboard.off("keydown-H");
    // mainScene.input.keyboard.off("keydown-N");
    // mainScene.input.keyboard.off("keydown-I");
    // mainScene.input.keyboard.off("keydown-M");
  }
}
