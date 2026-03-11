const canvas = document.getElementById('intro-bg');
const ctx = canvas.getContext('2d');

let width, height;

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}

window.addEventListener('resize', resize);
resize();

const colors = [
    '#a000f0', // T
    '#f0f000', // O
    '#f0a000', // L
    '#0000f0', // J
    '#00f0f0', // I
    '#00f000', // S
    '#f00000', // Z
];

const pieces = [
    [[1, 1, 1], [0, 1, 0]], // T
    [[1, 1], [1, 1]],       // O
    [[1, 0], [1, 0], [1, 1]], // L
    [[0, 1], [0, 1], [1, 1]], // J
    [[1], [1], [1], [1]],     // I
    [[0, 1, 1], [1, 1, 0]],   // S
    [[1, 1, 0], [0, 1, 1]]    // Z
];

let mouse = { x: undefined, y: undefined };

window.addEventListener('mousemove', (event) => {
    mouse.x = event.x;
    mouse.y = event.y;
});

window.addEventListener('mouseout', () => {
    mouse.x = undefined;
    mouse.y = undefined;
});

class FallingPiece {
    constructor() {
        this.reset();
        this.y = Math.random() * height - height; // Start scattered
    }

    reset() {
        this.x = Math.random() * width;
        this.y = -100;
        this.speed = 1 + Math.random() * 3;
        this.size = 20 + Math.random() * 20;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.shape = pieces[Math.floor(Math.random() * pieces.length)];
        this.rotation = Math.floor(Math.random() * 4);
        this.rotationSpeed = (Math.random() - 0.5) * 0.1;
        this.angle = 0;
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        ctx.fillStyle = this.color;
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.color;

        // Center the rotation
        const offset = (this.shape.length * this.size) / 2;
        ctx.translate(-offset, -offset);

        this.shape.forEach((row, rY) => {
            row.forEach((val, rX) => {
                if (val) {
                    ctx.fillRect(
                        rX * this.size,
                        rY * this.size,
                        this.size - 2,
                        this.size - 2
                    );

                    // Inner light
                    ctx.fillStyle = 'rgba(255,255,255,0.3)';
                    ctx.fillRect(
                        rX * this.size,
                        rY * this.size,
                        this.size - 2,
                        this.size / 4
                    );
                    ctx.fillStyle = this.color;
                }
            });
        });

        ctx.shadowBlur = 0;
        ctx.restore();
    }

    update() {
        this.y += this.speed;
        this.angle += this.rotationSpeed;

        // Mouse Interaction
        if (mouse.x && mouse.y) {
            const dx = this.x - mouse.x;
            const dy = this.y - mouse.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const maxDistance = 150;

            if (distance < maxDistance) {
                const forceDirectionX = dx / distance;
                const forceDirectionY = dy / distance;
                const force = (maxDistance - distance) / maxDistance;
                const directionX = forceDirectionX * force * 5;
                const directionY = forceDirectionY * force * 5;

                this.x += directionX;
                this.y += directionY;
            }
        }

        if (this.y > height + 100) {
            this.reset();
        }
    }
}

const fallingPieces = [];
for (let i = 0; i < 30; i++) { // Increased count slightly
    fallingPieces.push(new FallingPiece());
}

function animate() {
    ctx.fillStyle = 'rgba(5, 5, 10, 0.2)'; // Trail effect
    ctx.fillRect(0, 0, width, height);

    fallingPieces.forEach(p => {
        p.update();
        p.draw();
    });

    requestAnimationFrame(animate);
}

animate();
