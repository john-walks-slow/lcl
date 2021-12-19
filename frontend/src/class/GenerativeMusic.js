import MS from 'teoria'
import * as Tone from 'tone'
import { customIntRandom, customWRandom, seededRandomKept } from '../utils/random'
import { range } from '../utils/utils'
import configurations from './configurations'
import SpatialPanner from './SpatialPanner'
class GenerativeMusic {
  constructor() {
    this.soundList = []
    const initTone = () => {
      // const context = new Tone.Context({ latencyHint: 4000 })
      const context = new Tone.Context({ latencyHint: 'playback' })
      Tone.setContext(context)
      Tone.getTransport().bpm.value = 35
      Tone.getTransport().start()
    }
    initTone()
    this.N4_LENGTH = Tone.Time('4n').toSeconds()
    this.scale = MS.note.fromMIDI(configurations.DAY.intRandom(71, 90)).scale('major')
    this.chordLoopLength = 128
    this.melodyLoopLength = 8
    // this.melodyLoopLength = 48;
    this.melodyIntervalRandomRange = 1
    this.melodyFadeFactor = 1.5
    this.chordFadeFactor = 0.8
    this.chordRythm
    this.melodyRythm
    this.melodyMinSight = 0
    this.melodyMaxSight = 15 * configurations.PLAYER_TARGET_H
    this.chordMinSight = 2 * configurations.PLAYER_TARGET_H
    this.chordMaxSight = 30 * configurations.PLAYER_TARGET_H
    this.channels = {
      melody: new Tone.Channel({ volume: 0, pan: 0, channelCount: 2 }),
      chord: new Tone.Channel({ volume: -26, pan: 0, channelCount: 2 }),
      effects: new Tone.Channel({ volume: 0, pan: 0, channelCount: 2 }),
      master: new Tone.Channel({ volume: 0, pan: 0, channelCount: 2 }),
    }
    this.channels.master.connect(Tone.getDestination())
    this.effectNodes = {
      reverb: new Tone.Reverb({
        roomSize: 0.75,
        wet: 0.6,
      }),
      delay: new Tone.FeedbackDelay({
        delayTime: '8n.',
        maxDelayTime: '1m',
        feedback: 0.2,
      }),
      stereoWidener: new Tone.StereoWidener(0.7),
      stereoWidener2: new Tone.StereoWidener(0.96),
      compressor: new Tone.Compressor({
        ratio: 5,
        threshold: -15,
        release: 0.25,
        attack: 0.05,
      }),
      compressor2: new Tone.Compressor({
        ratio: 1.7,
        threshold: -7,
        release: 0.25,
        attack: 0.02,
      }),

      limiter: new Tone.Limiter(-4),
    }
    this.channels.effects.chain(
      this.effectNodes.delay,
      this.effectNodes.reverb,
      // this.effectNodes.stereoWidener,
      // this.effectNodes.stereoWidener2,
      // this.effectNodes.compressor,
      this.effectNodes.compressor2,
      // this.effectNodes.limiter,
      this.channels.master
    )
    // .connect(this.effectNodes.stereoWidener)
    // .connect(this.effectNodes.stereoWidener2)
    // .connect(this.effectNodes.compressor)
    // .connect(this.effectNodes.compressor2)
    // .connect(this.effectNodes.limiter)
    this.channels.melody.connect(this.channels.effects)
    this.channels.chord.connect(this.channels.effects)

    MS.Scale.prototype.getNote = function(i) {
      let degree = i.mod(this.notes().length)
      let octave = (i - degree) / this.notes().length + this.tonic.octave()
      // console.log(degree);
      return MS.note(this.notes()[degree].name() + octave.toString())
    }

    // const context = new Tone.Context({ latencyHint: "playback" });
    // set this context as the global Context
    // Tone.setContext(context);
    const generateChord = () => {
      const day = configurations.DAY

      const CHORD_TYPE = {
        T: 0,
        D: 1,
        S: 2,
      }
      let majorMinor = day.random() * 1.6 + 0.2
      console.log(majorMinor)
      let CHORDS_LIST
      if (majorMinor > 1) {
        CHORDS_LIST = [
          { 1: Math.round((majorMinor - 0.4) * 0.6), 3: 0.2, 6: 0.2 },
          { 5: Math.round((majorMinor - 0.4) * 0.6), 3: 0.2, 5: 0.2 },
          { 4: Math.round((majorMinor - 0.4) * 0.6), 2: 0.2, 6: 0.2 },
        ]
      } else {
        CHORDS_LIST = [
          { 6: Math.round(0.6 / (majorMinor + 0.4)), 1: 0.2, 4: 0.2 },
          { 3: Math.round(0.6 / (majorMinor + 0.4)), 1: 0.2, 5: 0.2 },
          { 2: Math.round(0.6 / (majorMinor + 0.4)), 4: 0.2, 5: 0.2 },
        ]
      }
      let chords = []
      let currentPos = 0
      let currentType = false
      // this.chordSequence = [...Array(this.chordLoopLength)].map(i => []);
      this.chordSequence = [...Array(this.chordLoopLength)].map(i => [])
      while (currentPos < this.chordLoopLength) {
        switch (currentType) {
          case 'D':
            currentType = day.wRandom({ T: 4, D: 2, S: 1 })
            break
          case 'S':
            currentType = day.wRandom({ T: 3, D: 4, S: 2 })
            break
          case 'T':
            currentType = day.wRandom({ T: 2, D: 3, S: 4 })
            break
          default:
            currentType = day.wRandom({ T: 1, D: 1, S: 1 })
            break
        }
        // let currentChordDegree = CHORDS_LIST[CHORD_TYPE[currentType]][day.wRandom({ 0: 0.4, 1: 0.3, 2: 0.3 })] ;
        let currentChordDegree = parseInt(day.wRandom(CHORDS_LIST[CHORD_TYPE[currentType]]))
        // let currentChordNotes = [scale.get(currentChordDegree).name(), scale.get(currentChordDegree + 2).name(), scale.get(currentChordDegree + 4).name().toUpperCase()];
        // console.log(chordSequence[currentPos]);
        // console.log(parseInt(day.wRandom({ 4: 0.1, 3: 0.1, 2: 0.5, 1: 0.4, 0: 0.2 })));

        // if (day.random() > 0.9) {
        //   this.chordSequence[currentPos].push(false);
        // }

        this.chordSequence[currentPos].push(currentChordDegree)
        // this.chordSequence[currentPos].push(currentChordDegree);
        let previousPos = currentPos
        // currentPos += 4
        currentPos += parseInt(day.wRandom({ 8: 0.1, 6: 0.2, 4: 0.8, 2: 0.2, 1: 0.1 })) * 2
        // console.log(
        //   currentPos,
        //   (currentPos + 1).iDivide(8),
        //   previousPos,
        //   (previousPos + 1).iDivide(8),
        // )
        if ((previousPos + 1).iDivide(16) < (currentPos + 1).iDivide(16)) {
          currentPos = currentPos - (currentPos + 1).mod(16)
        }
      }
      console.log(`chordSequence: ${this.chordSequence}`)
      console.log(this.chordSequence)
      let rootPadSynth = new Tone.Synth({
        oscillator: { type: 'sine', volume: -55 },
        envelope: { release: '4n', attack: '4n' },
      })
      rootPadSynth.chain(this.channels.chord)
      new Tone.Sequence((time, note) => {
        if (!note) {
          return
        }
        // console.log(`R: ${this.scale.getNote(note - 14).scientific()}`)
        rootPadSynth.triggerRelease()
        rootPadSynth.triggerAttack(this.scale.getNote(note - 7).scientific())
      }, this.chordSequence).start()
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
    }
    generateChord()
  }
  // updateSound(this.scene, delta) {
  //   console.time('updateSound')

