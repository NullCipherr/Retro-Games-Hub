const canvas = document.getElementById('flappy-bird');
const context = canvas.getContext('2d');

// Game Constants
const GRAVITY = 0.5;
const FLAP_POWER = -8;
const BIRD_SIZE = 30;
const PIPE_WIDTH = 60;
const PIPE_GAP = 180;
const PIPE_SPEED = 3;
const PIPE_SPAWN_INTERVAL = 90; // frames

// Game State
let score = 0;
let bestScore = localStorage.getItem('flappyBirdBestScore') || 0;
let isPaused = false;
let isGameOver = false;
let isPlaying = false;
let frameCount = 0;

// Bird
const bird = {
    x: 100,
    y: canvas.height / 2,
    velocity: 0,
    size: BIRD_SIZE,
    color: '#00f3ff',
    rotation: 0
};

// Arrays
let pipes = [];
let particles = [];

// Input Handling
let spacePressed = false;

document.addEventListener('keydown', keyDownHandler, false);
document.addEventListener('keyup', keyUpHandler, false);
canvas.addEventListener('click', handleClick, false);

function keyDownHandler(e) {
    if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        if (!spacePressed && isPlaying && !isPaused && !isGameOver) {
            flap();
            spacePressed = true;
        }
    } else if (e.key === 'p' || e.key === 'P') {
        togglePause();
    }
}

function keyUpHandler(e) {
    if (e.key === ' ' || e.code === 'Space') {
        spacePressed = false;
    }
}

function handleClick(e) {
    if (isPlaying && !isPaused && !isGameOver) {
        flap();
    }
}

// Flap Function
function flap() {
    bird.velocity = FLAP_POWER;
    createFlapParticles();
}

// Create Particles
function createFlapParticles() {
    for (let i = 0; i < 5; i++) {
        particles.push({
            x: bird.x,
            y: bird.y + bird.size / 2,
            vx: Math.random() * -2 - 1,
            vy: (Math.random() - 0.5) * 2,
            size: Math.random() * 4 + 2,
            color: bird.color,
            life: 1
        });
    }
}

// Create Explosion
function createExplosion(x, y) {
    for (let i = 0; i < 20; i++) {
        particles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 8,
            vy: (Math.random() - 0.5) * 8,
            size: Math.random() * 6 + 3,
            color: ['#00f3ff', '#bc13fe', '#ff006e'][Math.floor(Math.random() * 3)],
            life: 1
        });
    }
}

// Draw Bird
function drawBird() {
    context.save();
    context.translate(bird.x + bird.size / 2, bird.y + bird.size / 2);

    // Rotate based on velocity
    bird.rotation = Math.min(Math.max(bird.velocity * 3, -30), 90) * Math.PI / 180;
    context.rotate(bird.rotation);

    // Bird body
    context.fillStyle = bird.color;
    context.shadowBlur = 20;
    context.shadowColor = bird.color;
    context.beginPath();
    context.arc(0, 0, bird.size / 2, 0, Math.PI * 2);
    context.fill();

    // Wing
    context.fillStyle = '#fff';
    context.beginPath();
    context.ellipse(-5, 0, 8, 12, 0, 0, Math.PI * 2);
    context.fill();

    // Eye
    context.fillStyle = '#000';
    context.beginPath();
    context.arc(8, -5, 4, 0, Math.PI * 2);
    context.fill();

    // Eye shine
    context.fillStyle = '#fff';
    context.beginPath();
    context.arc(10, -6, 2, 0, Math.PI * 2);
    context.fill();

    // Beak
    context.fillStyle = '#ffd000';
    context.beginPath();
    context.moveTo(12, 0);
    context.lineTo(20, -2);
    context.lineTo(20, 2);
    context.closePath();
    context.fill();

    context.shadowBlur = 0;
    context.restore();
}

// Draw Pipes
function drawPipes() {
    pipes.forEach(pipe => {
        const gradient = context.createLinearGradient(pipe.x, 0, pipe.x + PIPE_WIDTH, 0);
        gradient.addColorStop(0, '#bc13fe');
        gradient.addColorStop(1, '#ff006e');

        context.fillStyle = gradient;
        context.shadowBlur = 15;
        context.shadowColor = '#bc13fe';

        // Top pipe
        context.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.top);

        // Bottom pipe
        context.fillRect(pipe.x, pipe.bottom, PIPE_WIDTH, canvas.height - pipe.bottom);

        // Pipe caps
        context.fillRect(pipe.x - 5, pipe.top - 20, PIPE_WIDTH + 10, 20);
        context.fillRect(pipe.x - 5, pipe.bottom, PIPE_WIDTH + 10, 20);

        context.shadowBlur = 0;
    });
}

// Draw Background
function drawBackground() {
    // Gradient background
    const gradient = context.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#0a0a14');
    gradient.addColorStop(1, '#1a1a2e');
    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Stars
    context.fillStyle = '#fff';
    for (let i = 0; i < 50; i++) {
        const x = (i * 37) % canvas.width;
        const y = (i * 53) % canvas.height;
        const size = (i % 3) * 0.5 + 0.5;
        context.globalAlpha = 0.3 + (i % 5) * 0.1;
        context.fillRect(x, y, size, size);
    }
    context.globalAlpha = 1;
}

