const canvas = document.getElementById('chess-board');
const context = canvas.getContext('2d');

// Game Constants
const BOARD_SIZE = 8;
const SQUARE_SIZE = canvas.width / BOARD_SIZE;
const PIECES = {
    w: { k: '♔', q: '♕', r: '♖', b: '♗', n: '♘', p: '♙' },
    b: { k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟' }
};
const COLORS = {
    light: '#2a2a3e',
    dark: '#1a1a2e',
    highlight: 'rgba(0, 243, 255, 0.3)',
    move: 'rgba(0, 255, 136, 0.3)',
    capture: 'rgba(255, 0, 110, 0.3)',
    check: 'rgba(255, 208, 0, 0.5)',
    white: '#00f3ff',
    black: '#ff006e'
};

// Game State
let board = [];
let turn = 'w'; // 'w' or 'b'
let selectedSquare = null;
let possibleMoves = [];
let castlingRights = { w: { k: true, q: true }, b: { k: true, q: true } };
let enPassantTarget = null; // {r, c}
let halfMoveClock = 0;
let fullMoveNumber = 1;
let capturedPieces = { w: [], b: [] };
let isGameOver = false;
let promotionPending = null; // {r, c, fromR, fromC}

// Initialize Board
function initBoard() {
    // Lowercase for black, Uppercase for white in FEN, but here we use object structure
    // { type: 'p', color: 'w', hasMoved: false }
    board = Array(8).fill(null).map(() => Array(8).fill(null));

    const setupRow = (row, color, pieces) => {
        pieces.forEach((p, col) => {
            board[row][col] = { type: p, color: color, hasMoved: false };
        });
    };

    setupRow(0, 'b', ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r']);
    setupRow(1, 'b', Array(8).fill('p'));
    setupRow(6, 'w', Array(8).fill('p'));
    setupRow(7, 'w', ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r']);
}

// Input Handling
canvas.addEventListener('mousedown', handleMouseClick);

function handleMouseClick(e) {
    if (isGameOver || promotionPending) return;

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
        selectedSquare = { r: row, c: col };
        calculateMoves(row, col);
        draw();
    } else {
        selectedSquare = null;
        possibleMoves = [];
        draw();
    }
}

function calculateMoves(row, col) {
    possibleMoves = [];
    const piece = board[row][col];
    if (!piece) return;

    // Helper to add move if valid
    const addMove = (r, c, type = 'normal') => {
        if (r >= 0 && r < 8 && c >= 0 && c < 8) {
            const target = board[r][c];
            if (!target || target.color !== piece.color) {
                // Simulate move to check for check
                if (!isKingInCheckAfterMove(row, col, r, c)) {
                    possibleMoves.push({ r, c, type });
                }
            }
        }
    };

    const directions = {
        n: [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]],
        b: [[-1, -1], [-1, 1], [1, -1], [1, 1]],
        r: [[-1, 0], [1, 0], [0, -1], [0, 1]],
        q: [[-1, -1], [-1, 1], [1, -1], [1, 1], [-1, 0], [1, 0], [0, -1], [0, 1]],
        k: [[-1, -1], [-1, 1], [1, -1], [1, 1], [-1, 0], [1, 0], [0, -1], [0, 1]]
    };

    // Pawn Logic
    if (piece.type === 'p') {
        const dir = piece.color === 'w' ? -1 : 1;
        const startRow = piece.color === 'w' ? 6 : 1;

        // Move forward 1
        if (!board[row + dir][col]) {
            if (!isKingInCheckAfterMove(row, col, row + dir, col)) {
                possibleMoves.push({ r: row + dir, c: col, type: 'normal' });
                // Move forward 2
                if (row === startRow && !board[row + dir * 2][col]) {
                    if (!isKingInCheckAfterMove(row, col, row + dir * 2, col)) {
                        possibleMoves.push({ r: row + dir * 2, c: col, type: 'double' });
                    }
                }
            }
        }

        // Captures
        [[dir, -1], [dir, 1]].forEach(([dr, dc]) => {
            const tr = row + dr;
            const tc = col + dc;
            if (tr >= 0 && tr < 8 && tc >= 0 && tc < 8) {
                const target = board[tr][tc];
                if (target && target.color !== piece.color) {
                    if (!isKingInCheckAfterMove(row, col, tr, tc)) {
                        possibleMoves.push({ r: tr, c: tc, type: 'capture' });
                    }
                }
                // En Passant
                if (enPassantTarget && enPassantTarget.r === tr && enPassantTarget.c === tc) {
                    if (!isKingInCheckAfterMove(row, col, tr, tc)) {
                        possibleMoves.push({ r: tr, c: tc, type: 'enpassant' });
                    }
                }
            }
        });
    }

    // Knight Logic
    else if (piece.type === 'n') {
        directions.n.forEach(([dr, dc]) => addMove(row + dr, col + dc));
    }

    // King Logic
    else if (piece.type === 'k') {
        directions.k.forEach(([dr, dc]) => addMove(row + dr, col + dc));
        // Castling
        if (!piece.hasMoved && !isSquareAttacked(row, col, turn === 'w' ? 'b' : 'w')) {
            // Kingside
            if (castlingRights[turn].k && !board[row][col + 1] && !board[row][col + 2]) {
                if (!isSquareAttacked(row, col + 1, turn === 'w' ? 'b' : 'w') &&
                    !isSquareAttacked(row, col + 2, turn === 'w' ? 'b' : 'w')) {
                    possibleMoves.push({ r: row, c: col + 2, type: 'castling-k' });
                }
            }
            // Queenside
            if (castlingRights[turn].q && !board[row][col - 1] && !board[row][col - 2] && !board[row][col - 3]) {
                if (!isSquareAttacked(row, col - 1, turn === 'w' ? 'b' : 'w') &&
                    !isSquareAttacked(row, col - 2, turn === 'w' ? 'b' : 'w')) {
                    possibleMoves.push({ r: row, c: col - 2, type: 'castling-q' });
                }
            }
        }
    }

    // Sliding Pieces (Rook, Bishop, Queen)
    else {
        const dirs = directions[piece.type];
        dirs.forEach(([dr, dc]) => {
            let r = row + dr;
            let c = col + dc;
            while (r >= 0 && r < 8 && c >= 0 && c < 8) {
                const target = board[r][c];
                if (!target) {
                    if (!isKingInCheckAfterMove(row, col, r, c)) {
                        possibleMoves.push({ r, c, type: 'normal' });
                    }
                } else {
                    if (target.color !== piece.color) {
                        if (!isKingInCheckAfterMove(row, col, r, c)) {
                            possibleMoves.push({ r, c, type: 'capture' });
                        }
                    }
                    break; // Blocked
                }
                r += dr;
                c += dc;
            }
        });
    }
}

function isKingInCheckAfterMove(fromR, fromC, toR, toC) {
    // Simulate move
    const tempBoard = JSON.parse(JSON.stringify(board));
    const piece = tempBoard[fromR][fromC];
    tempBoard[toR][toC] = piece;
    tempBoard[fromR][fromC] = null;

    // Find King
    let kingR, kingC;
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const p = tempBoard[r][c];
            if (p && p.type === 'k' && p.color === turn) {
                kingR = r;
                kingC = c;
                break;
            }
        }
    }

    // Check if King is attacked
    return isSquareAttackedOnBoard(tempBoard, kingR, kingC, turn === 'w' ? 'b' : 'w');
}

