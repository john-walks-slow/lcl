export default function randomString() {
  return Math.random()
    .toString(36)
    .replace(/[^a-z]+/g, '')
    .substr(0, 8);
}



function xmur3(str) {
  for (var i = 0, h = 1779033703 ^ str.length; i < str.length; i++)
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353),
      h = h << 13 | h >>> 19;
  return function () {
    h = Math.imul(h ^ h >>> 16, 2246822507);
    h = Math.imul(h ^ h >>> 13, 3266489909);
    return (h ^= h >>> 16) >>> 0;
  };
}

export function seededRandom(string) {
  let seed = xmur3(string);
  let a = seed();
  let b = seed();
  let c = seed();
  let d = seed();
  a >>>= 0; b >>>= 0; c >>>= 0; d >>>= 0;
  var t = (a + b) | 0;
  a = b ^ b >>> 9;
  b = c + (c << 3) | 0;
  c = (c << 21 | c >>> 11);
  d = d + 1 | 0;
  t = t + d | 0;
  c = c + t | 0;
  return (t >>> 0) / 4294967296;
}

export function seededRandomKept(string) {
  let seed = xmur3(string);
  return function () {
    let a = seed();
    let b = seed();
    let c = seed();
    let d = seed();
    a >>>= 0;
    b >>>= 0;
    c >>>= 0;
    d >>>= 0;
    var t = (a + b) | 0;
    a = b ^ b >>> 9;
    b = c + (c << 3) | 0;
    c = (c << 21 | c >>> 11);
    d = d + 1 | 0;
    t = t + d | 0;
    c = c + t | 0;
    return (t >>> 0) / 4294967296;
  };

}

export const wRandomKept = (spec, random) => {
  var i, j, table = [];
  for (i in spec) {
    // The constant 10 below should be computed based on the
    // weights in the spec for a correct and optimal table size.
    // E.g. the spec {0:0.999, 1:0.001} will break this impl.
    for (j = 0; j < spec[i] * 10; j++) {
      table.push(i);
    }
  }
  return function () {
    return table[Math.floor(random.call() * table.length)];
  };
};
export const wRandom = (spec, random) => {
  var i, j, table = [];
  for (i in spec) {
    // The constant 10 below should be computed based on the
    // weights in the spec for a correct and optimal table size.
    // E.g. the spec {0:0.999, 1:0.001} will break this impl.
    for (j = 0; j < spec[i] * 10; j++) {
      table.push(i);
    }
  }
  return table[Math.floor(random.call() * table.length)];
};

export const customIntRandom = (random) => ((a, b) => {
  return a + Math.floor(random.call() * (b - a + 1));
});
export const customWRandom = (random) => (
  (spec) => (wRandom(spec, random,))
);
