import * as Tone from 'tone'
let c1 = new Tone.Channel()
c1.volume = 0
let c2 = new Tone.Channel()
c2.volume = -10
let synth = new Tone.Synth()

synth.connect(c1)
synth.triggerAttackRelease('C4', '4n')
setTimeout(() => {
  synth.disconnect(c1)
}, 200)