function isSquareAttacked(r, c, attackerColor) {
    return isSquareAttackedOnBoard(board, r, c, attackerColor);
}

function isSquareAttackedOnBoard(boardState, r, c, attackerColor) {
    // Check all squares for pieces of attackerColor that can hit (r, c)
    // Simplified: iterate all attacker pieces and see if they can move to (r, c)
    // Optimization: check from (r, c) outwards like a Queen/Knight to find attackers

    const directions = {
        n: [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]],
        diag: [[-1, -1], [-1, 1], [1, -1], [1, 1]],
        ortho: [[-1, 0], [1, 0], [0, -1], [0, 1]]
    };

    // Check Knights
    for (let [dr, dc] of directions.n) {
        const tr = r + dr, tc = c + dc;
        if (tr >= 0 && tr < 8 && tc >= 0 && tc < 8) {
            const p = boardState[tr][tc];
            if (p && p.color === attackerColor && p.type === 'n') return true;
        }
    }

    // Check Sliding (Queen, Rook, Bishop)
    for (let [dr, dc] of directions.ortho) {
        let tr = r + dr, tc = c + dc;
        while (tr >= 0 && tr < 8 && tc >= 0 && tc < 8) {
            const p = boardState[tr][tc];
            if (p) {
                if (p.color === attackerColor && (p.type === 'r' || p.type === 'q')) return true;
                break;
            }
            tr += dr; tc += dc;
        }
    }
    for (let [dr, dc] of directions.diag) {
        let tr = r + dr, tc = c + dc;
        while (tr >= 0 && tr < 8 && tc >= 0 && tc < 8) {
            const p = boardState[tr][tc];
            if (p) {
                if (p.color === attackerColor && (p.type === 'b' || p.type === 'q')) return true;
                break;
            }
            tr += dr; tc += dc;
        }
    }

    // Check Pawns
    const pawnDir = attackerColor === 'w' ? -1 : 1; // White pawns attack up (-1), Black down (1)
    // Wait, if I am White King at (r, c), I am attacked by Black Pawn at (r-1, c±1)
    // Attacker is Black (1). Pawn at (r-1) moves down to r.
    const attackRow = r - (attackerColor === 'w' ? 1 : -1); // Look where pawn comes from
    if (attackRow >= 0 && attackRow < 8) {
        if (c - 1 >= 0) {
            const p = boardState[attackRow][c - 1];
            if (p && p.color === attackerColor && p.type === 'p') return true;
        }
        if (c + 1 < 8) {
            const p = boardState[attackRow][c + 1];
            if (p && p.color === attackerColor && p.type === 'p') return true;
        }
    }

    // Check King
    for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue;
            const tr = r + dr, tc = c + dc;
            if (tr >= 0 && tr < 8 && tc >= 0 && tc < 8) {
                const p = boardState[tr][tc];
                if (p && p.color === attackerColor && p.type === 'k') return true;
            }
        }
    }

    return false;
}

