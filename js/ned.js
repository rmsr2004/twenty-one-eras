const ned = document.querySelector('#ned');
const bubble = document.querySelector('#bubble');
const bubbleFull = document.querySelector('#bubble-full');
const bubbleTyped = document.querySelector('#bubble-typed');
const nextButton = document.querySelector('#bubble-next');
const nedSays = document.querySelector('#ned-says');

const TYPING_SPEED = 30;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

let lines = [];
let lineIndex = 0;
let typingTimer = null;

function setNedEra(era) {
  closeBubble();
  lines = era.story;
  ned.setAttribute('aria-label', `Ask Ned about ${era.name}`);
  ned.disabled = false;
}

function openBubble() {
  lineIndex = 0;
  bubble.hidden = false;
  ned.setAttribute('aria-expanded', true);
  showLine();
}

function closeBubble() {
  stopTyping();
  if (bubble.contains(document.activeElement)) {
    ned.focus();
  }
  bubble.hidden = true;
  ned.setAttribute('aria-expanded', false);
}

function stopTyping() {
  clearInterval(typingTimer);
  typingTimer = null;
}

function showLine() {
  const line = lines[lineIndex];
  const isLast = lineIndex === lines.length - 1;

  bubbleFull.textContent = line;
  nedSays.textContent = line;
  nextButton.setAttribute('aria-label', isLast ? 'Close' : 'Next');
  bubble.classList.remove('is-done');
  stopTyping();

  if (reducedMotion.matches) {
    finishLine();
    return;
  }

  let letters = 0;
  bubbleTyped.textContent = '';
  typingTimer = setInterval(() => {
    letters++;
    bubbleTyped.textContent = line.slice(0, letters);
    if (letters === line.length) {
      finishLine();
    }
  }, TYPING_SPEED);
}

function finishLine() {
  stopTyping();
  bubbleTyped.textContent = lines[lineIndex];
  bubble.classList.add('is-done');
}

function advance() {
  if (typingTimer) {
    finishLine();
  } else if (lineIndex < lines.length - 1) {
    lineIndex++;
    showLine();
  } else {
    closeBubble();
  }
}

ned.addEventListener('click', () => {
  if (bubble.hidden) {
    openBubble();
  } else {
    advance();
  }
});

bubble.addEventListener('click', (event) => {
  if (event.target.closest('#bubble-close')) {
    closeBubble();
  } else {
    advance();
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !bubble.hidden) {
    closeBubble();
  }
});

export { setNedEra };
