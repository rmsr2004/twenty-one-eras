import { getAlbums, getEras, getTracks } from './api.js';
import * as player from './player.js';

const themeColor = document.querySelector('meta[name="theme-color"]');
const eraList = document.querySelector('#era-list');
const statusMessage = document.querySelector('#status');
const vinyl = document.querySelector('.cover');
const cover = document.querySelector('#cover');
const albumYear = document.querySelector('#album-year');
const albumTitle = document.querySelector('#album-title');
const albumDescription = document.querySelector('#album-description');
const tracksHeading = document.querySelector('#tracks-heading');
const favouritesToggle = document.querySelector('#favourites-toggle');
const favouritesCount = document.querySelector('#favourites-count');
const trackList = document.querySelector('#track-list');
const tracksStatus = document.querySelector('#tracks-status');
const volumeInput = document.querySelector('#volume');
const volumeValue = document.querySelector('#volume-value');
const quizOpen = document.querySelector('#quiz-open');
const quiz = document.querySelector('#quiz');
const quizForm = document.querySelector('#quiz-form');
const quizResult = document.querySelector('#quiz-result');
const quizResultName = document.querySelector('#quiz-result-name');
const quizResultText = document.querySelector('#quiz-result-text');

let eras = [];
let currentEra = null;
let tracks = [];
let showingFavourites = false;

const FAVOURITES_KEY = 'favourites';

function loadFavourites() {
  try {
    return JSON.parse(localStorage.getItem(FAVOURITES_KEY)) ?? [];
  } catch {
    return [];
  }
}

let favourites = loadFavourites();

function isFavourite(track) {
  return favourites.some((f) => f.id === track.id);
}

function toggleFavourite(track) {
  if (isFavourite(track)) {
    favourites = favourites.filter((f) => f.id !== track.id);
  } else {
    favourites.push(track);
  }
  localStorage.setItem(FAVOURITES_KEY, JSON.stringify(favourites));
  favouritesCount.textContent = favourites.length;
}

function updateFavouriteButton(button, track) {
  const saved = isFavourite(track);
  button.textContent = saved ? '♥' : '♡';
  button.setAttribute('aria-pressed', saved);
  button.setAttribute('aria-label', saved
    ? `Remove ${track.name} from favourites`
    : `Add ${track.name} to favourites`);
}

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
  themeColor.content = era.colors.background;
  document.title = `${era.name} · twenty one eras`;
}

function selectEra(slug) {
  const era = eras.find((e) => e.slug === slug);
  currentEra = era;

  applyTheme(era);
  if (cover.src !== era.cover) {
    cover.classList.add('is-loading');
    cover.src = era.cover;
  }
  cover.alt = `Album cover of ${era.name}`;
  albumYear.textContent = era.year;
  albumTitle.textContent = era.name;
  albumDescription.textContent = era.description;

  for (const button of eraList.querySelectorAll('button')) {
    button.setAttribute('aria-pressed', button.dataset.slug === slug);
  }

  showList(false);
}

cover.addEventListener('load', () => cover.classList.remove('is-loading'));
cover.addEventListener('error', () => cover.classList.remove('is-loading'));

eraList.addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (button) {
    selectEra(button.dataset.slug);
  }
});

function showList(favouritesView) {
  showingFavourites = favouritesView;
  favouritesToggle.setAttribute('aria-pressed', favouritesView);
  tracksHeading.textContent = favouritesView ? 'Favourites' : 'Tracks';
  player.stop();

  if (favouritesView) {
    tracks = [...favourites];
    renderTracks();
  } else if (currentEra) {
    loadTracks(currentEra);
  }
}

favouritesToggle.addEventListener('click', () => showList(!showingFavourites));

