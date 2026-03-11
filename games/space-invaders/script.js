const canvas = document.getElementById('space-invaders');
const context = canvas.getContext('2d');

// Game Constants
const PLAYER_WIDTH = 50;
const PLAYER_HEIGHT = 40;
const PLAYER_SPEED = 7;
const BULLET_WIDTH = 4;
const BULLET_HEIGHT = 15;
const BULLET_SPEED = 8;
const ENEMY_BULLET_SPEED = 5;
const ENEMY_WIDTH = 40;
const ENEMY_HEIGHT = 30;
const ENEMY_ROWS = 5;
const ENEMY_COLS = 11;
const ENEMY_PADDING = 10;
const ENEMY_OFFSET_TOP = 80;
const ENEMY_OFFSET_LEFT = 50;
const BARRIER_WIDTH = 80;
const BARRIER_HEIGHT = 60;
const BARRIER_BLOCKS = 4;

// Game State
let score = 0;
let lives = 3;
let wave = 1;
let highScore = localStorage.getItem('spaceInvadersHighScore') || 0;
let isPaused = false;
let isGameOver = false;
let isGameWon = false;
let isPlaying = false;
let enemyDirection = 1;
let enemySpeed = 1;
let enemyDropDistance = 20;
let shootCooldown = 0;
let mysteryShipActive = false;
let mysteryShipX = 0;

// Player
const player = {
    x: canvas.width / 2 - PLAYER_WIDTH / 2,
    y: canvas.height - 80,
    width: PLAYER_WIDTH,
    height: PLAYER_HEIGHT,
    speed: PLAYER_SPEED,
    color: '#00f3ff'
};

// Arrays
let bullets = [];
let enemyBullets = [];
let enemies = [];
let barriers = [];
let particles = [];

// Input Handling
let rightPressed = false;
let leftPressed = false;
let shootPressed = false;

document.addEventListener('keydown', keyDownHandler, false);
document.addEventListener('keyup', keyUpHandler, false);

function keyDownHandler(e) {
    if (e.key === 'Right' || e.key === 'ArrowRight') {
        rightPressed = true;
    } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
        leftPressed = true;
    } else if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        shootPressed = true;
    } else if (e.key === 'p' || e.key === 'P') {
        togglePause();
    }
}

function keyUpHandler(e) {
    if (e.key === 'Right' || e.key === 'ArrowRight') {
        rightPressed = false;
    } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
        leftPressed = false;
    } else if (e.key === ' ' || e.code === 'Space') {
        shootPressed = false;
    }
}

// Initialize Enemies
function initEnemies() {
    enemies = [];
    for (let row = 0; row < ENEMY_ROWS; row++) {
        for (let col = 0; col < ENEMY_COLS; col++) {
            let type = row < 1 ? 3 : row < 3 ? 2 : 1;
            enemies.push({
                x: ENEMY_OFFSET_LEFT + col * (ENEMY_WIDTH + ENEMY_PADDING),
                y: ENEMY_OFFSET_TOP + row * (ENEMY_HEIGHT + ENEMY_PADDING),
                width: ENEMY_WIDTH,
                height: ENEMY_HEIGHT,
                type: type,
                alive: true,
                color: type === 3 ? '#ff006e' : type === 2 ? '#bc13fe' : '#00f3ff'
            });
        }
    }
}

// Initialize Barriers
function initBarriers() {
    barriers = [];
    const barrierY = canvas.height - 200;
    const spacing = (canvas.width - (BARRIER_WIDTH * BARRIER_BLOCKS)) / (BARRIER_BLOCKS + 1);

    for (let i = 0; i < BARRIER_BLOCKS; i++) {
        barriers.push({
            x: spacing + i * (BARRIER_WIDTH + spacing),
            y: barrierY,
            width: BARRIER_WIDTH,
            height: BARRIER_HEIGHT,
            health: 100,
            color: '#00ff88'
        });
    }
}

