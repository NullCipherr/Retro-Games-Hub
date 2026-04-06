const canvas = document.getElementById('minesweeper');
const context = canvas.getContext('2d');

// Game Constants
const COLORS = {
    1: '#00f3ff', // Cyan
    2: '#00ff88', // Green
    3: '#ffd000', // Yellow
    4: '#ff006e', // Pink
    5: '#bc13fe', // Purple
    6: '#ff6600', // Orange
    7: '#ffffff', // White
    8: '#888888', // Gray
    mine: '#ff0000',
    flag: '#ffd000',
    hidden: '#1a1a2e',
    revealed: '#0a0a14',
    border: '#2a2a3e'
};

// Game State
let grid = [];
let rows = 10;
let cols = 10;
let minesCount = 10;
let cellSize = 0;
let flagsPlaced = 0;
let isGameOver = false;
let isGameWon = false;
let isFirstClick = true;
let startTime = 0;
let timerInterval = null;

// Difficulty Settings
const DIFFICULTIES = {
    easy: { rows: 10, cols: 10, mines: 10 },
    medium: { rows: 15, cols: 15, mines: 30 },
    hard: { rows: 20, cols: 20, mines: 60 }
};
let currentDifficulty = 'easy';

// Cell Class
class Cell {
    constructor(row, col) {
        this.row = row;
        this.col = col;
        this.isMine = false;
        this.isRevealed = false;
        this.isFlagged = false;
        this.neighborMines = 0;
    }
}

// Input Handling
canvas.addEventListener('mousedown', handleMouseClick);
canvas.addEventListener('contextmenu', e => e.preventDefault());

function handleMouseClick(e) {
    if (isGameOver || isGameWon) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const col = Math.floor(x / cellSize);
    const row = Math.floor(y / cellSize);

    if (row >= 0 && row < rows && col >= 0 && col < cols) {
        if (e.button === 0) { // Left Click
            revealCell(row, col);
        } else if (e.button === 2) { // Right Click
            toggleFlag(row, col);
        }
    }
}

function initGame() {
    const config = DIFFICULTIES[currentDifficulty];
    rows = config.rows;
    cols = config.cols;
    minesCount = config.mines;

    // Calculate cell size to fit canvas
    cellSize = canvas.width / cols;
    canvas.height = cellSize * rows;

    grid = [];
    flagsPlaced = 0;
    isGameOver = false;
    isGameWon = false;
    isFirstClick = true;

    clearInterval(timerInterval);
    document.getElementById('timer').innerText = "00:00";
    document.getElementById('mines-count').innerText = minesCount;
    document.getElementById('flags-count').innerText = flagsPlaced;

    // Initialize Grid
    for (let r = 0; r < rows; r++) {
        grid[r] = [];
        for (let c = 0; c < cols; c++) {
            grid[r][c] = new Cell(r, c);
        }
    }

    draw();
}

function placeMines(excludeRow, excludeCol) {
    let minesPlaced = 0;
    while (minesPlaced < minesCount) {
        const r = Math.floor(Math.random() * rows);
        const c = Math.floor(Math.random() * cols);

        // Don't place mine on first click or neighbors
        if (!grid[r][c].isMine &&
            (Math.abs(r - excludeRow) > 1 || Math.abs(c - excludeCol) > 1)) {
            grid[r][c].isMine = true;
            minesPlaced++;
        }
    }

    calculateNeighbors();
}

function calculateNeighbors() {
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (!grid[r][c].isMine) {
                let count = 0;
                for (let i = -1; i <= 1; i++) {
                    for (let j = -1; j <= 1; j++) {
                        if (r + i >= 0 && r + i < rows && c + j >= 0 && c + j < cols) {
                            if (grid[r + i][c + j].isMine) count++;
                        }
                    }
                }
                grid[r][c].neighborMines = count;
            }
        }
    }
}

function revealCell(row, col) {
    const cell = grid[row][col];

    if (cell.isRevealed || cell.isFlagged) return;

    if (isFirstClick) {
        placeMines(row, col);
        isFirstClick = false;
        startTimer();
    }

    cell.isRevealed = true;

    if (cell.isMine) {
        gameOver();
    } else if (cell.neighborMines === 0) {
        floodFill(row, col);
    }

    checkWin();
    draw();
}

function floodFill(row, col) {
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            const r = row + i;
            const c = col + j;

            if (r >= 0 && r < rows && c >= 0 && c < cols) {
                const neighbor = grid[r][c];
                if (!neighbor.isRevealed && !neighbor.isFlagged) {
                    revealCell(r, c);
                }
            }
        }
    }
}

