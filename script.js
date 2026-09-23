const difficultySettings = [
  {
    id: 'easy',
    label: 'Easy',
    targetWpm: 18,
    targetAccuracy: 80,
    quotes: [
      'The game is afoot, Watson.',
      'Watson kept his notebook close at hand.',
      'A small clue can solve a big case.',
      'Sherlock walked the quiet street with care.',
      'Every good detective needs a keen eye.'
    ]
},
  {
    id: 'medium',
    label: 'Medium',
    targetWpm: 26,
    targetAccuracy: 85,
    quotes: [
      'When you have eliminated the impossible, whatever remains, however improbable, must be the truth.',
      'There is nothing more deceptive than an obvious fact.',
      'I ought to know by this time that when a fact appears to be opposed to a long train of deductions it invariably proves to be capable of bearing some other interpretation.',
      'I never make exceptions. An exception disproves the rule.',
      'What one man can invent another can discover.'
    ]
  },
  {
    id: 'hard',
    label: 'Hard',
    targetWpm: 34,
    targetAccuracy: 90,
    quotes: [
      'The subtle arrangement of evidence, the quiet precision of observation, and the relentless logic of deduction are all essential to every successful case.',
      'It was not the grandeur of the mystery that fascinated him, but the disciplined, almost mathematical beauty hidden within the clues.',
      'Any prudent investigator must weigh every contradiction, every minor inconsistency, and every unexpected punctuation of fact before reaching a conclusion.',
      'To dismiss a startling detail as insignificant is a common error, though a most dangerous one when the truth depends upon the slightest discrepancy.',
      'The challenge of a complicated case lies not merely in discovering the answer, but in recognizing the pattern beneath the confusion and uncertainty.'
    ]
  }
];

const gameState = {
  words: [],
  wordIndex: 0,
  startTime: null,
  totalCorrectChars: 0,
  totalIncorrectChars: 0,
  typedValuePrevious: '',
  currentDifficultyIndex: 0,
  goodPerformanceStreak: 0,
  roundInProgress: false,
  currentRecording: [],
  currentQuote: ''
};

const ui = {
  quoteElement: document.getElementById('quote'),
  messageElement: document.getElementById('message'),
  typedValueElement: document.getElementById('typed-value'),
  startButton: document.getElementById('start'),
  difficultyLevelElement: document.getElementById('difficulty-level'),
  wpmStatElement: document.getElementById('wpm-stat'),
  accuracyStatElement: document.getElementById('accuracy-stat'),
  streakStatElement: document.getElementById('streak-stat'),
  gameShellElement: document.getElementById('game-shell')
};

if (Object.values(ui).some((element) => !element)) {
  console.error('Typing game UI failed to initialize. One or more required elements are missing.');
}

function getCurrentDifficulty() {
  return difficultySettings[gameState.currentDifficultyIndex];
}

function validateQuoteList() {
  const currentDifficulty = getCurrentDifficulty();
  if (!Array.isArray(currentDifficulty.quotes) || currentDifficulty.quotes.length === 0) {
    throw new Error(`No quotes available for ${currentDifficulty.label}.`);
  }
}

function setMessage(message, type = 'info') {
  if (!ui.messageElement) {
    return;
  }

  ui.messageElement.textContent = message;
  ui.messageElement.className = 'message';

  if (type === 'success') {
    ui.messageElement.classList.add('success');
  } else if (type === 'warning') {
    ui.messageElement.classList.add('warning');
  } else if (type === 'error') {
    ui.messageElement.classList.add('error-message');
  }
}

function updateDifficultyDisplay() {
  const difficulty = getCurrentDifficulty();

  if (!ui.difficultyLevelElement || !ui.gameShellElement) {
    return;
  }

  ui.difficultyLevelElement.textContent = difficulty.label;
  ui.difficultyLevelElement.className = `difficulty-badge ${difficulty.id}`;
  ui.difficultyLevelElement.setAttribute('aria-label', `Current difficulty level: ${difficulty.label}`);
  ui.gameShellElement.setAttribute('data-difficulty', difficulty.id);
  ui.gameShellElement.classList.remove('difficulty-flash');
  void ui.gameShellElement.offsetWidth;
  ui.gameShellElement.classList.add('difficulty-flash');
}

