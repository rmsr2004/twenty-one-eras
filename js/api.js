const BASE_URL = 'https://itunes.apple.com';
const ARTIST_ID = 349736311;

const NOT_STUDIO_ALBUM = /\b(single|ep|live|livestream|unplugged)\b/i;

async function getJSON(url) {
  const cached = sessionStorage.getItem(url);
  if (cached) {
    return JSON.parse(cached);
  }

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  const data = await response.json();
  sessionStorage.setItem(url, JSON.stringify(data));
  return data;
}

export async function getEras() {
  const response = await fetch('data/eras.json');
  if (!response.ok) {
    throw new Error(`Could not load eras.json (${response.status})`);
  }
  return response.json();
}

export async function getTracks(albumId) {
  const data = await getJSON(`${BASE_URL}/lookup?id=${albumId}&entity=song`);

  return data.results
    .filter((item) => item.wrapperType === 'track' && item.previewUrl)
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

export async function getAlbums() {
  const data = await getJSON(`${BASE_URL}/lookup?id=${ARTIST_ID}&entity=album&limit=200`);
  const seenNames = new Set();

  return data.results
    .filter((item) => item.collectionType === 'Album')
    .filter((item) => item.trackCount >= 8 && !NOT_STUDIO_ALBUM.test(item.collectionName))
    .filter((item) => {
      const name = item.collectionName.toLowerCase();
      if (seenNames.has(name)) return false;
      seenNames.add(name);
      return true;
    })
    .map((item) => ({
      id: item.collectionId,
      name: item.collectionName,
      year: Number(item.releaseDate.slice(0, 4)),
      cover: item.artworkUrl100.replace('100x100', '600x600'),
    }))
    .sort((a, b) => a.year - b.year);
}
