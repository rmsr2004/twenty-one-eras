const ITUNES_URL = 'https://itunes.apple.com';
const TWENTY_ONE_PILOTS_ARTIST_ID = 349736311;
const MIN_STUDIO_ALBUM_TRACKS = 8;
const NOT_A_STUDIO_ALBUM = /\b(single|ep|live|livestream|unplugged)\b/i;

async function fetchJSONOncePerSession(url) {
  const cached = sessionStorage.getItem(url);
  if (cached) {
    return JSON.parse(cached);
  }

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  const data = await response.json();
  try {
    sessionStorage.setItem(url, JSON.stringify(data));
  } catch (error) {
    console.warn('Response could not be cached:', error.message);
  }
  return data;
}

async function getEras() {
  const response = await fetch('data/eras.json');
  if (!response.ok) {
    throw new Error(`Could not load eras.json (${response.status})`);
  }
  return response.json();
}

function isTrackWithPreview(item) {
  return item.wrapperType === 'track' && Boolean(item.previewUrl);
}

async function getTracks(albumId) {
  const data = await fetchJSONOncePerSession(`${ITUNES_URL}/lookup?id=${albumId}&entity=song`);

  return data.results
    .filter(isTrackWithPreview)
    .map((item) => ({
      id: item.trackId,
      name: item.trackName,
      album: item.collectionName,
      number: item.trackNumber,
      duration: item.trackTimeMillis,
      preview: item.previewUrl,
    }))
    .sort((a, b) => a.number - b.number);
}

function isStudioAlbum(item) {
  return item.collectionType === 'Album'
    && item.trackCount >= MIN_STUDIO_ALBUM_TRACKS
    && !NOT_A_STUDIO_ALBUM.test(item.collectionName);
}

function uniqueByName(albums) {
  const seenNames = new Set();

  return albums.filter((album) => {
    const name = album.collectionName.toLowerCase();
    if (seenNames.has(name)) {
      return false;
    }
    seenNames.add(name);
    return true;
  });
}

function largeArtwork(artworkUrl100) {
  return artworkUrl100.replace('100x100', '600x600');
}

async function getAlbums() {
  const data = await fetchJSONOncePerSession(
    `${ITUNES_URL}/lookup?id=${TWENTY_ONE_PILOTS_ARTIST_ID}&entity=album&limit=200`,
  );

  return uniqueByName(data.results.filter(isStudioAlbum))
    .map((item) => ({
      id: item.collectionId,
      name: item.collectionName,
      year: Number(item.releaseDate.slice(0, 4)),
      cover: largeArtwork(item.artworkUrl100),
    }))
    .sort((a, b) => a.year - b.year);
}

export { getEras, getTracks, getAlbums };
