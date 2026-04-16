const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.static(__dirname + '/public'));

let connections = 0;

io.on('connection', (socket) => {
    connections++;
    io.emit('update_online', connections);
    
    socket.on('disconnect', () => {
        connections--;
        io.emit('update_online', connections);
    });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
    console.log('Server ArtikWordle started on port ' + PORT);
});
