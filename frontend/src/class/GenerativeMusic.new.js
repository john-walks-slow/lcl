import MS from 'teoria'
import * as Tone from 'tone'
import { customIntRandom, customWRandom, seededRandomKept } from '../utils/random'
import { range } from '../utils/utils'
import configurations from './configurations'
import deePool from './deePool'
import SampleLibrary from './SampleLibrary'

/**
 * @typedef {{
 *  synth: Tone.Sampler,
 *  instrument: Tone.Sampler,
 *  fadeFactor: number,
 *  MinAudible: number,
 *  MaxAudible: number,
 *  audible: boolean,
 *  channel: Tone.Channel,
 *  dryChannel: Tone.Channel,
 *  effectChannel: Tone.Channel,
 *  eq: Tone.EQ3,
 * }} soundObject
 */
class GenerativeMusic {
  constructor() {
    window.Tone = Tone
    window.gt = this
    Tone.setContext(new Tone.Context({ latencyHint: 'playback' }))
    /**@type {Object<string,Array<soundObject>>} */
    this.soundList = { melody: [], chord: [] }
    this.samplers
    this.FADE_OUT_VOLUME = -40
    this.N4_LENGTH = Tone.Time('4n').toSeconds()
  }

  loadSamples(callback) {
    console.time('loadSamples Performance')
    let loaded = 0
    const config = {
      instruments: ['salamander', 'cello'],
      options: [
        { attack: 0, release: 0.5 },
        { attack: 1.2, release: 0.5 },
      ],
      ext: '.ogg',
      onload: () => {
        loaded++
        console.log(config.instruments.length, loaded)
        loaded === config.instruments.length && callback && callback.apply()
      },
    }
    let { salamander, cello } = SampleLibrary.load(config)
    this.samplers = { salamander, cello }
    console.timeEnd('loadSamples Performance')
  }
  setup() {
    this.setupChannels()
    // this.setupGlobalSequence()
  }
  /**
   * Setup instrument / fx / channel / midi
   */
  setupChannels() {
    console.time('setupChannels Performance')

    /* NOTE
    instrument sound trail
    Sampler->Instance Channel->Instance EQ-------------->Instrument Channel->Master->Destination
                                          ->FX Gain->FX->
    */
    this.channels = {
      master: new Tone.PanVol({
        volume: this.FADE_OUT_VOLUME,
        pan: 0,
      }),
      bell: new Tone.PanVol({ volume: 10, pan: 0 }),
      pad: new Tone.PanVol({ volume: -35, pan: 0 }),
      effects: {
        reverb: new Tone.Reverb({
          roomSize: 0.75,
          wet: 1,
        }),
        delay: new Tone.FeedbackDelay({
          delayTime: '8n.',
          maxDelayTime: '4n',
          feedback: 0.5,
          wet: 1,
        }),

        eq: new Tone.EQ3({}),
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
      },
    }
    this.channels.master.connect(Tone.getDestination())
    this.channels.bell.connect(this.channels.master)
    this.channels.pad.connect(this.channels.master)
    this.channels.effects.forEach((e) => {
      e.connect(this.channels.master)
    })

    /**
     * @type {Object<string,deePool>}
     */
    this.synths = {}

    this.synths.bell = deePool.create(() => {
      let synth = {
        audible: false,
        channel: new Tone.PanVol(),
        delaySend: new Tone.PanVol(),
        reverbSend: new Tone.PanVol(),
        eq: new Tone.EQ3(),
      }
      synth.channel.chain(synth.eq, this.channels.bell)
      synth.channel.chain(synth.delaySend, this.channels.bell)
      synth.channel.chain(synth.reverbSend, this.channels.bell)
      return synth
    })
    this.synths.bell.grow(20)
    this.synths.pad = deePool.create(() => {
      let synth = {
        audible: false,
        channel: new Tone.PanVol(),
        delaySend: new Tone.PanVol(),
        reverbSend: new Tone.PanVol(),
        eq: new Tone.EQ3(),
      }
      synth.channel.chain(synth.eq, this.channels.pad)
      synth.channel.chain(synth.delaySend, this.channels.pad)
      synth.channel.chain(synth.reverbSend, this.channels.pad)
      return synth
    })
    this.synths.pad.grow(20)
    console.timeEnd('setupChannels Performance')
  }