// Draw Particles
function drawParticles() {
    particles.forEach((particle, index) => {
        context.save();
        context.globalAlpha = particle.life;
        context.fillStyle = particle.color;
        context.shadowBlur = 5;
        context.shadowColor = particle.color;
        context.fillRect(particle.x, particle.y, particle.size, particle.size);
        context.restore();

        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.life -= 0.02;

        if (particle.life <= 0) {
            particles.splice(index, 1);
        }
    });
}

// Draw Score
function drawScore() {
    context.fillStyle = '#fff';
    context.font = 'bold 48px Outfit';
    context.textAlign = 'center';
    context.shadowBlur = 10;
    context.shadowColor = '#00f3ff';
    context.fillText(score, canvas.width / 2, 80);
    context.shadowBlur = 0;
}

// Update Bird
function updateBird() {
    bird.velocity += GRAVITY;
    bird.y += bird.velocity;

    // Check boundaries
    if (bird.y + bird.size / 2 > canvas.height) {
        bird.y = canvas.height - bird.size / 2;
        gameOver();
    }

    if (bird.y - bird.size / 2 < 0) {
        bird.y = bird.size / 2;
        bird.velocity = 0;
    }
}

// Update Pipes
function updatePipes() {
    // Spawn new pipes
    if (frameCount % PIPE_SPAWN_INTERVAL === 0) {
        const minTop = 50;
        const maxTop = canvas.height - PIPE_GAP - 50;
        const top = Math.random() * (maxTop - minTop) + minTop;

        pipes.push({
            x: canvas.width,
            top: top,
            bottom: top + PIPE_GAP,
            scored: false
        });
    }

    // Move and check pipes
    pipes.forEach((pipe, index) => {
        pipe.x -= PIPE_SPEED;

        // Remove off-screen pipes
        if (pipe.x + PIPE_WIDTH < 0) {
            pipes.splice(index, 1);
        }

        // Check collision
        if (bird.x + bird.size / 2 > pipe.x &&
            bird.x - bird.size / 2 < pipe.x + PIPE_WIDTH) {

            if (bird.y - bird.size / 2 < pipe.top ||
                bird.y + bird.size / 2 > pipe.bottom) {
                gameOver();
            }
        }

        // Score
        if (!pipe.scored && pipe.x + PIPE_WIDTH < bird.x) {
            pipe.scored = true;
            score++;
            updateStats();
        }
    });
}

// Main Draw Function
function draw() {
    if (!isPlaying && !isPaused) return;

    drawBackground();
    drawPipes();
    drawBird();
    drawParticles();
    drawScore();

    if (isPaused) return;

    frameCount++;
    updateBird();
    updatePipes();

    if (!isGameOver) {
        requestAnimationFrame(draw);
    }
}

// Update Stats Display
function updateStats() {
    document.getElementById('score').innerText = score;
    document.getElementById('best-score').innerText = bestScore;

    if (score > bestScore) {
        bestScore = score;
        localStorage.setItem('flappyBirdBestScore', bestScore);
        document.getElementById('best-score').innerText = bestScore;
    }

    // Update medal
    updateMedal();
}

// Update Medal
function updateMedal() {
    const medalElement = document.getElementById('medal');

    if (score >= 50) {
        medalElement.textContent = '💎';
    } else if (score >= 30) {
        medalElement.textContent = '🥇';
    } else if (score >= 20) {
        medalElement.textContent = '🥈';
    } else if (score >= 10) {
        medalElement.textContent = '🥉';
    } else {
        medalElement.textContent = '🏅';
    }
}

// Start Game
function startGame() {
    document.getElementById('menu-overlay').classList.add('hidden');
    document.getElementById('game-over-modal').classList.add('hidden');

    score = 0;
    frameCount = 0;

    bird.y = canvas.height / 2;
    bird.velocity = 0;
    bird.rotation = 0;

    pipes = [];
    particles = [];

    isGameOver = false;
    isPaused = false;
    isPlaying = true;

    updateStats();
    draw();
}

// Game Over
function gameOver() {
    if (isGameOver) return;

    isGameOver = true;
    isPlaying = false;

    createExplosion(bird.x, bird.y);

    document.getElementById('game-over-modal').classList.remove('hidden');
    document.getElementById('final-score').innerText = score;
    document.getElementById('final-best').innerText = bestScore;
}

// Toggle Pause
function togglePause() {
    if (!isPlaying || isGameOver) return;

    isPaused = !isPaused;
    const modal = document.getElementById('pause-modal');

    if (isPaused) {
        modal.classList.remove('hidden');
    } else {
        modal.classList.add('hidden');
        draw();
    }
}

// Quit to Menu
function quitToMenu() {
    window.location.href = 'index.html';
}

// Event Listeners
document.getElementById('btn-quit').addEventListener('click', quitToMenu);
document.getElementById('btn-menu-return').addEventListener('click', quitToMenu);
document.getElementById('menu-from-gameover').addEventListener('click', quitToMenu);
document.getElementById('menu-from-pause').addEventListener('click', quitToMenu);

document.getElementById('btn-start').addEventListener('click', startGame);
document.getElementById('restart-btn').addEventListener('click', startGame);
document.getElementById('resume-btn').addEventListener('click', togglePause);

// Initial Setup
document.getElementById('best-score').innerText = bestScore;
drawBackground();
drawBird();
