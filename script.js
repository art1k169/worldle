const socket = io();
let currentRoomId = null;
let myName = "Игрок_" + Math.floor(Math.random() * 1000);

// --- ОБНОВЛЕНИЕ ОНЛАЙНА ---
socket.on('update_online', (count) => {
    document.getElementById('online-counter').innerText = `Онлайн на сайте: ${count}`;
});

// --- СПИСОК ЛОББИ ---
socket.on('rooms_list', (rooms) => {
    const list = document.getElementById('lobby-list');
    list.innerHTML = '';
    if (rooms.length === 0) list.innerHTML = 'Пусто...';
    
    rooms.forEach(room => {
        const div = document.createElement('div');
        div.className = 'room-item';
        div.innerHTML = `
            <span>Лобби: ${room.id} ${room.hasPass ? '🔒' : '🔓'}</span>
            <button onclick="joinLobby('${room.id}', ${room.hasPass})">Войти</button>
        `;
        list.appendChild(div);
    });
});

// --- СОЗДАНИЕ И ВХОД ---
function createNewLobby() {
    const roomId = Math.random().toString(36).substring(2, 7).toUpperCase();
    const isPublic = confirm("Сделать лобби публичным?");
    const password = prompt("Введите пароль (если не нужен, оставьте пустым):");
    
    socket.emit('create_room', { roomId, password, isPublic });
    setupRoom(roomId);
}

function joinLobby(id, hasPass) {
    let pass = hasPass ? prompt("Введите пароль лобби:") : null;
    socket.emit('join_room', { roomId: id, password: pass });
}

socket.on('join_success', (roomId) => setupRoom(roomId));
socket.on('error_msg', (msg) => alert(msg));

function setupRoom(id) {
    currentRoomId = id;
    document.getElementById('main-menu').classList.add('hidden');
    document.getElementById('game-zone').style.display = 'block';
}

// --- ИГРОВАЯ ЛОГИКА ---
function confirmTargetWord() {
    const word = document.getElementById('target-word-input').value.toUpperCase();
    if (word.length !== 5) return alert("Нужно 5 букв!");
    
    // Любое слово теперь разрешено!
    socket.emit('set_word', { roomId: currentRoomId, word });
    document.getElementById('word-input-area').classList.add('hidden');
    document.getElementById('status-msg').innerText = "СЛОВО ОТПРАВЛЕНО!";
}

// ВАЖНО: При проигрыше
socket.on('end_game', (data) => {
    if (!data.success) {
        document.getElementById('status-msg').innerHTML = 
            `<span style="color:#ff4d4d">ПРОИГРЫШ. СЛОВО: ${data.word}</span>`;
    }
});

// --- ЧАТ ---
function sendChatMessage() {
    const input = document.getElementById('chat-input');
    if (!input.value) return;
    socket.emit('send_chat_msg', { roomId: currentRoomId, text: input.value, user: myName });
    input.value = '';
}

socket.on('new_chat_msg', (data) => {
    const msgBox = document.getElementById('chat-messages');
    msgBox.innerHTML += `<div><b>${data.user}:</b> ${data.text}</div>`;
    msgBox.scrollTop = msgBox.scrollHeight;
});
