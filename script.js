const socket = io();

// --- СИСТЕМА ПРОГРЕССА ---
let myName = localStorage.getItem('artik_name') || "Игрок";
let myXP = parseInt(localStorage.getItem('artik_xp')) || 0;

function updateUIStats() {
    const nameDisplay = document.getElementById('player-name-display');
    const rankDisplay = document.getElementById('player-rank');
    const xpBar = document.getElementById('xp-bar');

    if (nameDisplay) nameDisplay.innerText = myName + " ✏️";
    
    let rankName = "SILVER I";
    if (myXP >= 1000) rankName = "GOLD I";
    if (myXP >= 3000) rankName = "PLATINUM I";
    
    if (rankDisplay) rankDisplay.innerText = rankName;
    if (xpBar) xpBar.style.width = (myXP % 1000) / 10 + "%";
}

// Изменение имени
document.getElementById('player-name-display').onclick = () => {
    const newName = prompt("Ваше имя:", myName);
    if (newName) {
        myName = newName;
        localStorage.setItem('artik_name', myName);
        updateUIStats();
    }
};

// --- ОНЛАЙН ---
socket.on('update_online', (count) => {
    const counter = document.getElementById('online-counter');
    if (counter) counter.innerText = "Онлайн: " + count;
});

// --- ЛОГИКА ИГРЫ (ШАБЛОН) ---
// Сюда вставь свою старую логику проверки слов, ввода букв и смены цветов

function onWin() {
    myXP += 150;
    localStorage.setItem('artik_xp', myXP);
    updateUIStats();
    document.getElementById('status-msg').innerText = "ПОБЕДА! +150 XP";
}

function onLose(word) {
    document.getElementById('status-msg').innerText = "ПРОИГРЫШ. СЛОВО: " + word;
}

// Инициализация при загрузке
updateUIStats();
