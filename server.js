const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.static('public'));

let rooms = {};
let online = 0;

io.on('connection', (socket) => {
    online++;
    io.emit('update_online', online);
    broadcastRooms();

    socket.on('create_room', (data) => {
        rooms[data.roomId] = {
            id: data.roomId,
            password: data.password || null,
            isPublic: data.isPublic,
            targetWord: null,
            players: [socket.id]
        };
        socket.join(data.roomId);
        broadcastRooms();
    });

    socket.on('join_room', (data) => {
        const r = rooms[data.roomId];
        if (r && (!r.password || r.password === data.password)) {
            socket.join(data.roomId);
            r.players.push(socket.id);
            socket.emit('join_success', data.roomId);
        } else {
            socket.emit('error_msg', 'Ошибка входа или пароль');
        }
    });

    socket.on('set_word', (data) => {
        if (rooms[data.roomId]) {
            rooms[data.roomId].targetWord = data.word.toUpperCase();
            io.to(data.roomId).emit('game_started');
        }
    });

    socket.on('game_lost', (roomId) => {
        if (rooms[roomId]) {
            io.to(roomId).emit('end_game', { success: false, word: rooms[roomId].targetWord });
        }
    });

    socket.on('send_chat_msg', (data) => {
        io.to(data.roomId).emit('new_chat_msg', data);
    });

    socket.on('disconnect', () => {
        online--;
        io.emit('update_online', online);
        for (let id in rooms) {
            rooms[id].players = rooms[id].players.filter(p => p !== socket.id);
            if (rooms[id].players.length === 0) delete rooms[id];
        }
        broadcastRooms();
    });
});

function broadcastRooms() {
    const list = Object.values(rooms).filter(r => r.isPublic).map(r => ({ id: r.id, hasPass: !!r.password }));
    io.emit('rooms_list', list);
}

http.listen(3000, () => console.log('Workle LIVE on 3000'));
