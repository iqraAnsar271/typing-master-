/**
 * auth.js
 * Client-side authentication state management.
 * Stores JWT + user info in localStorage and provides helpers for all pages.
 */

const Auth = (() => {
  const API = window.location.origin;
  const TOKEN_KEY = "tls_token";
  const USER_KEY = "tls_user";

  function getToken() {
    return localStorage.getItem(TOKEN_KEY);
  }

  function getUser() {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  function isLoggedIn() {
    return !!getToken();
  }

  function isAdmin() {
    const user = getUser();
    return user && user.role === "admin";
  }

  function saveAuth(data) {
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify({
      _id: data._id,
      username: data.username,
      email: data.email,
      role: data.role,
      avatar: data.avatar,
      joinDate: data.joinDate,
    }));
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    window.location.href = "login";
  }

  function authHeaders() {
    const token = getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async function apiRequest(url, options = {}) {
    const headers = {
      "Content-Type": "application/json",
      ...authHeaders(),
      ...options.headers,
    };

    const res = await fetch(url, { ...options, headers });
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Request failed");
    }
    return data;
  }

  async function register(username, email, password) {
    const data = await apiRequest(`${API}/api/auth/register`, {
      method: "POST",
      body: JSON.stringify({ username, email, password }),
    });
    saveAuth(data);
    return data;
  }

  async function login(email, password) {
    const data = await apiRequest(`${API}/api/auth/login`, {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    saveAuth(data);
    return data;
  }

  async function getProfile() {
    return apiRequest(`${API}/api/auth/me`);
  }

  async function updateProfile(updates) {
    return apiRequest(`${API}/api/auth/profile`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  }

  // ── Nav helper: inject auth-aware nav items ──
  function updateNav() {
    const navLinks = document.querySelector(".nav-links");
    if (!navLinks) return;

    // Remove existing auth links
    navLinks.querySelectorAll(".nav-auth-link").forEach((el) => el.remove());

    if (isLoggedIn()) {
      const user = getUser();

      const dashLink = document.createElement("a");
      dashLink.href = "dashboard";
      dashLink.className = "nav-link nav-auth-link";
      dashLink.textContent = "Dashboard";
      navLinks.appendChild(dashLink);

      if (isAdmin()) {
        const adminLink = document.createElement("a");
        adminLink.href = "admin";
        adminLink.className = "nav-link nav-auth-link";
        adminLink.textContent = "Admin";
        navLinks.appendChild(adminLink);
      }

      const logoutLink = document.createElement("a");
      logoutLink.href = "#";
      logoutLink.className = "nav-link nav-auth-link nav-logout";
      logoutLink.textContent = "Logout";
      logoutLink.addEventListener("click", (e) => {
        e.preventDefault();
        logout();
      });
      navLinks.appendChild(logoutLink);
    } else {
      const loginLink = document.createElement("a");
      loginLink.href = "login";
      loginLink.className = "nav-link nav-auth-link";
      loginLink.textContent = "Login";
      navLinks.appendChild(loginLink);
    }
  }

  // Auto-update nav on page load
  document.addEventListener("DOMContentLoaded", updateNav);

  return {
    getToken,
    getUser,
    isLoggedIn,
    isAdmin,
    logout,
    authHeaders,
    apiRequest,
    register,
    login,
    getProfile,
    updateProfile,
    updateNav,
  };
})();
