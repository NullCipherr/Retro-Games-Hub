const canvas = document.getElementById('snakeCanvas');
const ctx = canvas.getContext('2d');

const startOverlay = document.getElementById('startOverlay');
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');
const scoreEl = document.getElementById('score');
const bestScoreEl = document.getElementById('bestScore');
const speedEl = document.getElementById('speed');
const statusEl = document.getElementById('statusText');

const GRID_SIZE = 24;
const CELL = canvas.width / GRID_SIZE;

let snake = [];
let food = { x: 0, y: 0 };
let direction = { x: 1, y: 0 };
let nextDirection = { x: 1, y: 0 };
let score = 0;
let bestScore = Number(localStorage.getItem('snake2_best') || 0);
let speedLevel = 1;
let tickMs = 150;
let loop = null;
let isRunning = false;
let isPaused = false;

bestScoreEl.textContent = String(bestScore);

function randomCell() {
  return Math.floor(Math.random() * GRID_SIZE);
}

function placeFood() {
  do {
    food = { x: randomCell(), y: randomCell() };
  } while (snake.some(part => part.x === food.x && part.y === food.y));
}

function resetGame() {
  snake = [
    { x: 8, y: 12 },
    { x: 7, y: 12 },
    { x: 6, y: 12 }
  ];
  direction = { x: 1, y: 0 };
  nextDirection = { x: 1, y: 0 };
  score = 0;
  speedLevel = 1;
  tickMs = 150;
  isPaused = false;
  scoreEl.textContent = '0';
  speedEl.textContent = '1x';
  statusEl.textContent = 'Boa sorte.';
  placeFood();
  draw();
}

function setBestScore() {
  if (score > bestScore) {
    bestScore = score;
    localStorage.setItem('snake2_best', String(bestScore));
    bestScoreEl.textContent = String(bestScore);
  }
}

function drawGrid() {
  ctx.fillStyle = '#081021';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = 'rgba(255,255,255,0.05)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= GRID_SIZE; i++) {
    const p = i * CELL;
    ctx.beginPath();
    ctx.moveTo(p, 0);
    ctx.lineTo(p, canvas.height);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, p);
    ctx.lineTo(canvas.width, p);
    ctx.stroke();
  }
}

function drawSnake() {
  snake.forEach((part, index) => {
    const gradient = ctx.createLinearGradient(
      part.x * CELL,
      part.y * CELL,
      (part.x + 1) * CELL,
      (part.y + 1) * CELL
    );
    gradient.addColorStop(0, index === 0 ? '#00eaff' : '#7bff74');
    gradient.addColorStop(1, '#38d39f');

    ctx.fillStyle = gradient;
    ctx.fillRect(part.x * CELL + 2, part.y * CELL + 2, CELL - 4, CELL - 4);
  });
}

function drawFood() {
  ctx.fillStyle = '#ff3da9';
  ctx.beginPath();
  ctx.arc(food.x * CELL + CELL / 2, food.y * CELL + CELL / 2, CELL * 0.33, 0, Math.PI * 2);
  ctx.fill();
}

function draw() {
  drawGrid();
  drawSnake();
  drawFood();
}

function update() {
  if (!isRunning || isPaused) return;

  direction = nextDirection;
  const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

  if (
    head.x < 0 ||
    head.y < 0 ||
    head.x >= GRID_SIZE ||
    head.y >= GRID_SIZE ||
    snake.some(part => part.x === head.x && part.y === head.y)
  ) {
    isRunning = false;
    setBestScore();
    statusEl.textContent = `Fim de jogo. Pontuação final: ${score}.`;
    startOverlay.classList.remove('hidden');
    startBtn.textContent = 'Jogar novamente';
    return;
  }

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    score += 10;
    scoreEl.textContent = String(score);

    const nextLevel = Math.min(6, 1 + Math.floor(score / 60));
    if (nextLevel !== speedLevel) {
      speedLevel = nextLevel;
      tickMs = Math.max(70, 150 - (speedLevel - 1) * 15);
      speedEl.textContent = `${speedLevel}x`;
      restartLoop();
    }

    placeFood();
  } else {
    snake.pop();
  }

  draw();
}

function restartLoop() {
  if (loop) clearInterval(loop);
  loop = setInterval(update, tickMs);
}

function startGame() {
  resetGame();
  isRunning = true;
  startOverlay.classList.add('hidden');
  startBtn.textContent = 'Iniciar partida';
  restartLoop();
}

function togglePause() {
  if (!isRunning) return;
  isPaused = !isPaused;
  statusEl.textContent = isPaused ? 'Jogo pausado.' : 'Partida retomada.';
}

document.addEventListener('keydown', event => {
  const key = event.key.toLowerCase();

  if (key === 'p') {
    togglePause();
    return;
  }

  if (key === 'r') {
    startGame();
    return;
  }

  const map = {
    arrowup: { x: 0, y: -1 },
    w: { x: 0, y: -1 },
    arrowdown: { x: 0, y: 1 },
    s: { x: 0, y: 1 },
    arrowleft: { x: -1, y: 0 },
    a: { x: -1, y: 0 },
    arrowright: { x: 1, y: 0 },
    d: { x: 1, y: 0 }
  };

  const next = map[key];
  if (!next) return;

  if (next.x === -direction.x && next.y === -direction.y) return;
  nextDirection = next;
});

startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);

resetGame();
