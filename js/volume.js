import * as player from './player.js';

const STORAGE_KEY = 'volume';
const DEFAULT_PERCENT = 10;
const volumeInput = document.querySelector('#volume');
const volumeValue = document.querySelector('#volume-value');

function loadSavedPercent() {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? DEFAULT_PERCENT;
  } catch {
    return DEFAULT_PERCENT;
  }
}

function perceptualLevel(percent) {
  return (percent / 100) ** 2;
}

function setVolume(percent) {
  player.setVolume(perceptualLevel(percent));
  volumeValue.textContent = `${percent}%`;
}

function initVolume() {
  volumeInput.value = loadSavedPercent();
  setVolume(volumeInput.value);

  volumeInput.addEventListener('input', () => {
    setVolume(volumeInput.value);
    localStorage.setItem(STORAGE_KEY, volumeInput.value);
  });
}

export { initVolume };
