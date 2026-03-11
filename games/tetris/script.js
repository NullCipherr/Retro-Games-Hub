const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');
const nextCanvas = document.getElementById('next-piece');
const nextContext = nextCanvas.getContext('2d');

// Scale for the main board (300x600 / 10x20 = 30px per block)
context.scale(30, 30);
// Scale for next piece preview (80x80 / 4x4 = 20px per block approx)
nextContext.scale(20, 20);

// Game State
let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;
let isPaused = false;
let isGameOver = false;
let isPlaying = false; // New state for Menu

// Options
let difficulty = 'normal';
let showGhost = true;
let showParticles = true;

const colors = [
    null,
    '#a000f0', // T - Purple
    '#f0f000', // O - Yellow
    '#f0a000', // L - Orange
    '#0000f0', // J - Blue
    '#00f0f0', // I - Cyan
    '#00f000', // S - Green
    '#f00000', // Z - Red
];

const arena = createMatrix(10, 20);

const player = {
    pos: { x: 0, y: 0 },
    matrix: null,
    score: 0,
    level: 1,
    lines: 0,
    next: null,
};

// --- Core Functions ---

function createMatrix(w, h) {
    const matrix = [];
    while (h--) {
        matrix.push(new Array(w).fill(0));
    }
    return matrix;
}

function createPiece(type) {
    if (type === 'I') {
        return [
            [0, 5, 0, 0],
            [0, 5, 0, 0],
            [0, 5, 0, 0],
            [0, 5, 0, 0],
        ];
    } else if (type === 'L') {
        return [
            [0, 3, 0],
            [0, 3, 0],
            [0, 3, 3],
        ];
    } else if (type === 'J') {
        return [
            [0, 4, 0],
            [0, 4, 0],
            [4, 4, 0],
        ];
    } else if (type === 'O') {
        return [
            [2, 2],
            [2, 2],
        ];
    } else if (type === 'Z') {
        return [
            [7, 7, 0],
            [0, 7, 7],
            [0, 0, 0],
        ];
    } else if (type === 'S') {
        return [
            [0, 6, 6],
            [6, 6, 0],
            [0, 0, 0],
        ];
    } else if (type === 'T') {
        return [
            [0, 1, 0],
            [1, 1, 1],
            [0, 0, 0],
        ];
    }
}

function drawMatrix(matrix, offset, ctx, isGhost = false) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                if (isGhost) {
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
                    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
                    ctx.lineWidth = 0.1;
                    ctx.strokeRect(x + offset.x, y + offset.y, 1, 1);
                    ctx.fillRect(x + offset.x, y + offset.y, 1, 1);
                } else {
                    // Draw the block
                    ctx.fillStyle = colors[value];
                    // Add a glow effect
                    ctx.shadowBlur = 10;
                    ctx.shadowColor = colors[value];
                    ctx.fillRect(x + offset.x, y + offset.y, 1, 1);

                    // Reset shadow for clean edges
                    ctx.shadowBlur = 0;

                    // Inner highlight for 3D effect
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
                    ctx.fillRect(x + offset.x + 0.1, y + offset.y + 0.1, 0.8, 0.8);
                }
            }
        });
    });
}

function drawGhost() {
    if (!showGhost || !player.matrix) return;

    const ghostPos = { x: player.pos.x, y: player.pos.y };

    // Drop ghost until collision
    while (!collide(arena, { pos: ghostPos, matrix: player.matrix })) {
        ghostPos.y++;
    }
    ghostPos.y--; // Move back up one step

    drawMatrix(player.matrix, ghostPos, context, true);
}

function draw() {
    // Clear main canvas
    context.fillStyle = '#000';
    context.fillRect(0, 0, canvas.width, canvas.height);

    drawMatrix(arena, { x: 0, y: 0 }, context);

    if (isPlaying && !isPaused && !isGameOver) {
        drawGhost();
        drawMatrix(player.matrix, player.pos, context);
    }
}

function drawNext() {
    // Clear next canvas
    nextContext.clearRect(0, 0, nextCanvas.width, nextCanvas.height); // Clear transparently

    if (player.next) {
        // Center the piece in the 4x4 preview grid
        const offset = {
            x: (4 - player.next[0].length) / 2,
            y: (4 - player.next.length) / 2
        };
        drawMatrix(player.next, offset, nextContext);
    }
}

function merge(arena, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                arena[y + player.pos.y][x + player.pos.x] = value;
            }
        });
    });
}

function rotate(matrix, dir) {
    for (let y = 0; y < matrix.length; ++y) {
        for (let x = 0; x < y; ++x) {
            [
                matrix[x][y],
                matrix[y][x],
            ] = [
                    matrix[y][x],
                    matrix[x][y],
                ];
        }
    }
    if (dir > 0) {
        matrix.forEach(row => row.reverse());
    } else {
        matrix.reverse();
    }
}

function playerDrop() {
    player.pos.y++;
    if (collide(arena, player)) {
        player.pos.y--;
        merge(arena, player);
        playerReset();
        arenaSweep();
        updateScore();
    }
    dropCounter = 0;
}