function updateProgressBar() {
  const progressFill = document.getElementById('progress-fill');
  const progressTrack = document.querySelector('.progress-track');
  if (!progressFill || !progressTrack || gameState.words.length === 0) {
    return;
  }

  const percentage = Math.round((gameState.wordIndex / gameState.words.length) * 100);
  progressFill.style.width = `${percentage}%`;
  progressTrack.setAttribute('aria-valuenow', String(percentage));
}

function updateStats() {
  if (!ui.wpmStatElement || !ui.accuracyStatElement || !ui.streakStatElement) {
    return;
  }

  const elapsedMs = gameState.startTime ? Date.now() - gameState.startTime : 0;
  const elapsedMinutes = elapsedMs / 60000;
  const wordsCompleted = Math.max(gameState.wordIndex, 0);
  const wpm = elapsedMinutes > 0 ? Math.max(0, Math.round((wordsCompleted / elapsedMinutes))) : 0;
  const totalChars = gameState.totalCorrectChars + gameState.totalIncorrectChars;
  const accuracy = totalChars > 0 ? Math.max(0, Math.round((gameState.totalCorrectChars / totalChars) * 100)) : 100;

  ui.wpmStatElement.textContent = String(wpm);
  ui.accuracyStatElement.textContent = `${accuracy}%`;
  ui.streakStatElement.textContent = String(gameState.goodPerformanceStreak);
}

/* ---------- Player accounts (localStorage based) ---------- */

function getPlayerStats(name) {
  const allStats = JSON.parse(localStorage.getItem('typingGameStats') || '{}');
  return allStats[name] || { bestWpm: 0, bestAccuracy: 0, roundsPlayed: 0, difficultyIndex: 0, history: [] };
}

function savePlayerStats(name, stats) {
  const allStats = JSON.parse(localStorage.getItem('typingGameStats') || '{}');
  const existing = allStats[name] || {};
  const history = existing.history || [];

  if (stats.lastRound) {
    history.push(stats.lastRound);
  }

  allStats[name] = {
    ...existing,
    ...stats,
    history: history
  };
  localStorage.setItem('typingGameStats', JSON.stringify(allStats));
}

function updateBestScoreDisplay() {
  const nameInput = document.getElementById('player-name');
  const bestDisplay = document.getElementById('best-score-display');
  if (!nameInput || !bestDisplay) return;

  const name = nameInput.value.trim();
  if (!name) {
    bestDisplay.textContent = '';
    return;
  }

  const stats = getPlayerStats(name);
  bestDisplay.textContent = stats.roundsPlayed > 0
    ? `Your best: ${stats.bestWpm} WPM, ${stats.bestAccuracy}% accuracy (${stats.roundsPlayed} rounds played)`
    : 'No rounds played yet — start typing!';
}

function loadPlayerProgress() {
  const nameInput = document.getElementById('player-name');
  if (!nameInput) return;

  const name = nameInput.value.trim();
  if (!name) return;

  const stats = getPlayerStats(name);
  gameState.currentDifficultyIndex = stats.difficultyIndex || 0;
  gameState.goodPerformanceStreak = 0;
  updateDifficultyDisplay();
  updateBestScoreDisplay();
  localStorage.setItem('typingGamePlayerName', name);
}

/* ---------- Core game logic ---------- */

