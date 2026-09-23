/**
 * daily-challenge.js
 * ────────────────────────────────────────────────────────
 * Daily Challenge for Type Like Sherlock.
 * One deterministic quote per day (same for everyone),
 * local scoring, streak tracking, and server leaderboard.
 */

(function () {
  'use strict';

  /* ── Curated daily quote pool (60 quotes) ──────── */

  const DAILY_QUOTES = [
    'The world is full of obvious things which nobody by any chance ever observes.',
    'You see, but you do not observe. The distinction is clear.',
    'Education never ends, Watson. It is a series of lessons, with the greatest for the last.',
    'Mediocrity knows nothing higher than itself, but talent instantly recognizes genius.',
    'There is nothing more stimulating than a case where everything goes against you.',
    'My mind rebels at stagnation. Give me problems, give me work.',
    'It is a capital mistake to theorize before one has data.',
    'The emotional qualities are antagonistic to clear reasoning.',
    'Crime is common. Logic is rare. Therefore it is upon the logic rather than upon the crime that you should dwell.',
    'I cannot live without brainwork. What else is there to live for?',
    'Data! Data! Data! I cannot make bricks without clay.',
    'Nothing clears up a case so much as stating it to another person.',
    'The little things are infinitely the most important.',
    'A man should keep his little brain attic stocked with all the furniture that he is likely to use.',
    'The game is afoot. Not a word! Into your clothes and come!',
    'To a great mind, nothing is little.',
    'How often have I said to you that when you have eliminated the impossible, whatever remains must be the truth?',
    'My name is Sherlock Holmes. It is my business to know what other people do not know.',
    'I am a brain, Watson. The rest of me is a mere appendix.',
    'You know my methods. Apply them.',
    'Life is infinitely stranger than anything which the mind of man could invent.',
    'I have no data yet. It is a capital mistake to theorize before one has data.',
    'It has long been an axiom of mine that the little things are infinitely the most important.',
    'The temptation to form premature theories upon insufficient data is the bane of our profession.',
    'I ought to know by this time that when a fact appears to be opposed to a long train of deductions, it invariably proves to be capable of bearing some other interpretation.',
    'There is nothing more deceptive than an obvious fact.',
    'It is my belief, Watson, founded upon my experience, that the lowest and vilest alleys in London do not present a more dreadful record of sin than does the smiling and beautiful countryside.',
    'A man always finds it hard to realize that he may have finally lost a woman love.',
    'I think that there are certain crimes which the law cannot touch, and which therefore justify private revenge.',
    'I never guess. It is a shocking habit, destructive to the logical faculty.',
    'Violence does, in truth, recoil upon the violent, and the schemer falls into the pit which he digs for another.',
    'The best way of successfully acting a part is to be it.',
    'The chief proof of man real greatness lies in his perception of his own smallness.',
    'Work is the best antidote to sorrow, my dear Watson.',
    'Where there is no imagination there is no horror.',
    'A study in scarlet, eh? Why should we not use a little art jargon?',
    'We balance probabilities and choose the most likely. It is the scientific use of the imagination.',
    'I have always held that it is far better to be a fool in that sort of matter than to be wise.',
    'One cannot always have the success for which one hopes.',
    'Some people without possessing genius have a remarkable power of stimulating it.',
    'The world is big enough for us. No ghosts need apply.',
    'I cannot agree with those who rank modesty among the virtues.',
    'It is stupidity rather than courage to refuse to recognize danger when it is close upon you.',
    'Singularity is almost invariably a clue. The more featureless and commonplace a crime is, the more difficult it is to bring it home.',
    'My mind is like a racing engine, tearing itself to pieces because it is not connected up with the work for which it was built.',
    'The idea of using a form of poison which is not discoverable by any chemical test was just such a one as would occur to a clever and ruthless man.',
    'Detection is, or ought to be, an exact science and should be treated in the same cold and unemotional manner.',
    'I confess that I have been blind as a mole, but it is better to learn wisdom late than never to learn it at all.',
    'I followed you, and I saw things which made me think that you were indeed the murderer.',
    'A dog reflects the family life. Whoever saw a frisky dog in a gloomy family, or a sad dog in a happy one?',
    'When a doctor does go wrong, he is the first of criminals. He has nerve and he has knowledge.',
    'Women are naturally secretive, and they like to do their own secreting.',
    'I should prefer that you do not mention my name at all in connection with the case.',
    'Eliminate all other factors, and the one which remains must be the truth.',
    'Having gathered these facts, Watson, I smoked several pipes over them, trying to separate those which were crucial.',
    'There are always some lunatics about. It would be a dull world without them.',
    'Now is the dramatic moment of fate, Watson, when you hear a step upon the stair.',
    'Problems may be solved in the study which have baffled all those who have sought a solution by the aid of their senses.',
    'What you do in this world is a matter of no consequence. The question is what can you make people believe you have done?',
    'I think there are certain crimes which the law is powerless to address and which therefore, to some extent, justify private revenge.'
  ];

  /* ── Deterministic daily quote ─────────────────── */

  function getDayString() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }

  function hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }

  function getDailyQuote() {
    const dayStr = getDayString();
    const index = hashString(dayStr) % DAILY_QUOTES.length;
    return DAILY_QUOTES[index];
  }

  /* ── Streak tracking ───────────────────────────── */

  function getDailyData() {
    return JSON.parse(localStorage.getItem('typingDailyData') || '{}');
  }

  function saveDailyData(data) {
    localStorage.setItem('typingDailyData', JSON.stringify(data));
  }

  function getDailyStreak() {
    const data = getDailyData();
    return data.streak || 0;
  }

  function updateDailyStreak() {
    const data = getDailyData();
    const today = getDayString();

    if (data.lastDate === today) return; // already done today

    // Check if yesterday was completed
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

    if (data.lastDate === yStr) {
      data.streak = (data.streak || 0) + 1;
    } else if (data.lastDate !== today) {
      data.streak = 1; // streak broken, start fresh
    }

    data.lastDate = today;
    saveDailyData(data);
  }

  /* ── Daily best score (local) ──────────────────── */

  function getDailyBest() {
    const data = getDailyData();
    const today = getDayString();
    if (data.bestDate === today) {
      return { wpm: data.bestWpm || 0, accuracy: data.bestAccuracy || 0 };
    }
    return null;
  }

  function saveDailyBest(wpm, accuracy) {
    const data = getDailyData();
    const today = getDayString();
    if (data.bestDate !== today || wpm > (data.bestWpm || 0)) {
      data.bestDate = today;
      data.bestWpm = wpm;
      data.bestAccuracy = accuracy;
      saveDailyData(data);
    }
  }

  /* ── Server leaderboard ────────────────────────── */

  async function loadDailyLeaderboard() {
    const container = document.getElementById('daily-leaderboard');
    if (!container) return;

    try {
      const today = getDayString();
      const res = await fetch(`/api/leaderboard?mode=daily&date=${today}`);
      if (!res.ok) throw new Error('Server unavailable');
      const entries = await res.json();

      if (!entries || entries.length === 0) {
        container.innerHTML = '<p class="daily-lb-empty">No scores yet today. Be the first!</p>';
        return;
      }

      container.innerHTML = `
        <table class="daily-lb-table">
          <thead><tr><th>#</th><th>Name</th><th>WPM</th><th>Acc</th></tr></thead>
          <tbody>${entries.slice(0, 10).map((e, i) => `
            <tr><td>${i + 1}</td><td>${e.name}</td><td>${e.wpm}</td><td>${e.accuracy}%</td></tr>
          `).join('')}</tbody>
        </table>
      `;
    } catch {
      container.innerHTML = '<p class="daily-lb-empty">Leaderboard unavailable offline</p>';
    }
  }

  async function submitDailyScore(wpm, accuracy) {
    const nameInput = document.getElementById('player-name');
    const playerName = nameInput ? nameInput.value.trim() : 'Anonymous';
    const today = getDayString();

    try {
      await fetch('/api/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: playerName,
          wpm,
          accuracy,
          mode: 'daily',
          date: today
        })
      });
    } catch {
      // offline — score saved locally only
    }
  }

  /* ── UI ─────────────────────────────────────────── */

  function initDailyUI() {
    const card = document.getElementById('daily-challenge');
    if (!card) return;

    const dateEl = document.getElementById('daily-date');
    const previewEl = document.getElementById('daily-quote-preview');
    const bestEl = document.getElementById('daily-best');
    const startBtn = document.getElementById('daily-start');

    const today = getDayString();
    const quote = getDailyQuote();
    const streak = getDailyStreak();
    const best = getDailyBest();

    if (dateEl) dateEl.textContent = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    if (previewEl) previewEl.textContent = `"${quote.substring(0, 60)}${quote.length > 60 ? '...' : ''}"`;
    if (bestEl) {
      if (best) {
        bestEl.innerHTML = `<span class="daily-best-score">Today's best: ${best.wpm} WPM, ${best.accuracy}%</span>` +
          (streak > 1 ? ` <span class="daily-streak-badge">🔥 ${streak}-day streak</span>` : '');
      } else {
        bestEl.innerHTML = streak > 1
          ? `<span class="daily-streak-badge">🔥 ${streak}-day streak</span> — Not attempted today`
          : 'Not attempted today';
      }
    }

    if (startBtn) {
      startBtn.addEventListener('click', () => {
        window.isDailyChallenge = true;
        window.multiplayerQuote = quote;

        // Scroll to game shell and start
        const gameShell = document.getElementById('game-shell');
        if (gameShell) gameShell.scrollIntoView({ behavior: 'smooth' });

        setTimeout(() => {
          if (typeof startRound === 'function') startRound();
        }, 400);
      });
    }

    loadDailyLeaderboard();
  }

  /* ── Called by finishRound in script.js ─────────── */

  window.finishDailyChallenge = function (wpm, accuracy) {
    if (!window.isDailyChallenge) return;
    window.isDailyChallenge = false;
    window.multiplayerQuote = null;

    updateDailyStreak();
    saveDailyBest(wpm, accuracy);
    submitDailyScore(wpm, accuracy);

    // Refresh UI
    setTimeout(() => {
      initDailyUI();
      // Feed streak to achievements
      if (typeof checkBadges === 'function') {
        checkBadges({ dailyStreak: getDailyStreak() });
      }
    }, 500);
  };

  /* expose streak for achievements */
  window.getDailyStreak = getDailyStreak;

  initDailyUI();

})();
