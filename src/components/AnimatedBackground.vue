<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';

const props = defineProps({
  enabled: {
    type: Boolean,
    default: true
  }
});

const canvasRef = ref(null);
let ctx = null;
let animationId = 0;
let stars = [];
let comets = [];
let width = 0;
let height = 0;

function createStar() {
  return {
    x: Math.random() * width,
    y: Math.random() * height,
    radius: Math.random() * 1.8 + 0.3,
    alpha: Math.random(),
    speed: Math.random() * 0.015 + 0.005
  };
}

function createComet() {
  return {
    x: Math.random() * width,
    y: Math.random() * height,
    vx: Math.random() * 1.3 + 0.8,
    vy: Math.random() * 0.4 - 0.2,
    life: Math.random() * 300 + 220
  };
}

function resizeCanvas() {
  const canvas = canvasRef.value;
  if (!canvas) return;

  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width;
  canvas.height = height;

  const starCount = Math.max(90, Math.floor((width * height) / 19000));
  const cometCount = 6;
  stars = Array.from({ length: starCount }, createStar);
  comets = Array.from({ length: cometCount }, createComet);
}

function draw() {
  if (!ctx || !props.enabled) return;

  ctx.clearRect(0, 0, width, height);

  for (const star of stars) {
    star.alpha += star.speed;
    if (star.alpha >= 1 || star.alpha <= 0.2) {
      star.speed *= -1;
    }

    ctx.beginPath();
    ctx.fillStyle = `rgba(220, 245, 255, ${star.alpha})`;
    ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
    ctx.fill();
  }

  for (const comet of comets) {
    comet.x += comet.vx;
    comet.y += comet.vy;
    comet.life -= 1;

    const gradient = ctx.createLinearGradient(comet.x - 80, comet.y, comet.x, comet.y);
    gradient.addColorStop(0, 'rgba(255, 138, 61, 0)');
    gradient.addColorStop(1, 'rgba(0, 212, 199, 0.9)');

    ctx.beginPath();
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 2;
    ctx.moveTo(comet.x - 80, comet.y);
    ctx.lineTo(comet.x, comet.y);
    ctx.stroke();

    ctx.beginPath();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.arc(comet.x, comet.y, 1.8, 0, Math.PI * 2);
    ctx.fill();

    if (comet.life <= 0 || comet.x > width + 120 || comet.y < -120 || comet.y > height + 120) {
      Object.assign(comet, createComet(), { x: -120, y: Math.random() * height });
    }
  }

  animationId = window.requestAnimationFrame(draw);
}

function startAnimation() {
  if (!ctx || animationId) return;
  animationId = window.requestAnimationFrame(draw);
}

function stopAnimation() {
  if (!animationId) return;
  window.cancelAnimationFrame(animationId);
  animationId = 0;

  if (ctx) {
    ctx.clearRect(0, 0, width, height);
  }
}

onMounted(() => {
  const canvas = canvasRef.value;
  if (!canvas) return;

  ctx = canvas.getContext('2d');
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  if (props.enabled) {
    startAnimation();
  }
});

watch(
  () => props.enabled,
  (enabled) => {
    if (enabled) {
      startAnimation();
    } else {
      stopAnimation();
    }
  }
);

onBeforeUnmount(() => {
  stopAnimation();
  window.removeEventListener('resize', resizeCanvas);
});
</script>

<template>
  <canvas ref="canvasRef" class="background-canvas" aria-hidden="true"></canvas>
</template>
