const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "https://art1k169.github.io",
        methods: ["GET", "POST"]
    }
});

const rooms = {};

io.on('connection', (socket) => {
    socket.on('createRoom', (data) => {
        const code = Math.random().toString(36).substring(2, 8).toUpperCase();
        rooms[code] = {
            players: [{ id: socket.id, name: data.name }],
            secretWord: null,
            guesses: []
        };
        socket.join(code);
        socket.emit('roomCreated', { code });
        io.to(code).emit('playerJoined', rooms[code].players);
    });

    socket.on('joinRoom', (data) => {
        const room = rooms[data.code];
        if (room && room.players.length < 2) {
            room.players.push({ id: socket.id, name: data.name });
            socket.join(data.code);
            io.to(data.code).emit('playerJoined', room.players);
        } else {
            socket.emit('errorMsg', 'Комната не найдена или заполнена');
        }
    });

    socket.on('startGame', (code) => {
        const room = rooms[code];
        if (room && room.players.length === 2) {
            io.to(room.players[0].id).emit('initRole', { role: 'master' });
            io.to(room.players[1].id).emit('initRole', { role: 'guesser' });
        }
    });

    socket.on('setSecretWord', (data) => {
        const room = rooms[data.code];
        if (room) {
            room.secretWord = data.word.toUpperCase();
            io.to(data.code).emit('wordIsReady');
        }
    });

    socket.on('typeSync', (data) => {
        socket.to(data.code).emit('typeSync', data);
    });

    socket.on('submitGuess', (data) => {
        const room = rooms[data.code];
        if (!room || !room.secretWord) return;

        const guess = data.guess.toUpperCase();
        const secret = room.secretWord;
        const states = Array(5).fill('absent');
        const secretArr = secret.split('');
        const guessArr = guess.split('');

        guessArr.forEach((char, i) => {
            if (char === secretArr[i]) {
                states[i] = 'correct';
                secretArr[i] = null;
            }
        });

        guessArr.forEach((char, i) => {
            if (states[i] !== 'correct' && secretArr.includes(char)) {
                states[i] = 'present';
                secretArr[secretArr.indexOf(char)] = null;
            }
        });

        io.to(data.code).emit('guessResult', {
            guess,
            states,
            isWin: guess === secret,
            senderId: socket.id
        });
    });

    socket.on('leaveRoom', (code) => {
        socket.leave(code);
        socket.emit('leftSuccess');
        if (rooms[code]) {
            rooms[code].players = rooms[code].players.filter(p => p.id !== socket.id);
            if (rooms[code].players.length === 0) delete rooms[code];
            else io.to(code).emit('playerJoined', rooms[code].players);
        }
    });

    socket.on('disconnect', () => {
        for (const code in rooms) {
            rooms[code].players = rooms[code].players.filter(p => p.id !== socket.id);
            if (rooms[code].players.length === 0) delete rooms[code];
            else io.to(code).emit('playerJoined', rooms[code].players);
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});