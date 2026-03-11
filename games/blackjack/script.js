const canvas = document.getElementById('blackjack-table');
const context = canvas.getContext('2d');

// Game Constants
const SUITS = ['♠', '♥', '♣', '♦'];
const VALUES = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
const COLORS = {
    table: '#0a0a14',
    cardBg: '#1a1a2e',
    cardBorder: '#00f3ff',
    text: '#ffffff',
    red: '#ff006e',
    black: '#00f3ff', // Cyan for black suits in neon theme
    gold: '#ffd000'
};

// Game State
let deck = [];
let playerHand = [];
let dealerHand = [];
let balance = 1000;
let currentBet = 0;
let gameState = 'betting'; // betting, playing, dealerTurn, gameOver
let message = '';

// Card Class
class Card {
    constructor(suit, value) {
        this.suit = suit;
        this.value = value;
        this.x = 0;
        this.y = 0;
        this.targetX = 0;
        this.targetY = 0;
        this.faceUp = true;
    }

    getNumericValue() {
        if (['J', 'Q', 'K'].includes(this.value)) return 10;
        if (this.value === 'A') return 11;
        return parseInt(this.value);
    }
}

// Deck Functions
function createDeck() {
    deck = [];
    for (let suit of SUITS) {
        for (let value of VALUES) {
            deck.push(new Card(suit, value));
        }
    }
    shuffleDeck();
}

function shuffleDeck() {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
}

function dealCard(hand, faceUp = true) {
    if (deck.length === 0) createDeck();
    const card = deck.pop();
    card.faceUp = faceUp;
    hand.push(card);
    return card;
}

// Game Logic
function calculateScore(hand) {
    let score = 0;
    let aces = 0;

    for (let card of hand) {
        if (card.faceUp || gameState === 'gameOver' || gameState === 'dealerTurn') {
            score += card.getNumericValue();
            if (card.value === 'A') aces++;
        }
    }

    while (score > 21 && aces > 0) {
        score -= 10;
        aces--;
    }

    return score;
}

function startGame() {
    if (currentBet === 0) {
        alert("Faça uma aposta primeiro!");
        return;
    }

    gameState = 'playing';
    playerHand = [];
    dealerHand = [];

    // Initial Deal
    dealCard(playerHand);
    dealCard(dealerHand); // Dealer face up
    dealCard(playerHand);
    dealCard(dealerHand, false); // Dealer hole card

    updateUI();
    animateDeal();

    // Check for Blackjack immediately
    const playerScore = calculateScore(playerHand);
    if (playerScore === 21) {
        stand();
    }
}

function hit() {
    dealCard(playerHand);
    animateDeal();

    const score = calculateScore(playerHand);
    if (score > 21) {
        endGame('bust');
    }
    updateUI();
}

function stand() {
    gameState = 'dealerTurn';
    dealerHand[1].faceUp = true; // Reveal hole card

    let dealerScore = calculateScore(dealerHand);

    const dealerPlay = setInterval(() => {
        dealerScore = calculateScore(dealerHand);
        if (dealerScore < 17) {
            dealCard(dealerHand);
            animateDeal();
            updateUI();
        } else {
            clearInterval(dealerPlay);
            determineWinner();
        }
    }, 1000);

    updateUI();
}

function doubleDown() {
    if (balance >= currentBet) {
        balance -= currentBet;
        currentBet *= 2;
        dealCard(playerHand);
        animateDeal();

        const score = calculateScore(playerHand);
        if (score > 21) {
            endGame('bust');
        } else {
            stand();
        }
        updateUI();
    }
}

function determineWinner() {
    const playerScore = calculateScore(playerHand);
    const dealerScore = calculateScore(dealerHand);

    if (dealerScore > 21) {
        endGame('win', 'Dealer estourou!');
    } else if (playerScore > dealerScore) {
        endGame('win', 'Você venceu!');
    } else if (playerScore < dealerScore) {
        endGame('lose', 'Dealer venceu.');
    } else {
        endGame('push', 'Empate.');
    }
}

function endGame(result, msg) {
    gameState = 'gameOver';
    message = msg || '';

    if (result === 'win') {
        balance += currentBet * 2;
        if (calculateScore(playerHand) === 21 && playerHand.length === 2) {
            balance += currentBet * 0.5; // Blackjack bonus 3:2
            message = "BLACKJACK! " + message;
        }
        document.getElementById('result-title').innerText = "VITÓRIA!";
        document.getElementById('result-title').style.color = COLORS.gold;
    } else if (result === 'lose' || result === 'bust') {
        document.getElementById('result-title').innerText = "DERROTA";
        document.getElementById('result-title').style.color = COLORS.red;
        if (result === 'bust') message = "Você estourou!";
    } else {
        balance += currentBet;
        document.getElementById('result-title').innerText = "EMPATE";
        document.getElementById('result-title').style.color = "#fff";
    }

    document.getElementById('result-message').innerText = message;
    setTimeout(() => {
        document.getElementById('game-over-modal').classList.remove('hidden');
    }, 1000);

    currentBet = 0;
    updateUI();
}

