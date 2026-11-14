import { getAlbums, getEras } from './api.js';
import * as player from './player.js';
import { showAlbum } from './tracks.js';
import { initVolume } from './volume.js';

const themeColor = document.querySelector('meta[name="theme-color"]');
const eraList = document.querySelector('#era-list');
const statusMessage = document.querySelector('#status');
const vinyl = document.querySelector('.cover');
const cover = document.querySelector('#cover');
const albumYear = document.querySelector('#album-year');
const albumTitle = document.querySelector('#album-title');
const albumDescription = document.querySelector('#album-description');

let eras = [];

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

  showAlbum(era);
}

eraList.addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (button) {
    selectEra(button.dataset.slug);
  }
});

cover.addEventListener('load', () => cover.classList.remove('is-loading'));
cover.addEventListener('error', () => cover.classList.remove('is-loading'));

player.onUpdate(({ playing }) => vinyl.classList.toggle('is-spinning', playing));

async function init() {
  initVolume();
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
    statusMessage.textContent = '';
  } catch (error) {
    console.error(error);
    statusMessage.textContent = 'Could not load the albums. Check your connection and reload the page.';
  }
}

init();
