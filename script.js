const socket = io();

// Статистика игрока
let myName = localStorage.getItem('artik_name') || "Player";
let myXP = parseInt(localStorage.getItem('artik_xp')) || 0;

function updateUI() {
    document.getElementById('player-name').innerText = myName + " ✏️";
    const rankText = document.getElementById('player-rank');
    const xpBar = document.getElementById('xp-bar');
    
    let rank = "SILVER I";
    if (myXP >= 1000) rank = "GOLD I";
    if (myXP >= 3000) rank = "PLATINUM I";
    
    rankText.innerText = rank;
    xpBar.style.width = (myXP % 1000) / 10 + "%";
}

document.getElementById('player-name').onclick = () => {
    const name = prompt("Введите никнейм:", myName);
    if (name) {
        myName = name;
        localStorage.setItem('artik_name', myName);
        updateUI();
    }
};

// Онлайн
socket.on('update_online', (count) => {
    document.getElementById('online-count').innerText = "Онлайн: " + count;
});

// Игровая логика
function startGame(mode) {
    document.getElementById('main-menu').style.display = 'none';
    document.getElementById('game-zone').style.display = 'block';
    
    if (mode === 'bot') {
        document.getElementById('status-text').innerText = "БОТ ЗАГАДАЛ СЛОВО!";
    } else {
        document.getElementById('status-text').innerText = "ОТГАДЫВАЙТЕ СЛОВО!";
    }
    
    initBoard();
    initKeyboard();
}

function initBoard() {
    const board = document.getElementById('board');
    board.innerHTML = '';
    for (let i = 0; i < 30; i++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.id = 'cell-' + i;
        board.appendChild(cell);
    }
}

function initKeyboard() {
    const keys = [
        ['й','ц','у','к','е','н','г','ш','щ','з','х','ъ'],
        ['ф','ы','в','а','п','р','о','л','д','ж','э'],
        ['ввод','я','ч','с','м','и','т','ь','б','ю','⌫']
    ];
    const kb = document.getElementById('keyboard');
    kb.innerHTML = '';
    
    keys.forEach(row => {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'key-row';
        row.forEach(key => {
            const btn = document.createElement('button');
            btn.className = 'key';
            if (key === 'ввод' || key === '⌫') btn.classList.add('wide');
            btn.innerText = key;
            rowDiv.appendChild(btn);
        });
        kb.appendChild(rowDiv);
    });
}

function onWin() {
    myXP += 150;
    localStorage.setItem('artik_xp', myXP);
    updateUI();
    document.getElementById('status-text').innerHTML = "<span style='color:#538d4e'>ПОБЕДА! +150 XP</span>";
}

updateUI();
