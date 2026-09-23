/**
 * heatmap.js
 * ────────────────────────────────────────────────────────
 * Keyboard heatmap for Type Like Sherlock.
 * Tracks per-key accuracy over time, renders a visual
 * QWERTY keyboard colored by error rate.
 */

(function () {
  'use strict';

  const KEYBOARD_ROWS = [
    ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '='],
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '[', ']', '\\'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ';', "'"],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', '/'],
    [' ']  // space bar
  ];

  const WIDE_KEYS = { ' ': 'Space' };

  /* ── Storage ────────────────────────────────────── */

  function getHeatmapData() {
    return JSON.parse(localStorage.getItem('typingHeatmap') || '{}');
  }

  function saveHeatmapData(data) {
    localStorage.setItem('typingHeatmap', JSON.stringify(data));
  }

  /* ── Per-key recording (called by script.js) ───── */

  window.recordKeyAccuracy = function (expected, typed) {
    if (!expected || !typed) return;

    const data = getHeatmapData();
    const key = expected.toUpperCase();

    if (!data[key]) data[key] = { correct: 0, incorrect: 0 };

    if (expected === typed) {
      data[key].correct++;
    } else {
      data[key].incorrect++;
      // Also track the mistyped key
      const wrongKey = typed.toUpperCase();
      if (!data[wrongKey]) data[wrongKey] = { correct: 0, incorrect: 0 };
      data[wrongKey].incorrect++;
    }

    saveHeatmapData(data);
  };

  /* ── Color calculation ─────────────────────────── */

  function getKeyColor(correct, incorrect) {
    const total = correct + incorrect;
    if (total === 0) return { bg: 'rgba(255,255,255,0.04)', text: 'var(--muted)' };

    const accuracy = correct / total;

    // HSL: 0 = red, 120 = green
    const hue = Math.round(accuracy * 120);
    const saturation = 70;
    const lightness = 25 + (1 - accuracy) * 10;

    return {
      bg: `hsla(${hue}, ${saturation}%, ${lightness}%, 0.5)`,
      text: accuracy > 0.7 ? 'var(--text)' : '#fff'
    };
  }

  /* ── Render keyboard ───────────────────────────── */

  function renderHeatmap() {
    const container = document.getElementById('keyboard-heatmap');
    if (!container) return;

    const data = getHeatmapData();
    const totalEntries = Object.values(data).reduce((sum, v) => sum + v.correct + v.incorrect, 0);

    container.innerHTML = KEYBOARD_ROWS.map((row, rowIndex) => {
      const keysHtml = row.map(key => {
        const upperKey = key.toUpperCase();
        const stats = data[upperKey] || { correct: 0, incorrect: 0 };
        const total = stats.correct + stats.incorrect;
        const accuracy = total > 0 ? Math.round((stats.correct / total) * 100) : -1;
        const color = getKeyColor(stats.correct, stats.incorrect);
        const isWide = WIDE_KEYS[key];
        const displayKey = isWide || key;
        const tooltip = accuracy >= 0
          ? `${displayKey}: ${accuracy}% accuracy (${total} presses)`
          : `${displayKey}: No data`;

        return `<div class="heatmap-key ${isWide ? 'heatmap-key-wide' : ''} ${rowIndex === 4 ? 'heatmap-key-space' : ''}" 
                     style="background: ${color.bg}; color: ${color.text};" 
                     title="${tooltip}"
                     data-accuracy="${accuracy}">
          ${displayKey}
          ${total > 0 ? `<span class="heatmap-key-pct">${accuracy}%</span>` : ''}
        </div>`;
      }).join('');

      return `<div class="heatmap-row">${keysHtml}</div>`;
    }).join('');

    // Add legend
    if (totalEntries > 0) {
      container.innerHTML += `
        <div class="heatmap-legend">
          <span class="heatmap-legend-item"><span class="heatmap-swatch" style="background:hsla(0,70%,30%,0.5)"></span>Low accuracy</span>
          <span class="heatmap-legend-item"><span class="heatmap-swatch" style="background:hsla(60,70%,28%,0.5)"></span>Medium</span>
          <span class="heatmap-legend-item"><span class="heatmap-swatch" style="background:hsla(120,70%,25%,0.5)"></span>High accuracy</span>
          <span class="heatmap-legend-item"><span class="heatmap-swatch" style="background:rgba(255,255,255,0.04)"></span>No data</span>
        </div>
      `;
    }
  }

  /* ── Reset ──────────────────────────────────────── */

  const resetBtn = document.getElementById('heatmap-reset');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (confirm('Reset all keyboard heatmap data? This cannot be undone.')) {
        localStorage.removeItem('typingHeatmap');
        renderHeatmap();
      }
    });
  }

  /* ── Expose refresh for use after rounds ────────── */
  window.refreshHeatmap = renderHeatmap;

  /* ── Init ───────────────────────────────────────── */
  renderHeatmap();

})();