// Draw Player
function drawPlayer() {
    context.save();

    // Ship body
    context.beginPath();
    context.moveTo(player.x + player.width / 2, player.y);
    context.lineTo(player.x, player.y + player.height);
    context.lineTo(player.x + player.width, player.y + player.height);
    context.closePath();
    context.fillStyle = player.color;
    context.shadowBlur = 20;
    context.shadowColor = player.color;
    context.fill();

    // Cockpit
    context.beginPath();
    context.arc(player.x + player.width / 2, player.y + player.height / 2, 8, 0, Math.PI * 2);
    context.fillStyle = '#fff';
    context.fill();

    context.shadowBlur = 0;
    context.restore();
}

// Draw Enemies
function drawEnemies() {
    enemies.forEach(enemy => {
        if (!enemy.alive) return;

        context.save();
        context.fillStyle = enemy.color;
        context.shadowBlur = 15;
        context.shadowColor = enemy.color;

        // Simple alien shape
        context.beginPath();
        context.rect(enemy.x + 5, enemy.y, enemy.width - 10, enemy.height - 10);
        context.fill();

        // Eyes
        context.fillStyle = '#000';
        context.fillRect(enemy.x + 10, enemy.y + 8, 6, 6);
        context.fillRect(enemy.x + enemy.width - 16, enemy.y + 8, 6, 6);

        context.shadowBlur = 0;
        context.restore();
    });
}

// Draw Bullets
function drawBullets() {
    context.fillStyle = '#fff';
    context.shadowBlur = 10;
    context.shadowColor = '#fff';

    bullets.forEach(bullet => {
        context.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    });

    context.shadowBlur = 0;
}

// Draw Enemy Bullets
function drawEnemyBullets() {
    context.fillStyle = '#ff006e';
    context.shadowBlur = 10;
    context.shadowColor = '#ff006e';

    enemyBullets.forEach(bullet => {
        context.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    });

    context.shadowBlur = 0;
}

// Draw Barriers
function drawBarriers() {
    barriers.forEach(barrier => {
        if (barrier.health <= 0) return;

        const alpha = barrier.health / 100;
        context.save();
        context.globalAlpha = alpha;
        context.fillStyle = barrier.color;
        context.shadowBlur = 10;
        context.shadowColor = barrier.color;
        context.fillRect(barrier.x, barrier.y, barrier.width, barrier.height);
        context.shadowBlur = 0;
        context.restore();
    });
}

// Draw Mystery Ship
function drawMysteryShip() {
    if (!mysteryShipActive) return;

    context.save();
    context.fillStyle = '#ffd000';
    context.shadowBlur = 20;
    context.shadowColor = '#ffd000';

    // UFO shape
    context.beginPath();
    context.ellipse(mysteryShipX, 40, 30, 15, 0, 0, Math.PI * 2);
    context.fill();

    context.fillStyle = '#ff6600';
    context.beginPath();
    context.ellipse(mysteryShipX, 35, 15, 8, 0, 0, Math.PI * 2);
    context.fill();

    context.shadowBlur = 0;
    context.restore();
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

// Create Explosion
function createExplosion(x, y, color) {
    for (let i = 0; i < 15; i++) {
        particles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 6,
            vy: (Math.random() - 0.5) * 6,
            size: Math.random() * 4 + 2,
            color: color,
            life: 1
        });
    }
}

// Shoot Bullet
function shootBullet() {
    if (shootCooldown > 0) return;

    bullets.push({
        x: player.x + player.width / 2 - BULLET_WIDTH / 2,
        y: player.y,
        width: BULLET_WIDTH,
        height: BULLET_HEIGHT,
        speed: BULLET_SPEED
    });

    shootCooldown = 15;
}

