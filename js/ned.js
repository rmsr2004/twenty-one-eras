const MS_PER_LETTER = 30;
const GREETING = "Hello, I'm Ned! Let me tell you about this era.";

const ned = document.querySelector('#ned');
const bubble = document.querySelector('#bubble');
const bubbleSpaceHolder = document.querySelector('#bubble-space-holder');
const bubbleTypedText = document.querySelector('#bubble-typed-text');
const nextButton = document.querySelector('#bubble-next');
const lineForScreenReaders = document.querySelector('#ned-line-for-screen-readers');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const cannotHover = window.matchMedia('(hover: none)');

let storyLines = [];
let lineIndex = 0;
let typingTimer = null;

function setNedEra(era) {
  closeBubble();
  // Without hover (touch screens) the greeting tooltip is never seen, so Ned says it first.
  storyLines = cannotHover.matches ? [GREETING, ...era.story] : era.story;
  ned.setAttribute('aria-label', `Ask Ned about ${era.name}`);
  ned.disabled = false;
}

function isTyping() {
  return typingTimer !== null;
}

function isLastLine() {
  return lineIndex === storyLines.length - 1;
}

function openBubble() {
  lineIndex = 0;
  bubble.hidden = false;
  ned.setAttribute('aria-expanded', true);
  showLine();
}

function moveFocusOutOfBubble() {
  if (bubble.contains(document.activeElement)) {
    ned.focus();
  }
}

function closeBubble() {
  stopTyping();
  moveFocusOutOfBubble();
  bubble.hidden = true;
  ned.setAttribute('aria-expanded', false);
}

function stopTyping() {
  clearInterval(typingTimer);
  typingTimer = null;
  ned.classList.remove('is-talking');
}

function showLine() {
  const line = storyLines[lineIndex];

  bubbleSpaceHolder.textContent = line;
  lineForScreenReaders.textContent = line;
  nextButton.setAttribute('aria-label', isLastLine() ? 'Close' : 'Next');
  bubble.classList.remove('is-line-complete');
  stopTyping();

  if (prefersReducedMotion.matches) {
    completeLine();
  } else {
    typeLine(line);
  }
}

function typeLine(line) {
  let typedLetters = 0;
  bubbleTypedText.textContent = '';
  ned.classList.add('is-talking');

  typingTimer = setInterval(() => {
    typedLetters++;
    bubbleTypedText.textContent = line.slice(0, typedLetters);
    if (typedLetters === line.length) {
      completeLine();
    }
  }, MS_PER_LETTER);
}

function completeLine() {
  stopTyping();
  bubbleTypedText.textContent = storyLines[lineIndex];
  bubble.classList.add('is-line-complete');
}

function advanceStory() {
  if (isTyping()) {
    completeLine();
  } else if (isLastLine()) {
    closeBubble();
  } else {
    lineIndex++;
    showLine();
  }
}

ned.addEventListener('click', () => {
  if (bubble.hidden) {
    openBubble();
  } else {
    advanceStory();
  }
});

bubble.addEventListener('click', (event) => {
  if (event.target.closest('#bubble-close')) {
    closeBubble();
  } else {
    advanceStory();
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !bubble.hidden) {
    closeBubble();
  }
});

export { setNedEra };
