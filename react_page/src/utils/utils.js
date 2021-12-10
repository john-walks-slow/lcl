export function range(min = 0, max) {
  return [...Array(max - min + 1).keys()].map(i => i + min);
}

export function characterRange(startChar, endChar) {
  return String.fromCharCode(...range(startChar.charCodeAt(0), endChar.charCodeAt(0)));
}
Number.prototype.mod = function (n) {
  return ((this % n) + n) % n;
};
Number.prototype.iDivide = function (n) {
  return (this - this.mod(n)) / n;
};