// Enemy Shooting
function enemyShoot() {
    if (Math.random() < 0.02 * wave) {
        const aliveEnemies = enemies.filter(e => e.alive);
        if (aliveEnemies.length > 0) {
            const shooter = aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)];
            enemyBullets.push({
                x: shooter.x + shooter.width / 2 - BULLET_WIDTH / 2,
                y: shooter.y + shooter.height,
                width: BULLET_WIDTH,
                height: BULLET_HEIGHT,
                speed: ENEMY_BULLET_SPEED
            });
        }
    }
}

// Update Bullets
function updateBullets() {
    // Player bullets
    bullets.forEach((bullet, index) => {
        bullet.y -= bullet.speed;

        // Remove if off screen
        if (bullet.y < 0) {
            bullets.splice(index, 1);
            return;
        }

        // Check enemy collision
        enemies.forEach(enemy => {
            if (!enemy.alive) return;

            if (bullet.x < enemy.x + enemy.width &&
                bullet.x + bullet.width > enemy.x &&
                bullet.y < enemy.y + enemy.height &&
                bullet.y + bullet.height > enemy.y) {

                enemy.alive = false;
                bullets.splice(index, 1);
                score += enemy.type * 10;
                createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, enemy.color);
                updateStats();

                // Check win condition
                if (enemies.every(e => !e.alive)) {
                    levelUp();
                }
            }
        });

        // Check barrier collision
        barriers.forEach(barrier => {
            if (barrier.health <= 0) return;

            if (bullet.x < barrier.x + barrier.width &&
                bullet.x + bullet.width > barrier.x &&
                bullet.y < barrier.y + barrier.height &&
                bullet.y + bullet.height > barrier.y) {

                barrier.health -= 10;
                bullets.splice(index, 1);
            }
        });
    });

    // Enemy bullets
    enemyBullets.forEach((bullet, index) => {
        bullet.y += bullet.speed;

        // Remove if off screen
        if (bullet.y > canvas.height) {
            enemyBullets.splice(index, 1);
            return;
        }

        // Check player collision
        if (bullet.x < player.x + player.width &&
            bullet.x + bullet.width > player.x &&
            bullet.y < player.y + player.height &&
            bullet.y + bullet.height > player.y) {

            enemyBullets.splice(index, 1);
            lives--;
            createExplosion(player.x + player.width / 2, player.y + player.height / 2, player.color);
            updateStats();

            if (lives <= 0) {
                gameOver();
            }
        }

        // Check barrier collision
        barriers.forEach(barrier => {
            if (barrier.health <= 0) return;

            if (bullet.x < barrier.x + barrier.width &&
                bullet.x + bullet.width > barrier.x &&
                bullet.y < barrier.y + barrier.height &&
                bullet.y + bullet.height > barrier.y) {

                barrier.health -= 10;
                enemyBullets.splice(index, 1);
            }
        });
    });
}

// Update Enemies
function updateEnemies() {
    let shouldDrop = false;
    let leftMost = canvas.width;
    let rightMost = 0;

    enemies.forEach(enemy => {
        if (!enemy.alive) return;

        leftMost = Math.min(leftMost, enemy.x);
        rightMost = Math.max(rightMost, enemy.x + enemy.width);
    });

    if (rightMost >= canvas.width - 10 || leftMost <= 10) {
        enemyDirection *= -1;
        shouldDrop = true;
    }

    enemies.forEach(enemy => {
        if (!enemy.alive) return;

        enemy.x += enemyDirection * enemySpeed;

        if (shouldDrop) {
            enemy.y += enemyDropDistance;
        }

        // Check if enemies reached player
        if (enemy.y + enemy.height >= player.y) {
            gameOver();
        }
    });
}

// Update Mystery Ship
function updateMysteryShip() {
    if (!mysteryShipActive && Math.random() < 0.001) {
        mysteryShipActive = true;
        mysteryShipX = -50;
    }

    if (mysteryShipActive) {
        mysteryShipX += 3;

        if (mysteryShipX > canvas.width + 50) {
            mysteryShipActive = false;
        }

        // Check collision with bullets
        bullets.forEach((bullet, index) => {
            if (bullet.x > mysteryShipX - 30 && bullet.x < mysteryShipX + 30 &&
                bullet.y < 55 && bullet.y > 25) {

                const bonus = Math.floor(Math.random() * 50) + 50;
                score += bonus;
                updateStats();
                createExplosion(mysteryShipX, 40, '#ffd000');
                bullets.splice(index, 1);
                mysteryShipActive = false;
            }
        });
    }
}