function renderQuote() {
  if (!ui.quoteElement) return;
  const quote = window.multiplayerQuote || getCurrentDifficulty().quotes[Math.floor(Math.random() * getCurrentDifficulty().quotes.length)];
  gameState.words = quote.split(/\s+/);
  gameState.wordIndex = 0;
  gameState.totalCorrectChars = 0;
  gameState.totalIncorrectChars = 0;
  gameState.typedValuePrevious = '';
  gameState.currentRecording = [];
  gameState.currentQuote = quote;

  const wordsHtml = gameState.words
    .map((word) => {
      const chars = word.split('').map((c) => `<span class="char">${c}</span>`).join('');
      return `<span class="word">${chars}</span>`;
    })
    .join(' ');

  ui.quoteElement.innerHTML = wordsHtml;
  highlightCurrentWord();
  startGhostRace(quote);
}
function updateCharHighlighting() {
  const wordElements = ui.quoteElement.querySelectorAll('.word');
  const currentWordEl = wordElements[gameState.wordIndex];
  if (!currentWordEl) return;

  const typedValue = ui.typedValueElement.value;
  const charEls = currentWordEl.querySelectorAll('.char');

  charEls.forEach((el, i) => {
    el.classList.remove('char-correct', 'char-incorrect');
    if (i < typedValue.length) {
      el.classList.add(typedValue[i] === el.textContent ? 'char-correct' : 'char-incorrect');
    }
  });

  // Next key highlighting for touch keyboard
  if (window.VirtualKeyboard && typeof window.VirtualKeyboard.highlightNextKey === 'function') {
    let nextChar = ' ';
    if (typedValue.length < charEls.length) {
      nextChar = charEls[typedValue.length].textContent;
    }
    window.VirtualKeyboard.highlightNextKey(nextChar);
  }
}
function highlightCurrentWord() {
  if (!ui.quoteElement) {
    return;
  }

  const wordElements = ui.quoteElement.querySelectorAll('.word');

  wordElements.forEach((element, index) => {
    element.classList.toggle('highlight', index === gameState.wordIndex);
    element.classList.toggle('correct-word', index < gameState.wordIndex);
  });
}

function startRound() {
  if (!ui.typedValueElement || !ui.startButton || !ui.quoteElement || !ui.messageElement) {
    setMessage('The game could not start because the typing UI is unavailable.', 'error');
    console.error('Typing game UI failed to initialize.');
    return;
  }

  try {
    validateQuoteList();
    renderQuote();
    ui.typedValueElement.value = '';
    ui.typedValueElement.classList.remove('error', 'correct');
    ui.typedValueElement.dataset.previousValue = '';
    ui.typedValueElement.focus();
    gameState.startTime = Date.now();
    gameState.roundInProgress = true;
    setMessage(`Round started on ${getCurrentDifficulty().label} mode.`, 'info');
    updateStats();
    updateProgressBar();
  } catch (error) {
    console.error(error);
    setMessage('Unable to start a new round. Please refresh the page and try again.', 'error');
  }
}

function advanceDifficulty() {
  if (gameState.currentDifficultyIndex < difficultySettings.length - 1) {
    gameState.currentDifficultyIndex += 1;
    updateDifficultyDisplay();
    setMessage(`Difficulty increased to ${getCurrentDifficulty().label}!`, 'success');
  } else {
    setMessage('You are already playing on the hardest difficulty!', 'success');
  }
  gameState.goodPerformanceStreak = 0;
  updateStats();
}

