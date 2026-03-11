// Animated background for intro page
const canvas = document.getElementById('intro-bg');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const pieces = ['♔', '♕', '♖', '♗', '♘', '♙'];
const floatingPieces = [];

class FloatingPiece {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * canvas.width;
        this.y = -50;
        this.size = Math.random() * 40 + 20;
        this.speed = Math.random() * 2 + 1;
        this.char = pieces[Math.floor(Math.random() * pieces.length)];
        this.color = Math.random() < 0.5 ? '#00f3ff' : '#ff006e';
        this.rotation = Math.random() * Math.PI * 2;
        this.rotSpeed = (Math.random() - 0.5) * 0.02;
    }

    update() {
        this.y += this.speed;
        this.rotation += this.rotSpeed;

        if (this.y > canvas.height + 50) {
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
        ctx.globalAlpha = 0.3;
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.fillText(this.char, 0, 0);
        ctx.restore();
    }
}

for (let i = 0; i < 20; i++) {
    floatingPieces.push(new FloatingPiece());
}

function animate() {
    ctx.fillStyle = '#0a0a14';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    floatingPieces.forEach(p => {
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
