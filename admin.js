/**
 * admin.js
 * Admin panel logic: fetch users, stats, manage roles, and view user details.
 */

(function () {
  // Guard: redirect if not admin
  if (!Auth.isLoggedIn() || !Auth.isAdmin()) {
    window.location.href = Auth.isLoggedIn() ? "dashboard.html" : "login.html";
    return;
  }

  const API = window.location.origin;
  let allUsers = [];

  // ── Load dashboard stats ──
  async function loadStats() {
    try {
      const stats = await Auth.apiRequest(`${API}/api/admin/stats`);
      document.getElementById("admin-total-users").textContent = stats.totalUsers;
      document.getElementById("admin-active-users").textContent = stats.activeUsers;
      document.getElementById("admin-total-scores").textContent = stats.totalScores;
      document.getElementById("admin-avg-wpm").textContent = `${stats.avgWpm} WPM`;
      document.getElementById("admin-avg-acc").textContent = `${stats.avgAcc}%`;
      document.getElementById("admin-new-week").textContent = stats.newUsersThisWeek;
    } catch (err) {
      console.error("Stats load failed:", err);
    }
  }

  // ── Load all users ──
  async function loadUsers() {
    try {
      allUsers = await Auth.apiRequest(`${API}/api/admin/users`);
      renderUsers(allUsers);
    } catch (err) {
      console.error("Users load failed:", err);
      document.getElementById("admin-users-tbody").innerHTML =
        `<tr><td colspan="9" class="admin-loading">Failed to load users.</td></tr>`;
    }
  }

  // ── Render users table ──
  function renderUsers(users) {
    const tbody = document.getElementById("admin-users-tbody");

    if (users.length === 0) {
      tbody.innerHTML = `<tr><td colspan="9" class="admin-loading">No users found.</td></tr>`;
      return;
    }

    tbody.innerHTML = users
      .map((u) => {
        const joinDate = new Date(u.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
        const s = u.stats || {};
        const isSelf = u._id === Auth.getUser()._id;

        return `
        <tr class="${!u.isActive ? "row-disabled" : ""}">
          <td>
            <div class="admin-user-cell">
              <span class="admin-user-avatar">${u.avatar || "🕵️"}</span>
              <span class="admin-user-name">${escapeHtml(u.username)}</span>
            </div>
          </td>
          <td class="admin-email-cell">${escapeHtml(u.email)}</td>
          <td><span class="role-badge role-${u.role}">${u.role.toUpperCase()}</span></td>
          <td><span class="status-badge status-${u.isActive ? "active" : "disabled"}">${u.isActive ? "Active" : "Disabled"}</span></td>
          <td>${s.totalTests || 0}</td>
          <td>${s.bestWpm || 0}</td>
          <td>${s.avgWpm || 0}</td>
          <td>${joinDate}</td>
          <td class="admin-actions-cell">
            <button class="admin-action-btn view" onclick="AdminPanel.viewUser('${u._id}')" title="View Details">👁️</button>
            ${!isSelf ? `
              <button class="admin-action-btn role" onclick="AdminPanel.toggleRole('${u._id}', '${u.role}')" title="Toggle Role">${u.role === "admin" ? "👤" : "🛡️"}</button>
              <button class="admin-action-btn status" onclick="AdminPanel.toggleStatus('${u._id}', ${u.isActive})" title="Toggle Status">${u.isActive ? "🚫" : "✅"}</button>
              <button class="admin-action-btn delete" onclick="AdminPanel.deleteUser('${u._id}', '${escapeHtml(u.username)}')" title="Delete User">🗑️</button>
            ` : `<span class="admin-self-label">You</span>`}
          </td>
        </tr>`;
      })
      .join("");
  }

  // ── Filter / Search ──
  function applyFilters() {
    const query = document.getElementById("admin-search").value.toLowerCase();
    const roleFilter = document.getElementById("admin-role-filter").value;
    const statusFilter = document.getElementById("admin-status-filter").value;

    let filtered = allUsers;

    if (query) {
      filtered = filtered.filter(
        (u) =>
          u.username.toLowerCase().includes(query) ||
          u.email.toLowerCase().includes(query)
      );
    }

    if (roleFilter) {
      filtered = filtered.filter((u) => u.role === roleFilter);
    }

    if (statusFilter === "active") {
      filtered = filtered.filter((u) => u.isActive);
    } else if (statusFilter === "disabled") {
      filtered = filtered.filter((u) => !u.isActive);
    }

    renderUsers(filtered);
  }

  document.getElementById("admin-search").addEventListener("input", applyFilters);
  document.getElementById("admin-role-filter").addEventListener("change", applyFilters);
  document.getElementById("admin-status-filter").addEventListener("change", applyFilters);

  // ── Admin actions ──
  async function toggleRole(userId, currentRole) {
    const newRole = currentRole === "admin" ? "user" : "admin";
    if (!confirm(`Change this user's role to ${newRole.toUpperCase()}?`)) return;

    try {
      await Auth.apiRequest(`${API}/api/admin/users/${userId}`, {
        method: "PUT",
        body: JSON.stringify({ role: newRole }),
      });
      await loadUsers();
      await loadStats();
    } catch (err) {
      alert(err.message);
    }
  }

  async function toggleStatus(userId, isActive) {
    const action = isActive ? "disable" : "enable";
    if (!confirm(`Are you sure you want to ${action} this account?`)) return;

    try {
      await Auth.apiRequest(`${API}/api/admin/users/${userId}`, {
        method: "PUT",
        body: JSON.stringify({ isActive: !isActive }),
      });
      await loadUsers();
      await loadStats();
    } catch (err) {
      alert(err.message);
    }
  }

  async function deleteUser(userId, username) {
    if (!confirm(`Permanently delete "${username}" and all their scores? This cannot be undone.`)) return;

    try {
      await Auth.apiRequest(`${API}/api/admin/users/${userId}`, {
        method: "DELETE",
      });
      await loadUsers();
      await loadStats();
    } catch (err) {
      alert(err.message);
    }
  }

  // ── User detail modal ──
  async function viewUser(userId) {
    const user = allUsers.find((u) => u._id === userId);
    if (!user) return;

    const overlay = document.getElementById("admin-modal-overlay");
    overlay.style.display = "flex";

    document.getElementById("modal-avatar").textContent = user.avatar || "🕵️";
    document.getElementById("modal-name").textContent = user.username;
    document.getElementById("modal-email").textContent = user.email;

    const s = user.stats || {};
    document.getElementById("modal-stats").innerHTML = `
      <div class="modal-stat"><span class="modal-stat-val">${s.totalTests || 0}</span><span class="modal-stat-lbl">Tests</span></div>
      <div class="modal-stat"><span class="modal-stat-val">${s.bestWpm || 0}</span><span class="modal-stat-lbl">Best WPM</span></div>
      <div class="modal-stat"><span class="modal-stat-val">${s.avgWpm || 0}</span><span class="modal-stat-lbl">Avg WPM</span></div>
      <div class="modal-stat"><span class="modal-stat-val">${s.avgAcc || 0}%</span><span class="modal-stat-lbl">Accuracy</span></div>
    `;

    // Fetch scores
    const scoresContainer = document.getElementById("modal-scores");
    scoresContainer.innerHTML = `<p class="dash-empty">Loading scores...</p>`;

    try {
      const scores = await Auth.apiRequest(`${API}/api/admin/users/${userId}/scores`);

      if (scores.length === 0) {
        scoresContainer.innerHTML = `<p class="dash-empty">No tests completed yet.</p>`;
        return;
      }

      scoresContainer.innerHTML = `
        <table class="admin-table modal-table">
          <thead><tr><th>#</th><th>Date</th><th>WPM</th><th>Accuracy</th><th>Mode</th></tr></thead>
          <tbody>
            ${scores
              .map(
                (s, i) => `
              <tr>
                <td>${i + 1}</td>
                <td>${new Date(s.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</td>
                <td class="wpm-cell">${s.wpm}</td>
                <td>${s.accuracy}%</td>
                <td><span class="mode-tag">${(s.mode || "practice").toUpperCase()}</span></td>
              </tr>`
              )
              .join("")}
          </tbody>
        </table>`;
    } catch (err) {
      scoresContainer.innerHTML = `<p class="dash-empty">Failed to load scores.</p>`;
    }
  }

  // Close modal
  document.getElementById("admin-modal-close").addEventListener("click", () => {
    document.getElementById("admin-modal-overlay").style.display = "none";
  });
  document.getElementById("admin-modal-overlay").addEventListener("click", (e) => {
    if (e.target === e.currentTarget) {
      e.currentTarget.style.display = "none";
    }
  });

  // ── Helpers ──
  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  // Expose for inline onclick handlers
  window.AdminPanel = {
    viewUser,
    toggleRole,
    toggleStatus,
    deleteUser,
  };

  // Init
  loadStats();
  loadUsers();
})();
