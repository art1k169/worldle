const socket = io();
let currentRoomId = null;
let myName = localStorage.getItem('artik_name') || "Игрок";
let myXP = parseInt(localStorage.getItem('artik_xp')) || 0;

function updateUIStats() {
    document.getElementById('player-name-display').innerText = myName + " ✏️";
    const rank = myXP < 1000 ? "SILVER I" : myXP < 3000 ? "GOLD I" : "PLATINUM I";
    document.getElementById('player-rank').innerText = rank;
    document.getElementById('xp-bar').style.width = (myXP % 1000) / 10 + "%";
}
updateUIStats();

socket.on('update_online', (count) => {
    document.getElementById('online-counter').innerText = "Онлайн: " + count;
});

socket.on('rooms_list', (rooms) => {
    const list = document.getElementById('lobby-list');
    list.innerHTML = '';
    if (rooms.length === 0) {
        list.innerHTML = '<div style="padding-top: 50px; color: #818384;">Комнат пока нет</div>';
        return;
    }
    rooms.forEach(room => {
        const div = document.createElement('div');
        div.className = 'room-item';
        div.innerHTML = `
            <span>Лобби: <b>${room.id}</b> ${room.hasPass ? '🔒' : '🔓'}</span>
            <button onclick="joinLobby('${room.id}', ${room.hasPass})">Войти</button>
        `;
        list.appendChild(div);
    });
});

function startSolo() {
    alert("Запуск одиночного режима...");
    document.getElementById('main-menu').classList.add('hidden');
    document.getElementById('game-zone').classList.remove('hidden');
    document.getElementById('game-title').innerText = "Одиночный режим";
    document.getElementById('multiplayer-footer').classList.add('hidden');
    document.getElementById('setup-controls').classList.add('hidden');
}

function startBot() {
    alert("Бот готовится к игре...");
    startSolo();
    document.getElementById('game-title').innerText = "Игра с Ботом";
}

function openCreateModal() {
    const roomId = Math.random().toString(36).substring(2, 7).toUpperCase();
    const isPublic = confirm("Сделать комнату публичной?");
    const password = prompt("Установите пароль (оставьте пустым для входа всех):");
    socket.emit('create_room', { roomId, password, isPublic });
    enterRoom(roomId);
}

function joinLobby(id, hasPass) {
    let password = hasPass ? prompt("Введите пароль:") : null;
    socket.emit('join_room', { roomId: id, password });
}

socket.on('join_success', (id) => enterRoom(id));
socket.on('error_msg', (msg) => alert(msg));

function enterRoom(id) {
    currentRoomId = id;
    document.getElementById('main-menu').classList.add('hidden');
    document.getElementById('game-zone').classList.remove('hidden');
    document.getElementById('game-title').innerText = "Лобби: " + id;
}

function confirmTargetWord() {
    const word = document.getElementById('target-word-input').value.toUpperCase().trim();
    if (word.length !== 5) return alert("Нужно 5 букв!");
    socket.emit('set_word', { roomId: currentRoomId, word });
    document.getElementById('setup-controls').classList.add('hidden');
}

socket.on('end_game', (data) => {
    const status = document.getElementById('game-status');
    if (data.success) {
        myXP += 150;
        localStorage.setItem('artik_xp', myXP);
        updateUIStats();
        status.innerHTML = "<span style='color:#538d4e'>ПОБЕДА! +150 XP</span>";
    } else {
        status.innerHTML = `<span style='color:#ff4d4d'>ПРОИГРЫШ. БЫЛО: ${data.word}</span>`;
    }
});

function sendChatMessage() {
    const input = document.getElementById('chat-input');
    if (!input.value) return;
    socket.emit('send_chat_msg', { roomId: currentRoomId, text: input.value, user: myName });
    input.value = '';
}

socket.on('new_chat_msg', (data) => {
    const box = document.getElementById('chat-messages');
    box.innerHTML += `<div><b>${data.user}:</b> ${data.text}</div>`;
    box.scrollTop = box.scrollHeight;
});
