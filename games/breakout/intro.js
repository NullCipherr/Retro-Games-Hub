const canvas = document.getElementById('intro-bg');
const ctx = canvas.getContext('2d');

let width, height;

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}

window.addEventListener('resize', resize);
resize();

const colors = ['#00f3ff', '#bc13fe', '#ff00c1', '#f0f000', '#00f000'];

let mouse = { x: undefined, y: undefined };

window.addEventListener('mousemove', (event) => {
    mouse.x = event.x;
    mouse.y = event.y;
});

window.addEventListener('mouseout', () => {
    mouse.x = undefined;
    mouse.y = undefined;
});

class BouncingBall {
    constructor() {
        this.radius = Math.random() * 15 + 5;
        this.x = Math.random() * (width - this.radius * 2) + this.radius;
        this.y = Math.random() * (height - this.radius * 2) + this.radius;
        this.dx = (Math.random() - 0.5) * 4;
        this.dy = (Math.random() - 0.5) * 4;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.originalRadius = this.radius;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.color;
        ctx.fill();

        // Shine
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.beginPath();
        ctx.arc(this.x - this.radius / 3, this.y - this.radius / 3, this.radius / 4, 0, Math.PI * 2, false);
        ctx.fill();

        ctx.shadowBlur = 0;
        ctx.closePath();
    }

    update() {
        if (this.x + this.radius > width || this.x - this.radius < 0) {
            this.dx = -this.dx;
        }
        if (this.y + this.radius > height || this.y - this.radius < 0) {
            this.dy = -this.dy;
        }

        this.x += this.dx;
        this.y += this.dy;

        // Mouse Interaction
        if (mouse.x && mouse.y) {
            const dx = mouse.x - this.x;
            const dy = mouse.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 150) {
                if (this.radius < this.originalRadius * 2) {
                    this.radius += 1;
                }
            } else if (this.radius > this.originalRadius) {
                this.radius -= 1;
            }
        } else if (this.radius > this.originalRadius) {
            this.radius -= 1;
        }

        this.draw();
    }
}

const balls = [];
for (let i = 0; i < 30; i++) {
    balls.push(new BouncingBall());
}

function animate() {
    ctx.fillStyle = 'rgba(5, 5, 10, 0.2)'; // Trail effect
    ctx.fillRect(0, 0, width, height);

    balls.forEach(ball => {
        ball.update();
    });

    requestAnimationFrame(animate);
}

animate();
