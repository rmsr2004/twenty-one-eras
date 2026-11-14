const audio = new Audio();
let currentId = null;

export function toggle(track) {
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

export function stop() {
  currentId = null;
  audio.pause();
}

function play() {
  audio.play().catch((error) => console.warn('Preview could not play:', error.message));
}

export function onUpdate(callback) {
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
