// Animated background for intro page
const canvas = document.getElementById('intro-bg');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const cols = Math.floor(canvas.width / 40);
const rows = Math.floor(canvas.height / 40);
const cells = [];

// Initialize grid cells
for (let i = 0; i < cols; i++) {
    cells[i] = [];
    for (let j = 0; j < rows; j++) {
        cells[i][j] = {
            x: i * 40,
            y: j * 40,
            alpha: 0,
            targetAlpha: 0,
            delay: Math.random() * 100
        };
    }
}

function animate() {
    ctx.fillStyle = '#0a0a14';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            const cell = cells[i][j];

            // Randomly light up cells
            if (Math.random() < 0.005) {
                cell.targetAlpha = Math.random() * 0.5 + 0.1;
            }

            // Decay alpha
            if (cell.alpha < cell.targetAlpha) {
                cell.alpha += 0.02;
            } else {
                cell.alpha -= 0.01;
                cell.targetAlpha = 0;
            }

            if (cell.alpha < 0) cell.alpha = 0;

            if (cell.alpha > 0) {
                ctx.fillStyle = `rgba(0, 243, 255, ${cell.alpha})`;
                ctx.fillRect(cell.x, cell.y, 38, 38);

                ctx.strokeStyle = `rgba(0, 243, 255, ${cell.alpha * 0.5})`;
                ctx.strokeRect(cell.x, cell.y, 38, 38);
            }
        }
    }

    requestAnimationFrame(animate);
}

animate();

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});
