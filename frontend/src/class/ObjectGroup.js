import * as Tone from 'tone'
import configurations from './configurations'
import GenerativeMusic from './GenerativeMusic'

export default class ObjectGroup extends Phaser.Physics.Arcade.Group {
  constructor(scene) {
    super(scene.physics.world, scene, [], {
      immovable: false,
      pushable: false,
    })
    this.previousZone = null

    // this.createCallback = o => {
    //   setTimeout(() => {
    //     if (o.oData.isBackground) {
    //       return
    //     }
    //     let collidedObjects = scene.physics
    //       .overlapRect(
    //         o.x - o.displayWidth / 2,
    //         o.y - o.displayHeight / 2,
    //         o.displayWidth,
    //         o.displayHeight
    //       )
    //       .filter(o => o.oData)
    //     if (collidedObjects.length > 0) {
    //       console.log(collidedObjects)
    //       collidedObjects.forEach(c => {
    //         // scene.physics.collide(c, o);
    //         let cg = c.gameObject
    //         console.log(cg, o)
    //         if (cg.oData._id == o.oData._id) {
    //           return
    //         }
    //         if (cg.oData.isBackground) {
    //           return
    //         }
    //         // if (movedObjects.find((a) => (a[0] == o.id && a[1] == cg.id))) {
    //         //   return;
    //         // }
    //         if (cg.x < o.x) {
    //           cg.x -= (cg.displayWidth - Math.abs(o.x - cg.x)) * 1.1
    //         } else {
    //           o.x += (o.displayWidth - Math.abs(o.x - cg.x)) * 1.1
    //         }
    //         if (cg.y < o.y) {
    //           cg.y -= (cg.displayHeight - Math.abs(o.y - cg.y)) * 1.1
    //         } else {
    //           o.y += (o.displayHeight - Math.abs(o.y - cg.y)) * 1.1
    //         }
    //         // movedObjects.push([cg.id, o.id]);
    //       })
    //     }
    //   }, 50)
    // }
    this.scene = scene
  }
  updateObjects() {
    let currentZone = this.scene.objectData.map.getZone(this.scene.player)
    // console.log(currentZone, this.previousZone)
    if (
      !(
        this.previousZone &&
        currentZone[0] == this.previousZone[0] &&
        currentZone[1] == this.previousZone[1]
      )
    ) {
      console.time('updateObjects')
      let previousZones = this.scene.objectData.map.getNearBy(this.previousZone)
      let currentZones = this.scene.objectData.map.getNearBy(currentZone)
      let createZones = currentZones.filter(
        x => !JSON.stringify(previousZones).includes(JSON.stringify(x))
      )
      let destroyZones = previousZones.filter(
        x => !JSON.stringify(currentZones).includes(JSON.stringify(x))
      )
      this.previousZone = currentZone
      // console.log({ prev: previousZones, cur: currentZones });
      // console.log({ create: JSON.stringify(createZones), destroy: JSON.stringify(destroyZones) })
      createZones.forEach(zone => {
        // console.log(this.scene.objectData.map);
        if (!this.scene.objectData.map[zone[0]]) {
          return
        }
        if (!this.scene.objectData.map[zone[0]][[zone[1]]]) {
          return
        }
        let os = this.scene.objectData.map[zone[0]][zone[1]]
        os.forEach(o => {
          switch (o.type) {
            case 'object':
              // GenerativeMusic.setupSound(o)
              o.instance = this.create(o.x, o.y, 'object' + o._id)
              // o.instance.on('addedtoscene',()=>{
              //   console.log(collidedObjects);
              // })
              // o.instance = this.scene.physics.add.sprite(o.x,o.y,"object"+o.id);
              // console.log(this.scene.objectGroup);
              o.instance.depth = o.zFactor
              o.isForeground && (o.instance.alpha = 1 - Math.abs(o.zFactor - 1) / 2)
              o.isBackground && (o.instance.alpha = 1 - Math.abs(o.zFactor - 1) ** 0.5)
              o.instance.oData = o
              o.instance.setDisplaySize(o.displayWidth, o.displayHeight)
              o.instance.body.onOverlap = true
              if (o.isAnimate) {
                o.instance.anims.play('spritesheet' + o._id)
              }
              // if (o.dialog.length > 0) {
              let collider = this.scene.physics.add.collider(
                this.scene.player,
                o.instance,
                this.scene.objectCollideHandler
              )
              o.instance.collider = collider
              //  }
              o.instance.refreshBody()
              !o.loop && GenerativeMusic.setupSound(o)
              this.scene.gameObjectsLayer.add(o.instance)
              if (o.loop) {
                // GenerativeMusic.startLoop(o)
              }
              break
            case 'item':
              o.instance = this.scene.itemGroup
                .create(o.x, o.y, configurations.ITEM_LIST[o.itemId].name)
                .setDisplaySize(o.displayWidth, o.displayWidth)
              o.instance.fadeOut = this.scene.tweens.create({
                targets: o.instance,
                duration: 600,
                props: { alpha: 0 },
                onComplete: () => {
                  o.instance.destroy()
                },
              })
              o.instance.alpha = 1
              o.instance.depth = 1
              o.instance._id = o._id
              let itemCollider = this.scene.physics.add.collider(
                this.scene.player,
                o.instance,
                this.scene.itemCollideHandler
              )
              o.instance.collider = itemCollider
              o.instance.itemId = o.itemId

              this.scene.gameObjectsLayer.add(o.instance)
              break
            default:
              break
          }
        })
      })
      destroyZones.forEach(zone => {
        if (!this.scene.objectData.map[zone[0]]) {
          return
        }
        if (!this.scene.objectData.map[zone[0]][[zone[1]]]) {
          return
        }
        let os = this.scene.objectData.map[zone[0]][zone[1]]
        os.forEach(o => {
          switch (o.type) {
            case 'object':
              this.remove(o.instance, true, true)
              if (o.loop) {
                o.loop.dispose()
                o.loop = false
              }
              break
            case 'item':
              // TODO: TypeError: Cannot read properties of undefined (reading 'active')
              // console.log(o.instance);
              if (o.instance) {
                this.scene.itemGroup.remove(o.instance, true, true)
              }
              break
            default:
              break
          }
        })
      })
      // let seeds = [...Array(Object.keys(FILTER_LIST).length * 2)].map((o, i) => (Math.round(seededRandom(((i + 1) * currentZone[0] * this.scene.day + currentZone[1]).toString()) * 10)) / 10);
      // let RESULT_LIST = Object.assign({}, FILTER_LIST);
      // this.scene.filter = (x, y) => {
      //   let result = "";
      //   let i = 0;
      //   for (const [key, { min, max, unit, probability }] of Object.entries(FILTER_LIST)) {
      //     seeds[i] < probability && (
      //       result += `${key}(${min + (max - min) * Math.min(seeds[i] * Math.abs(x) / this.scene.MOVE_SPEED / 20, 1)}${unit}) `);
      //     i++;
      //     RESULT_LIST[key] = false;
      //   };
      //   i = 0;
      //   for (const [key, { min, max, unit, probability }] of Object.entries(FILTER_LIST)) {
      //     if (!RESULT_LIST[key]) { continue; }
      //     seeds[i] < probability && (
      //       result += `${key}(${min + (max - min) * Math.min(seeds[i] * Math.abs(y) / this.scene.MOVE_SPEED / 20, 1)}${unit}) `);
      //     i++;

      //   };
      //   return `${result}`;
      // };
      console.timeEnd('updateObjects')
    }
  }
}
