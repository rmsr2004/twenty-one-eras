import { getAlbums, getEras, getTracks } from './api.js';
import * as player from './player.js';

const eraList = document.querySelector('#era-list');
const statusMessage = document.querySelector('#status');
const cover = document.querySelector('#cover');
const albumYear = document.querySelector('#album-year');
const albumTitle = document.querySelector('#album-title');
const albumDescription = document.querySelector('#album-description');
const trackList = document.querySelector('#track-list');
const tracksStatus = document.querySelector('#tracks-status');

let eras = [];
let currentEra = null;
let tracks = [];

function renderEraButtons() {
  eraList.innerHTML = '';

  for (const era of eras) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'era-button';
    button.textContent = era.name;
    button.dataset.slug = era.slug;

    const item = document.createElement('li');
    item.append(button);
    eraList.append(item);
  }
}

function applyTheme(era) {
  document.body.dataset.era = era.slug;
  document.body.style.setProperty('--bg', era.colors.background);
  document.body.style.setProperty('--text', era.colors.text);
  document.body.style.setProperty('--accent', era.colors.accent);
}

function selectEra(slug) {
  const era = eras.find((e) => e.slug === slug);
  currentEra = era;

  applyTheme(era);
  cover.src = era.cover;
  cover.alt = `Album cover of ${era.name}`;
  albumYear.textContent = era.year;
  albumTitle.textContent = era.name;
  albumDescription.textContent = era.description;

  for (const button of eraList.querySelectorAll('button')) {
    button.setAttribute('aria-pressed', button.dataset.slug === slug);
  }

  player.stop();
  loadTracks(era);
}

eraList.addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (button) {
    selectEra(button.dataset.slug);
  }
});

function formatDuration(ms) {
  const seconds = Math.round(ms / 1000);
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

async function loadTracks(era) {
  trackList.innerHTML = '';
  tracksStatus.textContent = 'Loading tracks…';

  try {
    const result = await getTracks(era.id);

    if (era !== currentEra) return;

    tracks = result;
    renderTracks();
    tracksStatus.textContent = '';
  } catch (error) {
    console.error(error);
    if (era === currentEra) {
      tracksStatus.textContent = 'Could not load the tracks. Try again later.';
    }
  }
}

function renderTracks() {
  trackList.innerHTML = '';

  for (const track of tracks) {
    const item = document.createElement('li');
    item.className = 'track';
    item.dataset.id = track.id;
    item.innerHTML = `
      <button type="button" class="track-button">
        <span class="track-icon" aria-hidden="true">${track.number}</span>
        <span class="track-name"></span>
      </button>
      <span class="track-time">${formatDuration(track.duration)}</span>
    `;
    item.querySelector('.track-name').textContent = track.name;
    item.querySelector('.track-button').setAttribute('aria-label', `Play ${track.name}`);
    trackList.append(item);
  }
}

trackList.addEventListener('click', (event) => {
  const button = event.target.closest('.track-button');
  if (button) {
    const id = button.closest('.track').dataset.id;
    player.toggle(tracks.find((t) => String(t.id) === id));
  }
});

player.onUpdate(({ id, playing, progress }) => {
  for (const item of trackList.children) {
    const track = tracks.find((t) => String(t.id) === item.dataset.id);
    const isCurrent = track.id === id;
    const isPlaying = isCurrent && playing;

    item.classList.toggle('is-current', isCurrent);
    item.style.setProperty('--progress', isCurrent ? progress : 0);
    item.querySelector('.track-icon').textContent = isPlaying ? '❚❚' : track.number;
    item.querySelector('.track-button').setAttribute('aria-label', `${isPlaying ? 'Pause' : 'Play'} ${track.name}`);
  }
});

async function init() {
  statusMessage.textContent = 'Loading albums…';

  try {
    const [eraData, albums] = await Promise.all([getEras(), getAlbums()]);

    eras = eraData
      .map((era) => {
        const album = albums.find((a) => a.id === era.id);
        return album ? { ...era, cover: album.cover, trackCount: album.trackCount } : null;
      })
      .filter(Boolean);

    renderEraButtons();
    selectEra(eras[eras.length - 1].slug);
    statusMessage.textContent = '';
  } catch (error) {
    console.error(error);
    statusMessage.textContent = 'Could not load the albums. Check your connection and reload the page.';
  }
}

init();