function makeMove(move) {
    const piece = board[selectedSquare.r][selectedSquare.c];
    const target = board[move.r][move.c];

    // Capture
    if (target) {
        capturedPieces[turn].push(target.type);
        updateCapturedDisplay();
    } else if (move.type === 'enpassant') {
        // Remove captured pawn
        const dir = turn === 'w' ? 1 : -1;
        capturedPieces[turn].push('p');
        board[move.r + dir][move.c] = null;
        updateCapturedDisplay();
    }

    // Move
    board[move.r][move.c] = piece;
    board[selectedSquare.r][selectedSquare.c] = null;
    piece.hasMoved = true;

    // Castling Move Rook
    if (move.type === 'castling-k') {
        const rook = board[move.r][7];
        board[move.r][5] = rook;
        board[move.r][7] = null;
        rook.hasMoved = true;
    } else if (move.type === 'castling-q') {
        const rook = board[move.r][0];
        board[move.r][3] = rook;
        board[move.r][0] = null;
        rook.hasMoved = true;
    }

    // Promotion
    if (piece.type === 'p' && (move.r === 0 || move.r === 7)) {
        promotionPending = { r: move.r, c: move.c };
        showPromotionModal();
        draw();
        return; // Wait for selection
    }

    finalizeTurn(move, piece);
}

function finalizeTurn(move, piece) {
    // En Passant Target
    if (piece.type === 'p' && Math.abs(move.r - selectedSquare.r) === 2) {
        enPassantTarget = { r: (move.r + selectedSquare.r) / 2, c: move.c };
    } else {
        enPassantTarget = null;
    }

    // Switch Turn
    turn = turn === 'w' ? 'b' : 'w';
    selectedSquare = null;
    possibleMoves = [];

    // Check for Checkmate/Stalemate
    if (isCheckmate()) {
        gameOver();
    } else {
        updateStatus();
        draw();
    }
}

function showPromotionModal() {
    document.getElementById('promotion-modal').classList.remove('hidden');
}

document.querySelectorAll('.promo-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const type = e.target.dataset.piece;
        board[promotionPending.r][promotionPending.c].type = type;
        document.getElementById('promotion-modal').classList.add('hidden');

        // Need to reconstruct move info for finalizeTurn, but simplified here
        const piece = board[promotionPending.r][promotionPending.c];
        // Mock move object
        const move = { r: promotionPending.r, c: promotionPending.c };
        promotionPending = null;

        finalizeTurn(move, piece);
    });
});

