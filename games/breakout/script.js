const canvas = document.getElementById('breakout');
const context = canvas.getContext('2d');

// Game Constants
const PADDLE_WIDTH = 130;
const PADDLE_HEIGHT = 20;
const BALL_RADIUS = 10;
const BRICK_ROW_COUNT = 10;
const BRICK_COLUMN_COUNT = 8;
const BRICK_PADDING = 12;
const BRICK_OFFSET_TOP = 60;
const BRICK_OFFSET_LEFT = 45;
const BRICK_WIDTH = (canvas.width - (BRICK_OFFSET_LEFT * 2) - (BRICK_PADDING * (BRICK_COLUMN_COUNT - 1))) / BRICK_COLUMN_COUNT;
const BRICK_HEIGHT = 25;

// Game State
let score = 0;
let lives = 3;
let level = 1;
let isPaused = false;
let isGameOver = false;
let isGameWon = false;
let isPlaying = false;

// Paddle
const paddle = {
    x: canvas.width / 2 - PADDLE_WIDTH / 2,
    y: canvas.height - 50,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    dx: 0,
    speed: 9,
    color: '#00f3ff'
};

// Ball
const ball = {
    x: canvas.width / 2,
    y: canvas.height - 65,
    dx: 5,
    dy: -5,
    radius: BALL_RADIUS,
    speed: 5,
    color: '#fff',
    active: false // Ball sticks to paddle until launched
};

// Bricks
let bricks = [];

function initBricks() {
    bricks = [];
    for (let c = 0; c < BRICK_COLUMN_COUNT; c++) {
        bricks[c] = [];
        for (let r = 0; r < BRICK_ROW_COUNT; r++) {
            bricks[c][r] = {
                x: 0,
                y: 0,
                status: 1,
                color: `hsl(${c * 60}, 100%, 50%)` // Rainbow colors
            };
        }
    }
}

// Input Handling
let rightPressed = false;
let leftPressed = false;

document.addEventListener('keydown', keyDownHandler, false);
document.addEventListener('keyup', keyUpHandler, false);

function keyDownHandler(e) {
    if (e.key === 'Right' || e.key === 'ArrowRight') {
        rightPressed = true;
    } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
        leftPressed = true;
    } else if (e.key === ' ' || e.code === 'Space') {
        if (!ball.active && isPlaying && !isPaused) {
            ball.active = true;
            ball.dx = 5 * (Math.random() > 0.5 ? 1 : -1);
            ball.dy = -5;
        }
    } else if (e.key === 'p' || e.key === 'P') {
        togglePause();
    }
}

function keyUpHandler(e) {
    if (e.key === 'Right' || e.key === 'ArrowRight') {
        rightPressed = false;
    } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
        leftPressed = false;
    }
}

function drawBall() {
    context.beginPath();
    context.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    context.fillStyle = ball.color;
    context.shadowBlur = 10;
    context.shadowColor = ball.color;
    context.fill();
    context.shadowBlur = 0;
    context.closePath();
}

function drawPaddle() {
    context.beginPath();
    context.rect(paddle.x, paddle.y, paddle.width, paddle.height);
    context.fillStyle = paddle.color;
    context.shadowBlur = 15;
    context.shadowColor = paddle.color;
    context.fill();
    context.shadowBlur = 0;
    context.closePath();

    // Inner highlight
    context.fillStyle = 'rgba(255,255,255,0.5)';
    context.fillRect(paddle.x, paddle.y, paddle.width, 3);
}

function drawBricks() {
    for (let c = 0; c < BRICK_COLUMN_COUNT; c++) {
        for (let r = 0; r < BRICK_ROW_COUNT; r++) {
            if (bricks[c][r].status === 1) {
                const brickX = (c * (BRICK_WIDTH + BRICK_PADDING)) + BRICK_OFFSET_LEFT;
                const brickY = (r * (BRICK_HEIGHT + BRICK_PADDING)) + BRICK_OFFSET_TOP;
                bricks[c][r].x = brickX;
                bricks[c][r].y = brickY;

                context.beginPath();
                context.rect(brickX, brickY, BRICK_WIDTH, BRICK_HEIGHT);
                context.fillStyle = bricks[c][r].color;
                context.shadowBlur = 10;
                context.shadowColor = bricks[c][r].color;
                context.fill();
                context.shadowBlur = 0;
                context.closePath();

                // Shine
                context.fillStyle = 'rgba(255,255,255,0.2)';
                context.fillRect(brickX, brickY, BRICK_WIDTH, BRICK_HEIGHT / 2);
            }
        }
    }
}

function collisionDetection() {
    for (let c = 0; c < BRICK_COLUMN_COUNT; c++) {
        for (let r = 0; r < BRICK_ROW_COUNT; r++) {
            const b = bricks[c][r];
            if (b.status === 1) {
                if (ball.x > b.x && ball.x < b.x + BRICK_WIDTH && ball.y > b.y && ball.y < b.y + BRICK_HEIGHT) {
                    ball.dy = -ball.dy;
                    b.status = 0;
                    score += 10;
                    updateStats();

                    if (score === BRICK_ROW_COUNT * BRICK_COLUMN_COUNT * 10 * level) { // Simplified win condition check
                        levelUp();
                    }
                }
            }
        }
    }
}

