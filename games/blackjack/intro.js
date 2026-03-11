// Animated background for intro page
const canvas = document.getElementById('intro-bg');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const suits = ['♠', '♥', '♣', '♦'];
const particles = [];

class Particle {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * canvas.width;
        this.y = -20;
        this.size = Math.random() * 20 + 10;
        this.speed = Math.random() * 3 + 1;
        this.suit = suits[Math.floor(Math.random() * suits.length)];
        this.color = (this.suit === '♥' || this.suit === '♦') ? '#ff006e' : '#00f3ff';
        this.rotation = Math.random() * Math.PI * 2;
        this.rotSpeed = (Math.random() - 0.5) * 0.1;
        this.opacity = Math.random() * 0.5 + 0.1;
    }

    update() {
        this.y += this.speed;
        this.rotation += this.rotSpeed;

        if (this.y > canvas.height + 20) {
            this.reset();
        }
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.fillStyle = this.color;
        ctx.font = `${this.size}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.globalAlpha = this.opacity;
        ctx.shadowBlur = 5;
        ctx.shadowColor = this.color;
        ctx.fillText(this.suit, 0, 0);
        ctx.restore();
    }
}

for (let i = 0; i < 50; i++) {
    particles.push(new Particle());
}

function animate() {
    ctx.fillStyle = '#0a0a14';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    particles.forEach(p => {
        p.update();
        p.draw();
    });

    requestAnimationFrame(animate);
}

animate();

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});