  setupGlobalLoop() {
    let CHORD_LENGTH = { 8: 0.1, 6: 0.1, 4: 0.8, 2: 0.5, 1: 0.3 }
    let CHORD_SYNC = 32

    let scale = MS.note.fromMIDI(configurations.DAY.intRandom(70, 82)).scale('major')
    let chordLoopLength = 128
    let melodyLoopLength = 2
    let melodyIntervalRandomRange = 1
    let melodyFadeFactor = 1
    let chordFadeFactor = 1.5
    let chordRythm
    let melodyRythm
    let melodyMinAudible = configurations.PLAYER_TARGET_H
    let melodyMaxAudible = 14 * configurations.PLAYER_TARGET_H
    let chordMinAudible = configurations.PLAYER_TARGET_H
    let chordMaxAudible = 25 * configurations.PLAYER_TARGET_H
    MS.Scale.prototype.getNote = function (i) {
      let degree = i.mod(this.notes().length)
      let octave = (i - degree) / this.notes().length + this.tonic.octave()
      return MS.note(this.notes()[degree].name() + octave.toString())
    }

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
    this.chordSequence = [...Array(this.chordLoopLength)].map((i) => [])
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
      let currentChordDegree = parseInt(day.wRandom(CHORDS_LIST[CHORD_TYPE[currentType]]))

      this.chordSequence[currentPos].push(currentChordDegree)
      let previousPos = currentPos
      currentPos += parseInt(day.wRandom(CHORD_LENGTH)) * 2

      if ((previousPos + 1).iDivide(CHORD_SYNC) < (currentPos + 1).iDivide(CHORD_SYNC)) {
        currentPos = currentPos - (currentPos + 1).mod(CHORD_SYNC)
      }
    }
    console.log(`chordSequence: ${this.chordSequence}`)
    console.log(this.chordSequence)
    this.chordSequence = new Tone.Sequence(
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
            let notes = [note - 1, note + 1, note + 3].map((n) => this.scale.getNote(n).name())
            const possibleNotes = o.range.filter((n) => notes.includes(n.name()[0]))
            possibleNotes.sort((a, b) => {
              let jumpA
              let jumpB
              if (o.previousNote) {
                jumpA = Math.abs(MS.interval(o.previousNote, a).semitones())
                jumpB = Math.abs(MS.interval(o.previousNote, b).semitones())
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
            console.log(`H: ${o.note}`)
            o.synth.instrument
              .getAttackSources(o.note.scientific(), undefined, o.velocity)
              .forEach((s) => s.chain(o.synth.channel))
            console.log(o.velocity, this.channels.master.volume)
          } else if (o.previousNote) {
            o.synth.instrument.triggerRelease(o.previousNote.scientific())
            o.previousNote = false
          }
        })
      },
      this.chordSequence,
      '4n'
    )
    this.chordSequence.humanize = '8n'
  }
  /**
   * Update every audible synth
   * @param  {} delta
   */
  updateSynths(delta) {
    Object.keys(this.soundList).forEach((key) =>
      this.soundList[key].forEach((o) => {
        this.updateSynth(o, delta)
      })
    )
  }

  /**
   * update sound
   */
  updateSound() {
    let currentZone = this.scene.objectData.soundMap.getZone(this.scene.player)
    if (
      !(
        this.previousZone &&
        currentZone[0] == this.previousZone[0] &&
        currentZone[1] == this.previousZone[1]
      )
    ) {
      let previousZones = this.scene.objectData.soundMap.getNearBy(this.previousZone)
      let currentZones = this.scene.objectData.soundMap.getNearBy(currentZone)
      let createZones = currentZones.filter(
        (x) => !JSON.stringify(previousZones).includes(JSON.stringify(x))
      )
      let destroyZones = previousZones.filter(
        (x) => !JSON.stringify(currentZones).includes(JSON.stringify(x))
      )
      this.previousZone = currentZone
      console.log({ create: JSON.stringify(createZones), destroy: JSON.stringify(destroyZones) })
      createZones.forEach((zone) => {
        if (!this.scene.objectData.soundMap[zone[0]]) {
          return
        }
        if (!this.scene.objectData.soundMap[zone[0]][[zone[1]]]) {
          return
        }
        let os = this.scene.objectData.soundMap[zone[0]][zone[1]]
        os.forEach((o) => {
          o.loop || this.setupInstanceLoop(o)
          this.soundList[o.character].push(o)
          this.setupSynth(o)
        })
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
    }
  }

  /**
   * Update synth according to game (distance, pan)
   * @param {*} o
   * @param {*} delta
   * @returns
   */
  updateSynth(o, delta) {
    let synth = o.synth
    if (!synth) {
      return
    }
    let instance = o.instance || o
    const positionX = instance.x - this.scene.player.x
    const positionY = instance.y - this.scene.player.y
    let distance = (positionX ** 2 + positionY ** 2) ** 0.5
    let pan =
      (Math.acos(positionX / distance) / Math.PI - 1) * Math.min(1, distance / instance.width)
    distance = Math.max(distance, synth.MinAudible)
    synth.audible = distance < synth.MaxAudible

    if (synth.audible) {
      let volume =
        -40 *
        ((distance - synth.MinAudible) / (synth.MaxAudible - synth.MinAudible)) ** synth.fadeFactor

      synth.dryChannel.pan.rampTo(Math.abs(pan) ** 1.3, delta / 1200)
      synth.effectChannel.pan.rampTo(Math.abs(pan) ** 0.8, delta / 1200)
      synth.dryChannel.volume.rampTo(volume, delta / 1200)
    } else {
    }
  }

  /**
   * Set the loop for gameobject
   * @param {*} o
   */
  setupInstanceLoop(o) {
    let MELODY_NOTES = {
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
    o.delayOffset = 10 * (1 - 2 * o.sizeFactor)
    o.reverbOffset = 10 * (1 - o.zFactor)
    o.tone = 1 - 2 * o.sizeFactor
    o.velocity = o.sizeFactor ** 0.2
    switch (o.character) {
      case 'chord':
        o.min = o.intRandom(-this.scale.notes().length - 5, 0)
        o.max = o.min + o.intRandom(4, 6)
        o.range = range(o.min, o.max).map((i) => this.scale.getNote(i))
        o.loop = true
        break
      case 'melody':
        o.loopInterval = this.melodyLoopLength * this.N4_LENGTH
        o.loopSpeed = 1

        o.melodySequence = []
        o.noteIndex = o.wRandom(MELODY_NOTES)
        o.note = this.scale.getNote(parseInt(o.noteIndex))

        o.beat = o.intRandom(0, this.melodyLoopLength - 1)
        o.subdivision = parseFloat(
          o.wRandom({ 0: 5, 0.5: 4, 0.3: 0.3, 0.6: 0.3, 0.25: 0.3, 0.75: 0.3 })
        )
        o.time = (o.beat + o.subdivision) * this.N4_LENGTH
        o.melodySequence.push([o.time, o.note])
        o.noteIndex = o.wRandom(MELODY_NOTES)
        o.note = this.scale.getNote(parseInt(o.noteIndex))
        o.beat = o.intRandom(0, this.melodyLoopLength - 1)
        o.subdivision = parseFloat(
          o.wRandom({ 0: 5, 0.5: 4, 0.3: 0.3, 0.6: 0.3, 0.25: 0.3, 0.75: 0.3 })
        )
        o.time = (o.beat + o.subdivision) * this.N4_LENGTH
        o.loop = new Tone.Part((time, note) => {
          if (o.synth && o.synth.audible) {
            if (!note) {
              return
            }
            console.log(`M: ${note}`)
            o.synth.instrument
              .getAttackReleaseSources(o.note.scientific(), '4n', undefined, o.velocity)
              .forEach((s) => s.chain(o.synth.channel))
          }
        }, o.melodySequence)
        o.loop.loop = true
        o.loop.loopEnd = o.loopInterval
        o.loop.humanize = '8n'

        break
    }
  }
  /**
   * @param  {soundObject} o
   */
  setupSynth(o) {
    try {
      if (!o.synth) {
        o.synth = this.synths[o.instrument].use()
      }
      if (o.character == 'melody') {
        o.loop.start()
      }
      o.synth.reverbSend.set({ volume: o.reverbOffset })
      o.synth.delaySend.set({ volume: o.delayOffset })
    } catch (error) {
      console.log(error)
      console.log(this.synths[o.instrument])
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

  /**
   * Hook scene and start context whenever possible
   * @param {*} scene
   */
  start(scene) {
    this.scene = scene
    const startContext = async () => {
      try {
        await Tone.start()
        console.log('Generative Music Started')
        document.removeEventListener('click', startContext)
        document.removeEventListener('touchend', startContext)
        document.removeEventListener('keydown', startContext)
      } catch (error) {
        console.log(error)
      }
      this.updateSound()
      Tone.getTransport().bpm.value = 60
      Tone.getTransport().start()
      this.chordSequence.start()
      setInterval(() => {
        this.updateSound()
        this.updateSynths(300)
      }, 300)
    }
    if (Tone.context.state == 'running') {
      startContext()
    } else {
      document.addEventListener('click', startContext)
      document.addEventListener('touchend', startContext)
      document.addEventListener('keydown', startContext)
    }
  }

  fadeIn() {
    this.channels && this.channels.master.volume.rampTo(0, 4)
  }
  fadeOut() {
    this.channels && this.channels.master.volume.rampTo(this.FADE_OUT_VOLUME, 4)
  }
}
export default new GenerativeMusic()