function playerHardDrop() {
    while (!collide(arena, player)) {
        player.pos.y++;
    }
    player.pos.y--;
    merge(arena, player);
    playerReset();
    arenaSweep();
    updateScore();
    dropCounter = 0;
}

function playerMove(dir) {
    player.pos.x += dir;
    if (collide(arena, player)) {
        player.pos.x -= dir;
    }
}

function playerRotate(dir) {
    const pos = player.pos.x;
    let offset = 1;
    rotate(player.matrix, dir);
    while (collide(arena, player)) {
        player.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if (offset > player.matrix[0].length) {
            rotate(player.matrix, -dir);
            player.pos.x = pos;
            return;
        }
    }
}

function playerReset() {
    const pieces = 'ILJOTSZ';
    if (player.next === null) {
        player.next = createPiece(pieces[pieces.length * Math.random() | 0]);
    }
    player.matrix = player.next;
    player.next = createPiece(pieces[pieces.length * Math.random() | 0]);
    drawNext();

    player.pos.y = 0;
    player.pos.x = (arena[0].length / 2 | 0) - (player.matrix[0].length / 2 | 0);

    if (collide(arena, player)) {
        isGameOver = true;
        isPlaying = false;
        document.getElementById('game-over-modal').classList.remove('hidden');
        document.getElementById('final-score').innerText = player.score;
    }
}

function collide(arena, player) {
    const m = player.matrix;
    const o = player.pos;
    for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x) {
            if (m[y][x] !== 0) {
                const arenaY = y + o.y;
                const arenaX = x + o.x;

                if (arenaY >= arena.length) {
                    return true;
                }

                if (arenaX < 0 || arenaX >= arena[0].length) {
                    return true;
                }

                if (arenaY >= 0 && arena[arenaY][arenaX] !== 0) {
                    return true;
                }
            }
        }
    }
    return false;
}

function arenaSweep() {
    let rowCount = 1;
    outer: for (let y = arena.length - 1; y > 0; --y) {
        for (let x = 0; x < arena[y].length; ++x) {
            if (arena[y][x] === 0) {
                continue outer;
            }
        }

        const row = arena.splice(y, 1)[0].fill(0);
        arena.unshift(row);
        ++y;

        player.score += rowCount * 10;
        player.lines += 1;
        rowCount *= 2;
    }

    // Level up every 10 lines
    player.level = Math.floor(player.lines / 10) + 1;
    updateSpeed();
}

function updateSpeed() {
    let baseSpeed = 1000;

    if (difficulty === 'easy') baseSpeed = 1200;
    if (difficulty === 'hard') baseSpeed = 800;

    // Speed increases with level
    dropInterval = Math.max(100, baseSpeed - (player.level - 1) * 100);
}

function updateScore() {
    document.getElementById('score').innerText = player.score;
    document.getElementById('level').innerText = player.level;
    document.getElementById('lines').innerText = player.lines;
}

function update(time = 0) {
    if (!isPlaying || isPaused || isGameOver) {
        // Still draw the board (background) if paused
        if (isPaused) draw();
        return;
    }

    const deltaTime = time - lastTime;
    lastTime = time;

    dropCounter += deltaTime;
    if (dropCounter > dropInterval) {
        playerDrop();
    }

    draw();
    requestAnimationFrame(update);
}

// --- Controls & Events ---

document.addEventListener('keydown', event => {
    if (!isPlaying || isPaused || isGameOver) return;

    if (event.keyCode === 37) { // Left
        playerMove(-1);
    } else if (event.keyCode === 39) { // Right
        playerMove(1);
    } else if (event.keyCode === 40) { // Down
        playerDrop();
    } else if (event.keyCode === 38) { // Up (Rotate)
        playerRotate(1);
    } else if (event.keyCode === 32) { // Space (Hard Drop)
        playerHardDrop();
    } else if (event.keyCode === 80) { // P (Pause)
        togglePause();
    }
});

function togglePause() {
    if (!isPlaying || isGameOver) return;
    isPaused = !isPaused;
    const modal = document.getElementById('pause-modal');
    if (isPaused) {
        modal.classList.remove('hidden');
    } else {
        modal.classList.add('hidden');
        lastTime = performance.now();
        update();
    }
}

function startGame() {
    document.getElementById('game-over-modal').classList.add('hidden');

    arena.forEach(row => row.fill(0));
    player.score = 0;
    player.lines = 0;
    player.level = 1;
    player.next = null;

    // Load settings from LocalStorage
    difficulty = localStorage.getItem('tetris_difficulty') || 'normal';
    showGhost = localStorage.getItem('tetris_ghost') !== 'false'; // Default true
    showParticles = localStorage.getItem('tetris_particles') !== 'false'; // Default true

    updateSpeed();
    updateScore();

    isGameOver = false;
    isPaused = false;
    isPlaying = true;

    playerReset();
    lastTime = performance.now();
    update();
}

function quitToMenu() {
    window.location.href = 'intro.html';
}

// Button Listeners
document.getElementById('restart-btn').addEventListener('click', startGame);
document.getElementById('resume-btn').addEventListener('click', togglePause);
document.getElementById('btn-quit').addEventListener('click', quitToMenu);
document.getElementById('btn-menu-return').addEventListener('click', quitToMenu);

// Initial Start
startGame();
