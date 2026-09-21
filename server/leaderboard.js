async function loadLeaderboard() {
  const tbody = document.getElementById('leaderboard-body');
  const emptyMessage = document.getElementById('leaderboard-empty');

  try {
    const response = await fetch('/api/leaderboard');
    const entries = await response.json();

    if (!entries || entries.length === 0) {
      emptyMessage.style.display = 'block';
      return;
    }

    tbody.innerHTML = entries
      .map((entry, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${entry.name}</td>
          <td>${entry.wpm}</td>
          <td>${entry.accuracy}%</td>
          <td>${entry.mode === 'competition' ? 'Competition' : 'Practice'}</td>
        </tr>
      `)
      .join('');
  } catch (err) {
    console.error('Could not load leaderboard:', err);
    emptyMessage.textContent = 'Could not load leaderboard. Is the server running?';
    emptyMessage.style.display = 'block';
  }
}

loadLeaderboard();