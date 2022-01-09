import MS from 'teoria'
import * as Tone from 'tone'
import { customIntRandom, customWRandom, seededRandomKept } from '../utils/random'
import { range } from '../utils/utils'
import configurations from './configurations'
import deePool from './deePool'
import _ from 'lodash'
import SampleLibrary from './SampleLibrary'
// export default
class GenerativeMusic {
  constructor(scene) {
    console.log(Tone.getDestination().volume)
    this.scene = scene
    this.soundList = { melody: [], chord: [] }
    this.audibleList = []
    const initTone = () => {
      // const context = new Tone.Context({ latencyHint: 4000 })
      const context = new Tone.Context({ latencyHint: 'playback' })
      Tone.setContext(context)
      Tone.getTransport().bpm.value = 60
      Tone.getTransport().start()
    }
    initTone()
    this.N4_LENGTH = Tone.Time('4n').toSeconds()
    this.CHORD_LENGTH = { 8: 0.1, 6: 0.1, 4: 0.8, 2: 0.5, 1: 0.3 }
    this.CHORD_SYNC = 32
    this.MELODY_NOTES = {
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
    }
    this.EQ_AMOUNT = 4
    this.DELAY_AMOUNT = -10
    this.REVERB_AMOUNT = 0
    this.scale = MS.note.fromMIDI(configurations.DAY.intRandom(70, 82)).scale('major')
    this.chordLoopLength = 128
    this.melodyLoopLength = 2
    // this.melodyLoopLength = 48;
    this.melodyIntervalRandomRange = 1
    this.melodyFadeFactor = 1
    this.chordFadeFactor = 1.5
    this.chordRythm
    this.melodyRythm
    this.melodyMinAudible = configurations.PLAYER_TARGET_H
    this.melodyMaxAudible = 14 * configurations.PLAYER_TARGET_H
    this.chordMinAudible = configurations.PLAYER_TARGET_H
    this.chordMaxAudible = 25 * configurations.PLAYER_TARGET_H
    /* NOTE
    instrument sound trail
    ->Instance Channel->Instrument Channel->Master
    ->Instance Effect Channel->Send To Effect Bus->Buses->Master
    */
    this.channels = {
      master: new Tone.Channel({ volume: -40, pan: 0, channelCount: 2, mute: false }),
      bell: new Tone.Channel({ volume: 10, pan: 0, channelCount: 2, mute: false }),
      pad: new Tone.Channel({ volume: -35, pan: 0, channelCount: 2, mute: false }),
      buses: new Tone.Channel({ volume: -10, pan: 0, channelCount: 2, mute: false }),
    }
    this.channels.bell.chain(this.channels.master)
    this.channels.pad.chain(this.channels.master)
    this.channels.buses.chain(this.channels.master)
    this.channels.master.connect(Tone.getDestination())
    this.synths = {}
    let instruments = SampleLibrary.load({
      instruments: ['salamander', 'cello'],
      options: [
        { attack: 0, release: 0.5 },
        { attack: 1.2, release: 0.5 },
      ],
      onload: () => {
        // Object.assign(synth, synthAsync)
      },
    })

    this.synths.bell = deePool.create(() => {
      let synth = {}
      synth.instrument = instruments['salamander']
      // synth.current = synthFallback
      synth.fadeFactor = this.melodyFadeFactor
      synth.MinAudible = this.melodyMinAudible
      synth.MaxAudible = this.melodyMaxAudible
      synth.audible = false
      synth.channel = new Tone.Channel({ channelCount: 2 })
      synth.dryChannel = new Tone.Channel({ channelCount: 2 })
      synth.effectChannel = new Tone.Channel({ channelCount: 2 })
      synth.eq = new Tone.EQ3()
      synth.channel.chain(synth.effectChannel)
      synth.channel.chain(synth.dryChannel)
      synth.dryChannel.chain(synth.eq, this.channels.bell)
      return synth
    })
    this.synths.bell.grow(50)
    this.synths.pad = deePool.create(() => {
      let synth = {}
      synth.instrument = instruments['cello']
      synth.fadeFactor = this.chordFadeFactor
      synth.MinAudible = this.chordMinAudible
      synth.MaxAudible = this.chordMaxAudible
      synth.audible = false
      synth.channel = new Tone.Channel({ channelCount: 2 })
      synth.dryChannel = new Tone.Channel({ channelCount: 2 })
      synth.effectChannel = new Tone.Channel({ channelCount: 2 })
      synth.eq = new Tone.EQ3()
      synth.channel.chain(synth.effectChannel)
      synth.channel.chain(synth.dryChannel)
      synth.dryChannel.chain(synth.eq, this.channels.pad)
      return synth
    })
    this.synths.pad.grow(50)

    let makeBus = (node, name) => {
      let bus = new Tone.Channel({ channelCount: 2 })
      bus.node = node
      bus.chain(node, this.channels.buses)
      bus.receive(name)
      node.bus = bus
      return node
    }
    this.effects = {
      reverb: makeBus(
        new Tone.Reverb({
          roomSize: 0.75,
          wet: 1,
        }),
        'reverb'
      ),
      delay: makeBus(
        new Tone.FeedbackDelay({
          delayTime: '8n.',
          maxDelayTime: '4n',
          feedback: 0.5,
          wet: 1,
        }),
        'delay'
      ),
      eq: makeBus(new Tone.EQ3({}), 'eq'),
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

      limiter: new Tone.Limiter(-2),
    }
    // .connect(this.effectNodes.stereoWidener)
    // .connect(this.effectNodes.stereoWidener2)
    // .connect(this.effectNodes.compressor)
    // .connect(this.effectNodes.compressor2)
    // .connect(this.effectNodes.limiter)
    // this.effects.delay.bus.send('reverb', -4)
    MS.Scale.prototype.getNote = function(i) {
      let degree = i.mod(this.notes().length)
      let octave = (i - degree) / this.notes().length + this.tonic.octave()
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

        // if (day.random() > 0.9) {
        //   this.chordSequence[currentPos].push(false);
        // }

        this.chordSequence[currentPos].push(currentChordDegree)
        // this.chordSequence[currentPos].push(currentChordDegree);
        let previousPos = currentPos
        // currentPos += 4
        currentPos += parseInt(day.wRandom(this.CHORD_LENGTH)) * 2

        if (
          (previousPos + 1).iDivide(this.CHORD_SYNC) < (currentPos + 1).iDivide(this.CHORD_SYNC)
        ) {
          currentPos = currentPos - (currentPos + 1).mod(this.CHORD_SYNC)
        }
      }
      console.log(`chordSequence: ${this.chordSequence}`)
      console.log(this.chordSequence)
      this.chordLoop = new Tone.Sequence(
        (time, note) => {
          this.soundList.chord.forEach(o => {
            if (!o.synth) {
              console.log('synth missing')
              return
            }
            if (o.synth.audible) {
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
                if (jumpA == jumpB) {
                  Math.random() > 0.5 ? jumpA++ : jumpB++
                }
                if (jumpA == 0) {
                  Math.random() > 0.5 ? jumpA++ : false
                }
                if (jumpB == 0) {
                  Math.random() > 0.5 ? jumpB++ : false
                }
                return jumpA - jumpB
              })
              console.log('release')
              o.previousNote && o.synth.instrument.triggerRelease(o.previousNote.scientific())
              o.note = o.previousNote = possibleNotes[0]
              // o.note = o.previousNote = possibleNotes[o.intRandom(0, possibleNotes.length - 1)]
              console.log(`H: ${o.note}`)
              // console.log(`H: ${o.note.scientific()} ${o.dialog}`)
              // o.synth.set({
              //   width: Phaser.Math.Angle.WrapDegrees(Phaser.Math.Angle.BetweenPoints(this.player, o)) / 180
              // });
              o.synth.instrument
                .getAttackSources(o.note.scientific(), undefined, o.velocity)
                .forEach(s => s.chain(o.synth.channel))
            } else if (o.previousNote) {
              o.synth.instrument.triggerRelease(o.previousNote.scientific())
              o.previousNote = false
            }
          })
        },
        this.chordSequence,
        '4n'
      )
      this.chordLoop.humanize = '8n'
      // let rootPadSynth = new Tone.Synth({
      //   oscillator: { type: 'sine', volume: -55 },
      //   envelope: { release: '4n', attack: '4n' },
      // })
      // rootPadSynth.chain(this.channels.pad)
      // new Tone.Sequence((time, note) => {
      //   if (!note) {
      //     return
      //   }
      //   // console.log(`R: ${this.scale.getNote(note - 14).scientific()}`)
      //   rootPadSynth.instrument.triggerRelease()
      //   rootPadSynth.instrument.triggerAttack(this.scale.getNote(note - 7).scientific())
      // }, this.chordSequence).start()
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
  //   console.time('updateSound Performance')

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
  //     const positionX = o.instance.x - this.scene.player.x
  //     const positionY = this.scene.player.y - o.instance.y
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
  //   console.timeEnd('updateSound Performance')
  // }
  /**
   * @param  {} delta
   */
  updateSynths(delta) {
    this.audibleList = []
    console.time('updateSynths Performance')
    Object.keys(this.soundList).forEach(key =>
      this.soundList[key].forEach(o => {
        this.updateSynth(o, delta)
      })
    )
    console.timeEnd('updateSynths Performance')
    console.log('Audible:' + this.audibleList.length)
  }

  /**
   */
  updateSound() {
    let currentZone = this.scene.objectData.soundMap.getZone(this.scene.player)
    // console.log(currentZone, this.previousZone)
    if (
      !(
        this.previousZone &&
        currentZone[0] == this.previousZone[0] &&
        currentZone[1] == this.previousZone[1]
      )
    ) {
      console.time('updateSound Performance')
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
      console.log({ create: JSON.stringify(createZones), destroy: JSON.stringify(destroyZones) })
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
          o.loop || this.setupLoop(o)
          this.soundList[o.character].push(o)
          this.setupSynth(o)
        })
      })
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
            this.soundList[o.character].indexOf(o) > -1 &&
              this.soundList[o.character].splice(this.soundList[o.character].indexOf(o), 1)
            this.recycleSynth(o)
          }
        })
      })
      console.log(
        Object.keys(this.soundList).reduce(
          (acc, key) => acc + `${key}:${this.soundList[key].length} `,
          ''
        )
      )
      // Object.keys(this.soundList).forEach(key => {
      //   this.soundList[key].filter(o=>o.audible)
      // })

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
      console.timeEnd('updateSound Performance')
    }
  }
  updateSynth(o, delta) {
    let synth = o.synth
    if (!synth) {
      return
    }
    let instance = o.instance || o
    const positionX = instance.x - this.scene.player.x
    const positionY = instance.y - this.scene.player.y
    let distance = (positionX ** 2 + positionY ** 2) ** 0.5
    // console.log({ positionX, positionY, distance })
    let pan =
      (Math.acos(positionX / distance) / Math.PI - 1) * Math.min(1, distance / instance.width)
    distance = Math.max(distance, synth.MinAudible)
    synth.audible = distance < synth.MaxAudible

    if (synth.audible) {
      this.audibleList.push(o._id)
      let volume =
        -40 *
        ((distance - synth.MinAudible) / (synth.MaxAudible - synth.MinAudible)) ** synth.fadeFactor

      synth.dryChannel.pan.rampTo(Math.abs(pan) ** 1.3, delta / 1200)
      synth.effectChannel.pan.rampTo(Math.abs(pan) ** 0.8, delta / 1200)
      // synth.channel.volume.rampTo(-10, delta / 128/10)
      synth.dryChannel.volume.rampTo(volume, delta / 1200)
    } else {
      // let location = this.audibleList.indexOf(o._id)
      // location > -1 && this.audibleList.splice(location, 1)
    }
  }

  setupLoop(o) {
    o.random = seededRandomKept(o._id.toString())
    o.wRandom = customWRandom(o.random)
    o.intRandom = customIntRandom(o.random)
    if (o.isBackground) {
      o.instrument = 'pad'
      o.character = 'chord'
    } else {
      o.instrument = 'bell'
      o.character = 'melody'
    }
    o.sizeFactor =
      (configurations.OBJECT_W[o.size] + configurations.OBJECT_W.M) /
      (configurations.OBJECT_W.XXL + configurations.OBJECT_W.M)
    o.delayAmount = 10 * (1 - 2 * o.sizeFactor) + this.DELAY_AMOUNT
    o.reverbAmount = 10 * (1 - o.zFactor) + this.REVERB_AMOUNT
    o.tone = 1 - 2 * o.sizeFactor
    o.velocity = o.sizeFactor ** 0.2
    switch (o.character) {
      case 'chord':
        // PadSynth
        o.min = o.intRandom(-this.scale.notes().length - 5, 0)
        o.max = o.min + o.intRandom(4, 6)
        // o.min = scale.getNote(o.min);
        // o.max = scale.getNote(o.max);
        o.range = range(o.min, o.max).map(i => this.scale.getNote(i))
        o.loop = true
        break
      case 'melody':
        // What about using pattern?
        // if (!previousNote) {

        // } else {
        //   // o.noteIndex = previousNote.noteIndex + Math.floor((o.random() ** 1.2) * 9) - 4;
        // }
        // o.loopInterval = (this.melodyLoopLength + o.intRandom(-2, 2) / 4) * this.N4_LENGTH
        o.loopInterval = this.melodyLoopLength * this.N4_LENGTH
        o.loopSpeed = 1

        o.melodySequence = []
        o.noteIndex = o.wRandom(this.MELODY_NOTES)
        o.note = this.scale.getNote(parseInt(o.noteIndex))

        o.beat = o.intRandom(0, this.melodyLoopLength - 1)
        o.subdivision = parseFloat(
          o.wRandom({ '0': 5, '0.5': 4, '0.3': 0.3, '0.6': 0.3, '0.25': 0.3, '0.75': 0.3 })
        )
        o.time = (o.beat + o.subdivision) * this.N4_LENGTH
        // o.melodySequence[o.beat][o.subdivision] = o.note
        o.melodySequence.push([o.time, o.note])
        o.noteIndex = o.wRandom(this.MELODY_NOTES)
        o.note = this.scale.getNote(parseInt(o.noteIndex))
        o.beat = o.intRandom(0, this.melodyLoopLength - 1)
        o.subdivision = parseFloat(
          o.wRandom({ '0': 5, '0.5': 4, '0.3': 0.3, '0.6': 0.3, '0.25': 0.3, '0.75': 0.3 })
        )
        o.time = (o.beat + o.subdivision) * this.N4_LENGTH
        // o.melodySequence.push([o.time + this.melodyLoopLength, o.note])
        // o.melodySequence[o.beat][o.subdivision] = o.note
        // let isMelodySpaced = o.wRandom({ false: 0.3, true: 0.1 })
        // while (isMelodySpaced == 'true') {
        //   o.melodySequence[o.beat].push(false)
        //   isMelodySpaced = o.wRandom({ false: 0.4, true: 0.1 })
        // }
        o.loop = new Tone.Part((time, note) => {
          // console.log(o.synth, o.synth.audible, note)
          if (o.synth && o.synth.audible) {
            if (!note) {
              return
            }
            console.log(`M: ${note}`)
            // console.log(`M: ${o.note.scientific()} ${o.dialog}`)
            // o.synth.instrument.getAttackSources(o.note.scientific()).forEach(s => s.chain(o.synth.channel))
            o.synth.instrument
              .getAttackReleaseSources(o.note.scientific(), '4n', undefined, o.velocity)
              .forEach(s => s.chain(o.synth.channel))
            // o.synth
            //   .getAttackReleaseSources(o.note.scientific())
            //   .forEach(s => s.chain(o.synth.channel))
          }
        }, o.melodySequence)
        o.loop.loop = true
        o.loop.loopEnd = o.loopInterval
        o.loop.humanize = '8n'

        // o.secondLoop = new Tone.Part((time, note) => {
        //   if (o.secondLoopOn) {
        //     if (o.synth && o.synth.audible) {
        //       if (!note) {
        //         return
        //       }
        //       console.log(`M`)
        //       // console.log(`M: ${o.note.scientific()} ${o.dialog}`)
        //       o.synth.instrument.triggerAttackRelease(note.scientific(), '8n')
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
        //     synth.instrument.triggerAttackRelease(o.note.scientific(), "8n");
        //   }, this.N4_LENGTH * o.loopInterval, o.intRandom(0, 8) * this.N4_LENGTH);
        // code
        break
    }
  }
  /**
   * @param  {Object} o
   */
  setupSynth(o) {
    try {
      if (!o.synth) {
        o.synth = this.synths[o.instrument].use()
      }
      if (o.character == 'melody') {
        o.loop.start()
      }
      o.synth.effectChannel.send('reverb', o.reverbAmount)
      o.synth.effectChannel.send('delay', o.delayAmount)
    } catch (error) {
      console.log(error)
      console.log(this.synths[o.instrument])
    }
    if (o.tone > 0) {
      o.synth.eq.set({
        low: (-o.tone * this.EQ_AMOUNT) / 2,
        middle: 0,
        high: o.tone * this.EQ_AMOUNT,
      })
    } else {
      o.synth.eq.set({
        low: -o.tone * this.EQ_AMOUNT,
        middle: (-o.tone * this.EQ_AMOUNT) / 2,
        high: (o.tone * this.EQ_AMOUNT) / 2,
      })
    }
    this.updateSynth(o, 0)
  }
  recycleSynth(o) {
    try {
      if (o.synth) {
        o.synth.channel.initialized = true
        o.previousNote && o.synth.instrument.triggerRelease(o.previousNote.scientific())
        o.previousNote = false
        this.synths[o.instrument].recycle(o.synth)
        o.synth = false
        if (o.character == 'melody') {
          o.loop.stop()
        }
      }
    } catch (error) {
      console.log(error)
    }
  }
  setupScene(scene) {
    this.scene = scene
  }
  startBgm() {
    this.updateSound()
    const start = () => {
      try {
        Tone.start()
        this.chordLoop.start()
        console.log('Generative Music Started')
        // const osc = new Tone.Oscillator('C3').start()
        // osc.toDestination()
        document.removeEventListener('click', start)
        document.removeEventListener('touchend', start)
        document.removeEventListener('keydown', start)
      } catch (error) {
        console.log(error)
      }
    }
    if (Tone.context.state == 'running') {
      // if (true) {
      start()
    } else {
      document.addEventListener('click', start)
      document.addEventListener('touchend', start)
      document.addEventListener('keydown', start)
    }
  }
}
export default new GenerativeMusic()
