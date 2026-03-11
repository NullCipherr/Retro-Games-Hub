// Animated background for intro page
const canvas = document.getElementById('intro-bg');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Particle system for stars
class Star {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.speedY = Math.random() * 0.5 + 0.2;
        this.opacity = Math.random();
        this.fadeSpeed = Math.random() * 0.02 + 0.01;
    }

    update() {
        this.y += this.speedY;
        this.x += this.speedX;
        this.opacity += this.fadeSpeed;

        if (this.opacity >= 1 || this.opacity <= 0) {
            this.fadeSpeed *= -1;
        }

        if (this.y > canvas.height) {
            this.y = 0;
            this.x = Math.random() * canvas.width;
        }

        if (this.x > canvas.width || this.x < 0) {
            this.x = Math.random() * canvas.width;
        }
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = '#fff';
        ctx.shadowBlur = 5;
        ctx.shadowColor = '#00f3ff';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

// Alien invader silhouettes
class AlienSilhouette {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = -50;
        this.size = Math.random() * 30 + 20;
        this.speed = Math.random() * 0.5 + 0.2;
        this.opacity = Math.random() * 0.3 + 0.1;
        this.color = ['#00f3ff', '#bc13fe', '#ff006e'][Math.floor(Math.random() * 3)];
    }

    update() {
        this.y += this.speed;

        if (this.y > canvas.height + 50) {
            this.y = -50;
            this.x = Math.random() * canvas.width;
        }
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.color;

        // Simple alien shape
        ctx.fillRect(this.x, this.y, this.size, this.size * 0.8);

        // Eyes
        ctx.fillStyle = '#000';
        ctx.fillRect(this.x + this.size * 0.2, this.y + this.size * 0.3, this.size * 0.15, this.size * 0.15);
        ctx.fillRect(this.x + this.size * 0.65, this.y + this.size * 0.3, this.size * 0.15, this.size * 0.15);

        ctx.restore();
    }
}

// Create particles
const stars = [];
const aliens = [];

for (let i = 0; i < 150; i++) {
    stars.push(new Star());
}

for (let i = 0; i < 8; i++) {
    aliens.push(new AlienSilhouette());
}

// Animation loop
function animate() {
    ctx.fillStyle = 'rgba(5, 5, 10, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    stars.forEach(star => {
        star.update();
        star.draw();
    });

    aliens.forEach(alien => {
        alien.update();
        alien.draw();
    });

    requestAnimationFrame(animate);
}

animate();

// Resize handler
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});
