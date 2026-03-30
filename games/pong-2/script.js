const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');

const startOverlay = document.getElementById('startOverlay');
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');
const playerScoreEl = document.getElementById('playerScore');
const aiScoreEl = document.getElementById('aiScore');
const bestStreakEl = document.getElementById('bestStreak');
const currentStreakEl = document.getElementById('currentStreak');
const statusEl = document.getElementById('statusText');

const bestStreakKey = 'pong2_best_streak';
let bestStreak = Number(localStorage.getItem(bestStreakKey) || 0);
bestStreakEl.textContent = String(bestStreak);

const state = {
  running: false,
  paused: false,
  awaitingServe: true,
  playerScore: 0,
  aiScore: 0,
  currentStreak: 0
};

const paddle = {
  width: 14,
  height: 110,
  playerY: canvas.height / 2 - 55,
  aiY: canvas.height / 2 - 55,
  speed: 8
};

const ball = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  r: 9,
  vx: 0,
  vy: 0,
  speed: 6.4
};

const keys = { up: false, down: false };

function resetBall(direction = 1) {
  ball.x = canvas.width / 2;
  ball.y = canvas.height / 2;
  ball.speed = 6.4;
  ball.vx = direction * ball.speed;
  ball.vy = (Math.random() * 2 - 1) * 3;
}

function resetMatch() {
  state.playerScore = 0;
  state.aiScore = 0;
  state.currentStreak = 0;
  playerScoreEl.textContent = '0';
  aiScoreEl.textContent = '0';
  currentStreakEl.textContent = '0';
  paddle.playerY = canvas.height / 2 - paddle.height / 2;
  paddle.aiY = canvas.height / 2 - paddle.height / 2;
  state.awaitingServe = true;
  resetBall(1);
  statusEl.textContent = 'Pressione espaço para sacar.';
}

function serve() {
  if (!state.awaitingServe || !state.running) return;
  state.awaitingServe = false;
  statusEl.textContent = 'Rally em andamento.';
}

function updatePlayer() {
  if (keys.up) paddle.playerY -= paddle.speed;
  if (keys.down) paddle.playerY += paddle.speed;
  paddle.playerY = Math.max(0, Math.min(canvas.height - paddle.height, paddle.playerY));
}

function updateAI() {
  const target = ball.y - paddle.height / 2;
  const reaction = 4.6 + Math.min(state.playerScore, 6) * 0.35;

  if (paddle.aiY < target) paddle.aiY += reaction;
  if (paddle.aiY > target) paddle.aiY -= reaction;

  paddle.aiY = Math.max(0, Math.min(canvas.height - paddle.height, paddle.aiY));
}

function checkPaddleCollision(px, py) {
  return (
    ball.x + ball.r > px &&
    ball.x - ball.r < px + paddle.width &&
    ball.y + ball.r > py &&
    ball.y - ball.r < py + paddle.height
  );
}

function updateBall() {
  if (state.awaitingServe) return;

  ball.x += ball.vx;
  ball.y += ball.vy;

  if (ball.y - ball.r <= 0 || ball.y + ball.r >= canvas.height) {
    ball.vy *= -1;
  }

  if (checkPaddleCollision(30, paddle.playerY) && ball.vx < 0) {
    const relative = (ball.y - (paddle.playerY + paddle.height / 2)) / (paddle.height / 2);
    ball.vx = Math.abs(ball.vx) + 0.22;
    ball.vy += relative * 1.8;
    state.currentStreak += 1;
    currentStreakEl.textContent = String(state.currentStreak);
  }

  if (checkPaddleCollision(canvas.width - 44, paddle.aiY) && ball.vx > 0) {
    const relative = (ball.y - (paddle.aiY + paddle.height / 2)) / (paddle.height / 2);
    ball.vx = -(Math.abs(ball.vx) + 0.22);
    ball.vy += relative * 1.8;
  }

  if (ball.x < 0) {
    state.aiScore += 1;
    aiScoreEl.textContent = String(state.aiScore);
    state.currentStreak = 0;
    currentStreakEl.textContent = '0';
    state.awaitingServe = true;
    resetBall(1);
    statusEl.textContent = 'Ponto da IA. Pressione espaço para sacar.';
  }

  if (ball.x > canvas.width) {
    state.playerScore += 1;
    playerScoreEl.textContent = String(state.playerScore);
    if (state.currentStreak > bestStreak) {
      bestStreak = state.currentStreak;
      localStorage.setItem(bestStreakKey, String(bestStreak));
      bestStreakEl.textContent = String(bestStreak);
    }
    state.awaitingServe = true;
    resetBall(-1);
    statusEl.textContent = 'Seu ponto. Pressione espaço para sacar.';
  }

  if (state.playerScore >= 10 || state.aiScore >= 10) {
    state.running = false;
    state.awaitingServe = true;
    statusEl.textContent = state.playerScore >= 10 ? 'Vitória! Você fechou em 10 pontos.' : 'Derrota. IA venceu em 10 pontos.';
    startOverlay.classList.remove('hidden');
    startBtn.textContent = 'Jogar revanche';
  }
}

function drawCourt() {
  ctx.fillStyle = '#091226';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = 'rgba(255,255,255,0.2)';
  ctx.setLineDash([10, 12]);
  ctx.beginPath();
  ctx.moveTo(canvas.width / 2, 0);
  ctx.lineTo(canvas.width / 2, canvas.height);
  ctx.stroke();
  ctx.setLineDash([]);
}

function draw() {
  drawCourt();

  ctx.fillStyle = '#00e9ff';
  ctx.fillRect(30, paddle.playerY, paddle.width, paddle.height);

  ctx.fillStyle = '#ff56d1';
  ctx.fillRect(canvas.width - 44, paddle.aiY, paddle.width, paddle.height);

  ctx.fillStyle = '#f8fbff';
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
  ctx.fill();
}

function frame() {
  if (state.running && !state.paused) {
    updatePlayer();
    updateAI();
    updateBall();
  }

  draw();
  requestAnimationFrame(frame);
}

function startMatch() {
  resetMatch();
  state.running = true;
  state.paused = false;
  startOverlay.classList.add('hidden');
  startBtn.textContent = 'Iniciar confronto';
}

function togglePause() {
  if (!state.running) return;
  state.paused = !state.paused;
  statusEl.textContent = state.paused ? 'Jogo pausado.' : 'Partida retomada.';
}

document.addEventListener('keydown', event => {
  const key = event.key.toLowerCase();

  if (key === 'arrowup' || key === 'w') keys.up = true;
  if (key === 'arrowdown' || key === 's') keys.down = true;

  if (key === ' ') {
    event.preventDefault();
    serve();
  }

  if (key === 'p') togglePause();
  if (key === 'r') startMatch();
});

document.addEventListener('keyup', event => {
  const key = event.key.toLowerCase();
  if (key === 'arrowup' || key === 'w') keys.up = false;
  if (key === 'arrowdown' || key === 's') keys.down = false;
});

startBtn.addEventListener('click', startMatch);
restartBtn.addEventListener('click', startMatch);

resetMatch();
frame();
