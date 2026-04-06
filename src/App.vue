<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import AnimatedBackground from './components/AnimatedBackground.vue';
import { useProfile } from './composables/useProfile';

const CATEGORY_ICONS = {
  acao: '⚡',
  estrategia: '🧠',
  cartas: '🃏',
  arcade: '🕹️',
  outros: '🎮'
};

const AVATAR_OPTIONS = ['👾', '👨‍🚀', '👽', '🤖', '🐱', '🦊'];

const games = ref([]);
const isLoading = ref(true);
const hasError = ref(false);

const currentView = ref('home');
const selectedCategory = ref('all');
const searchTerm = ref('');
const sortBy = ref('name');
const catalogMode = ref('grid');
const isSidebarCollapsed = ref(false);
const isSidebarOpen = ref(false);

const { profile, settings } = useProfile();
const usernameInput = ref(profile.value.name);
const selectedAvatar = ref(profile.value.avatar);

const normalizedSearch = computed(() => normalizeText(searchTerm.value));

const categories = computed(() => {
  const map = new Map();
  for (const game of games.value) {
    const current = map.get(game.category) ?? {
      slug: game.category,
      label: game.categoryLabel || game.category,
      icon: CATEGORY_ICONS[game.category] || '🎮',
      count: 0
    };
    current.count += 1;
    map.set(game.category, current);
  }
  return Array.from(map.values()).sort((a, b) => a.label.localeCompare(b.label, 'pt-BR'));
});

const featuredGames = computed(() => {
  const featured = games.value.filter((game) => game.featured);
  return (featured.length > 0 ? featured : games.value).slice(0, 3);
});

const recommendedGame = computed(() => {
  return games.value.find((game) => game.recommended) || games.value[0] || null;
});

const filteredGames = computed(() => {
  const filtered = games.value.filter((game) => {
    const normalizedName = normalizeText(
      `${game.title} ${game.slug} ${game.categoryLabel || game.category}`
    );
    const matchesSearch =
      normalizedSearch.value.length === 0 || normalizedName.includes(normalizedSearch.value);
    const matchesCategory =
      selectedCategory.value === 'all' || game.category === selectedCategory.value;
    return matchesSearch && matchesCategory;
  });

  return filtered.sort((a, b) => {
    if (sortBy.value === 'category') {
      return (a.categoryLabel || a.category).localeCompare(
        b.categoryLabel || b.category,
        'pt-BR'
      );
    }
    return a.title.localeCompare(b.title, 'pt-BR');
  });
});

const quickAccessCategories = computed(() => categories.value.slice(0, 4));
const resultsLabel = computed(() => `${filteredGames.value.length} de ${games.value.length} resultados`);

