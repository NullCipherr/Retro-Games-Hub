// Animated background for intro page
const canvas = document.getElementById('intro-bg');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Particle system for clouds and birds
class Cloud {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 60 + 40;
        this.speed = Math.random() * 0.3 + 0.1;
        this.opacity = Math.random() * 0.3 + 0.1;
    }

    update() {
        this.x += this.speed;

        if (this.x > canvas.width + this.size) {
            this.x = -this.size;
            this.y = Math.random() * canvas.height;
        }
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = '#fff';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#00f3ff';

        // Cloud shape (3 circles)
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 0.5, 0, Math.PI * 2);
        ctx.arc(this.x + this.size * 0.4, this.y, this.size * 0.4, 0, Math.PI * 2);
        ctx.arc(this.x + this.size * 0.8, this.y, this.size * 0.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}

// Flying bird silhouette
class FlyingBird {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = -50;
        this.y = Math.random() * canvas.height * 0.6;
        this.size = Math.random() * 20 + 15;
        this.speed = Math.random() * 2 + 1;
        this.wingPhase = Math.random() * Math.PI * 2;
        this.color = ['#00f3ff', '#bc13fe', '#ff006e'][Math.floor(Math.random() * 3)];
    }

    update() {
        this.x += this.speed;
        this.wingPhase += 0.2;

        if (this.x > canvas.width + 50) {
            this.reset();
        }
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);

        const wingOffset = Math.sin(this.wingPhase) * 5;

        ctx.fillStyle = this.color;
        ctx.globalAlpha = 0.6;
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.color;

        // Body
        ctx.beginPath();
        ctx.arc(0, 0, this.size * 0.4, 0, Math.PI * 2);
        ctx.fill();

        // Left wing
        ctx.beginPath();
        ctx.ellipse(-this.size * 0.3, wingOffset, this.size * 0.5, this.size * 0.3, -0.3, 0, Math.PI * 2);
        ctx.fill();

        // Right wing
        ctx.beginPath();
        ctx.ellipse(this.size * 0.3, wingOffset, this.size * 0.5, this.size * 0.3, 0.3, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}

// Floating pipes in background
class FloatingPipe {
    constructor() {
        this.reset();
    }

    reset() {
        this.x = Math.random() * canvas.width;
        this.y = canvas.height + 100;
        this.width = 40;
        this.height = Math.random() * 150 + 100;
        this.speed = Math.random() * 0.5 + 0.2;
        this.opacity = Math.random() * 0.2 + 0.05;
    }

    update() {
        this.y -= this.speed;

        if (this.y < -this.height) {
            this.reset();
        }
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.opacity;

        const gradient = ctx.createLinearGradient(this.x, this.y, this.x + this.width, this.y);
        gradient.addColorStop(0, '#bc13fe');
        gradient.addColorStop(1, '#ff006e');

        ctx.fillStyle = gradient;
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#bc13fe';

        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.fillRect(this.x - 5, this.y, this.width + 10, 20);

        ctx.restore();
    }
}

// Create particles
const clouds = [];
const birds = [];
const pipes = [];

for (let i = 0; i < 8; i++) {
    clouds.push(new Cloud());
}

for (let i = 0; i < 12; i++) {
    birds.push(new FlyingBird());
    birds[i].x = Math.random() * canvas.width;
}

for (let i = 0; i < 6; i++) {
    pipes.push(new FloatingPipe());
    pipes[i].y = Math.random() * canvas.height;
}

// Animation loop
function animate() {
    // Gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#0a0a14');
    gradient.addColorStop(1, '#1a1a2e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw stars
    ctx.fillStyle = '#fff';
    for (let i = 0; i < 100; i++) {
        const x = (i * 37) % canvas.width;
        const y = (i * 53) % canvas.height;
        const size = (i % 3) * 0.5 + 0.5;
        ctx.globalAlpha = 0.2 + (i % 5) * 0.1;
        ctx.fillRect(x, y, size, size);
    }
    ctx.globalAlpha = 1;

    pipes.forEach(pipe => {
        pipe.update();
        pipe.draw();
    });

    clouds.forEach(cloud => {
        cloud.update();
        cloud.draw();
    });

    birds.forEach(bird => {
        bird.update();
        bird.draw();
    });

    requestAnimationFrame(animate);
}

animate();

// Resize handler
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});
