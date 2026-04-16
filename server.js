const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.static(__dirname + '/public'));

let rooms = {};
let totalConnections = 0;

io.on('connection', (socket) => {
    totalConnections++;
    io.emit('update_online', totalConnections);
    
    sendPublicRooms(socket);

    socket.on('create_room', (data) => {
        rooms[data.roomId] = {
            id: data.roomId,
            password: data.password || null,
            isPublic: data.isPublic,
            targetWord: null,
            players: [socket.id]
        };
        socket.join(data.roomId);
        broadcastPublicRooms();
    });

    socket.on('join_room', (data) => {
        const room = rooms[data.roomId];
        if (!room) {
            socket.emit('error_msg', 'Лобби не найдено');
            return;
        }
        if (room.password && room.password !== data.password) {
            socket.emit('error_msg', 'Неверный пароль');
            return;
        }
        socket.join(data.roomId);
        room.players.push(socket.id);
        socket.emit('join_success', data.roomId);
    });

    socket.on('set_word', (data) => {
        if (rooms[data.roomId]) {
            rooms[data.roomId].targetWord = data.word.toUpperCase();
            io.to(data.roomId).emit('game_started');
        }
    });

    socket.on('game_lost', (roomId) => {
        if (rooms[roomId]) {
            const word = rooms[roomId].targetWord;
            io.to(roomId).emit('end_game', { success: false, word: word });
        }
    });

    socket.on('send_chat_msg', (data) => {
        io.to(data.roomId).emit('new_chat_msg', {
            user: data.user,
            text: data.text
        });
    });

    socket.on('disconnect', () => {
        totalConnections--;
        io.emit('update_online', totalConnections);
        for (let roomId in rooms) {
            rooms[roomId].players = rooms[roomId].players.filter(id => id !== socket.id);
            if (rooms[roomId].players.length === 0) {
                delete rooms[roomId];
                broadcastPublicRooms();
            }
        }
    });
});

function sendPublicRooms(socket) {
    const publicList = Object.values(rooms)
        .filter(r => r.isPublic)
        .map(r => ({ id: r.id, hasPass: !!r.password }));
    socket.emit('rooms_list', publicList);
}

function broadcastPublicRooms() {
    const publicList = Object.values(rooms)
        .filter(r => r.isPublic)
        .map(r => ({ id: r.id, hasPass: !!r.password }));
    io.emit('rooms_list', publicList);
}

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
    console.log('Server is running on port ' + PORT);
});
