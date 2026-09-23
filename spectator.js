/**
 * spectator.js
 * Spectator mode to watch ongoing races live without participating.
 */

(function () {
  let isSpectating = false;
  let spectateInterval = null;

  const SPECTATOR_RACERS = [
    { id: 'racer-1', name: '🕵️‍♂️ Sherlock Holmes', baseWpm: 88, color: '#ffb800', progress: 0, wpm: 0, accuracy: 99 },
    { id: 'racer-2', name: '🩺 Dr. John Watson', baseWpm: 65, color: '#00d2ff', progress: 0, wpm: 0, accuracy: 96 },
    { id: 'racer-3', name: '🕷️ Prof. Moriarty', baseWpm: 94, color: '#ff4757', progress: 0, wpm: 0, accuracy: 98 },
    { id: 'racer-4', name: '🔍 Inspector Lestrade', baseWpm: 52, color: '#2ed573', progress: 0, wpm: 0, accuracy: 93 }
  ];

  const QUOTE = "It is a capital mistake to theorize before one has data. Insensibly one begins to twist facts to suit theories, instead of theories to suit facts.";

  function initSpectatorUI() {
    const container = document.getElementById('spectator-view');
    if (!container) return;

    container.innerHTML = `
      <div class="spectator-header">
        <div class="spectator-live-badge">🔴 LIVE SPECTATOR MODE</div>
        <p class="spectator-subtitle">Watching live high-stakes detective typist showdown</p>
      </div>

      <div class="spectator-quote-box">
        <p class="spectator-quote">"${QUOTE}"</p>
      </div>

      <div class="spectator-racers-list" id="spectator-racers-list"></div>

      <div class="spectator-ticker" id="spectator-ticker">
        <span class="ticker-label">RACE FEED:</span> <span id="ticker-text">Race is starting...</span>
      </div>
    `;

    renderRacersList();
  }

  function renderRacersList() {
    const list = document.getElementById('spectator-racers-list');
    if (!list) return;

    list.innerHTML = '';
    SPECTATOR_RACERS.forEach((racer) => {
      const card = document.createElement('div');
      card.className = 'spectator-racer-card';
      card.id = `spec-${racer.id}`;

      card.innerHTML = `
        <div class="spectator-racer-info">
          <span class="spectator-racer-name">${racer.name}</span>
          <div class="spectator-racer-stats">
            <span class="spec-wpm" id="wpm-${racer.id}">${racer.wpm} WPM</span>
            <span class="spec-acc">${racer.accuracy}% ACC</span>
          </div>
        </div>
        <div class="progress-track">
          <div class="progress-fill" id="fill-${racer.id}" style="width: 0%; background: ${racer.color};"></div>
        </div>
      `;

      list.appendChild(card);
    });
  }

  function startSpectating() {
    if (isSpectating) return;
    isSpectating = true;

    initSpectatorUI();
    SPECTATOR_RACERS.forEach((r) => { r.progress = 0; r.wpm = 0; });

    let elapsedSeconds = 0;
    const tickerEvents = [
      "Prof. Moriarty takes an aggressive early lead!",
      "Sherlock Holmes is maintaining a perfect 100% accuracy rate.",
      "Dr. Watson is accelerating rapidly through the quote!",
      "Sherlock closes the gap on Moriarty at key 85!",
      "Inspector Lestrade is typing steadily in lane 4."
    ];

    spectateInterval = setInterval(() => {
      elapsedSeconds += 0.2;

      let highestProgress = 0;
      let leaderName = '';

      SPECTATOR_RACERS.forEach((racer) => {
        if (racer.progress < 100) {
          // Human-like speed variance
          const speedFactor = racer.baseWpm / 60;
          const randomFluctuation = 0.8 + Math.random() * 0.4;
          const advance = (speedFactor * randomFluctuation * 0.2 / QUOTE.length) * 100;

          racer.progress = Math.min(100, racer.progress + advance);
          racer.wpm = Math.round(racer.baseWpm * randomFluctuation);
        }

        if (racer.progress > highestProgress) {
          highestProgress = racer.progress;
          leaderName = racer.name;
        }

        // Update UI elements
        const fill = document.getElementById(`fill-${racer.id}`);
        const wpmEl = document.getElementById(`wpm-${racer.id}`);
        if (fill) fill.style.width = `${racer.progress.toFixed(1)}%`;
        if (wpmEl) wpmEl.textContent = `${racer.wpm} WPM`;
      });

      // Update Ticker
      const tickerText = document.getElementById('ticker-text');
      if (tickerText && Math.floor(elapsedSeconds * 5) % 15 === 0) {
        const randomMsg = tickerEvents[Math.floor(Math.random() * tickerEvents.length)];
        tickerText.textContent = `${leaderName.split(' ')[1]} leads! — ${randomMsg}`;
      }

      // Check if race completed
      if (SPECTATOR_RACERS.every((r) => r.progress >= 100)) {
        clearInterval(spectateInterval);
        if (tickerText) {
          const winner = [...SPECTATOR_RACERS].sort((a, b) => b.wpm - a.wpm)[0];
          tickerText.textContent = `🏆 RACE FINISHED! Winner: ${winner.name} (${winner.wpm} WPM)`;
        }
      }
    }, 200);
  }

  function stopSpectating() {
    isSpectating = false;
    if (spectateInterval) {
      clearInterval(spectateInterval);
      spectateInterval = null;
    }
  }

  window.Spectator = {
    start: startSpectating,
    stop: stopSpectating,
    init: initSpectatorUI
  };
})();
