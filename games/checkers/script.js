const canvas = document.getElementById('checkers-board');
const context = canvas.getContext('2d');

// Game Constants
const BOARD_SIZE = 8;
const SQUARE_SIZE = canvas.width / BOARD_SIZE;
const COLORS = {
    light: '#2a2a3e',
    dark: '#1a1a2e',
    highlight: 'rgba(0, 243, 255, 0.3)',
    move: 'rgba(0, 255, 136, 0.3)',
    capture: 'rgba(255, 0, 110, 0.3)',
    cyan: '#00f3ff',
    pink: '#ff006e',
    king: '#ffd000'
};

// Game State
let board = [];
let turn = 'cyan'; // 'cyan' (bottom) or 'pink' (top)
let selectedPiece = null;
let possibleMoves = [];
let mustCapture = false;
let isGameOver = false;
let cyanCount = 12;
let pinkCount = 12;

// Piece Class
class Piece {
    constructor(row, col, color) {
        this.row = row;
        this.col = col;
        this.color = color;
        this.isKing = false;
    }
}

// Initialize Board
function initBoard() {
    board = Array(8).fill(null).map(() => Array(8).fill(null));
    cyanCount = 12;
    pinkCount = 12;
    turn = 'cyan';
    isGameOver = false;
    selectedPiece = null;
    possibleMoves = [];

    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            if ((r + c) % 2 === 1) {
                if (r < 3) {
                    board[r][c] = new Piece(r, c, 'pink');
                } else if (r > 4) {
                    board[r][c] = new Piece(r, c, 'cyan');
                }
            }
        }
    }
    updateStats();
}

// Input Handling
canvas.addEventListener('mousedown', handleMouseClick);

function handleMouseClick(e) {
    if (isGameOver) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const col = Math.floor(x / SQUARE_SIZE);
    const row = Math.floor(y / SQUARE_SIZE);

    if (col >= 0 && col < 8 && row >= 0 && row < 8) {
        handleSquareClick(row, col);
    }
}

function handleSquareClick(row, col) {
    // If clicking a possible move
    const move = possibleMoves.find(m => m.r === row && m.c === col);
    if (move) {
        makeMove(move);
        return;
    }

    // Select piece
    const piece = board[row][col];
    if (piece && piece.color === turn) {
        // Check if any capture is mandatory
        const allMoves = getAllPossibleMoves(turn);
        const captureMoves = allMoves.filter(m => m.type === 'capture');

        if (captureMoves.length > 0) {
            // Must select a piece that can capture
            const canCapture = captureMoves.some(m => m.fromR === row && m.fromC === col);
            if (!canCapture) {
                // Visual feedback could be added here (shake or red flash)
                return;
            }
        }

        selectedPiece = piece;
        calculateMoves(piece);

        // Filter moves if capture is mandatory
        if (captureMoves.length > 0) {
            possibleMoves = possibleMoves.filter(m => m.type === 'capture');
        }

        draw();
    } else {
        selectedPiece = null;
        possibleMoves = [];
        draw();
    }
}

function getAllPossibleMoves(playerColor) {
    let moves = [];
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const p = board[r][c];
            if (p && p.color === playerColor) {
                moves = moves.concat(getPieceMoves(p));
            }
        }
    }
    return moves;
}

function calculateMoves(piece) {
    possibleMoves = getPieceMoves(piece);
}

function getPieceMoves(piece) {
    const moves = [];
    const dirs = [];

    if (piece.color === 'cyan' || piece.isKing) {
        dirs.push([-1, -1], [-1, 1]); // Move Up
    }
    if (piece.color === 'pink' || piece.isKing) {
        dirs.push([1, -1], [1, 1]); // Move Down
    }

    dirs.forEach(([dr, dc]) => {
        const r = piece.row + dr;
        const c = piece.col + dc;

        if (isValidPos(r, c)) {
            if (!board[r][c]) {
                // Normal Move
                moves.push({ r, c, type: 'normal', fromR: piece.row, fromC: piece.col });
            } else if (board[r][c].color !== piece.color) {
                // Capture Move
                const jumpR = r + dr;
                const jumpC = c + dc;
                if (isValidPos(jumpR, jumpC) && !board[jumpR][jumpC]) {
                    moves.push({
                        r: jumpR,
                        c: jumpC,
                        type: 'capture',
                        capturedR: r,
                        capturedC: c,
                        fromR: piece.row,
                        fromC: piece.col
                    });
                }
            }
        }
    });
    return moves;
}

function isValidPos(r, c) {
    return r >= 0 && r < 8 && c >= 0 && c < 8;
}

