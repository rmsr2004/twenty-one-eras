import { getTracks } from './api.js';
import * as player from './player.js';
import { getFavourites, isFavourite, toggleFavourite } from './favourites.js';

const PAUSE_ICON = '❚❚';
const NO_FAVOURITES_MESSAGE = 'No favourites yet. Press ♥ on any track to save it here.';

const tracksHeading = document.querySelector('#tracks-heading');
const favouritesToggle = document.querySelector('#favourites-toggle');
const favouritesCount = document.querySelector('#favourites-count');
const trackList = document.querySelector('#track-list');
const tracksStatus = document.querySelector('#tracks-status');
const trackRowTemplate = document.querySelector('#track-row-template');

let currentEra = null;
let visibleTracks = [];
let showingFavourites = false;

favouritesCount.textContent = getFavourites().length;

function showAlbum(era) {
  currentEra = era;
  showAlbumTracks();
}

function updateViewHeader() {
  favouritesToggle.setAttribute('aria-pressed', showingFavourites);
  tracksHeading.textContent = showingFavourites ? 'Favourites' : 'Tracks';
}

function showAlbumTracks() {
  showingFavourites = false;
  updateViewHeader();
  player.stop();

  if (currentEra) {
    loadTracks(currentEra);
  }
}

function showFavourites() {
  showingFavourites = true;
  updateViewHeader();
  player.stop();

  visibleTracks = getFavourites();
  renderTracks();
}

favouritesToggle.addEventListener('click', () => {
  if (showingFavourites) {
    showAlbumTracks();
  } else {
    showFavourites();
  }
});

function isAlbumStillShown(era) {
  return era === currentEra && !showingFavourites;
}

async function loadTracks(era) {
  trackList.replaceChildren();
  tracksStatus.textContent = 'Loading tracks…';

  try {
    const tracks = await getTracks(era.id);
    if (isAlbumStillShown(era)) {
      visibleTracks = tracks;
      renderTracks();
    }
  } catch (error) {
    console.error(error);
    if (isAlbumStillShown(era)) {
      tracksStatus.textContent = 'Could not load the tracks. Try again later.';
    }
  }
}

function formatDuration(milliseconds) {
  const totalSeconds = Math.round(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  return `${minutes}:${seconds}`;
}

function updateFavouriteButton(button, track) {
  const saved = isFavourite(track);
  button.textContent = saved ? '♥' : '♡';
  button.setAttribute('aria-pressed', saved);
  button.setAttribute('aria-label', saved
    ? `Remove ${track.name} from favourites`
    : `Add ${track.name} to favourites`);
}

function createTrackRow(track, index) {
  const row = trackRowTemplate.content.firstElementChild.cloneNode(true);
  const position = index + 1;

  row.dataset.id = track.id;
  row.dataset.position = position;
  row.style.setProperty('--row-index', index);
  row.querySelector('.track-icon').textContent = position;
  row.querySelector('.track-name').textContent = track.name;
  row.querySelector('.track-time').textContent = formatDuration(track.duration);
  row.querySelector('.track-button').setAttribute('aria-label', `Play ${track.name}`);
  if (showingFavourites) {
    row.querySelector('.track-album').textContent = track.album;
  }
  updateFavouriteButton(row.querySelector('.favourite-button'), track);

  return row;
}

function renderTracks() {
  trackList.replaceChildren(...visibleTracks.map(createTrackRow));
  tracksStatus.textContent = showingFavourites && visibleTracks.length === 0 ? NO_FAVOURITES_MESSAGE : '';
}

function trackOfRow(row) {
  return visibleTracks.find((track) => String(track.id) === row.dataset.id);
}

trackList.addEventListener('click', (event) => {
  const row = event.target.closest('.track');
  if (!row) {
    return;
  }
  const track = trackOfRow(row);

  if (event.target.closest('.favourite-button')) {
    toggleFavourite(track);
    favouritesCount.textContent = getFavourites().length;
    if (showingFavourites) {
      visibleTracks = getFavourites();
      renderTracks();
    } else {
      updateFavouriteButton(row.querySelector('.favourite-button'), track);
    }
  } else if (event.target.closest('.track-button')) {
    player.toggle(track);
  }
});

function syncRowsWithPlayer({ id, playing, progress }) {
  for (const row of trackList.children) {
    const track = trackOfRow(row);
    const isCurrent = track.id === id;
    const isPlaying = isCurrent && playing;

    row.classList.toggle('is-current', isCurrent);
    row.style.setProperty('--progress', isCurrent ? progress : 0);
    row.querySelector('.track-icon').textContent = isPlaying ? PAUSE_ICON : row.dataset.position;
    row.querySelector('.track-button').setAttribute('aria-label', `${isPlaying ? 'Pause' : 'Play'} ${track.name}`);
  }
}

function playNextTrack(finishedTrackId) {
  const finishedIndex = visibleTracks.findIndex((track) => track.id === finishedTrackId);
  const nextTrack = visibleTracks[finishedIndex + 1];
  if (finishedIndex !== -1 && nextTrack) {
    player.toggle(nextTrack);
  }
}

player.onUpdate(syncRowsWithPlayer);
player.onEnded(playNextTrack);

export { showAlbum };
