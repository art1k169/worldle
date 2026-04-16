const socket = io();

let currentRoomId = null;
let playerName = "Игрок " + Math.floor(Math.random() * 1000);

// --- 1. ОБЩАЯ ЛОГИКА И ОНЛАЙН ---

socket.on('update_online', (count) => {
    document.getElementById('online-counter').innerText = `Онлайн: ${count}`;
});

// Получение списка комнат
socket.on('rooms_list', (rooms) => {
    const listDiv = document.getElementById('rooms-list');
    listDiv.innerHTML = '';

    if (rooms.length === 0) {
        listDiv.innerHTML = '<p>Нет активных лобби</p>';
    }

    rooms.forEach(room => {
        const roomEl = document.createElement('div');
        roomEl.style.padding = "5px";
        roomEl.innerHTML = `
            <span>Лобби: <b>${room.id}</b> ${room.hasPass ? '🔒' : '🔓'}</span>
            <button onclick="joinLobby('${room.id}', ${room.hasPass})">Войти</button>
        `;
        listDiv.appendChild(roomEl);
    });
});

// --- 2. УПРАВЛЕНИЕ ЛОББИ ---

function createNewLobby() {
    const roomId = Math.random().toString(36).substring(2, 7).toUpperCase();
    const isPublic = confirm("Сделать лобби публичным?");
    const password = isPublic ? prompt("Установите пароль (оставьте пустым, если не нужен)") : null;

    socket.emit('create_room', { roomId, password, isPublic });
    enterRoom(roomId);
}

function joinLobby(roomId, hasPass) {
    let password = null;
    if (hasPass) {
        password = prompt("Введите пароль для входа:");
    }
    socket.emit('join_room', { roomId, password });
}

socket.on('join_success', (roomId) => {
    enterRoom(roomId);
});

socket.on('error_msg', (msg) => {
    alert(msg);
});

function enterRoom(roomId) {
    currentRoomId = roomId;
    document.getElementById('lobby-menu').style.display = 'none';
    document.getElementById('game-zone').style.display = 'block';
    document.getElementById('status-msg').innerText = `Вы в лобби: ${roomId}. Загадайте слово!`;
}

// --- 3. ИГРОВАЯ ЛОГИКА ---

// Функция отправки загаданного слова (ЛЮБОГО)
function submitTargetWord(word) {
    word = word.trim().toUpperCase();
    if (word.length !== 5) {
        alert("Слово должно быть из 5 букв!");
        return;
    }
    // ВНИМАНИЕ: Проверка по словарю удалена. Можно любое слово.
    socket.emit('set_word', { roomId: currentRoomId, word: word });
}

// Обработка проигрыша (когда сервер присылает слово)
socket.on('end_game', (data) => {
    if (!data.success) {
        const status = document.getElementById('status-msg');
        status.style.color = "red";
        status.innerText = `ПРОИГРЫШ. БЫЛО ЗАГАДАНО: ${data.word}`;
    } else {
        document.getElementById('status-msg').innerText = "ПОБЕДА!";
    }
});

// --- 4. ЧАТ ---

function sendChatMessage() {
    const input = document.getElementById('chat-input');
    const text = input.value.trim();
    if (text && currentRoomId) {
        socket.emit('send_chat_msg', { 
            roomId: currentRoomId, 
            text: text, 
            user: playerName 
        });
        input.value = '';
    }
}

socket.on('new_chat_msg', (data) => {
    const chatBox = document.getElementById('chat-messages');
    const msgDiv = document.createElement('div');
    msgDiv.innerHTML = `<b>${data.user}:</b> ${data.text}`;
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
});
