const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, '..')));

const COUNTDOWN_SECONDS = 3;
const RACE_DURATION_MS = 60000; // 60 seconds — change this to whatever length you want

const quotes = [
  'The game is afoot, Watson.',
  'When you have eliminated the impossible, whatever remains, however improbable, must be the truth.',
  'There is nothing more deceptive than an obvious fact.',
  'I never make exceptions. An exception disproves the rule.',
  'What one man can invent another can discover.'
];

const rooms = {}; // roomCode -> { players: [{id, name}], quote, started, playerProgress, winnerDeclared, raceTimer }

function generateRoomCode() {
  return Math.random().toString(36).substring(2, 6).toUpperCase();
}

function endRaceByTimeout(roomCode) {
  const room = rooms[roomCode];
  if (!room || room.winnerDeclared) return;
  room.winnerDeclared = true;

  const results = room.players
    .map((p) => {
      const progress = (room.playerProgress && room.playerProgress[p.id]) || { wordIndex: 0, totalWords: 1 };
      return { name: p.name, wordIndex: progress.wordIndex, totalWords: progress.totalWords };
    })
    .sort((a, b) => b.wordIndex - a.wordIndex);

  io.to(roomCode).emit('race-time-up', { results });
}

io.on('connection', (socket) => {
  console.log('A player connected:', socket.id);

  socket.on('create-room', (playerName) => {
    let roomCode = generateRoomCode();
    while (rooms[roomCode]) {
      roomCode = generateRoomCode();
    }
    rooms[roomCode] = { players: [{ id: socket.id, name: playerName }], quote: null, started: false };
    socket.join(roomCode);
    socket.data.roomCode = roomCode;
    socket.emit('room-created', { roomCode, players: rooms[roomCode].players });
  });

  socket.on('join-room', ({ roomCode, playerName }) => {
    const room = rooms[roomCode];
    if (!room) {
      socket.emit('join-error', 'Room not found.');
      return;
    }
    room.players.push({ id: socket.id, name: playerName });
    socket.join(roomCode);
    socket.data.roomCode = roomCode;

    io.to(roomCode).emit('room-update', { players: room.players });

    if (room.players.length >= 2 && !room.started) {
      room.started = true;
      room.quote = quotes[Math.floor(Math.random() * quotes.length)];
      room.playerProgress = {};
      room.winnerDeclared = false;

      io.to(roomCode).emit('get-ready', { seconds: COUNTDOWN_SECONDS });

      setTimeout(() => {
        io.to(roomCode).emit('race-start', {
          quote: room.quote,
          players: room.players,
          duration: RACE_DURATION_MS
        });

        room.raceTimer = setTimeout(() => {
          endRaceByTimeout(roomCode);
        }, RACE_DURATION_MS);
      }, COUNTDOWN_SECONDS * 1000);
    }
  });

  socket.on('progress-update', ({ roomCode, wordIndex, totalWords }) => {
    const room = rooms[roomCode];
    if (room) {
      if (!room.playerProgress) room.playerProgress = {};
      room.playerProgress[socket.id] = { wordIndex, totalWords };
    }
    socket.to(roomCode).emit('opponent-progress', { playerId: socket.id, wordIndex, totalWords });
  });

  socket.on('player-finished', ({ roomCode, wpm, accuracy }) => {
    const room = rooms[roomCode];
    if (!room || room.winnerDeclared) return;
    room.winnerDeclared = true;
    if (room.raceTimer) {
      clearTimeout(room.raceTimer);
    }
    const player = room.players.find((p) => p.id === socket.id);
    io.to(roomCode).emit('race-winner', {
      name: player ? player.name : 'A player',
      wpm,
      accuracy
    });
  });

  socket.on('disconnect', () => {
    const roomCode = socket.data.roomCode;
    if (roomCode && rooms[roomCode]) {
      rooms[roomCode].players = rooms[roomCode].players.filter((p) => p.id !== socket.id);
      if (rooms[roomCode].players.length === 0) {
        if (rooms[roomCode].raceTimer) {
          clearTimeout(rooms[roomCode].raceTimer);
        }
        delete rooms[roomCode];
      } else {
        io.to(roomCode).emit('room-update', { players: rooms[roomCode].players });
      }
    }
    console.log('A player disconnected:', socket.id);
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});