function toggleFlag(row, col) {
    const cell = grid[row][col];

    if (cell.isRevealed) return;

    if (cell.isFlagged) {
        cell.isFlagged = false;
        flagsPlaced--;
    } else {
        if (flagsPlaced < minesCount) {
            cell.isFlagged = true;
            flagsPlaced++;
        }
    }

    document.getElementById('flags-count').innerText = flagsPlaced;
    draw();
}

function startTimer() {
    startTime = Date.now();
    timerInterval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
        const seconds = (elapsed % 60).toString().padStart(2, '0');
        document.getElementById('timer').innerText = `${minutes}:${seconds}`;
    }, 1000);
}

function gameOver() {
    isGameOver = true;
    clearInterval(timerInterval);

    // Reveal all mines
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (grid[r][c].isMine) {
                grid[r][c].isRevealed = true;
            }
        }
    }

    document.getElementById('game-over-modal').classList.remove('hidden');
    document.getElementById('final-time').innerText = document.getElementById('timer').innerText;
}

function checkWin() {
    if (isGameOver) return;

    let revealedCount = 0;
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (grid[r][c].isRevealed) revealedCount++;
        }
    }

    if (revealedCount === (rows * cols) - minesCount) {
        isGameWon = true;
        clearInterval(timerInterval);
        document.getElementById('victory-modal').classList.remove('hidden');
        document.getElementById('victory-time').innerText = document.getElementById('timer').innerText;
    }
}

function draw() {
    context.clearRect(0, 0, canvas.width, canvas.height);

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const cell = grid[r][c];
            const x = c * cellSize;
            const y = r * cellSize;

            // Draw Cell Background
            context.fillStyle = cell.isRevealed ? COLORS.revealed : COLORS.hidden;
            context.fillRect(x, y, cellSize, cellSize);

            // Draw Border
            context.strokeStyle = COLORS.border;
            context.lineWidth = 1;
            context.strokeRect(x, y, cellSize, cellSize);

            if (cell.isRevealed) {
                if (cell.isMine) {
                    // Draw Mine
                    context.fillStyle = COLORS.mine;
                    context.shadowBlur = 10;
                    context.shadowColor = COLORS.mine;
                    context.beginPath();
                    context.arc(x + cellSize / 2, y + cellSize / 2, cellSize / 4, 0, Math.PI * 2);
                    context.fill();
                    context.shadowBlur = 0;
                } else if (cell.neighborMines > 0) {
                    // Draw Number
                    context.fillStyle = COLORS[cell.neighborMines];
                    context.font = `bold ${cellSize * 0.6}px Outfit`;
                    context.textAlign = 'center';
                    context.textBaseline = 'middle';
                    context.shadowBlur = 5;
                    context.shadowColor = COLORS[cell.neighborMines];
                    context.fillText(cell.neighborMines, x + cellSize / 2, y + cellSize / 2);
                    context.shadowBlur = 0;
                }
            } else if (cell.isFlagged) {
                // Draw Flag
                context.fillStyle = COLORS.flag;
                context.shadowBlur = 10;
                context.shadowColor = COLORS.flag;
                context.beginPath();
                context.moveTo(x + cellSize * 0.3, y + cellSize * 0.8);
                context.lineTo(x + cellSize * 0.3, y + cellSize * 0.2);
                context.lineTo(x + cellSize * 0.7, y + cellSize * 0.35);
                context.lineTo(x + cellSize * 0.3, y + cellSize * 0.5);
                context.fill();
                context.shadowBlur = 0;
            }
        }
    }
}

// UI Event Listeners
document.querySelectorAll('.diff-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('selected'));
        e.target.classList.add('selected');
        currentDifficulty = e.target.dataset.diff;
    });
});

document.getElementById('btn-start').addEventListener('click', () => {
    document.getElementById('menu-overlay').classList.add('hidden');
    initGame();
});

document.getElementById('restart-btn').addEventListener('click', () => {
    document.getElementById('game-over-modal').classList.add('hidden');
    initGame();
});

document.getElementById('next-level-btn').addEventListener('click', () => {
    document.getElementById('victory-modal').classList.add('hidden');
    initGame();
});

function quitToMenu() {
    window.location.href = 'index.html';
}

document.getElementById('btn-quit').addEventListener('click', quitToMenu);
document.getElementById('btn-menu-return').addEventListener('click', quitToMenu);
document.getElementById('menu-from-gameover').addEventListener('click', quitToMenu);
document.getElementById('menu-from-victory').addEventListener('click', quitToMenu);

// Initial Draw (Empty Grid)
initGame();
document.getElementById('menu-overlay').classList.remove('hidden'); // Show menu initially
