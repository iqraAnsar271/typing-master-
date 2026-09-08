const socket = io();

const mpNameInput = document.getElementById('mp-name');
const mpCreateBtn = document.getElementById('mp-create');
const mpRoomCodeInput = document.getElementById('mp-room-code');
const mpJoinBtn = document.getElementById('mp-join');
const mpStatus = document.getElementById('mp-status');
const mpPlayersList = document.getElementById('mp-players');
const typedValueInput = document.getElementById('typed-value');

let raceFinished = false;
let currentRoomCode = null;
let raceTimerInterval = null;
window.multiplayerQuote = null;

if (typedValueInput) typedValueInput.disabled = true; // locked until countdown finishes

function renderPlayerList(players) {
  mpPlayersList.innerHTML = players.map((p) => `<li>${p.name}</li>`).join('');
}

function sendProgress(wordIndex, totalWords) {
  if (!currentRoomCode || raceFinished) return;
  socket.emit('progress-update', { roomCode: currentRoomCode, wordIndex, totalWords });
}

function announceFinish(wpm, accuracy) {
  if (!currentRoomCode || raceFinished) return;
  raceFinished = true;
  socket.emit('player-finished', { roomCode: currentRoomCode, wpm, accuracy });
}

function startRaceTimer(durationMs) {
  const timerEl = document.getElementById('race-timer');
  if (!timerEl) return;

  let remainingMs = durationMs;
  timerEl.textContent = `Time left: ${Math.ceil(remainingMs / 1000)}s`;

  if (raceTimerInterval) clearInterval(raceTimerInterval);
  raceTimerInterval = setInterval(() => {
    remainingMs -= 1000;
    timerEl.textContent = `Time left: ${Math.max(0, Math.ceil(remainingMs / 1000))}s`;
    if (remainingMs <= 0) clearInterval(raceTimerInterval);
  }, 1000);
}

mpCreateBtn.addEventListener('click', () => {
  const name = mpNameInput.value.trim() || 'Player';
  socket.emit('create-room', name);
});

mpJoinBtn.addEventListener('click', () => {
  const name = mpNameInput.value.trim() || 'Player';
  const roomCode = mpRoomCodeInput.value.trim().toUpperCase();
  if (!roomCode) {
    mpStatus.textContent = 'Enter a room code first.';
    return;
  }
  currentRoomCode = roomCode;
  socket.emit('join-room', { roomCode, playerName: name });
});

socket.on('room-created', ({ roomCode, players }) => {
  currentRoomCode = roomCode;
  mpStatus.textContent = `Room created! Share this code: ${roomCode} — waiting for a friend to join...`;
  renderPlayerList(players);
});

socket.on('room-update', ({ players }) => {
  renderPlayerList(players);
});

socket.on('join-error', (message) => {
  mpStatus.textContent = message;
});

socket.on('get-ready', ({ seconds }) => {
  const countdownEl = document.getElementById('mp-countdown');
  if (typedValueInput) typedValueInput.disabled = true;

  let remaining = seconds;
  if (countdownEl) countdownEl.textContent = `Race starts in ${remaining}...`;

  const countdownInterval = setInterval(() => {
    remaining -= 1;
    if (remaining > 0) {
      if (countdownEl) countdownEl.textContent = `Race starts in ${remaining}...`;
    } else {
      if (countdownEl) countdownEl.textContent = 'Go!';
      clearInterval(countdownInterval);
    }
  }, 1000);
});

socket.on('race-start', ({ quote, players, duration }) => {
  window.multiplayerQuote = quote;
  renderPlayerList(players);
  mpStatus.textContent = 'Both players ready — race starting!';
  raceFinished = false;

  const countdownEl = document.getElementById('mp-countdown');
  if (countdownEl) countdownEl.textContent = '';
  if (typedValueInput) typedValueInput.disabled = false;

  if (typeof startRound === 'function') {
    startRound();
  }
  startRaceTimer(duration);
});

socket.on('opponent-progress', ({ playerId, wordIndex, totalWords }) => {
  let bar = document.getElementById(`opp-bar-${playerId}`);
  if (!bar) {
    bar = document.createElement('div');
    bar.id = `opp-bar-${playerId}`;
    bar.className = 'opponent-progress';
    mpPlayersList.parentElement.appendChild(bar);
  }
  const percent = Math.round((wordIndex / totalWords) * 100);
  bar.textContent = `Opponent: ${percent}%`;
  bar.style.setProperty('--progress', `${percent}%`);
});

socket.on('race-winner', ({ name, wpm, accuracy }) => {
  raceFinished = true;
  if (raceTimerInterval) clearInterval(raceTimerInterval);
  mpStatus.textContent = `🏆 ${name} won! (${wpm} WPM, ${accuracy}% accuracy)`;
});

socket.on('race-time-up', ({ results }) => {
  raceFinished = true;
  if (raceTimerInterval) clearInterval(raceTimerInterval);
  if (typedValueInput) typedValueInput.disabled = true;

  const leader = results[0];
  if (leader && leader.wordIndex > 0) {
    mpStatus.textContent = `⏰ Time's up! ${leader.name} was furthest ahead (${leader.wordIndex}/${leader.totalWords} words).`;
  } else {
    mpStatus.textContent = `⏰ Time's up! No one finished a single word.`;
  }
});