function finishRound() {
  if (!gameState.roundInProgress || !ui.messageElement) {
    return;
  }

  const elapsedMs = gameState.startTime ? Date.now() - gameState.startTime : 0;
  const elapsedMinutes = elapsedMs / 60000;
  const wordsCompleted = gameState.words.length;
  const wpm = elapsedMinutes > 0 ? Math.max(0, Math.round((wordsCompleted / elapsedMinutes))) : 0;
  const totalChars = gameState.totalCorrectChars + gameState.totalIncorrectChars;
  const accuracy = totalChars > 0 ? Math.max(0, Math.round((gameState.totalCorrectChars / totalChars) * 100)) : 100;
  const currentDifficulty = getCurrentDifficulty();
  const meetsTarget = wpm >= currentDifficulty.targetWpm && accuracy >= currentDifficulty.targetAccuracy;

  if (typeof announceFinish === 'function') {
    announceFinish(wpm, accuracy);
  }

  gameState.roundInProgress = false;
  stopGhostRace();

  if (meetsTarget) {
    gameState.goodPerformanceStreak += 1;
    setMessage(`Excellent work! ${wpm} WPM with ${accuracy}% accuracy.`, 'success');
  } else {
    gameState.goodPerformanceStreak = 0;
    setMessage(`Round complete! ${wpm} WPM and ${accuracy}% accuracy.`, 'warning');
  }

  if (gameState.goodPerformanceStreak >= 3) {
    advanceDifficulty();
  }

  updateStats();
  updateProgressBar();

  // Save this player's stats (best scores + current difficulty) if a name is entered
  const nameInput = document.getElementById('player-name');
  let roundsPlayed = 0;
  const playerName = (nameInput && nameInput.value.trim()) ? nameInput.value.trim() : 'Player 1';
  const existingStats = getPlayerStats(playerName);
  roundsPlayed = existingStats.roundsPlayed + 1;

  savePlayerStats(playerName, {
    bestWpm: Math.max(existingStats.bestWpm, wpm),
    bestAccuracy: Math.max(existingStats.bestAccuracy, accuracy),
    roundsPlayed: roundsPlayed,
    difficultyIndex: gameState.currentDifficultyIndex,
    badges: existingStats.badges || [],
    lastRound: {
      date: new Date().toLocaleDateString(),
      wpm: wpm,
      accuracy: accuracy,
      mode: 'Practice'
    }
  });
  updateBestScoreDisplay();

  // Save ghost run (best per quote)
  saveGhostRun(gameState.currentQuote, gameState.currentRecording, wpm, accuracy);

  // Save replay data
  if (typeof saveReplayData === 'function') {
    saveReplayData(gameState.currentRecording, gameState.currentQuote, wpm, accuracy);
  }

  // Show Share Card button
  const shareBtn = document.getElementById('share-btn');
  if (shareBtn) {
    shareBtn.style.display = 'inline-block';
    shareBtn.onclick = () => {
      if (window.ShareCard && typeof window.ShareCard.showModal === 'function') {
        window.ShareCard.showModal({
          wpm: wpm,
          accuracy: accuracy,
          mode: 'Practice',
          quote: gameState.currentQuote
        });
      }
    };
  }

  // Refresh heatmap
  if (typeof refreshHeatmap === 'function') {
    refreshHeatmap();
  }

  // Check achievement badges
  if (typeof checkBadges === 'function') {
    const dailyStreak = (typeof getDailyStreak === 'function') ? getDailyStreak() : 0;
    checkBadges({
      wpm: wpm,
      accuracy: accuracy,
      difficultyId: currentDifficulty.id,
      difficultyIndex: gameState.currentDifficultyIndex,
      streak: gameState.goodPerformanceStreak,
      roundsPlayed: roundsPlayed,
      dailyStreak: dailyStreak
    });
  }

  // Daily challenge hook
  if (typeof finishDailyChallenge === 'function') {
    finishDailyChallenge(wpm, accuracy);
  }
}

function completeWord() {
  const currentWord = gameState.words[gameState.wordIndex];

  if (!currentWord) {
    return;
  }

  gameState.totalCorrectChars += currentWord.length;
  gameState.wordIndex += 1;
  gameState.typedValuePrevious = '';

  if (ui.typedValueElement) {
    ui.typedValueElement.value = '';
    ui.typedValueElement.classList.remove('error', 'correct');
  }

  if (gameState.wordIndex >= gameState.words.length) {
    finishRound();
    return;
  }

  highlightCurrentWord();
  updateStats();
  updateProgressBar();

  if (typeof sendProgress === 'function') {
    sendProgress(gameState.wordIndex, gameState.words.length);
  }
}

