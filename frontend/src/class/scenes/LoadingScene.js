import feathers from '@feathersjs/feathers'
import rest from '@feathersjs/rest-client'
import batteryURL from '../../assets/game/batteries.png'
import bgURL from '../../assets/game/bg.png'
import boxURL from '../../assets/game/boxes.png'
import dialogURL from '../../assets/game/dialog2.png'
import fatURL from '../../assets/game/fats.png'
import gamepadURL from '../../assets/game/gamepad.png'
import labelURL from '../../assets/game/labels.png'
import telescopeURL from '../../assets/game/telescopes.png'
import whiteURL from '../../assets/game/white.png'
import moreURL from '../../assets/game/more.png'
import { setObjects } from '../../store/actions/actionCreators'
import configurations from '../configurations'
import generativeMusic from '../GenerativeMusic'
import ObjectData from '../ObjectData'
import { objectService } from '../feathers-service'
export default class LoadingScene extends Phaser.Scene {
  constructor(methods) {
    super({
      key: 'LoadingScene',
    })
    this.configurations = configurations
    this.dispatch = methods.dispatch
  }
  preload() {}

  create() {
    try {
      const setup = data => {
        this.dispatch(setObjects(data))
        let objectList = data
        this.load.image('bg', bgURL)
        this.load.image('dialog', dialogURL)
        this.load.image('boxes', boxURL)
        this.load.image('fats', fatURL)
        this.load.image('labels', labelURL)
        this.load.image('telescopes', telescopeURL)
        this.load.image('batteries', batteryURL)
        this.load.image('more', moreURL)
        this.load.spritesheet('player', whiteURL, {
          frameWidth: 40,
          frameHeight: 46,
        })
        this.load.spritesheet('gamepad', gamepadURL, {
          frameWidth: 16,
          frameHeight: 16,
        })
        // [...Array(10000)].forEach(() => {
        //   list.push(createTestObject({
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

        let objectData = new ObjectData(objectList)
        objectData.setupObject()
        objectData.list.forEach((o, i) => {
          generativeMusic.setupSound(o)
          switch (o.isAnimate) {
            case true:
              var shardsImg = new Image()
              shardsImg.onload = () => {
                this.textures.addSpriteSheet('object' + o._id, shardsImg, {
                  frameWidth: o.columns,
                  frameHeight: o.rows,
                })
              }
              shardsImg.src = o.blobURI

              // this.load.spritesheet("object" + o._id, 'assets/objects/' + o._id + '.png', { frameWidth: o.columns, frameHeight: o.rows });
              break
            default:
              this.textures.addBase64('object' + o._id, o.blobURI)
              // this.load.image("object" + o._id, 'assets/objects/' + o._id + '.png')
              break
          }
          objectData.map.pushNew(o.zone, o)
        })
        // DENSITY_OFFSET = Math.min(OBJECT_W.L, DENSITY_OFFSET);
        this.load.on(
          'complete',
          () => {
            this.label.text += `\nStarting ...`

            console.log(objectData)
            // setTimeout(() => {
            this.scene.start('MainScene', {
              objectData: objectData,
            })
            console.log('mainscene start')
            this.scene.stop('LoadingScene')
            // }, 300);
          },
          this
        )
        this.load.on('start', progress => {
          this.label.text += '\nFetching assets ...'
        })
        let loadStart = false
        this.load.on('filecomplete', (key, type, data) => {
          if (!loadStart) {
            loadStart = true
            this.label.text += '\nLoading Content ...'
          }
          this.label.text += `\n- Fetching ${key} ..`
        })
        this.load.start()
      }
      objectService.find({ paginate: false }).then(setup)
    } catch (error) {
      console.log(error)
    }
    this.add.rectangle(
      configurations.WINDOW_CENTER_X,
      configurations.WINDOW_CENTER_Y,
      configurations.WINDOW_W,
      configurations.WINDOW_H,
      0x000000
    )
    this.label = this.add.text(
      configurations.WINDOW_W / 20,
      configurations.WINDOW_H / 20,
      new Date(configurations.TIMESTAMP).toString().split('GMT')[0] +
        'user@remote' +
        '\n Fetching object list...',
      {
        align: 'left',
        color: '#FFFFFF',
        fontSize: (16 * configurations.WINDOW_H) / 750,
        wordWrap: {
          width: configurations.WINDOW_W * 0.9,
          useAdvancedWrap: true,
        },
      }
    )
  }
  update() {}
  update() {}
}
