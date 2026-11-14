const STORAGE_KEY = 'favourites';

function load() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? [];
  } catch {
    return [];
  }
}

let favourites = load();

export function getFavourites() {
  return [...favourites];
}

export function isFavourite(track) {
  return favourites.some((f) => f.id === track.id);
}

export function toggleFavourite(track) {
  if (isFavourite(track)) {
    favourites = favourites.filter((f) => f.id !== track.id);
  } else {
    favourites.push(track);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(favourites));
}
