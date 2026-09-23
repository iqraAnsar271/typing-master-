/**
 * virtual-keyboard.js
 * On-screen responsive QWERTY keyboard for touch users and key highlighting guide.
 */

(function () {
  const KEYBOARD_ROWS = [
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
    ['Shift', 'z', 'x', 'c', 'v', 'b', 'n', 'm', 'Backspace'],
    ['Space']
  ];

  let currentTargetChar = null;

  function initVirtualKeyboard() {
    const container = document.getElementById('virtual-keyboard');
    if (!container) return;

    container.innerHTML = '';

    KEYBOARD_ROWS.forEach((rowKeys, rowIndex) => {
      const rowDiv = document.createElement('div');
      rowDiv.className = `vkey-row row-${rowIndex}`;

      rowKeys.forEach((key) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'vkey';

        let keyDisplay = key;
        let dataKey = key;

        if (key === 'Space') {
          keyDisplay = 'Space';
          dataKey = ' ';
          btn.classList.add('vkey-space');
        } else if (key === 'Backspace') {
          keyDisplay = '⌫';
          dataKey = 'Backspace';
          btn.classList.add('vkey-backspace');
        } else if (key === 'Shift') {
          keyDisplay = '⇧';
          dataKey = 'Shift';
          btn.classList.add('vkey-shift');
        }

        btn.textContent = keyDisplay;
        btn.dataset.key = dataKey.toLowerCase();

        // Handle Touch and Click for touch typists
        btn.addEventListener('pointerdown', (e) => {
          e.preventDefault();
          btn.classList.add('vkey-pressed');
          handleVirtualKeyPress(dataKey);
        });

        btn.addEventListener('pointerup', () => btn.classList.remove('vkey-pressed'));
        btn.addEventListener('pointerleave', () => btn.classList.remove('vkey-pressed'));

        rowDiv.appendChild(btn);
      });

      container.appendChild(rowDiv);
    });

    listenPhysicalKeyboard();
  }

  function handleVirtualKeyPress(keyVal) {
    const inputEl = document.getElementById('typing-input') || document.querySelector('input[type="text"]');
    if (!inputEl || inputEl.disabled) return;

    inputEl.focus();

    if (keyVal === 'Backspace') {
      inputEl.value = inputEl.value.slice(0, -1);
    } else if (keyVal === 'Shift') {
      return;
    } else {
      inputEl.value += keyVal;
    }

    // Trigger input event so script.js processes the typing logic
    const event = new Event('input', { bubbles: true });
    inputEl.dispatchEvent(event);
  }

  function highlightNextKey(char) {
    currentTargetChar = char;
    const container = document.getElementById('virtual-keyboard');
    if (!container) return;

    // Clear previous target highlights
    container.querySelectorAll('.vkey-target').forEach((el) => el.classList.remove('vkey-target'));

    if (!char) return;

    let searchKey = char.toLowerCase();
    if (searchKey === ' ') searchKey = ' ';

    const keyEl = container.querySelector(`.vkey[data-key="${searchKey}"]`);
    if (keyEl) {
      keyEl.classList.add('vkey-target');
    }
  }

  function listenPhysicalKeyboard() {
    window.addEventListener('keydown', (e) => {
      const key = e.key === ' ' ? ' ' : e.key.toLowerCase();
      const container = document.getElementById('virtual-keyboard');
      if (!container) return;

      const keyEl = container.querySelector(`.vkey[data-key="${key}"]`);
      if (keyEl) {
        keyEl.classList.add('vkey-pressed');
      }
    });

    window.addEventListener('keyup', (e) => {
      const key = e.key === ' ' ? ' ' : e.key.toLowerCase();
      const container = document.getElementById('virtual-keyboard');
      if (!container) return;

      const keyEl = container.querySelector(`.vkey[data-key="${key}"]`);
      if (keyEl) {
        keyEl.classList.remove('vkey-pressed');
      }
    });
  }

  // Export functions to window
  window.VirtualKeyboard = {
    init: initVirtualKeyboard,
    highlightNextKey: highlightNextKey
  };

  document.addEventListener('DOMContentLoaded', () => {
    initVirtualKeyboard();
  });
})();
