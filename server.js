const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

const rooms = {};

io.on('connection', (socket) => {
    socket.on('createRoom', (data) => {
        const code = Math.random().toString(36).substring(2, 8).toUpperCase();
        rooms[code] = { players: [{ id: socket.id, name: data.name }], secretWord: null };
        socket.join(code);
        socket.emit('roomCreated', { code });
    });

    socket.on('joinRoom', (data) => {
        const room = rooms[data.code];
        if (room && room.players.length < 2) {
            room.players.push({ id: socket.id, name: data.name });
            socket.join(data.code);
            io.to(data.code).emit('playerJoined', room.players);
        }
    });

    socket.on('startGame', (code) => {
        const room = rooms[code];
        if (room) {
            io.to(room.players[0].id).emit('initRole', { role: 'master' });
            io.to(room.players[1].id).emit('initRole', { role: 'guesser' });
        }
    });

    socket.on('setSecretWord', (data) => {
        const room = rooms[data.code];
        if (room) {
            room.secretWord = data.word.toUpperCase();
            io.to(data.code).emit('wordIsReady', { word: room.secretWord });
        }
    });

    socket.on('submitGuess', (data) => {
        const room = rooms[data.code];
        if (!room) return;
        const guess = data.guess.toUpperCase();
        const secret = room.secretWord;
        const states = Array(5).fill('absent');
        const sArr = secret.split('');
        guess.split('').forEach((c, i) => { if(c === sArr[i]) { states[i] = 'correct'; sArr[i] = null; } });
        guess.split('').forEach((c, i) => { if(states[i] !== 'correct' && sArr.includes(c)) { states[i] = 'present'; sArr[sArr.indexOf(c)] = null; } });
        io.to(data.code).emit('guessResult', { guess, states, isWin: guess === secret, senderId: socket.id });
    });

    socket.on('leaveRoom', (code) => {
        socket.leave(code);
        delete rooms[code];
        io.to(code).emit('roomClosed');
    });

    socket.on('disconnect', () => {
        for (const code in rooms) {
            if (rooms[code].players.find(p => p.id === socket.id)) {
                io.to(code).emit('roomClosed');
                delete rooms[code];
            }
        }
    });
});

server.listen(10000);
