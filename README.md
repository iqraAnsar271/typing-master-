<div align="center">

<img src="https://img.shields.io/badge/🔍_Type_Like_Sherlock-000000?style=for-the-badge" alt="Type Like Sherlock" />

# 🔍 Type Like Sherlock

### *Deduction needs speed. Test your typing against the detective's own words.*

<br>

[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white)](https://socket.io/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

<br>

A full-stack, **Sherlock Holmes–themed** typing speed game featuring solo practice with adaptive difficulty,<br>
real-time multiplayer races, a global leaderboard, achievement badges, daily challenges, and much more —<br>
all wrapped in a **cinematic dark-green design system** with premium canvas animations.

<br>

[🎮 Live Demo](#) &nbsp;•&nbsp; [🐛 Report Bug](https://github.com/iqraAnsar271/typing-master-/issues) &nbsp;•&nbsp; [✨ Request Feature](https://github.com/iqraAnsar271/typing-master-/issues)

<br>

---

</div>

## 📸 Screenshots

> **Replace the placeholders below with your own screenshots or GIFs.**

<table>
  <tr>
    <td align="center"><b>🏠 Home</b></td>
    <td align="center"><b>⌨️ Practice Mode</b></td>
  </tr>
  <tr>
    <td><img src="screenshots/home.png" alt="Home page — hero section with animated canvas background" width="400"/></td>
    <td><img src="screenshots/practice.png" alt="Practice mode — typing a Sherlock quote with live WPM and accuracy" width="400"/></td>
  </tr>
  <tr>
    <td align="center"><b>🏁 Competition Mode</b></td>
    <td align="center"><b>🏆 Leaderboard</b></td>
  </tr>
  <tr>
    <td><img src="screenshots/competition.png" alt="Multiplayer race — two players typing the same quote in real time" width="400"/></td>
    <td><img src="screenshots/leaderboard.png" alt="Global leaderboard showing top scores" width="400"/></td>
  </tr>
  <tr>
    <td align="center"><b>📅 Daily Challenge</b></td>
    <td align="center"><b>👤 Profile & Achievements</b></td>
  </tr>
  <tr>
    <td><img src="screenshots/daily-challenge.png" alt="Daily challenge card with streak tracking" width="400"/></td>
    <td><img src="screenshots/profile.png" alt="User profile page with achievement badges" width="400"/></td>
  </tr>
</table>

<br>

## ✨ Features

<details open>
<summary><h3>🎯 Core Gameplay</h3></summary>

| Feature | Description |
|:--------|:------------|
| **Solo Practice Mode** | Type quotes from Sherlock Holmes (and other themes) with real-time WPM, accuracy, and streak tracking |
| **3 Difficulty Levels** | Easy, Medium, and Hard with progressively longer and more complex quotes |
| **Adaptive Difficulty** | The game automatically promotes or demotes your difficulty level based on your WPM and accuracy |
| **Per-Player Best Scores** | Your personal best is saved locally and displayed before each round |
| **Real-Time Multiplayer** | Create or join a private room with a 4-character code, get a synced 3-2-1 countdown, and race opponents |
| **Live Opponent Progress** | See your competitor's typing progress update in real time during a race |
| **Global Leaderboard** | Server-side persistent leaderboard ranking top scores across all players and modes |

</details>

<details open>
<summary><h3>🚀 Advanced Features</h3></summary>

| Feature | Description |
|:--------|:------------|
| 🏅 **Achievement Badges** | Earn badges like *Perfect Round*, *Speed Demon*, *Streak Master*, *Century Club*, and *The Sherlock* |
| 📅 **Daily Challenge** | A unique quote every day (same for all players), with daily streak tracking and dedicated leaderboard |
| 🎹 **Keyboard Heatmap** | Visual QWERTY heatmap tracking per-key accuracy over time, highlighting weak spots in red |
| ⏪ **Typing Replay** | Record and play back typing sessions keystroke-by-keystroke with adjustable speed |
| 📦 **Quote Packs** | Switch between themed collections: 🔍 Sherlock Holmes, 🚀 Sci-Fi, and 🎬 Movies |
| 🖼️ **Social Share Cards** | Generate a canvas-rendered result card with your WPM, accuracy, and avatar for sharing |
| ⌨️ **Virtual Keyboard** | On-screen responsive QWERTY keyboard for touch devices with next-key highlighting |
| 👀 **Spectator Mode** | Watch a simulated live race between iconic Sherlock Holmes characters |
| 🎨 **Canvas Animations** | Unique per-page animated backgrounds: typewriter elements, code matrix, velocity streams, aurora waves |
| 👤 **User Profile** | Customizable avatar and display name with full stats history |

</details>

<details>
<summary><h3>🚧 Coming Soon</h3></summary>

- 🔐 **User Accounts (Signup / Login)** — JWT-based auth with persistent MongoDB profiles
- 🛡️ **Admin Panel** — Manage quotes, view users, and moderate leaderboard entries
- 📊 **User Dashboard** — Personal stats overview with recent scores and progress tracking

</details>

<br>

## 🛠️ Tech Stack

```
┌─────────────┬──────────────────────────────────────────────────────┐
│  Frontend   │  HTML5 · CSS3 (Vanilla) · JavaScript (ES6+) · Canvas│
├─────────────┼──────────────────────────────────────────────────────┤
│  Backend    │  Node.js · Express                                   │
├─────────────┼──────────────────────────────────────────────────────┤
│  Real-Time  │  Socket.io                                           │
├─────────────┼──────────────────────────────────────────────────────┤
│  Database   │  MongoDB · Mongoose ODM                              │
├─────────────┼──────────────────────────────────────────────────────┤
│  Auth       │  JSON Web Tokens (JWT) · bcrypt.js                   │
├─────────────┼──────────────────────────────────────────────────────┤
│  Fonts      │  Inter · JetBrains Mono (Google Fonts)               │
├─────────────┼──────────────────────────────────────────────────────┤
│  Design     │  Dark green / black · Glassmorphism · Monospace      │
└─────────────┴──────────────────────────────────────────────────────┘
```

<br>

## 📂 Project Structure

```
typing-game/
│
├── 📄 index.html                 # Home page — hero & navigation
├── 📄 practice.html              # Solo practice mode
├── 📄 competition.html           # Real-time multiplayer race
├── 📄 leaderboard.html           # Global leaderboard
├── 📄 login.html                 # Authentication (signup & login)
├── 📄 dashboard.html             # User dashboard (stats overview)
├── 📄 profile.html               # User profile & avatar customization
├── 📄 admin.html                 # Admin panel
│
├── 🎨 style.css                  # Global stylesheet & design system
│
├── ⚙️ script.js                  # Core typing engine & adaptive difficulty
├── ⚙️ multiplayer.js             # Socket.io multiplayer client logic
├── ⚙️ auth.js                    # Client-side authentication helpers
├── ⚙️ achievements.js            # Badge system & toast notifications
├── ⚙️ daily-challenge.js         # Daily challenge engine & streak tracking
├── ⚙️ heatmap.js                 # Keyboard accuracy heatmap renderer
├── ⚙️ replay.js                  # Keystroke replay engine
├── ⚙️ quote-packs.js             # Themed quote collections
├── ⚙️ share-card.js              # Canvas social share card generator
├── ⚙️ virtual-keyboard.js        # On-screen touch keyboard
├── ⚙️ spectator.js               # Spectator mode (simulated live race)
├── ⚙️ bg-animations.js           # Premium per-page canvas animations
├── ⚙️ dashboard.js               # Dashboard data & rendering
├── ⚙️ profile.js                 # Profile page logic & avatar management
├── ⚙️ admin.js                   # Admin panel client logic
│
└── 📁 server/
    ├── server.js                 # Express + Socket.io entry point
    ├── package.json              # Server dependencies
    ├── .env                      # Environment variables
    ├── leaderboard.js            # Leaderboard utilities
    ├── 📁 models/
    │   ├── User.js               # Mongoose User schema
    │   └── Score.js              # Mongoose Score schema
    ├── 📁 routes/
    │   ├── authRoutes.js         # Authentication API endpoints
    │   ├── gameRoutes.js         # Game & leaderboard API endpoints
    │   └── adminRoutes.js        # Admin API endpoints
    └── 📁 middleware/
        └── authMiddleware.js     # JWT verification middleware
```

<br>

## 🚀 Getting Started

### Prerequisites

> - [**Node.js**](https://nodejs.org/) v18 or higher
> - [**MongoDB**](https://www.mongodb.com/try/download/community) running locally (or a MongoDB Atlas connection string)

### Installation

**1️⃣ Clone the repository**

```bash
git clone https://github.com/iqraAnsar271/typing-master-.git
cd typing-master-
```

**2️⃣ Install server dependencies**

```bash
cd server
npm install
```

**3️⃣ Configure environment variables**

The `server/.env` file comes pre-configured for local development:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/typing-game
JWT_SECRET=typelikesherlock_secret_key_2026
```

> [!IMPORTANT]
> Update `MONGO_URI` if using MongoDB Atlas, and change `JWT_SECRET` to a strong random string for production.

**4️⃣ Start the server**

```bash
node server.js
```

You should see:

```
✅ MongoDB connected
🚀 Server running on port 5000
```

**5️⃣ Open in your browser**

```
http://localhost:5000
```

<br>

## 🎮 How to Play

<table>
  <tr>
    <td width="33%">

### 🕵️ Solo Practice

1. Navigate to **Practice**
2. Enter your name & pick a quote pack
3. Click **Start** — a quote appears
4. Type each word + press `Space`
5. See your **WPM**, **accuracy** & **streak**
6. Hit targets → auto difficulty bump!

</td>
    <td width="33%">

### 🏁 Multiplayer Race

1. Navigate to **Competition**
2. Enter your name
3. **Create** or **Join** a room (4-char code)
4. **3-2-1 countdown** begins
5. Race typing the same quote
6. First to finish wins! (60s timer)

</td>
    <td width="34%">

### 📅 Daily Challenge

- New quote featured **every day**
- Same for all players worldwide
- Build your **daily streak**
- Unlock the **7-Day Streak** badge! 🏅

</td>
  </tr>
</table>

<br>

## 🗺️ Roadmap

- [ ] 🔊 **Sound Effects** — Keystroke audio, countdown beeps, victory fanfares
- [ ] 🔄 **Rematch Button** — Instant rematch without leaving the room
- [ ] 🕵️ **Detective Messages** — Thematic Sherlock commentary based on performance
- [ ] 📊 **Detailed Analytics** — Historical WPM/accuracy graphs and per-session breakdowns
- [ ] 🏆 **Seasonal Tournaments** — Time-limited events with exclusive badges
- [ ] 🌍 **Cloud Deploy** — One-click deploy to Vercel / Railway / Render

<br>

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/iqraAnsar271/typing-master-/issues).

```
1. Fork the repository
2. Create your feature branch    →  git checkout -b feature/amazing-feature
3. Commit your changes           →  git commit -m "Add amazing feature"
4. Push to the branch            →  git push origin feature/amazing-feature
5. Open a Pull Request
```

<br>

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

<br>

---

<div align="center">

<br>

Built with ☕ and 🔍 by [**Iqra Ansar**](https://github.com/iqraAnsar271)

*"The game is afoot."* — Sherlock Holmes

<br>

<img src="https://img.shields.io/badge/Made_with-❤️-red?style=for-the-badge" alt="Made with love" />
<img src="https://img.shields.io/badge/Powered_by-Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Powered by Node.js" />

</div>
