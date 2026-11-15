const audio = new Audio();
let currentId = null;

function toggle(track) {
  if (track.id === currentId) {
    if (audio.paused) {
      play();
    } else {
      audio.pause();
    }
    return;
  }

  currentId = track.id;
  audio.src = track.preview;
  play();
}

function setVolume(value) {
  audio.volume = value;
}

function stop() {
  currentId = null;
  audio.pause();
}

function play() {
  audio.play().catch((error) => console.warn('Preview could not play:', error.message));
}

function onEnded(callback) {
  audio.addEventListener('ended', () => callback(currentId));
}

function onUpdate(callback) {
  for (const type of ['play', 'pause', 'ended', 'timeupdate']) {
    audio.addEventListener(type, () => {
      callback({
        id: currentId,
        playing: !audio.paused,
        progress: audio.ended || !audio.duration ? 0 : audio.currentTime / audio.duration,
      });
    });
  }
}

export { toggle, setVolume, stop, onEnded, onUpdate };
