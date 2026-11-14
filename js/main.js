import { getAlbums } from './api.js';

const eraList = document.querySelector('#era-list');
const statusMessage = document.querySelector('#status');
const cover = document.querySelector('#cover');
const albumYear = document.querySelector('#album-year');
const albumTitle = document.querySelector('#album-title');
const albumDescription = document.querySelector('#album-description');

let albums = [];

function renderEraButtons() {
  eraList.innerHTML = '';

  for (const album of albums) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'era-button';
    button.textContent = album.name;
    button.dataset.id = album.id;

    const item = document.createElement('li');
    item.append(button);
    eraList.append(item);
  }
}

function selectAlbum(id) {
  const album = albums.find((a) => a.id === id);

  cover.src = album.cover;
  cover.alt = `Album cover of ${album.name}`;
  albumYear.textContent = album.year;
  albumTitle.textContent = album.name;
  albumDescription.textContent = `${album.trackCount} tracks`;

  for (const button of eraList.querySelectorAll('button')) {
    button.setAttribute('aria-pressed', button.dataset.id === String(id));
  }
}

eraList.addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (button) {
    selectAlbum(Number(button.dataset.id));
  }
});

async function init() {
  statusMessage.textContent = 'Loading albums…';

  try {
    albums = await getAlbums();
    renderEraButtons();
    selectAlbum(albums[albums.length - 1].id);
    statusMessage.textContent = '';
  } catch (error) {
    console.error(error);
    statusMessage.textContent = 'Could not load the albums. Check your connection and reload the page.';
  }
}

init();