function isCheckmate() {
    // Check if current player has any valid moves
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const p = board[r][c];
            if (p && p.color === turn) {
                // Temporarily select to calc moves
                // This is inefficient but works
                // We need a way to calc moves without selecting
                // Refactoring calculateMoves to accept piece would be better
                // For now, let's just use the existing structure by mocking selection
                // Actually, calculateMoves relies on `board[row][col]` so we can just call it
                // But it sets `possibleMoves` global. We need a pure function.
                // Let's hack it:
                const oldPossible = possibleMoves;
                calculateMoves(r, c);
                if (possibleMoves.length > 0) {
                    possibleMoves = oldPossible;
                    return false;
                }
                possibleMoves = oldPossible;
            }
        }
    }
    return true;
}

function gameOver() {
    isGameOver = true;
    const winner = turn === 'w' ? 'Preto' : 'Branco';
    document.getElementById('winner-display').innerText = winner;
    document.getElementById('game-over-modal').classList.remove('hidden');
}

function updateStatus() {
    const statusEl = document.getElementById('game-status');
    const turnEl = document.getElementById('turn-display');

    turnEl.innerText = turn === 'w' ? 'Branco' : 'Preto';
    turnEl.style.color = turn === 'w' ? COLORS.white : COLORS.black;

    // Check if King is in check
    let kingR, kingC;
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const p = board[r][c];
            if (p && p.type === 'k' && p.color === turn) {
                kingR = r; kingC = c; break;
            }
        }
    }
    if (isSquareAttacked(kingR, kingC, turn === 'w' ? 'b' : 'w')) {
        statusEl.innerText = "XEQUE!";
        statusEl.style.color = COLORS.check;
    } else {
        statusEl.innerText = "Em Jogo";
        statusEl.style.color = "#fff";
    }
}

function updateCapturedDisplay() {
    const wContainer = document.getElementById('captured-white');
    const bContainer = document.getElementById('captured-black');

    wContainer.innerText = capturedPieces.w.map(p => PIECES.b[p]).join(' ');
    bContainer.innerText = capturedPieces.b.map(p => PIECES.w[p]).join(' ');
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
            if (selectedSquare && selectedSquare.r === r && selectedSquare.c === c) {
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
    context.font = `${SQUARE_SIZE * 0.8}px Outfit, serif`; // Use serif for chess pieces usually looks better, but Outfit is sans. Let's try standard font for symbols.
    context.font = `${SQUARE_SIZE * 0.75}px sans-serif`;
    context.textAlign = 'center';
    context.textBaseline = 'middle';

    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const piece = board[r][c];
            if (piece) {
                context.fillStyle = piece.color === 'w' ? COLORS.white : COLORS.black;
                context.shadowBlur = 10;
                context.shadowColor = piece.color === 'w' ? COLORS.white : COLORS.black;
                context.fillText(PIECES[piece.color][piece.type], c * SQUARE_SIZE + SQUARE_SIZE / 2, r * SQUARE_SIZE + SQUARE_SIZE / 2 + 5);
                context.shadowBlur = 0;
            }
        }
    }
}

function initGame() {
    initBoard();
    turn = 'w';
    selectedSquare = null;
    possibleMoves = [];
    capturedPieces = { w: [], b: [] };
    isGameOver = false;
    promotionPending = null;
    updateStatus();
    updateCapturedDisplay();
    draw();
    document.getElementById('menu-overlay').classList.add('hidden');
    document.getElementById('game-over-modal').classList.add('hidden');
}

// Event Listeners
document.getElementById('btn-start').addEventListener('click', initGame);
document.getElementById('restart-btn').addEventListener('click', initGame);
document.getElementById('btn-quit').addEventListener('click', () => window.location.href = 'index.html');
document.getElementById('btn-menu-return').addEventListener('click', () => window.location.href = 'index.html');
document.getElementById('menu-from-gameover').addEventListener('click', () => window.location.href = 'index.html');

// Initial Draw
initBoard();
draw();
document.getElementById('menu-overlay').classList.remove('hidden');
