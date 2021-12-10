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
import { secureStorage } from "../../utils/storage";
import { range } from '../../utils/utils';
import { customIntRandom, customWRandom, seededRandom, seededRandomKept } from "../../utils/random";
import MS from 'teoria';
import * as Tone from 'tone';
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
    try {
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

        let N4_LENGTH = Tone.Time("4n").toSeconds();
        let scale = MS.scale('C5', 'major');
        MS.Scale.prototype.getNote = function (i) {
          let degree = i.mod(this.notes().length);
          let octave = (i - degree) / this.notes().length + 5;
          // console.log(degree);
          return MS.note((this.notes()[degree].name() + octave.toString()));
        };
        const context = new Tone.Context({ latencyHint: "playback" });
        Tone.setContext(context);
        const initMoment = Tone.now();
        const chordLoopLength = 32;
        const melodyLoopLength = 2;
        // const context = new Tone.Context({ latencyHint: "playback" });
        // set this context as the global Context
        // Tone.setContext(context);
        const generateChord = (() => {
          let day = {};
          day._id = "asdasssisdasdasw";
          day.random = seededRandomKept(day._id.toString());
          day.wRandom = customWRandom(day.random);
          day.intRandom = customIntRandom(day.random);
          const T_CHORDS = [1, 3, 6];
          const D_CHORDS = [5, 3, 7];
          const S_CHORDS = [4, 2, 6];
          const CHORD_TYPE = {
            T: 0,
            D: 1,
            S: 2,
          };
          const CHORDS_LIST = [{ 1: 0.4, 3: 0.2, 6: 0.2 }, { 5: 0.4, 3: 0.2, 5: 0.2 }, { 4: 0.4, 2: 0.2, 6: 0.2 }];
          let chords = [];
          let currentPos = 0;
          let currentType = false;
          this.chordSequence = [...Array(chordLoopLength)].map(i => []);
          while (currentPos < chordLoopLength) {
            switch (currentType) {
              case "D":
                currentType = day.wRandom({ T: 0.4, D: 0.2, S: 0.1 });
                break;
              case "S":
                currentType = day.wRandom({ T: 0.3, D: 0.4, S: 0.2 });
                break;
              case "T":
                currentType = day.wRandom({ T: 0.2, D: 0.3, S: 0.4 });
                break;
              default:
                currentType = day.wRandom({ T: 0.1, D: 0.1, S: 0.1 });
                break;
            }
            // let currentChordDegree = CHORDS_LIST[CHORD_TYPE[currentType]][day.wRandom({ 0: 0.4, 1: 0.3, 2: 0.3 })] ;
            let currentChordDegree = parseInt(day.wRandom(CHORDS_LIST[CHORD_TYPE[currentType]])) - 1;
            // let currentChordNotes = [scale.get(currentChordDegree).name(), scale.get(currentChordDegree + 2).name(), scale.get(currentChordDegree + 4).name().toUpperCase()];
            // console.log(chordSequence[currentPos]);
            // console.log(parseInt(day.wRandom({ 4: 0.1, 3: 0.1, 2: 0.5, 1: 0.4, 0: 0.2 })));
            if (day.random() > 0.9) { this.chordSequence[currentPos].push(false); }

            this.chordSequence[currentPos].push(currentChordDegree);
            let previousPos = currentPos;
            currentPos += 6;
            // currentPos += parseInt(day.wRandom({ 4: 0.2, 3: 0.3, 2: 0.8, 1: 0.1, 0: 0.1 }));
            // if ((previousPos + 1).iDivide(8) < (currentPos + 1).iDivide(8)) {
            //   currentPos = currentPos - (currentPos + 1).mod(8) - 1;
            // }
          };
          console.log(this.chordSequence);
          let rootPadSynth = new Tone.PolySynth(
            Tone.Synth,
            {
              oscillator: { type: "sine", volume: -60 },
              envelope: { release: "4n", attack: "4n" },
              maxPolyphony: 64
            }
          );
          rootPadSynth.chain(Tone.getDestination());
          // new Tone.Sequence((time, note) => {
          //   if (!note) { return; }
          //   console.log(`R: ${scale.getNote(note - 14).scientific()}`);
          //   rootPadSynth.set({
          //     oscillator: { type: "sine", volume: -60 },
          //     envelope: { release: "4n", attack: "4n" },
          //   });
          //   rootPadSynth.triggerAttackRelease(scale.getNote(note - 14).scientific(), "2n.", time, 1);
          // }, this.chordSequence).start();
          // while (currentPos < 16) {
          //   let chordLength = day.wRandom({
          //     4: 0.1, 2: 0.5, 1: 0.2, 0.5: 0.1
          //   });
          //   // chordLength < 0.1 ? chordLength = 4 : (
          //   //   chordLength < 0.6 ? chordLength = 2 : (
          //   //     chordLength < 0.85 ? chordLength = 1 : (
          //   //       chordLength <= 1 ? chordLength = 0.5 : false
          //   //     )
          //   //   )
          //   // );
          //   let notes = [];
          //   let rootNoteOctave = {
          //     1: [3],
          //     2: [3],
          //     3: [3, 2],
          //     4: [3, 2],
          //     5: [3, 2],
          //     6: [2],
          //     7: [2]
          //   };
          //   notes[0] = rootNoteOctave[currentChordDegree].map(i =>
          //     MS.note(scale.get(currentChordDegree).toUpperCase() + i.toString())
          //   ).sort(
          //     (a, b) => {
          //       if (chords.length == 0) {
          //         return 0;
          //       }
          //       let previousRoot = chords[chords.length - 1].notes[0];
          //       let intervalA = MS.interval(previousRoot, a).semitones();
          //       let intervalB = MS.interval(previousRoot, b).semitones();
          //       return intervalA - intervalB;
          //     })[0];
          //   let chordCombinations = [
          //     [[1, 4], [5, 4], [3, 5]],
          //     [[5, 4], [1, 5], [3, 5]],
          //     [[5, 4], [3, 5], [1, 6]],
          //     [[3, 4], [1, 5], [5, 5]],
          //   ];
          //   notes.push(
          //     chordCombinations.map(c =>
          //       MS.note(scale.get(currentChordDegree + c[0] - 1)))
          //       .sort((a, b) => { }));
          //   chords.push(
          //     {
          //       pos: currentPos,
          //       notes: notes,
          //       type: currentType
          //     });
          //   currentPos += chordLength;
          // }
        })();
        this.gameObjectMap.getZone = (player, gridSize = this.GRID_SIZE) => {
          return [Math.ceil(player.x / gridSize), Math.ceil(player.y / gridSize)];
        };
        this.gameObjectMap.getNearBy = (zone, scope = 1) => {
          if (!zone) { return []; }
          let results = [];
          range(-scope, scope).forEach((v1) => {
            range(-scope, scope).forEach((v2) => {
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
        this.objectList = this.objectList.sort((a, b) => b.birthday - a.birthday).slice(0, 50);
        this.objectList.forEach((o, i) => {
          const setupObject = (() => {
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
            o.displayWidth = Math.round(o.displayWidth / o.columns) * o.columns;
            o.displayHeight = Math.round(o.displayHeight / o.rows) * o.rows;

            o.zone = [Math.ceil(o.x / this.GRID_SIZE), Math.ceil(o.y / this.GRID_SIZE)];
            o.type = "object";
            if (o.item) {
              if (!player.ownItems.includes(o._id)) {
                let i = o.item;
                i._id = o._id;
                this.itemList.push(i);
                let rad = i.seed[0] * (Math.PI / 180);
                // let sizeOffset = (this.PLAYER_TARGET_H + this.OBJECT_W.M) / 2;
                let minDistance = this.PLAYER_TARGET_H + this.OBJECT_W[o.size];
                let distance = i.seed[1] * this.RANDOM_ZONE_W + offset + dateOffset + sizeOffset;
                if (o.zFactor == 1 && distance < minDistance) { distance = minDistance; }
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
          })();

          const setupSound = (() => {
            o.random = seededRandomKept(o._id.toString());
            o.wRandom = customWRandom(o.random);
            o.intRandom = customIntRandom(o.random);
            switch (o.size) {
              case 'XXL':
                o.sound = 'pad';
                o.tone = -6;
                o.reverb = 0.65;
                o.delay = 0;
                break;
              case 'XL':
                o.sound = 'pad';
                o.tone = -4;
                o.reverb = 0.5;
                o.delay = 0;
                break;
              case 'L':
                o.sound = 'pad';
                o.tone = -2;
                o.reverb = 0.35;
                o.delay = 0;
                break;
              case 'M':
                o.sound = 'piano';
                o.tone = 1;
                o.reverb = 0.1;
                o.delay = 0.1;
                break;
              case 'S':
                o.sound = 'bell';
                o.tone = 3;
                o.reverb = 0.15;
                o.delay = 0.25;
                break;
              case 'XS':
                o.sound = 'bell';
                o.tone = 5;
                o.reverb = 0.2;
                o.delay = 0.4;
                break;
            }
            switch (o.sound) {
              case 'pad':
                o.synth = new Tone.PolySynth(
                  Tone.Synth,
                  {
                    oscillator: { type: "sine", volume: -46 },
                    envelope: { release: "4n", attack: "4n" }, maxPolyphony: 64
                  }
                );
                o.panner = new Tone.Panner3D({
                  rolloffFactor: 1, refDistance: this.PLAYER_TARGET_H * 6, maxDistance: this.PLAYER_TARGET_H * 200,
                  positionZ: (1 - o.zFactor) * 100, distanceModel: "exponential"
                });
                o.synth.chain(o.panner, Tone.getDestination());
                o.min = o.intRandom(-1 * scale.notes().length - 5, 0);
                o.max = o.min + o.intRandom(5, 7);
                // o.min = scale.getNote(o.min);
                // o.max = scale.getNote(o.max);
                console.log(o.min, o.max, range(o.min, o.max));
                o.range = range(o.min, o.max)
                  .map((i) => (
                    scale.getNote(i)));
                console.log(o._id, o.range);
                o.startDelay = 0;
                o.loop = new Tone.Sequence((time, note) => {
                  if (!note) { return; }
                  let notes = [note, note + 2, note + 4].map(n => scale.getNote(n).name());
                  let possibleNotes = o.range.filter(n => notes.includes(n.name()[0]));
                  possibleNotes.sort((a, b) => {
                    let jumpA;
                    let jumpB;
                    if (o.previousNote) {
                      jumpA = Math.abs(MS.interval(o.previousNote, a).semitones());
                      jumpB = Math.abs(MS.interval(o.previousNote, b).semitones());
                      // console.log(jumpA, jumpB);
                    } else {
                      jumpA = 0;
                      jumpB = 0;
                    }
                    return jumpA - jumpB;
                  });
                  // o.previousNote = possibleNotes[0];
                  o.previousNote = possibleNotes[o.intRandom(0, possibleNotes.length - 1)];


                  console.log(`H: ${o.previousNote.scientific()}`);
                  // o.synth.set({
                  //   width: Phaser.Math.Angle.WrapDegrees(Phaser.Math.Angle.BetweenPoints(this.player, o)) / 180
                  // });
                  o.synth.triggerAttackRelease(o.previousNote.scientific(), "2n.", time);

                }, this.chordSequence);
                break;
              default:
                // What about using pattern?
                // if (!previousNote) {

                // } else {
                //   // o.noteIndex = previousNote.noteIndex + Math.floor((o.random() ** 1.2) * 9) - 4;
                // }
                o.synth = new Tone.PolySynth(
                  Tone.Synth,
                  {
                    oscillator: { type: "sine", volume: -30 },
                    envelope: { release: "2n" }, maxPolyphony: 64
                  }
                );
                o.panner = new Tone.Panner3D({
                  rolloffFactor: 1.2, refDistance: this.PLAYER_TARGET_H * 2, maxDistance: this.PLAYER_TARGET_H * 10,
                  positionZ: (1 - o.zFactor) * 100, distanceModel: "exponential"
                });
                o.synth.chain(o.panner, Tone.getDestination());
                o.noteIndex = o.intRandom(-5, 10);

                o.noteIndex = o.wRandom({
                  "-5": 0.3,
                  "-4": 0.4,
                  "-3": 0.4,
                  "-2": 0.3,
                  "-1": 0.2,
                  " 0": 0.4,
                  " 1": 0.5,
                  " 2": 0.4,
                  " 3": 0.5,
                  " 4": 0.5,
                  " 5": 0.4,
                  " 6": 0.2
                });
                o.note = scale.getNote(parseInt(o.noteIndex));
                o.loopInterval = melodyLoopLength + o.intRandom(-2, 2);
                // o.loopInterval = melodyLoopLength;
                o.startDelay = o.intRandom(0, melodyLoopLength - 1) * N4_LENGTH + o.wRandom({ 0: 0.6, 1: 0.2 }) * N4_LENGTH / 2;
                o.loop = new Tone.Loop((t) => {
                  // console.log(o.note);
                  if (o.panner.audible) {
                    console.log(`M: ${o.note.scientific()} ${o.dialog}`);

                    // o.melodySynth.set({
                    //   width: Phaser.Math.Angle.WrapDegrees(Phaser.Math.Angle.BetweenPoints(this.player, o)) / 180
                    // });
                    o.synth.triggerAttackRelease(o.note.scientific(), "8n");
                  }
                }, N4_LENGTH * o.loopInterval);
                // Tone.getTransport().scheduleRepeat(
                //   (t) => {
                //     console.log(o.note);
                //     synth.triggerAttackRelease(o.note.scientific(), "8n");
                //   }, N4_LENGTH * o.loopInterval, o.intRandom(0, 8) * N4_LENGTH);
                // code
                break;
            }
          })();

          this.gameObjectMap.pushNew(o.zone, o);

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
    } catch (error) {
      console.log(error);
    }
    ;
    this.add.rectangle(this.WINDOW_CENTER_X, this.WINDOW_CENTER_Y, this.WINDOW_W, this.WINDOW_H, 0x000000);
    this.label = this.add.text(this.WINDOW_W / 20, 80,
      new Date(this.timestamp).toString().split('GMT')[0] + "user@remote" + '\n Fetching object list...',
      { align: "left", color: "#FFFFFF", fontSize: 16 * this.WINDOW_H / 750, wordWrap: { width: this.WINDOW_W * 0.9, useAdvancedWrap: true } });
  }
  update() {

  }
}