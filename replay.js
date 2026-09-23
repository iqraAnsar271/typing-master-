/**
 * replay.js
 * ────────────────────────────────────────────────────────
 * Typing test replay for Type Like Sherlock.
 * Records each keystroke with timestamp during a round,
 * then plays it back character-by-character at original pace.
 */

(function () {
  'use strict';

  let replayTimeouts = [];
  let replaySpeed = 1;

  /* ── Storage ────────────────────────────────────── */

  window.saveReplayData = function (recording, quote, wpm, accuracy) {
    const data = {
      keystrokes: recording,
      quote: quote,
      wpm: wpm,
      accuracy: accuracy,
      timestamp: Date.now()
    };
    localStorage.setItem('typingReplay', JSON.stringify(data));

    // Show replay button
    const btn = document.getElementById('replay-btn');
    if (btn) btn.style.display = 'inline-flex';
  };

  function getReplayData() {
    const raw = localStorage.getItem('typingReplay');
    return raw ? JSON.parse(raw) : null;
  }

  /* ── Replay engine ──────────────────────────────── */

  function clearReplay() {
    for (const t of replayTimeouts) clearTimeout(t);
    replayTimeouts = [];
  }

  function startReplay() {
    const data = getReplayData();
    if (!data || !data.keystrokes || data.keystrokes.length === 0) return;

    clearReplay();

    const overlay = document.getElementById('replay-overlay');
    const quoteEl = document.getElementById('replay-quote');
    const wpmEl = document.getElementById('replay-wpm');
    const accEl = document.getElementById('replay-acc');
    const timeEl = document.getElementById('replay-time');
    const speedEl = document.getElementById('replay-speed');

    if (!overlay || !quoteEl) return;

    overlay.style.display = 'block';
    if (speedEl) speedEl.textContent = `${replaySpeed}×`;

    // Render quote with individual char spans
    const words = data.quote.split(/\s+/);
    quoteEl.innerHTML = words.map(word => {
      const chars = word.split('').map(c => `<span class="replay-char">${c}</span>`).join('');
      return `<span class="replay-word">${chars}</span>`;
    }).join(' ');

    const allChars = quoteEl.querySelectorAll('.replay-char');
    const keystrokes = data.keystrokes;
    const startTime = keystrokes[0] ? keystrokes[0].time : 0;

    let correctSoFar = 0;
    let incorrectSoFar = 0;
    let charIndex = 0;

    // Schedule each keystroke reveal
    for (let i = 0; i < keystrokes.length; i++) {
      const ks = keystrokes[i];
      const delay = ((ks.time - startTime) / replaySpeed);

      const t = setTimeout(() => {
        if (charIndex < allChars.length) {
          const charEl = allChars[charIndex];
          if (ks.correct) {
            charEl.classList.add('replay-correct');
            correctSoFar++;
          } else {
            charEl.classList.add('replay-incorrect');
            incorrectSoFar++;
          }
          charIndex++;
        }

        // Update live stats
        const elapsed = (ks.time - startTime) / 1000;
        const elapsedMin = elapsed / 60;
        const wordsTyped = Math.floor(charIndex / 5); // standard 5-char words
        const liveWpm = elapsedMin > 0 ? Math.round(wordsTyped / elapsedMin) : 0;
        const totalTyped = correctSoFar + incorrectSoFar;
        const liveAcc = totalTyped > 0 ? Math.round((correctSoFar / totalTyped) * 100) : 100;

        if (wpmEl) wpmEl.textContent = `${liveWpm} WPM`;
        if (accEl) accEl.textContent = `${liveAcc}%`;
        if (timeEl) timeEl.textContent = `${elapsed.toFixed(1)}s`;

        // Final state
        if (i === keystrokes.length - 1) {
          if (wpmEl) wpmEl.textContent = `${data.wpm} WPM`;
          if (accEl) accEl.textContent = `${data.accuracy}%`;
        }
      }, delay);

      replayTimeouts.push(t);
    }
  }

  function stopReplay() {
    clearReplay();
    const overlay = document.getElementById('replay-overlay');
    if (overlay) overlay.style.display = 'none';
  }

  /* ── Event bindings ────────────────────────────── */

  const replayBtn = document.getElementById('replay-btn');
  const closeBtn = document.getElementById('replay-close');
  const speedBtn = document.getElementById('replay-speed');

  if (replayBtn) {
    replayBtn.addEventListener('click', () => {
      replaySpeed = 1;
      startReplay();
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', stopReplay);
  }

  if (speedBtn) {
    speedBtn.addEventListener('click', () => {
      // Cycle: 1 → 2 → 4 → 1
      if (replaySpeed === 1) replaySpeed = 2;
      else if (replaySpeed === 2) replaySpeed = 4;
      else replaySpeed = 1;

      speedBtn.textContent = `${replaySpeed}×`;

      // Restart at new speed
      startReplay();
    });
  }

  /* ── Show replay button if data exists ─────────── */
  const existingReplay = getReplayData();
  if (existingReplay && document.getElementById('replay-btn')) {
    document.getElementById('replay-btn').style.display = 'inline-flex';
  }

})();
