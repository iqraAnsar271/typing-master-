/**
 * dashboard.js
 * Populates the user dashboard with live data from the API.
 */

(function () {
  const AVATARS = ["🕵️‍♂️", "🔍", "🎩", "📜", "⚡", "🦅", "🦉", "🎭", "🛡️", "💎"];

  // Guard: redirect to login if not authenticated
  if (!Auth.isLoggedIn()) {
    window.location.href = "login";
    return;
  }

  let selectedAvatar = null;

  async function loadDashboard() {
    try {
      const profile = await Auth.getProfile();

      // Hero
      document.getElementById("dash-avatar").textContent = profile.avatar || "🕵️‍♂️";
      document.getElementById("dash-greeting").textContent = `Welcome back, ${profile.username}`;
      const joinDate = new Date(profile.joinDate).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      });
      document.getElementById("dash-sub").textContent = `Member since ${joinDate}`;

      // Stats
      const s = profile.stats || {};
      document.getElementById("dash-best-wpm").textContent = s.bestWpm || 0;
      document.getElementById("dash-avg-wpm").textContent = s.avgWpm || 0;
      document.getElementById("dash-avg-acc").textContent = `${s.avgAcc || 100}%`;
      document.getElementById("dash-total-tests").textContent = s.totalTests || 0;

      // Recent activity
      renderActivity(profile.recentScores || []);

      // Settings form pre-fill
      document.getElementById("dash-edit-username").value = profile.username;
      selectedAvatar = profile.avatar || "🕵️‍♂️";
      renderAvatarPicker(selectedAvatar);
    } catch (err) {
      console.error("Dashboard load failed:", err);
      if (err.message.includes("token") || err.message.includes("authorized")) {
        Auth.logout();
      }
    }
  }

  function renderActivity(scores) {
    const list = document.getElementById("dash-activity-list");
    if (!scores || scores.length === 0) {
      list.innerHTML = `<p class="dash-empty">No tests completed yet. <a href="practice">Start typing!</a></p>`;
      return;
    }

    list.innerHTML = scores
      .slice(0, 15)
      .map((s) => {
        const date = new Date(s.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
        return `
        <div class="dash-activity-item">
          <div class="activity-left">
            <span class="activity-mode">${(s.mode || "practice").toUpperCase()}</span>
            <span class="activity-date">${date}</span>
          </div>
          <div class="activity-right">
            <span class="activity-wpm">${s.wpm} <small>WPM</small></span>
            <span class="activity-acc">${s.accuracy}%</span>
          </div>
        </div>`;
      })
      .join("");
  }

  function renderAvatarPicker(currentAvatar) {
    const picker = document.getElementById("dash-avatar-picker");
    if (!picker) return;

    picker.innerHTML = AVATARS.map(
      (av) =>
        `<button type="button" class="dash-av-btn ${av === currentAvatar ? "selected" : ""}" data-avatar="${av}">${av}</button>`
    ).join("");

    picker.addEventListener("click", (e) => {
      const btn = e.target.closest(".dash-av-btn");
      if (!btn) return;
      selectedAvatar = btn.dataset.avatar;
      picker.querySelectorAll(".dash-av-btn").forEach((b) => b.classList.remove("selected"));
      btn.classList.add("selected");
      document.getElementById("dash-avatar").textContent = selectedAvatar;
    });
  }

  function showMessage(text, type = "error") {
    const el = document.getElementById("dash-message");
    el.textContent = text;
    el.className = `auth-message ${type}`;
    el.style.display = "block";
    setTimeout(() => (el.style.display = "none"), 4000);
  }

  // Save settings
  document.getElementById("dash-settings-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.getElementById("dash-edit-username").value.trim();
    const password = document.getElementById("dash-edit-password").value;

    const updates = { username };
    if (selectedAvatar) updates.avatar = selectedAvatar;
    if (password) updates.password = password;

    try {
      await Auth.updateProfile(updates);
      showMessage("Profile updated!", "success");

      // Update stored user info
      const user = Auth.getUser();
      if (user) {
        user.username = username;
        if (selectedAvatar) user.avatar = selectedAvatar;
        localStorage.setItem("tls_user", JSON.stringify(user));
      }

      document.getElementById("dash-greeting").textContent = `Welcome back, ${username}`;
      document.getElementById("dash-edit-password").value = "";
    } catch (err) {
      showMessage(err.message);
    }
  });

  // Logout
  document.getElementById("dash-logout").addEventListener("click", () => {
    Auth.logout();
  });

  // Init
  loadDashboard();
})();
