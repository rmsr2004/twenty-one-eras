import * as player from './player.js';

const STORAGE_KEY = 'volume';
const volumeInput = document.querySelector('#volume');
const volumeValue = document.querySelector('#volume-value');

function setVolume(percent) {
  player.setVolume((percent / 100) ** 2);
  volumeValue.textContent = `${percent}%`;
}

export function initVolume() {
  try {
    volumeInput.value = localStorage.getItem(STORAGE_KEY) ?? 80;
  } catch {
  }
  setVolume(volumeInput.value);

  volumeInput.addEventListener('input', () => {
    setVolume(volumeInput.value);
    localStorage.setItem(STORAGE_KEY, volumeInput.value);
  });
}