function makeMove(move) {
    const piece = board[selectedPiece.row][selectedPiece.col];

    // Move piece
    board[selectedPiece.row][selectedPiece.col] = null;
    board[move.r][move.c] = piece;
    piece.row = move.r;
    piece.col = move.c;

    // Handle Capture
    let captured = false;
    if (move.type === 'capture') {
        board[move.capturedR][move.capturedC] = null;
        captured = true;
        if (turn === 'cyan') pinkCount--;
        else cyanCount--;
    }

    // King Promotion
    if (!piece.isKing) {
        if ((piece.color === 'cyan' && move.r === 0) ||
            (piece.color === 'pink' && move.r === 7)) {
            piece.isKing = true;
        }
    }

    // Multi-jump Logic
    if (captured) {
        // Check if another capture is possible from new position
        const newMoves = getPieceMoves(piece);
        const captureMoves = newMoves.filter(m => m.type === 'capture');

        if (captureMoves.length > 0) {
            // Must continue capturing
            selectedPiece = piece;
            possibleMoves = captureMoves;
            updateStats();
            draw();
            return; // Turn does not end
        }
    }

    endTurn();
}

function endTurn() {
    turn = turn === 'cyan' ? 'pink' : 'cyan';
    selectedPiece = null;
    possibleMoves = [];

    updateStats();
    checkWinCondition();
    draw();
}

function checkWinCondition() {
    if (cyanCount === 0) {
        gameOver('Pink');
    } else if (pinkCount === 0) {
        gameOver('Cyan');
    } else {
        // Check if current player has any moves
        const moves = getAllPossibleMoves(turn);
        if (moves.length === 0) {
            gameOver(turn === 'cyan' ? 'Pink' : 'Cyan');
        }
    }
}

function gameOver(winner) {
    isGameOver = true;
    document.getElementById('winner-display').innerText = winner;
    document.getElementById('winner-display').style.color = winner === 'Cyan' ? COLORS.cyan : COLORS.pink;
    document.getElementById('game-over-modal').classList.remove('hidden');
}

function updateStats() {
    document.getElementById('cyan-count').innerText = cyanCount;
    document.getElementById('pink-count').innerText = pinkCount;

    const turnEl = document.getElementById('turn-display');
    turnEl.innerText = turn === 'cyan' ? 'Cyan' : 'Pink';
    turnEl.style.color = turn === 'cyan' ? COLORS.cyan : COLORS.pink;
}

function draw() {
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Board
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const isDark = (r + c) % 2 === 1;
            context.fillStyle = isDark ? COLORS.dark : COLORS.light;
            context.fillRect(c * SQUARE_SIZE, r * SQUARE_SIZE, SQUARE_SIZE, SQUARE_SIZE);

            // Highlight Selected
            if (selectedPiece && selectedPiece.row === r && selectedPiece.col === c) {
                context.fillStyle = COLORS.highlight;
                context.fillRect(c * SQUARE_SIZE, r * SQUARE_SIZE, SQUARE_SIZE, SQUARE_SIZE);
            }

            // Highlight Moves
            const move = possibleMoves.find(m => m.r === r && m.c === c);
            if (move) {
                context.fillStyle = move.type === 'capture' ? COLORS.capture : COLORS.move;
                context.beginPath();
                context.arc(c * SQUARE_SIZE + SQUARE_SIZE / 2, r * SQUARE_SIZE + SQUARE_SIZE / 2, SQUARE_SIZE / 6, 0, Math.PI * 2);
                context.fill();
            }
        }
    }

    // Draw Pieces
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const piece = board[r][c];
            if (piece) {
                const x = c * SQUARE_SIZE + SQUARE_SIZE / 2;
                const y = r * SQUARE_SIZE + SQUARE_SIZE / 2;
                const radius = SQUARE_SIZE * 0.35;

                context.fillStyle = piece.color === 'cyan' ? COLORS.cyan : COLORS.pink;
                context.shadowBlur = 15;
                context.shadowColor = piece.color === 'cyan' ? COLORS.cyan : COLORS.pink;

                context.beginPath();
                context.arc(x, y, radius, 0, Math.PI * 2);
                context.fill();

                // Inner circle for detail
                context.fillStyle = 'rgba(0,0,0,0.3)';
                context.beginPath();
                context.arc(x, y, radius * 0.6, 0, Math.PI * 2);
                context.fill();

                if (piece.isKing) {
                    context.fillStyle = COLORS.king;
                    context.shadowColor = COLORS.king;
                    context.font = `${radius}px Arial`;
                    context.textAlign = 'center';
                    context.textBaseline = 'middle';
                    context.fillText('👑', x, y + 2);
                }

                context.shadowBlur = 0;
            }
        }
    }
}

// Event Listeners
document.getElementById('btn-start').addEventListener('click', () => {
    document.getElementById('menu-overlay').classList.add('hidden');
    initBoard();
    draw();
});

document.getElementById('restart-btn').addEventListener('click', () => {
    document.getElementById('game-over-modal').classList.add('hidden');
    initBoard();
    draw();
});

function quitToMenu() {
    window.location.href = 'index.html';
}

document.getElementById('btn-quit').addEventListener('click', quitToMenu);
document.getElementById('btn-menu-return').addEventListener('click', quitToMenu);
document.getElementById('menu-from-gameover').addEventListener('click', quitToMenu);

// Init
initBoard();
draw();
document.getElementById('menu-overlay').classList.remove('hidden');
