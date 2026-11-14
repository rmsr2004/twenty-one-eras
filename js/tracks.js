import { getTracks } from './api.js';
import * as player from './player.js';
import { getFavourites, isFavourite, toggleFavourite } from './favourites.js';

const tracksHeading = document.querySelector('#tracks-heading');
const favouritesToggle = document.querySelector('#favourites-toggle');
const favouritesCount = document.querySelector('#favourites-count');
const trackList = document.querySelector('#track-list');
const tracksStatus = document.querySelector('#tracks-status');

let currentEra = null;
let tracks = [];
let showingFavourites = false;

favouritesCount.textContent = getFavourites().length;

export function showAlbum(era) {
  currentEra = era;
  showList(false);
}

function showList(favouritesView) {
  showingFavourites = favouritesView;
  favouritesToggle.setAttribute('aria-pressed', favouritesView);
  tracksHeading.textContent = favouritesView ? 'Favourites' : 'Tracks';
  player.stop();

  if (favouritesView) {
    tracks = getFavourites();
    renderTracks();
  } else if (currentEra) {
    loadTracks(currentEra);
  }
}

favouritesToggle.addEventListener('click', () => showList(!showingFavourites));

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

function formatDuration(ms) {
  const seconds = Math.round(ms / 1000);
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

function updateFavouriteButton(button, track) {
  const saved = isFavourite(track);
  button.textContent = saved ? '♥' : '♡';
  button.setAttribute('aria-pressed', saved);
  button.setAttribute('aria-label', saved
    ? `Remove ${track.name} from favourites`
    : `Add ${track.name} to favourites`);
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
    favouritesCount.textContent = getFavourites().length;
  } else if (event.target.closest('.track-button')) {
    player.toggle(track);
  }
});

player.onUpdate(({ id, playing, progress }) => {
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

player.onEnded((id) => {
  const index = tracks.findIndex((t) => t.id === id);
  const next = tracks[index + 1];
  if (index !== -1 && next) {
    player.toggle(next);
  }
});
