// ARCGames Hub - ARC-themed Background Animation
const canvas = document.getElementById('intro-bg');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const colors = {
    primary: '#8a2be2',   // purple
    secondary: '#ff8c00', // orange
    accent: '#ffd700',    // gold/yellow
    glow: 'rgba(138, 43, 226, 0.3)', // purple glow
    stars: ['#ffffff', '#ffe9c4', '#d4fbff'] // star variations
};

// Star/Pixel class
class Pixel {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2;
        this.color = colors.stars[Math.floor(Math.random() * colors.stars.length)];
        this.blinkSpeed = Math.random() * 0.05 + 0.01;
        this.alpha = Math.random();
        this.blinkDir = Math.random() > 0.5 ? 1 : -1;
    }

    update() {
        this.alpha += this.blinkSpeed * this.blinkDir;
        if (this.alpha >= 1 || this.alpha <= 0.2) {
            this.blinkDir *= -1;
        }
    }

    draw() {
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Base Particle class for common properties
class Particle {
    constructor(x, y, size, color, speedX, speedY, life) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.color = color;
        this.speedX = speedX;
        this.speedY = speedY;
        this.life = life;
        this.maxLife = life;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.life -= 0.5;
    }

    draw() {
        const opacity = this.life / this.maxLife;
        ctx.fillStyle = this.color;
        ctx.globalAlpha = opacity * 0.4;
        ctx.fillRect(this.x, this.y, this.size, this.size);
    }
}

// Comet class extending Particle
class Comet extends Particle {
    constructor() {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const size = Math.random() * 2 + 1;
        const color = Math.random() > 0.5 ? colors.primary : colors.secondary;
        const speedX = (Math.random() - 0.5) * 4; // Faster
        const speedY = (Math.random() - 0.5) * 4;
        const life = Math.random() * 200 + 150;
        super(x, y, size, color, speedX, speedY, life);

        this.tailLength = Math.random() * 30 + 10;
        this.tail = [];
    }

    update() {
        super.update();

        // Add current position to tail
        this.tail.unshift({ x: this.x, y: this.y, life: this.life });

        // Remove old tail segments
        if (this.tail.length > this.tailLength) {
            this.tail.pop();
        }

        if (this.life <= 0) {
            this.reset();
        }

        // Wrap around
        if (this.x < -100) this.x = canvas.width + 100;
        if (this.x > canvas.width + 100) this.x = -100;
        if (this.y < -100) this.y = canvas.height + 100;
        if (this.y > canvas.height + 100) this.y = -100;
    }

    reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 1;
        this.color = Math.random() > 0.5 ? colors.primary : colors.secondary;
        this.speedX = (Math.random() - 0.5) * 4;
        this.speedY = (Math.random() - 0.5) * 4;
        this.life = this.maxLife;
        this.tail = [];
    }

    draw() {
        ctx.save();
        // Draw tail
        for (let i = 0; i < this.tail.length; i++) {
            const segment = this.tail[i];
            const opacity = (segment.life / this.maxLife) * (1 - i / this.tail.length);
            ctx.fillStyle = this.color;
            ctx.globalAlpha = opacity * 0.3;
            ctx.fillRect(segment.x, segment.y, this.size, this.size);
        }

        // Draw head
        super.draw();
        ctx.restore();
    }
}

// Radial burst effect
class RadialBurst {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.lines = [];
        this.numLines = 12;
        this.maxLength = 100;
        this.currentLength = 0;
        this.growing = true;
        this.speed = 2;
        this.opacity = 0.3;

        for (let i = 0; i < this.numLines; i++) {
            this.lines.push({
                angle: (Math.PI * 2 * i) / this.numLines
            });
        }
    }

    update() {
        if (this.growing) {
            this.currentLength += this.speed;
            if (this.currentLength >= this.maxLength) {
                this.growing = false;
            }
        } else {
            this.opacity -= 0.01;
            if (this.opacity <= 0) {
                this.reset();
            }
        }
    }

    reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.currentLength = 0;
        this.growing = true;
        this.opacity = 0.3;
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.strokeStyle = colors.accent;
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';

        this.lines.forEach(line => {
            const endX = this.x + Math.cos(line.angle) * this.currentLength;
            const endY = this.y + Math.sin(line.angle) * this.currentLength;

            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(endX, endY);
            ctx.stroke();
        });

        // Glow
        ctx.shadowBlur = 10;
        ctx.shadowColor = colors.accent;
        this.lines.forEach(line => {
            const endX = this.x + Math.cos(line.angle) * this.currentLength;
            const endY = this.y + Math.sin(line.angle) * this.currentLength;

            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(endX, endY);
            ctx.stroke();
        });

        ctx.restore();
    }
}

// Initialize entities
const pixels = [];
const radialBursts = [];

// Create pixels (stars) - Increased count
for (let i = 0; i < 150; i++) {
    pixels.push(new Pixel());
}

// Create radial bursts
for (let i = 0; i < 2; i++) {
    radialBursts.push(new RadialBurst());
}

// Create comets – bright shooting stars
const comets = [];
for (let i = 0; i < 8; i++) {
    comets.push(new Comet());
}

// Animation loop
function animate() {
    // Clear with fade effect
    // Solid dark cosmic background
    ctx.fillStyle = '#0a0a14';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw pixels (twinkling stars)
    pixels.forEach(pixel => {
        pixel.update();
        pixel.draw();
    });

    // Draw comets (shooting stars)
    comets.forEach(comet => {
        comet.update();
        comet.draw();
    });

    // Draw radial bursts
    radialBursts.forEach(burst => {
        burst.update();
        burst.draw();
    });

    // Reset global alpha
    ctx.globalAlpha = 1;

    requestAnimationFrame(animate);
}

// Handle resize
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

// Start animation
animate();
