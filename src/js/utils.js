/**
 * Utilities
 */
export function select (element) {
  if (typeof element === 'string') {
    return document.querySelector(element);
  }
  return element;
}
export function css (element, styles) {
  Object.keys(styles).forEach((key) => {
    element.style[key] = styles[key];
  });
}
export function sync (callback) {
  setTimeout(() => callback(), 1000 / 60);
}

export function call (func) {
  if (callable(func)) {
    func();
  }
}

export function callable (func) {
  return typeof func === 'function';
}

export function getRandomInt (min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
