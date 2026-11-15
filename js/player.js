const audio = new Audio();
let currentTrackId = null;

function toggle(track) {
  if (track.id !== currentTrackId) {
    currentTrackId = track.id;
    audio.src = track.preview;
    play();
  } else if (audio.paused) {
    play();
  } else {
    audio.pause();
  }
}

function setVolume(levelFromZeroToOne) {
  audio.volume = levelFromZeroToOne;
}

function stop() {
  currentTrackId = null;
  audio.pause();
}

function play() {
  audio.play().catch((error) => console.warn('Preview could not play:', error.message));
}

function currentProgress() {
  if (audio.ended || !audio.duration) {
    return 0;
  }
  return audio.currentTime / audio.duration;
}

function onEnded(callback) {
  audio.addEventListener('ended', () => callback(currentTrackId));
}

function onUpdate(callback) {
  for (const eventType of ['play', 'pause', 'ended', 'timeupdate']) {
    audio.addEventListener(eventType, () => {
      callback({
        id: currentTrackId,
        playing: !audio.paused,
        progress: currentProgress(),
      });
    });
  }
}

export { toggle, setVolume, stop, onEnded, onUpdate };
