/**
 * achievements.js
 * ────────────────────────────────────────────────────────
 * Achievement badge system for Type Like Sherlock.
 * Checks conditions after each round, awards badges,
 * shows toast notifications, renders badge tray.
 */

(function () {
  'use strict';

  const BADGES = [
    {
      id: 'perfect_round',
      label: 'Perfect Round',
      icon: '🎯',
      description: '100% accuracy in any round',
      check: (r) => r.accuracy >= 100
    },
    {
      id: 'speed_demon',
      label: 'Speed Demon',
      icon: '⚡',
      description: '50+ WPM in any round',
      check: (r) => r.wpm >= 50
    },
    {
      id: 'streak_master',
      label: 'Streak Master',
      icon: '🔥',
      description: 'Reach 3 difficulty upgrades',
      check: (r) => r.difficultyIndex >= 2 && r.streak >= 3
    },
    {
      id: 'daily_7',
      label: '7-Day Streak',
      icon: '📅',
      description: 'Complete daily challenge 7 days in a row',
      check: (r) => r.dailyStreak >= 7
    },
    {
      id: 'century_club',
      label: 'Century Club',
      icon: '💯',
      description: '100+ rounds played',
      check: (r) => r.roundsPlayed >= 100
    },
    {
      id: 'sherlock',
      label: 'The Sherlock',
      icon: '🔍',
      description: '60+ WPM with 95%+ accuracy on Hard',
      check: (r) => r.wpm >= 60 && r.accuracy >= 95 && r.difficultyId === 'hard'
    }
  ];

  /* ── Badge storage ─────────────────────────────── */

  function getEarnedBadges(playerName) {
    if (!playerName) return [];
    const allStats = JSON.parse(localStorage.getItem('typingGameStats') || '{}');
    const stats = allStats[playerName];
    return (stats && stats.badges) ? stats.badges : [];
  }

  function saveBadge(playerName, badgeId) {
    if (!playerName) return;
    const allStats = JSON.parse(localStorage.getItem('typingGameStats') || '{}');
    if (!allStats[playerName]) allStats[playerName] = {};
    if (!allStats[playerName].badges) allStats[playerName].badges = [];
    if (!allStats[playerName].badges.includes(badgeId)) {
      allStats[playerName].badges.push(badgeId);
      localStorage.setItem('typingGameStats', JSON.stringify(allStats));
    }
  }

  /* ── Toast notifications ───────────────────────── */

  function showBadgeToast(badge) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast toast-enter';
    toast.innerHTML = `
      <span class="toast-icon">${badge.icon}</span>
      <div class="toast-body">
        <strong class="toast-title">Badge Unlocked!</strong>
        <span class="toast-desc">${badge.label}</span>
      </div>
    `;

    container.appendChild(toast);

    // trigger animation
    requestAnimationFrame(() => {
      toast.classList.remove('toast-enter');
      toast.classList.add('toast-visible');
    });

    setTimeout(() => {
      toast.classList.remove('toast-visible');
      toast.classList.add('toast-exit');
      setTimeout(() => toast.remove(), 400);
    }, 4000);
  }

  /* ── Badge tray rendering ──────────────────────── */

  function renderBadgesTray() {
    const tray = document.getElementById('badges-tray');
    if (!tray) return;

    const nameInput = document.getElementById('player-name');
    const playerName = nameInput ? nameInput.value.trim() : '';
    const earned = getEarnedBadges(playerName);

    tray.innerHTML = BADGES.map(badge => {
      const isEarned = earned.includes(badge.id);
      return `
        <div class="badge-icon ${isEarned ? 'badge-earned' : 'badge-locked'}" 
             title="${badge.label}: ${badge.description}${isEarned ? ' ✓' : ' (Locked)'}">
          <span class="badge-emoji">${badge.icon}</span>
          ${isEarned ? '' : '<span class="badge-lock-overlay">🔒</span>'}
        </div>
      `;
    }).join('');
  }

  /* ── Check badges after round ──────────────────── */

  window.checkBadges = function (roundResult) {
    const nameInput = document.getElementById('player-name');
    const playerName = nameInput ? nameInput.value.trim() : '';
    if (!playerName) return;

    const earned = getEarnedBadges(playerName);
    const newBadges = [];

    for (const badge of BADGES) {
      if (!earned.includes(badge.id) && badge.check(roundResult)) {
        saveBadge(playerName, badge.id);
        newBadges.push(badge);
      }
    }

    // Show toasts for new badges (stagger them)
    newBadges.forEach((badge, i) => {
      setTimeout(() => showBadgeToast(badge), i * 600);
    });

    if (newBadges.length > 0) {
      renderBadgesTray();
    }
  };

  /* ── Init ───────────────────────────────────────── */

  renderBadgesTray();

  // Re-render when player name changes
  const nameInput = document.getElementById('player-name');
  if (nameInput) {
    nameInput.addEventListener('change', renderBadgesTray);
  }

})();
