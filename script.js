const socket = io();

// Статистика
let myXP = parseInt(localStorage.getItem('artik_xp')) || 0;
function updateStats() {
    document.getElementById('xp-bar').style.width = (myXP % 1000) / 10 + "%";
    document.getElementById('player-rank').innerText = myXP < 1000 ? "SILVER I" : "GOLD I";
}
updateStats();

// Навигация
function showScreen(screenId) {
    document.querySelectorAll('.menu-container, #game-zone').forEach(el => el.classList.add('hidden'));
    document.getElementById(screenId).classList.remove('hidden');
}

// Логика ввода кода
function toggleJoinBtn() {
    const val = document.getElementById('room-code-input').value;
    const btn = document.getElementById('join-btn');
    if (val.length === 6) {
        btn.classList.remove('hidden');
    } else {
        btn.classList.add('hidden');
    }
}

// Функции кнопок
function startSolo() {
    alert("Запуск одиночной игры...");
    showScreen('game-zone');
    initBoard();
}

function startBot() {
    alert("Бот загадывает слово...");
    showScreen('game-zone');
    initBoard();
}

function createRoom() {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    alert("Комната создана! Код: " + code);
    showScreen('game-zone');
    document.getElementById('game-status').innerText = "ОЖИДАНИЕ ИГРОКА... КОД: " + code;
    initBoard();
}

function joinRoom() {
    const code = document.getElementById('room-code-input').value;
    alert("Подключение к " + code);
    showScreen('game-zone');
    initBoard();
}

function initBoard() {
    const board = document.getElementById('board');
    board.innerHTML = '';
    for(let i=0; i<30; i++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        board.appendChild(cell);
    }
}

socket.on('update_online', count => {
    document.getElementById('online-count').innerText = "Онлайн: " + count;
});
