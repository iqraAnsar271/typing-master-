const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

const gameRoutes = require("./routes/gameRoutes");

dotenv.config({ path: path.join(__dirname, ".env") });

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "..")));
app.use("/api", gameRoutes);

const COUNTDOWN_SECONDS = 3;
const RACE_DURATION_MS = 60000;

const quotes = [
  "The game is afoot, Watson.",
  "When you have eliminated the impossible, whatever remains, however improbable, must be the truth.",
  "There is nothing more deceptive than an obvious fact.",
  "I never make exceptions. An exception disproves the rule.",
  "What one man can invent another can discover.",
];

const rooms = {};

io.on("connection", (socket) => {
  console.log("A player connected:", socket.id);

  socket.on("create-room", (playerName) => {
    let roomCode = Math.random().toString(36).substring(2, 6).toUpperCase();

    while (rooms[roomCode]) {
      roomCode = Math.random().toString(36).substring(2, 6).toUpperCase();
    }

    rooms[roomCode] = {
      players: [{ id: socket.id, name: playerName }],
      quote: null,
      started: false,
    };

    socket.join(roomCode);
    socket.data.roomCode = roomCode;

    socket.emit("room-created", {
      roomCode,
      players: rooms[roomCode].players,
    });
  });

  socket.on("join-room", ({ roomCode, playerName }) => {
    const room = rooms[roomCode];

    if (!room) {
      socket.emit("join-error", "Room not found.");
      return;
    }

    room.players.push({ id: socket.id, name: playerName });
    socket.join(roomCode);
    socket.data.roomCode = roomCode;

    io.to(roomCode).emit("room-update", { players: room.players });

    if (room.players.length >= 2 && !room.started) {
      room.started = true;
      room.quote = quotes[Math.floor(Math.random() * quotes.length)];
      room.playerProgress = {};
      room.winnerDeclared = false;

      io.to(roomCode).emit("get-ready", { seconds: COUNTDOWN_SECONDS });

      setTimeout(() => {
        io.to(roomCode).emit("race-start", {
          quote: room.quote,
          players: room.players,
          duration: RACE_DURATION_MS,
        });

        room.raceTimer = setTimeout(() => {
          const roomData = rooms[roomCode];
          if (!roomData || roomData.winnerDeclared) return;

          roomData.winnerDeclared = true;

          const results = roomData.players
            .map((p) => {
              const progress =
                (roomData.playerProgress && roomData.playerProgress[p.id]) || {
                  wordIndex: 0,
                  totalWords: 1,
                };

              return {
                name: p.name,
                wordIndex: progress.wordIndex,
                totalWords: progress.totalWords,
              };
            })
            .sort((a, b) => b.wordIndex - a.wordIndex);

          io.to(roomCode).emit("race-time-up", { results });
        }, RACE_DURATION_MS);
      }, COUNTDOWN_SECONDS * 1000);
    }
  });

  socket.on("progress-update", ({ roomCode, wordIndex, totalWords }) => {
    const room = rooms[roomCode];
    if (!room) return;

    if (!room.playerProgress) room.playerProgress = {};
    room.playerProgress[socket.id] = { wordIndex, totalWords };

    socket.to(roomCode).emit("opponent-progress", {
      playerId: socket.id,
      wordIndex,
      totalWords,
    });
  });

  socket.on("player-finished", ({ roomCode, wpm, accuracy }) => {
    const room = rooms[roomCode];
    if (!room || room.winnerDeclared) return;

    room.winnerDeclared = true;

    if (room.raceTimer) {
      clearTimeout(room.raceTimer);
    }

    const player = room.players.find((p) => p.id === socket.id);
    const winnerName = player ? player.name : "A player";

    io.to(roomCode).emit("race-winner", {
      name: winnerName,
      wpm,
      accuracy,
    });
  });

  socket.on("disconnect", () => {
    const roomCode = socket.data.roomCode;

    if (roomCode && rooms[roomCode]) {
      rooms[roomCode].players = rooms[roomCode].players.filter(
        (p) => p.id !== socket.id
      );

      if (rooms[roomCode].players.length === 0) {
        if (rooms[roomCode].raceTimer) {
          clearTimeout(rooms[roomCode].raceTimer);
        }
        delete rooms[roomCode];
      } else {
        io.to(roomCode).emit("room-update", {
          players: rooms[roomCode].players,
        });
      }
    }

    console.log("A player disconnected:", socket.id);
  });
});

const startServer = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing in .env");
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();