import * as Tone from 'tone'

export default class SpatialPanner extends Tone.Panner3D {
  constructor(...args) {
    super(...args)
    // this.positionXSignal = new Tone.Signal().connect(this.positionX)
    // this.positionYSignal = new Tone.Signal().connect(this.positionY)
    // this.positionZSignal = new Tone.Signal().connect(this.positionZ)
  }
  setSpatial(x, y, z) {}
}
