import MS from 'teoria'
import * as Tone from 'tone'
import { customIntRandom, customWRandom, seededRandomKept } from '../utils/random'
import { range } from '../utils/utils'
import configurations from './configurations'

class GenerativeMusic {
  constructor() {
    const initTone = () => {
      // const context = new Tone.Context({ latencyHint: 4000 })
      const context = new Tone.Context({ latencyHint: 'playback' })
      Tone.setContext(context)
    }
    initTone()
    this.N4_LENGTH = Tone.Time('4n').toSeconds()
    this.scale = MS.scale('C5', 'major')
    this.chordLoopLength = 64
    this.melodyLoopLength = 1
    // this.melodyLoopLength = 48;
    this.melodyIntervalRandomRange = 1
    this.melodyFadeFactor = 2
    this.chordFadeFactor = 1.1
    this.chordRythm
    this.melodyRythm
    this.melodyMinSight = configurations.PLAYER_TARGET_H
    this.melodySight = 9 * configurations.PLAYER_TARGET_H
    this.chordMinSight = configurations.PLAYER_TARGET_H
    this.chordSight = 45 * configurations.PLAYER_TARGET_H
    this.channels = {
      melody: new Tone.Channel({ volume: -30, pan: 0, channelCount: 2 }),
      chord: new Tone.Channel({ volume: -40, pan: 0, channelCount: 2 }),
      effects: new Tone.Channel({ volume: 0, pan: 0, channelCount: 2 }),
      master: new Tone.Channel({ volume: 0, pan: 0, channelCount: 2 }),
    }
    this.channels.master.connect(Tone.getDestination())
    this.effectNodes = {
      reverb: new Tone.Reverb({
        roomSize: 0.6,
        wet: 0.3,
      }),
      delay: new Tone.FeedbackDelay({
        delayTime: '8n.',
        maxDelayTime: '1m',
        feedback: 0.6,
      }),
      stereoWidener: new Tone.StereoWidener(0.96),
      stereoWidener2: new Tone.StereoWidener(0.96),
      compressor: new Tone.Compressor({
        ratio: 5,
        threshold: -15,
        release: 0.25,
        attack: 0.05,
      }),
      compressor2: new Tone.Compressor({
        ratio: 1.7,
        threshold: -8,
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
      this.effectNodes.limiter,
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
      let octave = (i - degree) / this.notes().length + 5
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
        currentPos += parseInt(day.wRandom({ 8: 0.1, 6: 0.2, 4: 0.8, 2: 0.2, 1: 0.1 }))
        // console.log(
        //   currentPos,
        //   (currentPos + 1).iDivide(8),
        //   previousPos,
        //   (previousPos + 1).iDivide(8),
        // )
        if ((previousPos + 1).iDivide(8) < (currentPos + 1).iDivide(8)) {
          currentPos = currentPos - (currentPos + 1).mod(8)
        }
      }
      console.log(`chordSequence: ${this.chordSequence}`)
      console.log(this.chordSequence)
      let rootPadSynth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'sine', volume: 0 },
        envelope: { release: '4n', attack: '8n' },
        maxPolyphony: 64,
      })
      rootPadSynth.chain(Tone.getDestination())
      // new Tone.Sequence((time, note) => {
      //   if (!note) { return; }
      //   console.log(`R: ${this.scale.getNote(note - 14).scientific()}`);
      //   rootPadSynth.triggerAttackRelease(this.scale.getNote(note - 7).scientific(), "2n.", 1);
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
    }
    generateChord()
  }

  updateSound(scene) {
    // console.time('updateSound')
    scene.objectGroup.children.each(o => {
      let synth = o.oData.synth
      if (!synth) {
        return
      }
      // let width = Phaser.Math.Angle.WrapDegrees(Phaser.Math.Angle.BetweenPoints(this.player, o)) / 180;
      // let distance = Phaser.Math.Distance.BetweenPoints(o, this.player);
      // console.log('width:' + width);
      // console.log('distance:' + distance);
      // o.oData.synth.set({
      //   volume: 0,
      //   width: width
      // });
      const positionX = o.x - scene.player.x
      const positionY = o.y - scene.player.y
      const distance = (positionX ** 2 + positionY ** 2) ** 0.5
      const pan = positionX / distance
      const volume = Math.round(-(distance ** synth.fadeFactor))
      // console.log(distance, pan, volume)
      synth.audible = distance < o.oData.panner.maxDistance
      o.oData.channel.set({
        pan,
        volume,
      })
      // o.oData.panner.set({ positionX, positionY })
      // o.oData.panner.distance = positionX ** 2 + positionY ** 2
      // o.oData.panner.audible = o.oData.panner.distance < o.oData.panner.maxDistance ** 2
    })
    // console.timeEnd('updateSound');
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
        o.synth = new Tone.Synth({
          oscillator: { type: 'sine', volume: 0 },
          envelope: { release: '8n', attack: '4n', sustain: 1 },
          // maxPolyphony: 64,
        })
        o.synth.fadeFactor = 0.5
        o.panner = new Tone.Panner3D({
          rolloffFactor: this.chordFadeFactor,
          refDistance: this.chordMinSight,
          maxDistance: this.chordSight,
          panningModel: 'equalpower',
          positionZ: (o.zFactor - 1) * 100,
          distanceModel: 'exponential',
        })
        o.channel = new Tone.Channel({ channelCount: 2 })
        o.synth.chain(
          // o.panner,
          o.channel,
          this.channels.chord
        )
        o.min = o.intRandom(-2 * this.scale.notes().length - 5, 5)
        o.max = o.min + o.intRandom(4, 6)
        // o.min = scale.getNote(o.min);
        // o.max = scale.getNote(o.max);
        o.range = range(o.min, o.max).map(i => this.scale.getNote(i))
        o.loop = new Tone.Sequence(
          (time, note) => {
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
            o.previousNote = possibleNotes[0]
            // o.previousNote =
            // possibleNotes[o.intRandom(0, possibleNotes.length - 1)];
            o.synth.triggerRelease()
            if (o.synth.audible) {
              console.log(`H: ${o.previousNote.scientific()} ${o.dialog}`)
              // o.synth.set({
              //   width: Phaser.Math.Angle.WrapDegrees(Phaser.Math.Angle.BetweenPoints(this.player, o)) / 180
              // });
              o.synth.triggerAttack(o.previousNote.scientific())
            }
          },
          this.chordSequence,
          '4n'
        )

        break
      default:
        // What about using pattern?
        // if (!previousNote) {

        // } else {
        //   // o.noteIndex = previousNote.noteIndex + Math.floor((o.random() ** 1.2) * 9) - 4;
        // }
        o.synth = new Tone.Synth({
          oscillator: { type: 'sine', volume: 0 },
          envelope: { release: '2n' },
        })
        o.synth.fadeFactor = 0.55

        o.panner = new Tone.Panner3D({
          rolloffFactor: this.melodyFadeFactor,
          refDistance: this.melodyMinSight,
          maxDistance: this.melodySight,
          panningModel: 'equalpower',
          positionZ: (o.zFactor - 1) * 100,
          distanceModel: 'linear',
        })
        o.channel = new Tone.Channel({ channelCount: 2 })
        o.synth.chain(
          // o.panner,
          o.channel,
          this.channels.melody
        )
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
        o.loopInterval = this.melodyLoopLength + o.intRandom(-2, 2)
        // o.loopInterval = melodyLoopLength;
        o.melodySequence = [...Array(this.melodyLoopLength)].map(i => [])
        o.beat = o.intRandom(0, this.melodyLoopLength - 1)
        let isMelodySpaced = o.wRandom({ false: 0.3, true: 0.1 })
        while (isMelodySpaced == 'true') {
          o.melodySequence[o.beat].push(false)
          isMelodySpaced = o.wRandom({ false: 0.4, true: 0.1 })
        }
        o.melodySequence[o.beat].push(o.note)
        o.loop = new Tone.Sequence(
          (time, note) => {
            if (!note) {
              return
            }
            if (o.synth.audible) {
              console.log(`M: ${o.note.scientific()} ${o.dialog}`)
              o.synth.triggerAttackRelease(note.scientific(), '8n')
            }
          },
          o.melodySequence,
          '4n'
        )
        // Tone.getTransport().scheduleRepeat(
        //   (t) => {
        //     console.log(o.note);
        //     synth.triggerAttackRelease(o.note.scientific(), "8n");
        //   }, this.N4_LENGTH * o.loopInterval, o.intRandom(0, 8) * this.N4_LENGTH);
        // code
        break
    }
    // o.loop.humanize = (Math.random() - 0.5) * 100
    o.loop.humanize = 300
    o.loop.start()
  }

  disposeSound(o) {
    o.synth && o.synth.dispose() && (o.synth = false)
    o.panner && o.panner.dispose() && (o.panner = false)
  }

  startLoop(o) {
    //
    try {
      if (o.loop.state == 'stopped') {
        o.loop.start()
      }
    } catch (error) {
      console.log('musicStartTime')
    }
  }
  stopLoop(o) {
    try {
      if (o.loop.state == 'started') {
        o.loop.stop()
      }
    } catch (error) {
      console.log(error)
    }
  }
  startBgm(scene) {
    const start = () => {
      // setup();
      // this.objectGroup.initSound();
      // set this context as the global Context
      try {
        Tone.start()
        Tone.getTransport().bpm.value = 34
        Tone.getTransport().start()
        // setInterval(this.updateSound.bind(this), 300);
        document.removeEventListener('click', start)
        document.removeEventListener('touchend', start)
        document.removeEventListener('keydown', start)
        // setInterval(() => {
        //   this.updateSound(scene)
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