function formatDuration(ms) {
  const seconds = Math.round(ms / 1000);
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

async function loadTracks(era) {
  trackList.innerHTML = '';
  tracksStatus.textContent = 'Loading tracks…';

  try {
    const result = await getTracks(era.id);

    if (era !== currentEra || showingFavourites) return;

    tracks = result;
    renderTracks();
  } catch (error) {
    console.error(error);
    if (era === currentEra && !showingFavourites) {
      tracksStatus.textContent = 'Could not load the tracks. Try again later.';
    }
  }
}

function renderTracks() {
  trackList.innerHTML = '';
  tracksStatus.textContent = tracks.length === 0 && showingFavourites
    ? 'No favourites yet. Press ♥ on any track to save it here.'
    : '';

  for (const [index, track] of tracks.entries()) {
    const item = document.createElement('li');
    item.className = 'track';
    item.dataset.id = track.id;
    item.dataset.number = index + 1;
    item.style.setProperty('--i', index);
    item.innerHTML = `
      <button type="button" class="track-button">
        <span class="track-icon" aria-hidden="true">${index + 1}</span>
        <span>
          <span class="track-name"></span>
          <span class="track-album"></span>
        </span>
      </button>
      <span class="track-time">${formatDuration(track.duration)}</span>
      <button type="button" class="favourite-button"></button>
    `;
    item.querySelector('.track-name').textContent = track.name;
    item.querySelector('.track-button').setAttribute('aria-label', `Play ${track.name}`);
    if (showingFavourites) {
      item.querySelector('.track-album').textContent = track.album;
    }
    updateFavouriteButton(item.querySelector('.favourite-button'), track);
    trackList.append(item);
  }
}

trackList.addEventListener('click', (event) => {
  const item = event.target.closest('.track');
  if (!item) return;
  const track = tracks.find((t) => String(t.id) === item.dataset.id);

  if (event.target.closest('.favourite-button')) {
    toggleFavourite(track);
    updateFavouriteButton(item.querySelector('.favourite-button'), track);
  } else if (event.target.closest('.track-button')) {
    player.toggle(track);
  }
});

player.onUpdate(({ id, playing, progress }) => {
  vinyl.classList.toggle('is-spinning', playing);

  for (const item of trackList.children) {
    const track = tracks.find((t) => String(t.id) === item.dataset.id);
    const isCurrent = track.id === id;
    const isPlaying = isCurrent && playing;

    item.classList.toggle('is-current', isCurrent);
    item.style.setProperty('--progress', isCurrent ? progress : 0);
    item.querySelector('.track-icon').textContent = isPlaying ? '❚❚' : item.dataset.number;
    item.querySelector('.track-button').setAttribute('aria-label', `${isPlaying ? 'Pause' : 'Play'} ${track.name}`);
  }
});

function setVolume(percent) {
  player.setVolume(percent / 100);
  volumeValue.textContent = `${percent}%`;
}

volumeInput.addEventListener('input', () => {
  setVolume(volumeInput.value);
  localStorage.setItem('volume', volumeInput.value);
});

quizOpen.addEventListener('click', () => {
  quizForm.reset();
  quizForm.hidden = false;
  quizResult.hidden = true;
  quiz.showModal();
});

quizForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const answers = [...new FormData(quizForm).values()];
  const scores = {};
  for (const slug of answers) {
    scores[slug] = (scores[slug] ?? 0) + 1;
  }
  const winner = answers.reduce((best, slug) => (scores[slug] > scores[best] ? slug : best));

  const era = eras.find((e) => e.slug === winner);
  selectEra(era.slug);
  quizResultName.textContent = era.name;
  quizResultText.textContent = era.description;
  quizForm.hidden = true;
  quizResult.hidden = false;
  quizResult.querySelector('button').focus();
});

quiz.addEventListener('click', (event) => {
  if (event.target.closest('[data-close]')) {
    quiz.close();
  }
});

async function init() {
  try {
    volumeInput.value = localStorage.getItem('volume') ?? 80;
  } catch {
  }
  setVolume(volumeInput.value);
  favouritesCount.textContent = favourites.length;
  statusMessage.textContent = 'Loading albums…';

  try {
    const [eraData, albums] = await Promise.all([getEras(), getAlbums()]);

    eras = eraData
      .map((era) => {
        const album = albums.find((a) => a.id === era.id);
        return album ? { ...era, cover: album.cover } : null;
      })
      .filter(Boolean);

    renderEraButtons();
    selectEra(eras[eras.length - 1].slug);
    quizOpen.disabled = false;
    statusMessage.textContent = '';
  } catch (error) {
    console.error(error);
    statusMessage.textContent = 'Could not load the albums. Check your connection and reload the page.';
  }
}

init();
