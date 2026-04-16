const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.static(__dirname + '/public'));

let totalConnections = 0;

io.on('connection', (socket) => {
    totalConnections++;
    // Отправляем новый онлайн всем сразу
    io.emit('update_online', totalConnections);
    console.log('User connected. Online:', totalConnections);

    socket.on('disconnect', () => {
        totalConnections--;
        // Обновляем онлайн при уходе игрока
        io.emit('update_online', totalConnections);
        console.log('User disconnected. Online:', totalConnections);
    });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
    console.log('Server is running on port ' + PORT);
});