function normalizeText(value) {
  return (value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function closeSidebarMobile() {
  if (window.innerWidth <= 968) {
    isSidebarOpen.value = false;
  }
}

function showHome() {
  currentView.value = 'home';
  selectedCategory.value = 'all';
  searchTerm.value = '';
  closeSidebarMobile();
}

function showCatalog(category = 'all') {
  currentView.value = 'catalog';
  selectedCategory.value = category;
  closeSidebarMobile();
}

function showProfile() {
  currentView.value = 'profile';
  usernameInput.value = profile.value.name;
  selectedAvatar.value = profile.value.avatar;
  closeSidebarMobile();
}

function showSettings() {
  currentView.value = 'settings';
  closeSidebarMobile();
}

function toggleSidebarCollapse() {
  isSidebarCollapsed.value = !isSidebarCollapsed.value;
}

function toggleSidebarMobile() {
  isSidebarOpen.value = !isSidebarOpen.value;
}

function saveProfile() {
  profile.value = {
    name: usernameInput.value?.trim() || 'Convidado',
    avatar: selectedAvatar.value
  };
}

function selectAvatar(avatar) {
  selectedAvatar.value = avatar;
}

function closeSidebarOnOutsideClick(event) {
  if (window.innerWidth > 968 || !isSidebarOpen.value) return;
  const sidebar = event.target.closest('.sidebar');
  const toggle = event.target.closest('.sidebar-toggle');
  if (!sidebar && !toggle) {
    isSidebarOpen.value = false;
  }
}

watch(searchTerm, () => {
  if (currentView.value !== 'catalog') {
    currentView.value = 'catalog';
  }
});

onMounted(async () => {
  document.body.classList.add('intro-body');
  document.addEventListener('click', closeSidebarOnOutsideClick);

  try {
    const response = await fetch('assets/data/games-catalog.json', { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`Falha no carregamento do catálogo (${response.status})`);
    }
    const payload = await response.json();
    games.value = Array.isArray(payload.games) ? payload.games : [];
  } catch (error) {
    hasError.value = true;
    console.error(error);
  } finally {
    isLoading.value = false;
  }
});

onBeforeUnmount(() => {
  document.body.classList.remove('intro-body');
  document.removeEventListener('click', closeSidebarOnOutsideClick);
});
</script>

<template>
  <div class="scanlines" v-show="settings.animateBackground"></div>
  <AnimatedBackground :enabled="settings.animateBackground" />
  <a class="skip-link" href="#main-content">Pular para o conteúdo principal</a>

  <button
    class="sidebar-toggle"
    type="button"
    aria-controls="sidebar"
    :aria-expanded="String(isSidebarOpen)"
    aria-label="Abrir menu"
    @click="toggleSidebarMobile"
  >
    ☰
  </button>

  <div class="hub-container">
    <aside
      id="sidebar"
      class="sidebar"
      :class="{ collapsed: isSidebarCollapsed, active: isSidebarOpen }"
      aria-label="Barra lateral do hub"
    >
      <div class="sidebar-header">
        <button type="button" class="sidebar-brand" aria-label="Ir para início" @click="showHome">
          ARC<span class="highlight">GAMES</span>
        </button>
        <p class="sidebar-subtitle">Hub de jogos retrô</p>
      </div>

      <form class="search-box" role="search" aria-label="Buscar jogos no catálogo" @submit.prevent>
        <label for="searchInput" class="sr-only">Buscar no catálogo</label>
        <input
          id="searchInput"
          v-model="searchTerm"
          type="text"
          placeholder="Buscar na loja..."
          autocomplete="off"
        />
        <span class="search-icon" aria-hidden="true">🔍</span>
      </form>

      <nav class="sidebar-nav" aria-label="Navegação principal">
        <div class="category-section">
          <h3 class="category-title">Navegação</h3>
          <ul class="category-list">
            <li>
              <button
                type="button"
                class="category-item"
                :class="{ active: currentView === 'home' }"
                @click="showHome"
              >
                <span class="category-icon" aria-hidden="true">🏠</span>
                <span>Início</span>
                <span class="category-count">✨</span>
              </button>
            </li>
            <li>
              <button
                type="button"
                class="category-item"
                :class="{ active: currentView === 'catalog' && selectedCategory === 'all' }"
                @click="showCatalog('all')"
              >
                <span class="category-icon" aria-hidden="true">🎮</span>
                <span>Todos os Jogos</span>
                <span class="category-count">{{ games.length }}</span>
              </button>
            </li>
          </ul>
        </div>

        <div class="all-games-options" :hidden="currentView !== 'catalog'">
          <div class="category-section">
            <h3 class="category-title">Categorias</h3>
            <ul class="category-list">
              <li v-for="category in categories" :key="category.slug">
                <button
                  type="button"
                  class="category-item"
                  :class="{ active: currentView === 'catalog' && selectedCategory === category.slug }"
                  @click="showCatalog(category.slug)"
                >
                  <span class="category-icon" aria-hidden="true">{{ category.icon }}</span>
                  <span>{{ category.label }}</span>
                  <span class="category-count">{{ category.count }}</span>
                </button>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      <div class="sidebar-divider" role="separator"></div>

      <div class="sidebar-footer">
        <ul class="category-list">
          <li>
            <button
              type="button"
              class="category-item"
              :class="{ active: currentView === 'profile' }"
              @click="showProfile"
            >
              <span class="category-icon" aria-hidden="true">👤</span>
              <span>Perfil</span>
            </button>
          </li>
          <li>
            <button
              type="button"
              class="category-item"
              :class="{ active: currentView === 'settings' }"
              @click="showSettings"
            >
              <span class="category-icon" aria-hidden="true">⚙️</span>
              <span>Configurações</span>
            </button>
          </li>
        </ul>
      </div>

      <button
        class="sidebar-collapse"
        type="button"
        aria-controls="sidebar"
        :aria-expanded="String(!isSidebarCollapsed)"
        aria-label="Recolher sidebar"
        @click="toggleSidebarCollapse"
      >
        <span aria-hidden="true">{{ isSidebarCollapsed ? '▶' : '◀' }}</span>
      </button>
    </aside>

    <main id="main-content" tabindex="-1" class="main-content">
      <section v-if="isLoading" class="welcome-banner">
        <h2 class="welcome-title">Carregando catálogo...</h2>
      </section>

      <section v-else-if="hasError" class="welcome-banner">
        <h2 class="welcome-title">Não foi possível carregar os jogos</h2>
        <p class="welcome-text">Verifique o arquivo `public/assets/data/games-catalog.json`.</p>
      </section>

      <template v-else>
        <div v-if="currentView === 'home'" class="home-view">
          <div class="welcome-banner">
            <div class="welcome-content">
              <h2 class="welcome-title">
                Bem-vindo{{ profile.name !== 'Convidado' ? `, ${profile.name}` : '' }} ao ARCGames! 🎮
              </h2>
              <p class="welcome-text">Sua coleção premium de jogos clássicos com visual neon futurista</p>
              <div class="welcome-stats">
                <div class="stat-item">
                  <div class="stat-icon">🎯</div>
                  <div class="stat-value">{{ games.length }}</div>
                  <div class="stat-label">Jogos Disponíveis</div>
                </div>
                <div class="stat-item">
                  <div class="stat-icon">🏆</div>
                  <div class="stat-value">{{ categories.length }}</div>
                  <div class="stat-label">Categorias</div>
                </div>
                <div class="stat-item">
                  <div class="stat-icon">⚡</div>
                  <div class="stat-value">100%</div>
                  <div class="stat-label">Diversão</div>
                </div>
              </div>
            </div>
          </div>

          <div class="featured-section">
            <h3 class="section-title"><span class="title-icon">⭐</span> Jogos em Destaque</h3>
            <div class="featured-grid">
              <a
                v-for="game in featuredGames"
                :key="`featured-${game.slug}`"
                :href="`games/${game.slug}/index.html`"
                class="featured-card"
              >
                <div class="featured-badge">{{ game.badge || 'Destaque' }}</div>
                <div class="featured-icon">{{ game.icon || '🎮' }}</div>
                <div class="featured-title">{{ game.title }}</div>
                <div class="featured-desc">{{ game.description }}</div>
              </a>
            </div>
          </div>

          <div class="recommendation-section" v-if="recommendedGame">
            <h3 class="section-title"><span class="title-icon">🎲</span> Recomendação do Dia</h3>
            <div class="recommendation-card">
              <div class="rec-left">
                <div class="rec-icon">{{ recommendedGame.icon || '🎮' }}</div>
              </div>
              <div class="rec-content">
                <div class="rec-badge">Jogo do Dia</div>
                <h4 class="rec-title">{{ recommendedGame.title }}</h4>
                <p class="rec-desc">{{ recommendedGame.description }}</p>
                <a :href="`games/${recommendedGame.slug}/index.html`" class="rec-btn">Jogar Agora</a>
              </div>
            </div>
          </div>

          <div class="quick-access-section">
            <h3 class="section-title"><span class="title-icon">🚀</span> Acesso Rápido</h3>
            <div class="quick-grid">
              <button
                v-for="category in quickAccessCategories"
                :key="`quick-${category.slug}`"
                type="button"
                class="quick-item"
                @click="showCatalog(category.slug)"
              >
                <div class="quick-icon">{{ category.icon }}</div>
                <div class="quick-label">{{ category.label }}</div>
              </button>
            </div>
          </div>
        </div>

        <div v-if="currentView === 'catalog'">
          <div class="games-toolbar">
            <div class="toolbar-group toolbar-search-group">
              <span class="toolbar-label">Buscar:</span>
              <div class="store-search">
                <input
                  v-model="searchTerm"
                  type="text"
                  placeholder="Nome, categoria ou tag..."
                  autocomplete="off"
                />
                <span class="store-search-icon">🔎</span>
              </div>
              <span class="results-meta">{{ resultsLabel }}</span>
            </div>
            <div class="toolbar-group">
              <span class="toolbar-label">Ordenar:</span>
              <button class="toolbar-btn" type="button" @click="sortBy = 'name'">🔤 Nome</button>
              <button class="toolbar-btn" type="button" @click="sortBy = 'category'">📁 Categoria</button>
            </div>
            <div class="toolbar-group">
              <span class="toolbar-label">Visualização:</span>
              <button class="toolbar-btn" type="button" @click="catalogMode = 'grid'">▦ Grade</button>
              <button class="toolbar-btn" type="button" @click="catalogMode = 'list'">☰ Lista</button>
            </div>
          </div>

          <div v-if="filteredGames.length > 0" class="games-grid" :class="{ 'is-list': catalogMode === 'list' }">
            <a
              v-for="game in filteredGames"
              :key="game.slug"
              :href="`games/${game.slug}/index.html`"
              class="game-card"
            >
              <div class="game-icon">{{ game.icon || '🎮' }}</div>
              <div class="game-category">{{ game.categoryLabel || game.category }}</div>
              <div class="game-title">{{ game.title }}</div>
              <div class="game-desc">{{ game.description }}</div>
              <div class="play-btn">Jogar</div>
            </a>
          </div>

          <div v-else class="no-results">
            <div class="no-results-icon">🔍</div>
            <h3>Nenhum jogo encontrado</h3>
            <p>Tente buscar com outros termos</p>
          </div>
        </div>

        <div v-if="currentView === 'profile'" class="profile-view">
          <h2 class="section-title"><span class="title-icon">👤</span> Meu Perfil</h2>
          <div class="profile-container">
            <div class="profile-header">
              <div class="profile-avatar">{{ selectedAvatar }}</div>
              <div class="profile-info">
                <h3>{{ profile.name }}</h3>
                <p>Nível 1 • Explorador</p>
              </div>
            </div>

            <div class="profile-form">
              <div class="form-group">
                <label for="usernameInput">Nome de Usuário</label>
                <input
                  id="usernameInput"
                  v-model="usernameInput"
                  type="text"
                  maxlength="32"
                  placeholder="Digite seu nome"
                />
              </div>

              <div class="form-group">
                <label>Avatar</label>
                <div class="avatar-grid">
                  <button
                    v-for="avatar in AVATAR_OPTIONS"
                    :key="avatar"
                    type="button"
                    class="avatar-option"
                    :class="{ selected: selectedAvatar === avatar }"
                    @click="selectAvatar(avatar)"
                  >
                    {{ avatar }}
                  </button>
                </div>
              </div>

              <button type="button" class="save-btn" @click="saveProfile">Salvar Alterações</button>
            </div>
          </div>
        </div>

        <div v-if="currentView === 'settings'" class="settings-view">
          <h2 class="section-title"><span class="title-icon">⚙️</span> Configurações</h2>
          <div class="settings-container">
            <div class="setting-item">
              <div class="setting-info">
                <h4>Animações de Fundo</h4>
                <p>Ativar ou desativar o fundo cósmico</p>
              </div>
              <label class="switch">
                <input v-model="settings.animateBackground" type="checkbox" />
                <span class="slider round"></span>
              </label>
            </div>
            <div class="setting-item">
              <div class="setting-info">
                <h4>Sons da Interface</h4>
                <p>Efeitos sonoros ao interagir</p>
              </div>
              <label class="switch">
                <input v-model="settings.enableSounds" type="checkbox" />
                <span class="slider round"></span>
              </label>
            </div>
          </div>
        </div>
      </template>
    </main>
  </div>
</template>
