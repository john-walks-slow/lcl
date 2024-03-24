import MS from 'teoria'
import * as Tone from 'tone'
import { customIntRandom, customWRandom, seededRandomKept } from '../utils/random'
import { range } from '../utils/utils'
import configurations from './configurations'
import deePool from './deePool'
import SampleLibrary from './SampleLibrary'

MS.Scale.prototype.getNote = function (i) {
  let degree = i.mod(this.notes().length)
  let octave = (i - degree) / this.notes().length + this.tonic.octave()
  return MS.note(this.notes()[degree].name() + octave.toString())
}

// /**
//  * @typedef {{
//  *  synth: Tone.Sampler,
//  *  instrument: Tone.Sampler,
//  *  fadeFactor: number,
//  *  MinAudible: number,
//  *  MaxAudible: number,
//  *  audible: boolean,
//  *  channel: Tone.Channel,
//  *  dryChannel: Tone.Channel,
//  *  effectChannel: Tone.Channel,
//  *  eq: Tone.EQ3,
//  * }} SoundObject
//  */

class GenerativeMusic {
  /**
   * @typedef {Object} SoundObject
   * @property {Synth} synth
   */

  /**
   * @typedef {"melody"|"chord"} Character
   */
  /**
   * @type {{[key in Character]: SoundObject[]}}
   * */
  soundList = { melody: [], chord: [] }
  audibleList = []
  MAX_SOUND = 8
  FADE_OUT_VOLUME = -50
  MASTER_VOLUME = 5
  N4_LENGTH = Tone.Time('4n').toSeconds()
  CHAR2INST = {
    chord: 'cello',
    melody: 'salamander',
  }
  /**
   * Synth
   * @typedef {Object} Synth
   * @property {Boolean} audible
   * @property {Tone.PanVol} panVol
   * @property {Tone.PanVol} delaySend
   * @property {Tone.PanVol} reverbSend
   * @property {Tone.EQ3} preFx
   */
  /**@typedef {"bell"|"pad"} SynthType */
  /**@type {{[k in SynthType]: deePool.DeePool<Synth>}} */
  synths = {}

  constructor(startMuted = false) {
    Tone.setContext(new Tone.Context({ latencyHint: 'interactive', sampleRate: 44100 }))
    // DEBUG
    window.Tone = Tone
    window.gm = this
    this.startMuted = startMuted
    this._setupChordSequence()
  }

