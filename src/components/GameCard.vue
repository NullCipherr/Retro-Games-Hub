<script setup>
defineProps({
  game: {
    type: Object,
    required: true
  },
  mode: {
    type: String,
    default: 'grid'
  }
});
</script>

<template>
  <a class="game-card" :class="[`mode-${mode}`]" :href="`games/${game.slug}/index.html`">
    <div class="game-card__icon" aria-hidden="true">{{ game.icon || '🎮' }}</div>
    <div class="game-card__body">
      <p class="game-card__category">{{ game.categoryLabel || game.category }}</p>
      <h3 class="game-card__title">{{ game.title }}</h3>
      <p class="game-card__description">{{ game.description }}</p>
      <span class="game-card__cta">Jogar agora</span>
    </div>
    <span v-if="game.badge" class="game-card__badge">{{ game.badge }}</span>
  </a>
</template>
