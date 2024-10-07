// Theme Switcher
const themeToggle = document.getElementById('theme-toggle');
const htmlElement = document.documentElement;
themeToggle.addEventListener('click', () => {
    if (htmlElement.classList.contains('dark')) {
        htmlElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
    } else {
        htmlElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
    }
});

// Load Theme Preference
if (localStorage.getItem('theme') === 'dark') {
    htmlElement.classList.add('dark');
} else {
    htmlElement.classList.remove('dark');
}

// Game Logic
const cells = document.querySelectorAll('.cell');
const gameModeSelect = document.getElementById('game-mode');
const undoBtn = document.getElementById('undo-btn');
const redoBtn = document.getElementById('redo-btn');
const resetBtn = document.getElementById('reset-btn');
const playerXHistory = document.getElementById('playerX-history');
const playerOHistory = document.getElementById('playerO-history');
const clickSound = document.getElementById('click-sound');
const winSound = document.getElementById('win-sound');
const winnerAnnouncement = document.getElementById('winner-announcement');

let board = ['', '', '', '', '', '', '', '', ''];
let currentPlayer = 'X';
let movesHistory = [];
let redoStack = [];
let isGameActive = true;

// Winning Conditions
const winningConditions = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5 ,8],
    [0, 4, 8],
    [2, 4, 6]
];

// Handle Cell Click
cells.forEach(cell => {
    cell.addEventListener('click', () => {
        const index = cell.getAttribute('data-index');
        if (board[index] !== '' || !isGameActive) return;

        board[index] = currentPlayer;
        cell.textContent = currentPlayer;
        cell.classList.add('transform', 'scale-110');
        setTimeout(() => {
            cell.classList.remove('transform', 'scale-110');
        }, 200);

        clickSound.play();
        movesHistory.push({ player: currentPlayer, index: index });
        redoStack = []; // Clear redo stack on new move
        updateHistory();
        checkResult();
        if (isGameActive) swapPlayer();

        // If playing vs Computer
        if (gameModeSelect.value === 'computer' && currentPlayer === 'O' && isGameActive) {
            setTimeout(computerMove, 500);
        }
    });
});

// Swap Player
function swapPlayer() {
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
}

// Check Game Result
function checkResult() {
    let roundWon = false;
    for (let condition of winningConditions) {
        const [a, b, c] = condition;
        if (board[a] && board[a] === board[b] && board[b] === board[c]) {
            roundWon = true;
            highlightWinningCells(condition);
            announceWinner(currentPlayer);
            break;
        }
    }

    if (roundWon) {
        isGameActive = false;
        winSound.play();
    } else if (!board.includes('')) {
        isGameActive = false;
        announceWinner('Draw');
    }
}

// Announce Winner
function announceWinner(winner) {
    if (winner === 'Draw') {
        winnerAnnouncement.textContent = "It's a Draw!";
    } else {
        winnerAnnouncement.textContent = `Player ${winner} Wins!`;
    }
}

// Highlight Winning Cells
function highlightWinningCells(condition) {
    condition.forEach(index => {
        cells[index].classList.add('bg-green-300', 'dark:bg-green-500');
    });
}

// Computer Move
function computerMove() {
    let availableCells = board.map((cell, index) => cell === '' ? index : null).filter(val => val !== null);
    if (availableCells.length === 0) return;
    let randomIndex = availableCells[Math.floor(Math.random() * availableCells.length)];
    board[randomIndex] = currentPlayer;
    const cell = document.querySelector(`.cell[data-index='${randomIndex}']`);
    cell.textContent = currentPlayer;
    cell.classList.add('transform', 'scale-110');
    setTimeout(() => {
        cell.classList.remove('transform', 'scale-110');
    }, 200);

    clickSound.play();
    movesHistory.push({ player: currentPlayer, index: randomIndex });
    redoStack = []; // Clear redo stack on new move
    updateHistory();
    checkResult();
    if (isGameActive) swapPlayer();
}

// Update Move History
function updateHistory() {
    playerXHistory.innerHTML = '';
    playerOHistory.innerHTML = '';
    movesHistory.forEach((move, idx) => {
        const li = document.createElement('li');
        li.textContent = `Move ${idx + 1}: Cell ${parseInt(move.index) + 1}`;
        if (move.player === 'X') {
            playerXHistory.appendChild(li);
        } else {
            playerOHistory.appendChild(li);
        }
    });
}

// Undo Move
undoBtn.addEventListener('click', () => {
    if (movesHistory.length === 0 || !isGameActive) return;
    const lastMove = movesHistory.pop();
    redoStack.push(lastMove);
    board[lastMove.index] = '';
    const cell = document.querySelector(`.cell[data-index='${lastMove.index}']`);
    cell.textContent = '';
    isGameActive = true;
    winnerAnnouncement.textContent = '';
    resetCellStyles();
    swapPlayer();
    updateHistory();
});

// Redo Move
redoBtn.addEventListener('click', () => {
    if (redoStack.length === 0 || !isGameActive) return;
    const move = redoStack.pop();
    board[move.index] = move.player;
    const cell = document.querySelector(`.cell[data-index='${move.index}']`);
    cell.textContent = move.player;
    movesHistory.push(move);
    updateHistory();
    checkResult();
    if (isGameActive) swapPlayer();
});

// Reset Game
resetBtn.addEventListener('click', resetGame);

// Reset Game Function
function resetGame() {
    board = ['', '', '', '', '', '', '', '', ''];
    currentPlayer = 'X';
    movesHistory = [];
    redoStack = [];
    isGameActive = true;
    winnerAnnouncement.textContent = '';
    cells.forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('bg-green-300', 'dark:bg-green-500');
    });
    resetCellStyles();
    playerXHistory.innerHTML = '';
    playerOHistory.innerHTML = '';
}

// Reset Cell Styles
function resetCellStyles() {
    cells.forEach(cell => {
        cell.classList.remove('bg-green-300', 'dark:bg-green-500');
    });
}

// Reset Game on Mode Change
gameModeSelect.addEventListener('change', resetGame);
