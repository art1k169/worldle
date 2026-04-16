const socket = io();
let currentRoomId = null;

// --- ДАННЫЕ ИГРОКА (РАНГИ И НИК) ---
let myName = localStorage.getItem('artik_name') || "Player";
let myXP = parseInt(localStorage.getItem('artik_xp')) || 0;

function updateUIStats() {
    const nameDisplay = document.getElementById('player-name-display');
    const rankDisplay = document.getElementById('player-rank');
    const xpBar = document.getElementById('xp-bar');

    if (nameDisplay) nameDisplay.innerText = myName + " ✏️";
    
    // Логика рангов
    let rankName = "SILVER I";
    if (myXP >= 1000) rankName = "GOLD I";
    if (myXP >= 3000) rankName = "PLATINUM I";
    
    if (rankDisplay) rankDisplay.innerText = rankName;
    if (xpBar) xpBar.style.width = (myXP % 1000) / 10 + "%";
}

// Редактирование ника
document.getElementById('player-name-display').onclick = () => {
    const newName = prompt("Введите ваш ник:", myName);
    if (newName) {
        myName = newName;
        localStorage.setItem('artik_name', myName);
        updateUIStats();
    }
};

// --- ОДИНОЧНАЯ ИГРА И БОТ ---
function startSolo() {
    document.getElementById('main-menu').classList.add('hidden');
    document.getElementById('game-zone').classList.remove('hidden');
    document.getElementById('game-title').innerText = "Одиночный режим";
    document.getElementById('setup-controls').classList.add('hidden'); // В соло слово дает сервер/рандом
    document.getElementById('game-status').innerText = "Отгадайте слово!";
    console.log("Одиночный режим запущен");
}

function startBot() {
    startSolo();
    document.getElementById('game-title').innerText = "Сражение с ботом";
    console.log("Игра с ботом запущена");
}

// --- МУЛЬТИПЛЕЕР: ЛОББИ И ПАРОЛИ ---
function openCreateModal() {
    const roomId = Math.random().toString(36).substring(2, 7).toUpperCase();
    const isPublic = confirm("Сделать комнату публичной (отображать в списке)?");
    const password = prompt("Введите пароль лобби (оставьте пустым, если не нужен):");
    
    socket.emit('create_room', { roomId, password, isPublic });
    enterRoom(roomId);
}

function joinLobby(id, hasPass) {
    let password = null;
    if (hasPass) {
        password = prompt("Это приватное лобби. Введите пароль:");
        if (password === null) return;
    }
    socket.emit('join_room', { roomId: id, password });
}

socket.on('join_success', (id) => enterRoom(id));
socket.on('error_msg', (msg) => alert(msg));

function enterRoom(id) {
    currentRoomId = id;
    document.getElementById('main-menu').classList.add('hidden');
    document.getElementById('game-zone').classList.remove('hidden');
    document.getElementById('game-title').innerText = "Лобби: " + id;
    document.getElementById('setup-controls').classList.remove('hidden');
    document.getElementById('game-status').innerText = "Загадайте слово сопернику!";
}

// --- ИГРОВАЯ ЛОГИКА ---
function confirmTargetWord() {
    const input = document.getElementById('target-word-input');
    const word = input.value.toUpperCase().trim();
    
    if (word.length !== 5) {
        alert("Слово должно быть из 5 букв!");
        return;
    }

    socket.emit('set_word', { roomId: currentRoomId, word });
    document.getElementById('setup-controls').classList.add('hidden');
    document.getElementById('game-status').innerText = "Слово отправлено. Ждем соперника...";
}

socket.on('game_started', () => {
    document.getElementById('game-status').innerText = "Игра началась! Отгадывайте!";
});

// Когда кто-то не угадал (или выиграл)
socket.on('end_game', (data) => {
    const status = document.getElementById('game-status');
    if (data.success) {
        status.innerHTML = "<span style='color:#538d4e'>ПОБЕДА! +150 XP</span>";
        myXP += 150;
        localStorage.setItem('artik_xp', myXP);
        updateUIStats();
    } else {
        // Выводим загаданное слово всем
        status.innerHTML = `<span style='color:#ff4d4d'>ПРОИГРЫШ. БЫЛО ЗАГАДАНО: ${data.word}</span>`;
    }
});

// --- ОНЛАЙН И ЧАТ ---
socket.on('update_online', (count) => {
    document.getElementById('online-counter').innerText = "Онлайн: " + count;
});

socket.on('rooms_list', (rooms) => {
    const list = document.getElementById('lobby-list');
    list.innerHTML = '';
    if (rooms.length === 0) {
        list.innerHTML = '<div style="color:#818384; padding-top:40px;">Нет открытых лобби</div>';
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

function sendChatMessage() {
    const input = document.getElementById('chat-input');
    if (!input.value.trim()) return;
    socket.emit('send_chat_msg', { roomId: currentRoomId, text: input.value, user: myName });
    input.value = '';
}

socket.on('new_chat_msg', (data) => {
    const box = document.getElementById('chat-messages');
    box.innerHTML += `<div><b>${data.user}:</b> ${data.text}</div>`;
    box.scrollTop = box.scrollHeight;
});

// Инициализация при загрузке
updateUIStats();
