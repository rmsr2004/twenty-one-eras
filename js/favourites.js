const STORAGE_KEY = 'favourites';

function loadSavedFavourites() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? [];
  } catch {
    return [];
  }
}

let favourites = loadSavedFavourites();

function getFavourites() {
  return [...favourites];
}

function isFavourite(track) {
  return favourites.some((favourite) => favourite.id === track.id);
}

function toggleFavourite(track) {
  if (isFavourite(track)) {
    favourites = favourites.filter((favourite) => favourite.id !== track.id);
  } else {
    favourites.push(track);
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favourites));
  } catch (error) {
    console.warn('Favourites could not be saved:', error.message);
  }
}

export { getFavourites, isFavourite, toggleFavourite };