// Main Draw Function
function draw() {
    if (!isPlaying && !isPaused) return;

    context.clearRect(0, 0, canvas.width, canvas.height);

    drawBarriers();
    drawPlayer();
    drawEnemies();
    drawBullets();
    drawEnemyBullets();
    drawMysteryShip();
    drawParticles();

    if (isPaused) return;

    // Update game state
    if (shootPressed) {
        shootBullet();
    }

    if (shootCooldown > 0) shootCooldown--;

    // Player movement
    if (rightPressed && player.x < canvas.width - player.width) {
        player.x += player.speed;
    } else if (leftPressed && player.x > 0) {
        player.x -= player.speed;
    }

    updateBullets();
    updateEnemies();
    updateMysteryShip();
    enemyShoot();

    if (!isGameOver && !isGameWon) {
        requestAnimationFrame(draw);
    }
}

// Update Stats Display
function updateStats() {
    document.getElementById('score').innerText = score;
    document.getElementById('lives').innerText = lives;
    document.getElementById('wave').innerText = wave;
    document.getElementById('high-score').innerText = highScore;

    if (score > highScore) {
        highScore = score;
        localStorage.setItem('spaceInvadersHighScore', highScore);
        document.getElementById('high-score').innerText = highScore;
    }
}

// Start Game
function startGame() {
    document.getElementById('menu-overlay').classList.add('hidden');
    document.getElementById('game-over-modal').classList.add('hidden');
    document.getElementById('victory-modal').classList.add('hidden');

    score = 0;
    lives = 3;
    wave = 1;
    enemySpeed = 1;

    initEnemies();
    initBarriers();
    updateStats();

    bullets = [];
    enemyBullets = [];
    particles = [];

    isGameOver = false;
    isGameWon = false;
    isPaused = false;
    isPlaying = true;

    player.x = canvas.width / 2 - PLAYER_WIDTH / 2;

    draw();
}

// Game Over
function gameOver() {
    isGameOver = true;
    isPlaying = false;
    document.getElementById('game-over-modal').classList.remove('hidden');
    document.getElementById('final-score').innerText = score;
}

// Level Up
function levelUp() {
    isGameWon = true;
    document.getElementById('victory-modal').classList.remove('hidden');
    document.getElementById('victory-score').innerText = score;
}

// Next Wave
function nextWave() {
    wave++;
    lives++; // Bonus life
    enemySpeed += 0.5;

    initEnemies();
    initBarriers();
    updateStats();

    bullets = [];
    enemyBullets = [];

    document.getElementById('victory-modal').classList.add('hidden');
    isGameWon = false;

    draw();
}

// Toggle Pause
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

// Quit to Menu
function quitToMenu() {
    window.location.href = 'index.html';
}

// Event Listeners
document.getElementById('btn-quit').addEventListener('click', quitToMenu);
document.getElementById('btn-menu-return').addEventListener('click', quitToMenu);
document.getElementById('menu-from-gameover').addEventListener('click', quitToMenu);
document.getElementById('menu-from-victory').addEventListener('click', quitToMenu);
document.getElementById('menu-from-pause').addEventListener('click', quitToMenu);

document.getElementById('btn-start').addEventListener('click', startGame);
document.getElementById('restart-btn').addEventListener('click', startGame);
document.getElementById('resume-btn').addEventListener('click', togglePause);
document.getElementById('next-wave-btn').addEventListener('click', nextWave);

// Initial Setup
initEnemies();
initBarriers();
context.clearRect(0, 0, canvas.width, canvas.height);
drawBarriers();
drawEnemies();
drawPlayer();