function levelUp() {
    isGameWon = true;
    ball.active = false;
    document.getElementById('victory-modal').classList.remove('hidden');
    document.getElementById('victory-score').innerText = score;
}

function updateStats() {
    document.getElementById('score').innerText = score;
    document.getElementById('lives').innerText = lives;
    document.getElementById('level').innerText = level;
}

function resetBall() {
    ball.active = false;
    ball.x = paddle.x + paddle.width / 2;
    ball.y = paddle.y - ball.radius;
    ball.dx = 0;
    ball.dy = 0;
}

function draw() {
    if (!isPlaying && !isPaused) return; // Don't draw if in menu (except background maybe)

    context.clearRect(0, 0, canvas.width, canvas.height);

    drawBricks();
    drawBall();
    drawPaddle();

    if (isPaused) return;

    collisionDetection();

    // Ball Movement
    if (ball.active) {
        if (ball.x + ball.dx > canvas.width - ball.radius || ball.x + ball.dx < ball.radius) {
            ball.dx = -ball.dx;
        }
        if (ball.y + ball.dy < ball.radius) {
            ball.dy = -ball.dy;
        } else if (ball.y + ball.dy > canvas.height - ball.radius) {
            lives--;
            updateStats();
            if (!lives) {
                gameOver();
            } else {
                resetBall();
            }
        }

        // Paddle Collision
        if (ball.y + ball.dy > paddle.y - ball.radius &&
            ball.x > paddle.x &&
            ball.x < paddle.x + paddle.width) {

            // Simple reflection based on where it hit the paddle
            let hitPoint = ball.x - (paddle.x + paddle.width / 2);
            hitPoint = hitPoint / (paddle.width / 2);

            let angle = hitPoint * (Math.PI / 3); // Max 60 degrees

            let speed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
            // Increase speed slightly on hit
            speed = Math.min(speed * 1.05, 12);

            ball.dx = speed * Math.sin(angle);
            ball.dy = -speed * Math.cos(angle);
        }

        ball.x += ball.dx;
        ball.y += ball.dy;
    } else {
        // Ball follows paddle
        ball.x = paddle.x + paddle.width / 2;
        ball.y = paddle.y - ball.radius;
    }

    // Paddle Movement
    if (rightPressed && paddle.x < canvas.width - paddle.width) {
        paddle.x += paddle.speed;
    } else if (leftPressed && paddle.x > 0) {
        paddle.x -= paddle.speed;
    }

    if (!isGameOver && !isGameWon) {
        requestAnimationFrame(draw);
    }
}

function startGame() {
    document.getElementById('menu-overlay').classList.add('hidden');
    document.getElementById('game-over-modal').classList.add('hidden');
    document.getElementById('victory-modal').classList.add('hidden');

    score = 0;
    lives = 3;
    level = 1;
    initBricks();
    updateStats();

    isGameOver = false;
    isGameWon = false;
    isPaused = false;
    isPlaying = true;

    resetBall();
    draw();
}

function gameOver() {
    isGameOver = true;
    document.getElementById('game-over-modal').classList.remove('hidden');
    document.getElementById('final-score').innerText = score;
}

function togglePause() {
    if (!isPlaying || isGameOver || isGameWon) return;
    isPaused = !isPaused;
    const modal = document.getElementById('pause-modal');
    if (isPaused) {
        modal.classList.remove('hidden');
    } else {
        modal.classList.add('hidden');
        draw();
    }
}

function nextLevel() {
    level++;
    lives++; // Bonus life
    ball.speed += 1; // Increase base speed
    initBricks();
    updateStats();
    document.getElementById('victory-modal').classList.add('hidden');
    isGameWon = false;
    resetBall();
    draw();
}

// Event Listeners
function quitToMenu() {
    window.location.href = 'index.html';
}

// Menu navigation buttons
document.getElementById('btn-quit').addEventListener('click', quitToMenu);
document.getElementById('btn-menu-return').addEventListener('click', quitToMenu);
document.getElementById('menu-from-gameover').addEventListener('click', quitToMenu);
document.getElementById('menu-from-victory').addEventListener('click', quitToMenu);
document.getElementById('menu-from-pause').addEventListener('click', quitToMenu);

// Game control buttons
document.getElementById('btn-start').addEventListener('click', startGame);
document.getElementById('restart-btn').addEventListener('click', startGame);
document.getElementById('resume-btn').addEventListener('click', togglePause);
document.getElementById('next-level-btn').addEventListener('click', nextLevel);

// Initial Setup
initBricks();
// Draw one frame for background
context.clearRect(0, 0, canvas.width, canvas.height);
drawBricks();
drawPaddle();
