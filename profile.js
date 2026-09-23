/**
 * profile.js
 * User profile management, avatar selection, join date, and personal stats history.
 */

(function () {
  const AVATARS = ['🕵️‍♂️', '🔍', '🎩', '📜', '⚡', '🦅', '🦉', '🎭', '🛡️', '💎'];

  function getProfile() {
    try {
      const stored = localStorage.getItem('typingUserProfile');
      if (stored) return JSON.parse(stored);
    } catch (e) {}

    // Default Profile
    const defaultProfile = {
      name: 'SherlockTypist',
      avatar: '🕵️‍♂️',
      joinDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    };
    saveProfile(defaultProfile);
    return defaultProfile;
  }

  function saveProfile(profile) {
    localStorage.setItem('typingUserProfile', JSON.stringify(profile));
  }

  function loadStatsHistory() {
    try {
      const stats = localStorage.getItem('typingGameStats');
      if (stats) return JSON.parse(stats);
    } catch (e) {}
    return null;
  }

  function initProfilePage() {
    const profile = getProfile();
    const stats = loadStatsHistory();

    // Render Profile Banner
    const avatarDisplay = document.getElementById('profile-avatar-display');
    const nameInput = document.getElementById('profile-name-input');
    const joinDateEl = document.getElementById('profile-join-date');

    if (avatarDisplay) avatarDisplay.textContent = profile.avatar;
    if (nameInput) nameInput.value = profile.name;
    if (joinDateEl) joinDateEl.textContent = `Member since ${profile.joinDate}`;

    // Avatar Selector Grid
    const avatarGrid = document.getElementById('avatar-grid');
    if (avatarGrid) {
      avatarGrid.innerHTML = '';
      AVATARS.forEach((av) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `avatar-opt ${av === profile.avatar ? 'selected' : ''}`;
        btn.textContent = av;
        btn.onclick = () => {
          profile.avatar = av;
          saveProfile(profile);
          if (avatarDisplay) avatarDisplay.textContent = av;
          document.querySelectorAll('.avatar-opt').forEach((b) => b.classList.remove('selected'));
          btn.classList.add('selected');
        };
        avatarGrid.appendChild(btn);
      });
    }

    // Name input change listener
    if (nameInput) {
      nameInput.addEventListener('change', () => {
        profile.name = nameInput.value.trim() || 'SherlockTypist';
        saveProfile(profile);
      });
    }

    // Render Stat Cards
    if (stats) {
      const totalTests = stats.history ? stats.history.length : (stats.bestWpm ? 1 : 0);
      let avgWpm = stats.bestWpm || 0;
      let avgAcc = stats.bestAccuracy || 100;

      if (stats.history && stats.history.length > 0) {
        const sumWpm = stats.history.reduce((a, b) => a + (b.wpm || 0), 0);
        const sumAcc = stats.history.reduce((a, b) => a + (b.accuracy || 0), 0);
        avgWpm = Math.round(sumWpm / stats.history.length);
        avgAcc = Math.round(sumAcc / stats.history.length);
      }

      setStat('stat-best-wpm', `${stats.bestWpm || 0} WPM`);
      setStat('stat-avg-wpm', `${avgWpm} WPM`);
      setStat('stat-total-tests', totalTests);
      setStat('stat-avg-acc', `${avgAcc}%`);
      setStat('stat-streak', `${stats.dailyStreak || 0} Days`);
      setStat('stat-badges', `${(stats.badges || []).length} / 6`);

      // Render History Table
      renderHistoryTable(stats.history || []);
    }
  }

  function setStat(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  }

  function renderHistoryTable(history) {
    const tbody = document.getElementById('history-tbody');
    if (!tbody) return;

    tbody.innerHTML = '';
    if (history.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" class="empty-msg">No tests completed yet. Take a test in Practice Mode!</td></tr>`;
      return;
    }

    // Show recent tests first
    [...history].reverse().slice(0, 20).forEach((item, index) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>#${history.length - index}</td>
        <td>${item.date || 'Recent'}</td>
        <td class="wpm-cell">${item.wpm} WPM</td>
        <td class="acc-cell">${item.accuracy}%</td>
        <td><span class="mode-tag">${(item.mode || 'Practice').toUpperCase()}</span></td>
      `;
      tbody.appendChild(tr);
    });
  }

  window.UserProfile = {
    get: getProfile,
    save: saveProfile,
    init: initProfilePage
  };

  document.addEventListener('DOMContentLoaded', () => {
    initProfilePage();
  });
})();
