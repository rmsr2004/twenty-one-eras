const STORAGE_KEY = 'favourites';

function load() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? [];
  } catch {
    return [];
  }
}

let favourites = load();

function getFavourites() {
  return [...favourites];
}

function isFavourite(track) {
  return favourites.some((f) => f.id === track.id);
}

function toggleFavourite(track) {
  if (isFavourite(track)) {
    favourites = favourites.filter((f) => f.id !== track.id);
  } else {
    favourites.push(track);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(favourites));
}

export { getFavourites, isFavourite, toggleFavourite };