  _setupChordSequence() {
    console.time('setupGlobalSequence Performance')
    this.MELODY_PROBS = {
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
    this.CHORD_LENGTH_PROBS = { 8: 0.1, 6: 0.1, 4: 0.8, 2: 0.6, 1: 0.3 }
    this.CHORD_SYNC = 24
    this.CHORD_LOOP_LENGTH = 150
    this.MELODY_LOOP_LENGTH = 10
    this.FADE_FACTOR = { melody: 1.5, chord: 1.5 }
    this.AUDIBLE_RANGE = {
      melody: [configurations.PLAYER_TARGET_H, configurations.PLAYER_TARGET_H * 20],
      chord: [configurations.PLAYER_TARGET_H * 3, configurations.PLAYER_TARGET_H * 25],
    }
    this.VOLUME_RANGE = {
      melody: [-25, 3],
      chord: [-43, -28],
    }
    this.CHORD_TYPE = { T: 0, D: 1, S: 2 }
    this.SCALE = MS.note.fromMIDI(configurations.DAY.intRandom(70, 78)).scale('major')

    let majorMinor = configurations.DAY.random() + 0.1
    this.CHORD_PROBS =
      majorMinor > 1
        ? [
            { 1: Math.round(0.7), 3: 0.15, 6: 0.15 },
            { 5: Math.round(0.7), 2: 0.15, 3: 0.15 },
            { 4: Math.round(0.7), 2: 0.15, 6: 0.15 },
          ]
        : [
            { 6: Math.round(0.7), 1: 0.15, 4: 0.15 },
            { 3: Math.round(0.7), 1: 0.15, 5: 0.15 },
            { 2: Math.round(0.7), 4: 0.15, 5: 0.15 },
          ]

    let currentPos = 0
    let currentType = false
    // chordSequence = [...Array(CHORD_LOOP_LENGTH)].map(i => []);
    let chordSequence = [...Array(this.CHORD_LOOP_LENGTH)].map(() => [])
    while (currentPos < this.CHORD_LOOP_LENGTH) {
      switch (currentType) {
        case 'D':
          currentType = configurations.DAY.wRandom({ T: 4, D: 2, S: 1 })
          break
        case 'S':
          currentType = configurations.DAY.wRandom({ T: 3, D: 4, S: 2 })
          break
        case 'T':
          currentType = configurations.DAY.wRandom({ T: 2, D: 3, S: 4 })
          break
        default:
          currentType = configurations.DAY.wRandom({ T: 1, D: 1, S: 1 })
          break
      }
      // let currentChordDegree = this.CHORD_PROBS[CHORD_TYPE[currentType]][day.wRandom({ 0: 0.4, 1: 0.3, 2: 0.3 })] ;
      let currentChordDegree = parseInt(
        configurations.DAY.wRandom(this.CHORD_PROBS[this.CHORD_TYPE[currentType]])
      )
      // let currentChordNotes = [scale.get(currentChordDegree).name(), scale.get(currentChordDegree + 2).name(), scale.get(currentChordDegree + 4).name().toUpperCase()];

      // if (day.random() > 0.9) {
      //   chordSequence[currentPos].push(false);
      // }

      chordSequence[currentPos].push(currentChordDegree)
      // chordSequence[currentPos].push(currentChordDegree);
      let previousPos = currentPos
      // currentPos += 4
      currentPos += parseInt(configurations.DAY.wRandom(this.CHORD_LENGTH_PROBS)) * 2

      if ((previousPos + 1).iDivide(this.CHORD_SYNC) < (currentPos + 1).iDivide(this.CHORD_SYNC)) {
        currentPos = currentPos - (currentPos + 1).mod(this.CHORD_SYNC)
      }
    }
    console.log(`chordSequence: ${chordSequence}`)
    console.log(chordSequence)
    this.chordLoop = new Tone.Sequence(
      (time, note) => {
        this.soundList.chord.forEach((o) => {
          if (!o.synth) {
            console.log('synth missing')
            return
          }
          if (o.synth.audible) {
            if (!note) {
              return
            }
            let notes = [note - 1, note + 1, note + 3].map((n) => this.SCALE.getNote(n).name())
            const possibleNotes = o.range.filter((n) => notes.includes(n.name()[0]))
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
            o.previousNote &&
              this.instruments[this.CHAR2INST[o.character]].triggerRelease(
                o.previousNote.scientific()
              )
            o.note = o.previousNote = possibleNotes[0]
            // o.note = o.previousNote = possibleNotes[o.intRandom(0, possibleNotes.length - 1)]
            // console.log(`H: ${o.note}`)
            // console.log(`H: ${o.note.scientific()} ${o.dialog}`)
            // o.synth.set({
            //   width: Phaser.Math.Angle.WrapDegrees(Phaser.Math.Angle.BetweenPoints(this.player, o)) / 180
            // });

            this.instruments[this.CHAR2INST[o.character]].triggerAttack(
              o.note.scientific(),
              undefined,
              o.velocity,
              o.synth.panVol
            )
            // console.log(o.velocity, this.channels.master.volume)
          } else if (o.previousNote) {
            this.instruments[this.CHAR2INST[o.character]].triggerRelease(
              o.previousNote.scientific()
            )
            o.previousNote = false
          }
        })
      },
      chordSequence,
      '4n'
    )
    this.chordLoop.humanize = '8n'
    console.timeEnd('setupGlobalSequence Performance')
  }

  prepare(callback) {
    this._loadSamples(() => {
      this._setupChannels()
      callback && callback.apply()
    })
  }

  _loadSamples(onload) {
    console.time('loadSamples Performance')
    let loaded = 0
    const config = {
      instruments: ['salamander', 'cello'],
      options: [
        { attack: 0, release: 0.5 },
        { attack: 2.3, release: 2.3 },
      ],
      ext: '.ogg',
      onload: () => {
        loaded++
        console.log(config.instruments.length, loaded)
        if (loaded === config.instruments.length) {
          console.timeEnd('loadSamples Performance')
          onload && onload.apply()
        }
      },
      onerror: (e) => {
        console.log(e)
      },
    }
    this.instruments = SampleLibrary.load(config)
  }

  _setupChannels() {
    console.time('setupChannels Performance')

    /* NOTE
    instrument sound trail
    Sampler->Instance Channel->Instance EQ-------------->Instrument Channel->Master->Destination
                                          ->FX Gain->FX->
    */
    this.channels = {
      master: new Tone.Channel({
        volume: this.FADE_OUT_VOLUME,
        pan: 0,
        channelCount: 2,
      }),
      reverbBus: new Tone.Reverb({
        roomSize: 0.85,
        decay: '5',
        // decay: '1n',
        wet: 1,
      }),
      delayBus: new Tone.FeedbackDelay({
        delayTime: '8n.',
        maxDelayTime: '4n',
        feedback: 0.4,
        wet: 1,
      }),
      masterFx: {
        // eq: new Tone.EQ3({}),
        // stereoWidener: new Tone.StereoWidener(0.7),
        // stereoWidener2: new Tone.StereoWidener(0.96),
        delay: new Tone.FeedbackDelay({
          delayTime: '8n.',
          maxDelayTime: '4n',
          feedback: 0.4,
          wet: 0.15,
        }),
        reverb: new Tone.Reverb({
          roomSize: 0.65,
          decay: '3',
          // decay: '1n',
          wet: 0.2,
        }),
        compressor: new Tone.Compressor({
          ratio: 5,
          threshold: -5,
          release: 0.25,
          attack: 0.05,
        }),
        limiter: new Tone.Limiter(-0.6),
      },
    }
    // this.channels.reverbBus.connect(this.channels.master)
    // this.channels.delayBus.connect(this.channels.master)
    this.channels.master.chain(...Object.values(this.channels.masterFx), Tone.getDestination())

    this.synths = deePool.create(() => {
      /**@type {Synth} */
      let synth = {
        audible: false,
        panVol: new Tone.PanVol({ volume: -25, channelCount: 2 }),
        delaySend: new Tone.PanVol({ channelCount: 2 }),
        reverbSend: new Tone.PanVol({ channelCount: 2 }),
        eq: new Tone.EQ3(),
      }
      synth.panVol.chain(synth.eq, this.channels.master)
      // synth.panVol.chain(synth.delaySend, this.channels.delayBus)
      // synth.panVol.chain(synth.reverbSend, this.channels.reverbBus)
      return synth
    })
    this.synths.grow(15)
    console.timeEnd('setupChannels Performance')
  }

  start(scene) {
    this.scene = scene
    const startContext = async () => {
      try {
        // await Tone.start()
        await Tone.start()
        console.log('Generative Music Started')
        this._updateSound()
        Tone.getTransport().bpm.value = 165
        this.chordLoop.start()
        setInterval(() => {
          this._updateSound()
          this._updateSynths(500)
        }, 500)
        if (!this.startMuted) {
          Tone.getTransport().start()
          this.fadeIn()
        }
        // const osc = new Tone.Oscillator('C3').start()
        // osc.toDestination()
        document.removeEventListener('click', startContext)
        document.removeEventListener('touchend', startContext)
        document.removeEventListener('keydown', startContext)
      } catch (error) {
        console.log(error)
      }
    }
    if (Tone.context.state == 'running') {
      startContext()
    } else {
      document.addEventListener('click', startContext)
      document.addEventListener('touchend', startContext)
      document.addEventListener('keydown', startContext)
    }
  }
  /**
   * 根据scene、previouszone等生成新的soundlist
   */
  _updateSound() {
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
        (x) => !JSON.stringify(previousZones).includes(JSON.stringify(x))
      )
      let destroyZones = previousZones.filter(
        (x) => !JSON.stringify(currentZones).includes(JSON.stringify(x))
      )
      this.previousZone = currentZone
      // console.log({ prev: previousZones, cur: currentZones });
      console.log({
        create: JSON.stringify(createZones),
        destroy: JSON.stringify(destroyZones),
      })
      destroyZones.forEach((zone) => {
        if (!this.scene.objectData.soundMap[zone[0]]) {
          return
        }
        if (!this.scene.objectData.soundMap[zone[0]][[zone[1]]]) {
          return
        }
        let os = this.scene.objectData.soundMap[zone[0]][zone[1]]
        os.forEach((o) => {
          if (o.synth) {
            this.soundList[o.character].indexOf(o) > -1 &&
              this.soundList[o.character].splice(this.soundList[o.character].indexOf(o), 1)
            this._recycleSynth(o)
          }
        })
      })
      createZones.forEach((zone) => {
        // console.log(this.scene.objectData.soundMap);
        if (!this.scene.objectData.soundMap[zone[0]]) {
          return
        }
        if (!this.scene.objectData.soundMap[zone[0]][[zone[1]]]) {
          return
        }
        let os = this.scene.objectData.soundMap[zone[0]][zone[1]]
        os.forEach((o) => {
          o.loop || this._setupLoop(o)
          if (this.soundList[o.character].length < this.MAX_SOUND) {
            this.soundList[o.character].push(o)
            this._setupSynth(o)
          }
        })
      })

      console.timeEnd('updateSound Performance')
      console.log(
        Object.keys(this.soundList).reduce(
          (acc, key) => acc + `${key}:${this.soundList[key].length} `,
          ''
        )
      )
    }
  }

  /**
   * 根据soundlist更新所有synths
   * @param  {} delta
   */
  _updateSynths(delta) {
    this.audibleList = []
    console.time('updateSynths Performance')

    Object.keys(this.soundList).forEach((key) =>
      this.soundList[key].forEach((o, i) => {
        // if (i < this.MAX_SOUND) {
        this._updateSynth(o, delta)
        // }
      })
    )
    console.timeEnd('updateSynths Performance')
    // console.log('Audible:' + this.audibleList.length)
  }

  /**
   *
   * @param {SoundObject} o
   * @param {*} delta
   * @returns
   */
  _updateSynth(o, delta) {
    let synth = o.synth
    if (!synth) {
      return
    }
    let instance = o.instance || o
    const positionX = instance.x - this.scene.player.x
    const positionY = instance.y - this.scene.player.y
    let distance = (positionX ** 2 + positionY ** 2) ** 0.5
    // console.log({ positionX, positionY, distance })
    let minAudible = this.AUDIBLE_RANGE[o.character][0]
    let maxAudible = this.AUDIBLE_RANGE[o.character][1]
    let minVolume = this.VOLUME_RANGE[o.character][0]
    let maxVolume = this.VOLUME_RANGE[o.character][1]
    let fadeFactor = this.FADE_FACTOR[o.character]
    synth.audible = distance < maxAudible

    if (synth.audible) {
      let pan =
        -1 -
        2 *
          ((Math.acos(positionX / distance) / Math.PI - 1) * Math.min(1, distance / instance.width))
      let volume =
        minVolume +
        (maxVolume - minVolume) *
          ((distance - minAudible) / (maxAudible - minAudible)) ** fadeFactor
      this.audibleList.push(o._id)
      try {
        synth.panVol.set({ pan: pan, volume: volume })
      } catch (error) {
        console.log(pan)
        console.log(error)
      }
      // synth.channel.pan.rampTo(Math.abs(pan) ** 2, delta / 1200)
      // synth.channel.volume.rampTo(volume, delta / 1200)
      // synth.delaySend.pan.rampTo(Math.abs(pan) ** 0.8, delta / 1200)
    } else {
      // let location = this.audibleList.indexOf(o._id)
      // location > -1 && this.audibleList.splice(location, 1)
    }
  }
  _setupLoop(o) {
    o.random = seededRandomKept(o._id.toString())
    o.wRandom = customWRandom(o.random)
    o.intRandom = customIntRandom(o.random)
    if (o.random() < (o.zFactor - 0.2) / 2) {
      o.instrument = 'pad'
      o.character = 'chord'
    } else {
      o.instrument = 'bell'
      o.character = 'melody'
    }
    o.sizeFactor =
      (configurations.OBJECT_W[o.size] + configurations.OBJECT_W.M) /
      (configurations.OBJECT_W.XXL + configurations.OBJECT_W.M)
    o.delayOffset = 10 * (1 - 2 * o.sizeFactor)
    o.reverbOffset = 10 * (1 - o.zFactor)
    o.tone = 1 - 2 * o.sizeFactor
    o.velocity = o.sizeFactor ** 0.2

    switch (o.character) {
      case 'chord':
        // PadSynth
        o.min = o.intRandom(-this.SCALE.notes().length - 12, -5)
        o.max = o.min + o.intRandom(4, 6)
        // o.min = scale.getNote(o.min);
        // o.max = scale.getNote(o.max);
        o.range = range(o.min, o.max).map((i) => this.SCALE.getNote(i))
        o.loop = true
        break
      case 'melody':
        // What about using pattern?
        // if (!previousNote) {

        // } else {
        //   // o.noteIndex = previousNote.noteIndex + Math.floor((o.random() ** 1.2) * 9) - 4;
        // }
        // o.loopInterval = (MELODY_LOOP_LENGTH + o.intRandom(-2, 2) / 4) * this.N4_LENGTH
        o.loopInterval = this.MELODY_LOOP_LENGTH * this.N4_LENGTH
        o.loopSpeed = 1

        o.melodySequence = []
        o.noteIndex = o.wRandom(this.MELODY_PROBS)
        o.note = this.SCALE.getNote(parseInt(o.noteIndex))

        o.beat = o.intRandom(0, this.MELODY_LOOP_LENGTH - 1)
        o.subdivision = parseFloat(
          o.wRandom({ 0: 5, 0.5: 4, 0.3: 0.3, 0.6: 0.3, 0.25: 0.3, 0.75: 0.3 })
        )
        o.time = (o.beat + o.subdivision) * this.N4_LENGTH
        // o.melodySequence[o.beat][o.subdivision] = o.note
        o.melodySequence.push([o.time, o.note])
        o.noteIndex = o.wRandom(this.MELODY_PROBS)
        o.note = this.SCALE.getNote(parseInt(o.noteIndex))
        o.beat = o.intRandom(0, this.MELODY_LOOP_LENGTH - 1)
        o.subdivision = parseFloat(
          o.wRandom({ 0: 5, 0.5: 4, 0.3: 0.3, 0.6: 0.3, 0.25: 0.3, 0.75: 0.3 })
        )
        o.time = (o.beat + o.subdivision) * this.N4_LENGTH
        // o.melodySequence.push([o.time + this.MELODY_LOOP_LENGTH, o.note])
        // o.melodySequence[o.beat][o.subdivision] = o.note
        // let isMelodySpaced = o.wRandom({ false: 0.3, true: 0.1 })
        // while (isMelodySpaced == 'true') {
        //   o.melodySequence[o.beat].push(false)
        //   isMelodySpaced = o.wRandom({ false: 0.4, true: 0.1 })
        // }
        o.loop = new Tone.Part((time, note) => {
          if (Math.random() > 0.62) {
            o.noteIndex = o.wRandom(this.MELODY_PROBS)
            o.note = this.SCALE.getNote(parseInt(o.noteIndex))
          }
          // console.log(o.synth, o.synth.audible, note)
          if (o.synth && o.synth.audible) {
            if (!note) {
              return
            }
            // console.log(`M: ${note}`)
            // console.log(`M: ${o.note.scientific()} ${o.dialog}`)
            // this.instruments[this.CHAR2INST[o.character]].getAttackSources(o.note.scientific()).forEach(s => s.chain(o.synth.channel))
            // console.log(o.synth)
            this.instruments[this.CHAR2INST[o.character]].triggerAttackRelease(
              o.note.scientific(),
              '4n',
              undefined,
              o.velocity,
              o.synth.panVol
            )

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
        //       this.instruments[this.CHAR2INST[o.character]].triggerAttackRelease(note.scientific(), '8n')
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
   * @param  {SoundObject} o
   */
  _setupSynth(o) {
    const EQ_AMOUNT = 4
    const DELAY_AMOUNT = -10
    const REVERB_AMOUNT = -10
    try {
      if (!o.synth) {
        o.synth = this.synths.use()
      }
      if (o.character == 'melody') {
        o.loop.start()
      }
      o.synth.delaySend.set({ volume: o.delayOffset + DELAY_AMOUNT })
      o.synth.reverbSend.set({ volume: o.reverbOffset + REVERB_AMOUNT })
    } catch (error) {
      console.log(error)
      console.log(this.synths)
    }
    if (o.tone > 0) {
      o.synth.eq.set({
        low: (-o.tone * EQ_AMOUNT) / 2,
        middle: 0,
        high: o.tone * EQ_AMOUNT,
      })
    } else {
      o.synth.eq.set({
        low: -o.tone * EQ_AMOUNT,
        middle: (-o.tone * EQ_AMOUNT) / 2,
        high: (o.tone * EQ_AMOUNT) / 2,
      })
    }
    this._updateSynth(o, 0)
  }
  _recycleSynth(o) {
    try {
      if (o.synth) {
        o.previousNote &&
          this.instruments[this.CHAR2INST[o.character]].triggerRelease(o.previousNote.scientific())
        o.previousNote = false
        this.synths.recycle(o.synth)
        o.synth = false
        if (o.character == 'melody') {
          o.loop.stop()
        }
      }
    } catch (error) {
      console.log(error)
    }
  }
  fadeIn() {
    this.channels && this.channels.master.volume.rampTo(this.MASTER_VOLUME, 2)
    Tone.getTransport().start()
  }
  fadeOut() {
    this.channels && this.channels.master.volume.rampTo(this.FADE_OUT_VOLUME, 4)
    Tone.getTransport().pause()
  }
}
const generativeMusic = new GenerativeMusic(localStorage.getItem('muted') === 'true')
export default generativeMusic
