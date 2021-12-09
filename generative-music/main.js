const synth = new Tone.Synth().toDestination();

Number.prototype.mod = function(n) {
  return ((this % n) + n) % n;
};
let activeObjects = objects.slice(0, 30);
let melodyObjects = activeObjects.slice(0, 7);
let harmonyObjects = activeObjects.slice(7, 15);
let scale = teoria.scale('c', 'major').simple();

console.log(scale);
const N4_LENGTH = Tone.Time("4n").toSeconds();
// scale.length = scale.notes().length;

scale.prototype.getNote = (i) => {
  let degree = i.mod(scale.length);
  let octave = (i - degree) / scale.length + 4;
  return teoria.note((scale[degree] + octave));
}

activeObjects.forEach((o) => {
  o.random = seededRandomKept(o._id.toString());
  o.intRandom = (a, b) => {
    return a + Math.floor(o.random() * (b - a + 1))
  };
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
      o.min = (o.intRandom(scale.length * 4, scale.length * 6))
      o.max = (o.min + o.intRandom(3, 7))
      o.min = scale.getNote(o.min)
      o.max = scale.getNote(o.max)

      break;
    default:
      o.noteIndex = o.intRandom(-5, 10);
      o.note = scale.getNote(o.noteIndex)
      Tone.Transport.scheduleRepeat(
        (t) => {
          console.log(o.note);
          synth.triggerAttackRelease(o.note.scientific(), "8n");
        }, N4_LENGTH * (8 + o.intRandom(-1, 1)), o.intRandom(0, 8) * N4_LENGTH);
      // code
      break;
  }
});
let dayId = "1";
let dayRandom = seededRandomKept(dayId);
let dayIntRandom = (a, b) => {
  return a + Math.floor(dayRandom() * (b - a + 1))
};
const T_CHORDS = [1, 3, 6];
const D_CHORDS = [5, 3, 7];
const S_CHORDS = [4, 2, 6];
const CHORD_TYPE = {
  T: 0,
  D: 1,
  S: 2,
};
const CHORDS_LIST = [[1, 3, 6], [5, 3, 7], [4, 2, 6]];
let chords = [];
let currentPos = 0;
let currentType = 2;
while (currentPos < 7) {
  let chordLength = dayRandom();
  chordLength < 0.1 ? chordLength = 4 : (
    chordLength < 0.6 ? chordLength = 2 : (
      chordLength < 0.85 ? chordLength = 1 : (
        chordLength <= 1 ? chordLength = 0.5 : false
      )
    )
  );
  switch (currentType) {
    case CHORD_TYPE.D:
      currentType = dayIntRandom(0, 2) == 0 ? CHORD_TYPE.D : (
        dayIntRandom(0, 4) == 0 ? CHORD_TYPE.S : CHORD_TYPE.T
      );
      break;
    case CHORD_TYPE.S:
      currentType = dayIntRandom(0, 2) == 0 ? CHORD_TYPE.S : (
        dayIntRandom(0, 1) == 0 ? CHORD_TYPE.D : CHORD_TYPE.T
      );
      break;
    case CHORD_TYPE.T:
      currentType = dayIntRandom(0, 2) == 0 ? CHORD_TYPE.T : (
        dayIntRandom(0, 1) == 0 ? CHORD_TYPE.D : CHORD_TYPE.S
      );
      break;
  }
  let currentChordDegree = CHORDS_LIST[currentType][dayIntRandom(0, 2)];
  let notes = [];
  let rootNoteOctave = {
    1: [3],
    2: [3],
    3: [3, 2],
    4: [3, 2],
    5: [3, 2],
    6: [2],
    7: [2]
  };
  notes[0] = rootNoteOctave[currentChordDegree].map(i =>
    teoria.note(scale.get(currentChordDegree).toUpperCase() + i.toString())
  ).sort(
    (a, b) => {
      if (chords.length == 0) {
        return 0;
      }
      let previousRoot = chords[chords.length - 1].notes[0];
      let intervalA = teoria.interval(previousRoot, a).semitones();
      let intervalB = teoria.interval(previousRoot, b).semitones();
      return intervalA - intervalB;
    })[0];
  let chordCombinations = [
  [[1, 4], [5, 4], [3, 5]],
  [[5, 4], [1, 5], [3, 5]],
  [[5, 4], [3, 5], [1, 6]],
  [[3, 4], [1, 5], [5, 5]],
]
  notes.push(
    chordCombinations.map(c =>
      teoria.note(scale.get(currentChordDegree + c[0] - 1)))
    .sort((a, b) => {}));
  chords.push(
  {
    pos: currentPos,
    notes: notes,
    type: currentType
  });
  currentPos += chordLength;
}

Tone.start();
Tone.Transport.start()
// document.querySelector('button')
//   .addEventListener('click', async () => {
//     await Tone.start();
//   });