  //   this.scene.objectGroup.children.each(o => {
  //     if (!o.oData.synth) {
  //       return
  //     }
  //     // let width = Phaser.Math.Angle.WrapDegrees(Phaser.Math.Angle.BetweenPoints(this.player, o)) / 180;
  //     // let distance = Phaser.Math.Distance.BetweenPoints(o, this.player);
  //     // console.log('width:' + width);
  //     // console.log('distance:' + distance);
  //     // o.oData.synth.set({
  //     //   volume: 0,
  //     //   width: width
  //     // });
  //     const positionX = o.x - this.scene.player.x
  //     const positionY = this.scene.player.y - o.y
  //     // console.log(o.oData.panner.positionX.value)
  //     // o.oData.panner.set({ positionX, positionY })
  //     // o.oData.panner.positionXSignal.value = positionX
  //     // o.oData.panner.positionYSignal.value = positionY
  //     // o.oData.panner.positionX.cancelScheduledValues()
  //     // o.oData.panner.positionY.cancelScheduledValues()
  //     // o.oData.panner.positionXSignal.rampTo(positionX, delta)
  //     // o.oData.panner.positionYSignal.rampTo(positionY, delta)
  //     o.oData.panner.positionX.rampTo(positionX, 1)
  //     o.oData.panner.positionY.rampTo(positionY, 1)
  //     // o.oData.synth.volume.rampTo(-100, 10, Tone.now())
  //     o.oData.synth.audible = positionX ** 2 + positionY ** 2 < o.oData.panner.maxDistance ** 2
  //   })
  //   console.timeEnd('updateSound')
  // }
  updateSound(delta) {
    console.time('updateSynth')
    this.soundList.forEach(o => {
      this.updateSynth(o, delta)
    })
    console.timeEnd('updateSynth')

    let currentZone = this.scene.objectData.soundMap.getZone(this.scene.player)
    // console.log(currentZone, this.previousZone)
    if (
      !(
        this.previousZone &&
        currentZone[0] == this.previousZone[0] &&
        currentZone[1] == this.previousZone[1]
      )
    ) {
      console.time('updateSound')
      let previousZones = this.scene.objectData.soundMap.getNearBy(this.previousZone)
      let currentZones = this.scene.objectData.soundMap.getNearBy(currentZone)
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
        // console.log(this.scene.objectData.soundMap);
        if (!this.scene.objectData.soundMap[zone[0]]) {
          return
        }
        if (!this.scene.objectData.soundMap[zone[0]][[zone[1]]]) {
          return
        }
        let os = this.scene.objectData.soundMap[zone[0]][zone[1]]
        os.forEach(o => {
          if (o.loop) {
            this.soundList.push(o)
            this.setupSynth(o)
          }
        })
      })
      console.log(this.soundList)
      destroyZones.forEach(zone => {
        if (!this.scene.objectData.soundMap[zone[0]]) {
          return
        }
        if (!this.scene.objectData.soundMap[zone[0]][[zone[1]]]) {
          return
        }
        let os = this.scene.objectData.soundMap[zone[0]][zone[1]]
        os.forEach(o => {
          if (o.synth) {
            this.soundList.indexOf(o) > -1 && this.soundList.splice(this.soundList.indexOf(o), 1)
            this.disposeSynth(o)
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
      console.timeEnd('updateSound')
    }
  }
  updateSynth(o, delta) {
    // console.time('updateSound')

    let synth = o.synth
    if (!synth) {
      return
    }
    // let width = Phaser.Math.Angle.WrapDegrees(Phaser.Math.Angle.BetweenPoints(this.player, o)) / 180;
    // let distance = Phaser.Math.Distance.BetweenPoints(o, this.player);
    // console.log('width:' + width);
    // console.log('distance:' + distance);
    // o.synth.set({
    //   volume: 0,
    //   width: width
    // });
    // if (o.sound != 'pad' && this.soundList.length < 10 && o.loopSpeed == 1) {
    // o.loop.clear()
    // o.loop.at(o.time / 2, o.note)
    // o.loop.set({ loopEnd: o.loopInterval / 2 })
    // o.loopSpeed = 2
    // }
    const positionX = o.x - this.scene.player.x
    const positionY = o.y - this.scene.player.y
    let distance = (positionX ** 2 + positionY ** 2) ** 0.5
    const pan = positionX / distance
    distance = Math.max(distance, synth.minSight)
    synth.audible = distance < synth.maxSight

    if (synth.audible) {
      const volume =
        -40 * ((distance - synth.minSight) / (synth.maxSight - synth.minSight)) ** synth.fadeFactor

      // console.log(distance, pan, volume)
      // synth.audible = distance < o.panner.maxDistance
      // o.channel.set({
      //   pan,
      //   volume,
      // })
      o.channel.pan.rampTo(pan, delta / 128)
      o.channel.volume.rampTo(volume, delta / 128)
      // o.oData.panner.set({ positionX, positionY })
      // o.oData.panner.distance = positionX ** 2 + positionY ** 2
      // o.oData.panner.audible = o.oData.panner.distance < o.oData.panner.maxDistance ** 2

      // console.timeEnd('updateSound')
    }
  }

  setupSound(o) {
    o.random = seededRandomKept(o._id.toString())
    o.wRandom = customWRandom(o.random)
    o.intRandom = customIntRandom(o.random)
    // switch (o.size) {
    //   case 'XXL':
    //     o.sound = 'pad';
    //     o.tone = -6;
    //     o.reverb = 0.65;
    //     o.delay = 0;
    //     break;
    //   case 'XL':
    //     o.sound = 'pad';
    //     o.tone = -4;
    //     o.reverb = 0.5;
    //     o.delay = 0;
    //     break;
    //   case 'L':
    //     o.sound = 'pad';
    //     o.tone = -2;
    //     o.reverb = 0.35;
    //     o.delay = 0;
    //     break;
    //   case 'M':
    //     o.sound = 'piano';
    //     o.tone = 1;
    //     o.reverb = 0.1;
    //     o.delay = 0.1;
    //     break;
    //   case 'S':
    //     o.sound = 'bell';
    //     o.tone = 3;
    //     o.reverb = 0.15;
    //     o.delay = 0.25;
    //     break;
    //   case 'XS':
    //     o.sound = 'bell';
    //     o.tone = 5;
    //     o.reverb = 0.2;
    //     o.delay = 0.4;
    //     break;
    // }
    if (o.isForeground) {
    }
    if (o.isBackground) {
      o.sound = 'pad'
    }

    switch (o.sound) {
      case 'pad':
        // PadSynth
        o.min = o.intRandom(-2 * this.scale.notes().length - 5, -5)
        o.max = o.min + o.intRandom(4, 6)
        // o.min = scale.getNote(o.min);
        // o.max = scale.getNote(o.max);
        o.range = range(o.min, o.max).map(i => this.scale.getNote(i))
        o.loop = new Tone.Sequence(
          (time, note) => {
            if (o.synth && o.synth.audible) {
              if (!note) {
                return
              }
              let notes = [note - 1, note + 1, note + 3].map(n => this.scale.getNote(n).name())
              const possibleNotes = o.range.filter(n => notes.includes(n.name()[0]))
              possibleNotes.sort((a, b) => {
                let jumpA
                let jumpB
                if (o.previousNote) {
                  jumpA = Math.abs(MS.interval(o.previousNote, a).semitones())
                  jumpB = Math.abs(MS.interval(o.previousNote, b).semitones())
                  // console.log(jumpA, jumpB);
                } else {
                  jumpA = 0
                  jumpB = 0
                }
                return jumpA - jumpB
              })
              // o.previousNote = possibleNotes[0]
              o.previousNote = possibleNotes[o.intRandom(0, possibleNotes.length - 1)]
              o.synth && o.synth.triggerRelease()
              console.log(`H`)
              // console.log(`H: ${o.previousNote.scientific()} ${o.dialog}`)
              // o.synth.set({
              //   width: Phaser.Math.Angle.WrapDegrees(Phaser.Math.Angle.BetweenPoints(this.player, o)) / 180
              // });
              // TODO
              o.synth.triggerAttack(o.previousNote.scientific())
            }
          },
          this.chordSequence,
          '4n'
        )
        o.loop.humanize = '8n'
        o.loop.start('@2n')

        break
      default:
        // What about using pattern?
        // if (!previousNote) {

        // } else {
        //   // o.noteIndex = previousNote.noteIndex + Math.floor((o.random() ** 1.2) * 9) - 4;
        // }

        o.noteIndex = o.intRandom(-5, 10)

        o.noteIndex = o.wRandom({
          '-5': 0.3,
          '-4': 0.4,
          '-3': 0.4,
          '-2': 0.3,
          '-1': 0.2,
          ' 0': 0.4,
          ' 1': 0.5,
          ' 2': 0.4,
          ' 3': 0.5,
          ' 4': 0.5,
          ' 5': 0.4,
          ' 6': 0.2,
        })
        o.note = this.scale.getNote(parseInt(o.noteIndex))
        // o.loopInterval = (this.melodyLoopLength + o.intRandom(-2, 2) / 4) * this.N4_LENGTH
        o.loopInterval = this.melodyLoopLength * this.N4_LENGTH
        o.loopSpeed = 1
        // o.melodySequence = [...Array(this.melodyLoopLength)].map(i => [false, false])
        o.beat = o.intRandom(0, this.melodyLoopLength - 1)
        o.subdivision = parseFloat(
          o.wRandom({ '0': 5, '0.5': 4, '0.3': 0.3, '0.6': 0.3, '0.25': 0.3, '0.75': 0.3 })
        )
        o.time = (o.beat + o.subdivision) * this.N4_LENGTH
        // o.melodySequence[o.beat][o.subdivision] = o.note
        o.melodySequence = [[o.time, o.note]]
        // let isMelodySpaced = o.wRandom({ false: 0.3, true: 0.1 })
        // while (isMelodySpaced == 'true') {
        //   o.melodySequence[o.beat].push(false)
        //   isMelodySpaced = o.wRandom({ false: 0.4, true: 0.1 })
        // }
        o.loop = new Tone.Part((time, note) => {
          if (o.synth && o.synth.audible) {
            if (!note) {
              return
            }
            console.log(`M`)
            // console.log(`M: ${o.note.scientific()} ${o.dialog}`)
            o.synth.triggerAttackRelease(note.scientific(), '8n')
          }
        }, o.melodySequence)
        o.loop.loop = true
        o.loop.loopEnd = o.loopInterval
        o.loop.humanize = '8n'
        o.loop.start()

        // o.secondLoop = new Tone.Part((time, note) => {
        //   if (o.secondLoopOn) {
        //     if (o.synth && o.synth.audible) {
        //       if (!note) {
        //         return
        //       }
        //       console.log(`M`)
        //       // console.log(`M: ${o.note.scientific()} ${o.dialog}`)
        //       o.synth.triggerAttackRelease(note.scientific(), '8n')
        //     }
        //   }
        // }, o.melodySequence)
        // o.secondLoop.loop = true
        // o.secondLoop.loopEnd = o.loopInterval
        // o.secondLoop.humanize = '8n'
        // o.secondLoop.start()

        // Tone.getTransport().scheduleRepeat(
        //   (t) => {
        //     console.log(o.note);
        //     synth.triggerAttackRelease(o.note.scientific(), "8n");
        //   }, this.N4_LENGTH * o.loopInterval, o.intRandom(0, 8) * this.N4_LENGTH);
        // code
        break
    }
  }
  setupSynth(o) {
    switch (o.sound) {
      case 'pad':
        o.synth = new Tone.Synth({
          oscillator: { type: 'sine', volume: 0 },
          envelope: { release: '2n', attack: '1m', sustain: 1 },
          // maxPolyphony: 64,
        })
        o.synth.fadeFactor = this.chordFadeFactor
        o.synth.minSight = this.chordMinSight
        o.synth.maxSight = this.chordMaxSight
        o.synth.audible = false
        o.channel = new Tone.Channel({ channelCount: 2 })
        o.synth.chain(o.channel, this.channels.chord)
        break
      default:
        o.synth = new Tone.Synth({
          oscillator: { type: 'sine', volume: 0 },
          envelope: { attack: this.N4_LENGTH / 100, release: '2n' },
        })
        o.synth.fadeFactor = this.melodyFadeFactor
        o.synth.minSight = this.melodyMinSight
        o.synth.maxSight = this.melodyMaxSight
        o.synth.audible = false
        o.channel = new Tone.Channel({ channelCount: 2 })
        o.synth.chain(o.channel, this.channels.melody)
        break
    }
    this.updateSynth(o, 0)
  }
  disposeSynth(o) {
    try {
      if (o.synth) {
        o.synth.dispose()
        o.synth = false
      }
      if (o.channel) {
        o.channel.dispose()
        o.channel = false
      }
    } catch (error) {
      console.log(error)
    }
  }
  startBgm(scene) {
    this.scene = scene
    const start = () => {
      // setup();
      // this.objectGroup.initSound();
      // set this context as the global Context
      try {
        Tone.start()

        // setInterval(() => {
        //   // this.updateSound(this.scene, 50)
        // }, 50)

        // setInterval(this.updateSound.bind(this), 300);
        document.removeEventListener('click', start)
        document.removeEventListener('touchend', start)
        document.removeEventListener('keydown', start)
        // setInterval(() => {
        //   this.updateSound(this.scene)
        // }, 200)
      } catch (error) {
        console.log(error)
      }
    }
    if (Tone.context.state == 'running') {
      // if (true) {
      start()
    } else {
      let clickListener = document.addEventListener('click', start)
      let touchListener = document.addEventListener('touchend', start)
      let keyListener = document.addEventListener('keydown', start)
    }
  }
}
export default new GenerativeMusic()
