const socket = io();
let currentRoomId = null;
let myName = "Игрок_" + Math.floor(Math.random() * 1000);

socket.on('update_online', (count) => {
    document.getElementById('online-counter').innerText = "Онлайн: " + count;
});

socket.on('rooms_list', (rooms) => {
    const list = document.getElementById('lobby-list');
    list.innerHTML = '';
    if (rooms.length === 0) {
        list.innerHTML = '<div style="color: #818384; padding-top: 60px;">Нет активных лобби</div>';
        return;
    }
    rooms.forEach(room => {
        const div = document.createElement('div');
        div.className = 'room-item';
        const lockIcon = room.hasPass ? '🔒' : '🔓';
        div.innerHTML = `
            <span>Лобби: <b>${room.id}</b> ${lockIcon}</span>
            <button class="secondary" onclick="joinLobby('${room.id}', ${room.hasPass})">Войти</button>
        `;
        list.appendChild(div);
    });
});

function createNewLobby() {
    const roomId = Math.random().toString(36).substring(2, 7).toUpperCase();
    const isPublic = confirm("Сделать лобби публичным для всех?");
    const password = prompt("Введите пароль (пусто для входа без пароля):");
    socket.emit('create_room', { roomId, password, isPublic });
    enterLobbyView(roomId);
}

function joinLobby(id, hasPass) {
    let password = null;
    if (hasPass) {
        password = prompt("Введите пароль лобби:");
        if (password === null) return;
    }
    socket.emit('join_room', { roomId: id, password });
}

socket.on('join_success', (roomId) => {
    enterLobbyView(roomId);
});

socket.on('error_msg', (msg) => {
    alert(msg);
});

function enterLobbyView(id) {
    currentRoomId = id;
    document.getElementById('main-menu').classList.add('hidden');
    document.getElementById('game-zone').classList.remove('hidden');
    document.getElementById('game-status').innerText = "Вы в лоbби " + id + ". Загадайте слово!";
}

function confirmTargetWord() {
    const input = document.getElementById('target-word-input');
    const word = input.value.toUpperCase().trim();
    if (word.length !== 5) {
        alert("Слово должно состоять ровно из 5 букв!");
        return;
    }
    socket.emit('set_word', { roomId: currentRoomId, word: word });
    document.getElementById('setup-controls').classList.add('hidden');
    document.getElementById('game-status').innerText = "СЛОВО ПРИНЯТО. ИГРА НАЧАТА!";
}

socket.on('game_started', () => {
    document.getElementById('setup-controls').classList.add('hidden');
    document.getElementById('game-status').innerText = "ОТГАДЫВАЙТЕ СЛОВО!";
});

socket.on('end_game', (data) => {
    const status = document.getElementById('game-status');
    if (data.success) {
        status.style.color = "#538d4e";
        status.innerText = "ПОБЕДА!";
    } else {
        status.style.color = "#ff4d4d";
        status.innerText = "ПРОИГРЫШ. ЗАГАДАНО: " + data.word;
    }
});

function sendChatMessage() {
    const input = document.getElementById('chat-input');
    const text = input.value.trim();
    if (text === "") return;
    socket.emit('send_chat_msg', { roomId: currentRoomId, text: text, user: myName });
    input.value = '';
}

socket.on('new_chat_msg', (data) => {
    const msgBox = document.getElementById('chat-messages');
    const div = document.createElement('div');
    div.innerHTML = `<span style="color: #818384;">${data.user}:</span> <span>${data.text}</span>`;
    msgBox.appendChild(div);
    msgBox.scrollTop = msgBox.scrollHeight;
});

document.getElementById('chat-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendChatMessage();
});
