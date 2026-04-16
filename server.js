const io = require("socket.io")(server); // Твой сервер

let rooms = {}; 
let onlineCount = 0;

io.on("connection", (socket) => {
    onlineCount++;
    io.emit("update_online", onlineCount); // Рассылаем онлайн всем

    // Рассылка списка комнат при подключении
    sendPublicRooms(socket);

    // Создание лобби
    socket.on("create_room", ({ roomId, password, isPublic }) => {
        rooms[roomId] = {
            id: roomId,
            password: password || null,
            isPublic: isPublic,
            targetWord: null,
            players: [socket.id],
            gameActive: false
        };
        socket.join(roomId);
        broadcastRooms(); 
    });

    // Вход в лобби
    socket.on("join_room", ({ roomId, password }) => {
        const room = rooms[roomId];
        if (room) {
            if (room.password && room.password !== password) {
                return socket.emit("error_msg", "Неверный пароль!");
            }
            socket.join(roomId);
            socket.emit("join_success", roomId);
        }
    });

    // Загадывание слова (ЛЮБОЕ слово)
    socket.on("set_word", ({ roomId, word }) => {
        if (rooms[roomId]) {
            rooms[roomId].targetWord = word.toUpperCase();
            rooms[roomId].gameActive = true;
            io.to(roomId).emit("game_started");
        }
    });

    // Проигрыш (рассылка слова всем)
    socket.on("game_lost", (roomId) => {
        if (rooms[roomId]) {
            io.to(roomId).emit("end_game", { 
                success: false, 
                word: rooms[roomId].targetWord 
            });
            rooms[roomId].gameActive = false;
        }
    });

    // Чат
    socket.on("send_chat_msg", ({ roomId, text, user }) => {
        io.to(roomId).emit("new_chat_msg", { user, text });
    });

    socket.on("disconnect", () => {
        onlineCount--;
        io.emit("update_online", onlineCount);
    });
});

function broadcastRooms() {
    const publicData = Object.values(rooms)
        .filter(r => r.isPublic)
        .map(r => ({ id: r.id, hasPass: !!r.password }));
    io.emit("rooms_list", publicData);
}

function sendPublicRooms(socket) {
    const publicData = Object.values(rooms)
        .filter(r => r.isPublic)
        .map(r => ({ id: r.id, hasPass: !!r.password }));
    socket.emit("rooms_list", publicData);
}