// Drawing
function drawCard(card, x, y) {
    const width = 100;
    const height = 140;
    const radius = 10;

    // Card Background
    context.fillStyle = COLORS.cardBg;
    context.strokeStyle = COLORS.cardBorder;
    context.lineWidth = 2;

    context.beginPath();
    context.roundRect(x, y, width, height, radius);
    context.fill();
    context.stroke();

    if (card.faceUp) {
        // Suit Color
        context.fillStyle = (card.suit === '♥' || card.suit === '♦') ? COLORS.red : COLORS.black;

        // Top Left
        context.font = "20px Outfit";
        context.textAlign = "left";
        context.fillText(card.value, x + 10, y + 25);
        context.fillText(card.suit, x + 10, y + 45);

        // Center
        context.font = "40px Outfit";
        context.textAlign = "center";
        context.fillText(card.suit, x + width / 2, y + height / 2 + 15);

        // Bottom Right
        context.save();
        context.translate(x + width - 10, y + height - 10);
        context.rotate(Math.PI);
        context.textAlign = "left";
        context.fillText(card.value, 0, 0);
        context.fillText(card.suit, 0, 20);
        context.restore();
    } else {
        // Card Back Pattern
        context.fillStyle = COLORS.cardBorder;
        context.globalAlpha = 0.1;
        for (let i = 0; i < width; i += 10) {
            context.fillRect(x + i, y, 2, height);
        }
        context.globalAlpha = 1.0;

        context.font = "30px Outfit";
        context.fillStyle = COLORS.cardBorder;
        context.textAlign = "center";
        context.fillText("NEON", x + width / 2, y + height / 2);
    }
}

function draw() {
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Dealer Hand
    context.fillStyle = "#fff";
    context.font = "20px Outfit";
    context.textAlign = "center";
    context.fillText("DEALER", canvas.width / 2, 50);

    let startX = (canvas.width - (dealerHand.length * 110)) / 2;
    dealerHand.forEach((card, index) => {
        drawCard(card, startX + index * 110, 70);
    });

    if (dealerHand.length > 0 && gameState !== 'betting') {
        const score = calculateScore(dealerHand);
        if (gameState === 'gameOver' || gameState === 'dealerTurn') {
            context.fillText(score, canvas.width / 2, 230);
        }
    }

    // Draw Player Hand
    context.fillText("VOCÊ", canvas.width / 2, 350);

    startX = (canvas.width - (playerHand.length * 110)) / 2;
    playerHand.forEach((card, index) => {
        drawCard(card, startX + index * 110, 370);
    });

    if (playerHand.length > 0) {
        const score = calculateScore(playerHand);
        context.fillText(score, canvas.width / 2, 530);
    }
}

function animateDeal() {
    // Simple redraw for now, could add interpolation later
    draw();
}

// UI Updates
function updateUI() {
    document.getElementById('balance').innerText = `$${balance}`;
    document.getElementById('current-bet').innerText = `$${currentBet}`;

    const bettingControls = document.getElementById('betting-controls');
    const actionControls = document.getElementById('action-controls');

    if (gameState === 'betting') {
        bettingControls.classList.remove('hidden');
        actionControls.classList.add('hidden');
    } else if (gameState === 'playing') {
        bettingControls.classList.add('hidden');
        actionControls.classList.remove('hidden');
    } else {
        // Game Over or Dealer Turn - hide actions
        actionControls.classList.add('hidden');
    }

    draw();
}

// Event Listeners
document.querySelectorAll('.chip-btn').forEach(btn => {
    if (!btn.classList.contains('action-btn')) {
        btn.addEventListener('click', (e) => {
            const val = parseInt(e.target.dataset.value);
            if (balance >= val) {
                balance -= val;
                currentBet += val;
                updateUI();
            }
        });
    }
});

document.getElementById('btn-deal').addEventListener('click', () => {
    if (currentBet > 0) startGame();
});

document.getElementById('btn-hit').addEventListener('click', hit);
document.getElementById('btn-stand').addEventListener('click', stand);
document.getElementById('btn-double').addEventListener('click', doubleDown);

document.getElementById('btn-start').addEventListener('click', () => {
    document.getElementById('menu-overlay').classList.add('hidden');
    createDeck();
    updateUI();
    draw();
});

document.getElementById('restart-btn').addEventListener('click', () => {
    document.getElementById('game-over-modal').classList.add('hidden');
    gameState = 'betting';
    playerHand = [];
    dealerHand = [];
    updateUI();
});

function quitToMenu() {
    window.location.href = 'index.html';
}

document.getElementById('btn-quit').addEventListener('click', quitToMenu);
document.getElementById('btn-menu-return').addEventListener('click', quitToMenu);
document.getElementById('menu-from-gameover').addEventListener('click', quitToMenu);

// Init
createDeck();
draw();
document.getElementById('menu-overlay').classList.remove('hidden');