function handleTypingInput() {
  if (!ui.typedValueElement || !gameState.roundInProgress) {
    return;
  }

  const typedValue = ui.typedValueElement.value;
  const currentWord = gameState.words[gameState.wordIndex];

  if (!currentWord) {
    return;
  }

  if (typedValue === currentWord && gameState.wordIndex === gameState.words.length - 1) {
    gameState.totalCorrectChars += currentWord.length;
    finishRound();
    return;
  }

  if (typedValue.endsWith(' ') && typedValue.trim() === currentWord) {
    completeWord();
    return;
  }

  const previousValue = ui.typedValueElement.dataset.previousValue || '';
  const addedChars = typedValue.slice(previousValue.length);

  if (addedChars.length > 0) {
    const isCorrectSoFar = currentWord.startsWith(typedValue);
    if (isCorrectSoFar) {
      gameState.totalCorrectChars += addedChars.length;
      ui.typedValueElement.classList.remove('error');
      ui.typedValueElement.classList.add('correct');
    } else {
      gameState.totalIncorrectChars += addedChars.length;
      ui.typedValueElement.classList.remove('correct');
      ui.typedValueElement.classList.add('error');
    }

    // Record keystrokes for replay + heatmap
    for (let i = 0; i < addedChars.length; i++) {
      const charIdx = previousValue.length + i;
      const expected = currentWord[charIdx] || '';
      const typed = addedChars[i];
      const isCorrect = expected === typed;

      gameState.currentRecording.push({
        char: typed,
        expected: expected,
        correct: isCorrect,
        time: Date.now() - gameState.startTime
      });

      // Feed heatmap
      if (typeof recordKeyAccuracy === 'function') {
        recordKeyAccuracy(expected, typed);
      }
    }
  }

  ui.typedValueElement.dataset.previousValue = typedValue;
  updateStats();
  updateProgressBar();
  updateCharHighlighting();
}

ui.startButton.addEventListener('click', startRound);
ui.typedValueElement.addEventListener('input', handleTypingInput);
ui.typedValueElement.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    startRound();
  }
});

const heroStartButton = document.getElementById('hero-start');
if (heroStartButton) {
  heroStartButton.addEventListener('click', () => {
    document.getElementById('game-shell').scrollIntoView({ behavior: 'smooth' });
    startRound();
  });
}

// Load saved player name + their progress (difficulty, best scores) on page load
const playerNameInput = document.getElementById('player-name');
if (playerNameInput) {
  const savedName = localStorage.getItem('typingGamePlayerName');
  if (savedName) {
    playerNameInput.value = savedName;
    loadPlayerProgress();
  }
  playerNameInput.addEventListener('change', loadPlayerProgress);
}

updateDifficultyDisplay();
updateStats();
setMessage('Press start to begin the first round.', 'info');

/* ---------- Ghost Race ---------- */

let ghostTimers = [];

function hashQuote(quote) {
  let hash = 0;
  for (let i = 0; i < quote.length; i++) {
    hash = ((hash << 5) - hash) + quote.charCodeAt(i);
    hash = hash & hash;
  }
  return String(Math.abs(hash));
}

function getGhostRuns() {
  return JSON.parse(localStorage.getItem('typingGhostRuns') || '{}');
}

function saveGhostRun(quote, recording, wpm, accuracy) {
  if (!quote || !recording || recording.length === 0) return;
  const runs = getGhostRuns();
  const key = hashQuote(quote);
  const existing = runs[key];
  if (!existing || wpm > existing.wpm) {
    runs[key] = { keystrokes: recording, wpm: wpm, accuracy: accuracy, quote: quote };
    localStorage.setItem('typingGhostRuns', JSON.stringify(runs));
  }
}

function startGhostRace(quote) {
  stopGhostRace();
  const ghostFill = document.getElementById('ghost-progress-fill');
  const ghostLabel = document.getElementById('ghost-label');
  if (!ghostFill) return;

  const runs = getGhostRuns();
  const key = hashQuote(quote);
  const ghost = runs[key];

  if (!ghost || !ghost.keystrokes || ghost.keystrokes.length === 0) {
    ghostFill.style.width = '0%';
    if (ghostLabel) ghostLabel.textContent = '';
    return;
  }

  if (ghostLabel) ghostLabel.textContent = `Ghost: ${ghost.wpm} WPM, ${ghost.accuracy}%`;

  const totalChars = ghost.quote.replace(/\s+/g, '').length;
  let charsSoFar = 0;

  for (const ks of ghost.keystrokes) {
    if (ks.correct) {
      charsSoFar++;
      const pct = Math.round((charsSoFar / totalChars) * 100);
      const t = setTimeout(() => {
        ghostFill.style.width = `${pct}%`;
      }, ks.time);
      ghostTimers.push(t);
    }
  }
}

function stopGhostRace() {
  for (const t of ghostTimers) clearTimeout(t);
  ghostTimers = [];
}