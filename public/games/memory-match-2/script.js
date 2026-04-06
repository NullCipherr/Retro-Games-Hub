const boardEl = document.getElementById('board');
const timerEl = document.getElementById('timer');
const movesEl = document.getElementById('moves');
const streakEl = document.getElementById('streak');
const bestTimeEl = document.getElementById('bestTime');
const statusEl = document.getElementById('statusText');
const restartBtn = document.getElementById('restartBtn');

const bestTimeKey = 'memory2_best_time';
const symbols = ['👾', '🧩', '🚀', '⚡', '🃏', '🎯', '💣', '🛸'];

let deck = [];
let firstCard = null;
let secondCard = null;
let lockBoard = false;
let moves = 0;
let matches = 0;
let streak = 0;
let startedAt = null;
let timerId = null;

const bestTime = Number(localStorage.getItem(bestTimeKey) || 0);
bestTimeEl.textContent = bestTime > 0 ? formatTime(bestTime) : '--:--';

function formatTime(ms) {
  const total = Math.floor(ms / 1000);
  const minutes = String(Math.floor(total / 60)).padStart(2, '0');
  const seconds = String(total % 60).padStart(2, '0');
  return `${minutes}:${seconds}`;
}

function shuffle(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function startTimer() {
  if (timerId) return;
  startedAt = Date.now();
  timerId = setInterval(() => {
    timerEl.textContent = formatTime(Date.now() - startedAt);
  }, 250);
}

function stopTimer() {
  clearInterval(timerId);
  timerId = null;
}

function resetBoardState() {
  firstCard = null;
  secondCard = null;
  lockBoard = false;
}

function updateStats() {
  movesEl.textContent = String(moves);
  streakEl.textContent = String(streak);
}

function finishGame() {
  stopTimer();
  const elapsed = Date.now() - startedAt;
  timerEl.textContent = formatTime(elapsed);

  const currentBest = Number(localStorage.getItem(bestTimeKey) || 0);
  if (currentBest === 0 || elapsed < currentBest) {
    localStorage.setItem(bestTimeKey, String(elapsed));
    bestTimeEl.textContent = formatTime(elapsed);
    statusEl.textContent = `Nova melhor marca: ${formatTime(elapsed)}!`;
  } else {
    statusEl.textContent = `Concluído em ${formatTime(elapsed)} com ${moves} jogadas.`;
  }
}

function onCardClick(event) {
  const card = event.currentTarget;

  if (lockBoard || card === firstCard || card.classList.contains('matched')) return;

  if (!startedAt) {
    startTimer();
    statusEl.textContent = 'Partida em andamento.';
  }

  card.classList.add('flipped');

  if (!firstCard) {
    firstCard = card;
    return;
  }

  secondCard = card;
  lockBoard = true;
  moves += 1;

  const firstValue = firstCard.dataset.symbol;
  const secondValue = secondCard.dataset.symbol;

  if (firstValue === secondValue) {
    firstCard.classList.add('matched');
    secondCard.classList.add('matched');
    matches += 1;
    streak += 1;
    statusEl.textContent = 'Par encontrado.';
    updateStats();
    resetBoardState();

    if (matches === symbols.length) {
      finishGame();
    }
    return;
  }

  streak = 0;
  updateStats();
  statusEl.textContent = 'Não foi dessa vez.';

  setTimeout(() => {
    firstCard.classList.remove('flipped');
    secondCard.classList.remove('flipped');
    resetBoardState();
  }, 700);
}

function buildDeck() {
  deck = shuffle([...symbols, ...symbols]).map((symbol, index) => ({
    id: `card-${index}-${symbol}`,
    symbol
  }));
}

function renderBoard() {
  boardEl.innerHTML = '';
  deck.forEach(item => {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'card';
    card.dataset.symbol = item.symbol;
    card.setAttribute('aria-label', 'Carta virada para baixo');
    card.innerHTML = `
      <span class="card-face card-front">?</span>
      <span class="card-face card-back">${item.symbol}</span>
    `;
    card.addEventListener('click', onCardClick);
    boardEl.appendChild(card);
  });
}

function resetGame() {
  stopTimer();
  timerEl.textContent = '00:00';
  moves = 0;
  matches = 0;
  streak = 0;
  startedAt = null;
  updateStats();
  resetBoardState();
  statusEl.textContent = 'Clique em duas cartas para começar.';
  buildDeck();
  renderBoard();
}

document.addEventListener('keydown', event => {
  if (event.key.toLowerCase() === 'r') {
    resetGame();
  }
});

restartBtn.addEventListener('click', resetGame);
resetGame();
