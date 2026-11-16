import { getAlbums, getEras } from './api.js';
import * as player from './player.js';
import { showAlbum } from './tracks.js';
import { setNedEra } from './ned.js';
import { initVolume } from './volume.js';

const browserBarColor = document.querySelector('meta[name="theme-color"]');
const eraList = document.querySelector('#era-list');
const statusMessage = document.querySelector('#status');
const vinyl = document.querySelector('.vinyl');
const coverImage = document.querySelector('#cover-image');
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
  browserBarColor.content = era.colors.background;
  document.title = `${era.name} · twenty one eras`;
}

function resetVinylRotation() {
  for (const animation of vinyl.getAnimations()) {
    animation.currentTime = 0;
  }
}

function showCover(era) {
  if (coverImage.src !== era.cover) {
    coverImage.classList.add('is-loading');
    coverImage.src = era.cover;
  }
  coverImage.alt = `Album cover of ${era.name}`;
}

function showAlbumInfo(era) {
  albumYear.textContent = era.year;
  albumTitle.textContent = era.name;
  albumDescription.textContent = era.description;
}

function markSelectedEraButton(slug) {
  for (const button of eraList.querySelectorAll('button')) {
    button.setAttribute('aria-pressed', button.dataset.slug === slug);
  }
}

function selectEra(slug) {
  const era = eras.find((e) => e.slug === slug);

  applyTheme(era);
  resetVinylRotation();
  showCover(era);
  showAlbumInfo(era);
  markSelectedEraButton(slug);
  showAlbum(era);
  setNedEra(era);
}

eraList.addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (button && button.dataset.slug !== document.body.dataset.era) {
    selectEra(button.dataset.slug);
  }
});

function revealCover() {
  coverImage.classList.remove('is-loading');
}

coverImage.addEventListener('load', revealCover);
coverImage.addEventListener('error', revealCover);

player.onUpdate(({ playing }) => vinyl.classList.toggle('is-spinning', playing));

function erasWithCovers(eraData, albums) {
  return eraData
    .map((era) => {
      const album = albums.find((a) => a.id === era.id);
      return album ? { ...era, cover: album.cover } : null;
    })
    .filter(Boolean);
}

async function init() {
  initVolume();
  statusMessage.textContent = 'Loading albums…';

  try {
    const [eraData, albums] = await Promise.all([getEras(), getAlbums()]);
    eras = erasWithCovers(eraData, albums);

    renderEraButtons();
    const newestEra = eras.at(-1);
    selectEra(newestEra.slug);
    statusMessage.textContent = '';
  } catch (error) {
    console.error(error);
    statusMessage.textContent = 'Could not load the albums. Check your connection and reload the page.';
  }
}

init();
