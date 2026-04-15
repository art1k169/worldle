const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.static(__dirname));

let rooms = {};

io.on('connection', (socket) => {
    // Создание комнаты
    socket.on('createRoom', (data) => {
        const code = Math.random().toString(36).substring(2, 7).toUpperCase();
        rooms[code] = { players: [{ id: socket.id, name: data.name }], secretWord: null };
        socket.join(code);
        socket.emit('roomCreated', { code });
    });

    // Вход в комнату
    socket.on('joinRoom', (data) => {
        const room = rooms[data.code];
        if (room && room.players.length < 2) {
            room.players.push({ id: socket.id, name: data.name });
            socket.join(data.code);
            io.to(data.code).emit('playerJoined', room.players);
        } else { socket.emit('errorMsg', 'Комната не найдена или заполнена'); }
    });

    // Исправленная кнопка "Выйти"
    socket.on('leaveRoom', (code) => {
        socket.leave(code);
        if (rooms[code]) {
            rooms[code].players = rooms[code].players.filter(p => p.id !== socket.id);
            if (rooms[code].players.length === 0) {
                delete rooms[code];
            } else {
                io.to(code).emit('playerJoined', rooms[code].players);
            }
        }
        socket.emit('leftSuccess');
    });

    // Старт игры и раздача ролей
    socket.on('startGame', (code) => {
        const room = rooms[code];
        if (!room) return;
        const masterIdx = Math.floor(Math.random() * 2);
        room.players.forEach((p, i) => {
            io.to(p.id).emit('initRole', { role: (i === masterIdx ? 'master' : 'guesser') });
        });
    });

    // Установка секретного слова
    socket.on('setSecretWord', (data) => {
        if (rooms[data.code]) {
            rooms[data.code].secretWord = data.word.toUpperCase();
            io.to(data.code).emit('wordIsReady');
        }
    });

    // Синхронизация ввода букв для Хоста
    socket.on('typeSync', (data) => {
        socket.to(data.code).emit('typeSync', data);
    });

    // Проверка попытки
    socket.on('submitGuess', (data) => {
        const room = rooms[data.code];
        if (room && room.secretWord) {
            const secret = room.secretWord;
            const guess = data.guess.toUpperCase();
            let res = Array(5).fill('absent');
            let sMap = secret.split(''), gMap = guess.split('');

            for (let i = 0; i < 5; i++) {
                if (gMap[i] === sMap[i]) { res[i] = 'correct'; sMap[i] = null; gMap[i] = null; }
            }
            for (let i = 0; i < 5; i++) {
                if (gMap[i] !== null && sMap.includes(gMap[i])) {
                    res[i] = 'present'; sMap[sMap.indexOf(gMap[i])] = null;
                }
            }
            const win = res.every(s => s === 'correct');
            io.to(data.code).emit('guessResult', { guess, states: res, senderId: socket.id, isWin: win });
        }
    });
});

http.listen(3000, () => console.log('Server: http://localhost:3000'));