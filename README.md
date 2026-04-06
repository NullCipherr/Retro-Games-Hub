<div align="center">
  <img src="docs/assets/retro-games-hub-logo.svg" alt="Logo do Retro Games Hub" width="300" />
  <h1>Retro Games Hub</h1>
  <p><i>Hub de jogos retrô migrado para Vue 3 com foco em reuso, manutenção e escala.</i></p>
</div>

---

## Visão Geral

O projeto foi atualizado para **Vue.js (Vue 3 + Vite)** no frontend do hub principal.

### O que mudou

- Front legado (`index.html` com JS inline) foi substituído por aplicação Vue componentizada.
- Estrutura dos jogos e assets estáticos foi centralizada em `public/`.
- Scripts de catálogo e validação foram atualizados para a nova arquitetura.
- Interface do hub mantém: home, catálogo com filtros, perfil e configurações locais.

---

## Stack

- **Frontend do Hub**: Vue 3 + Vite
- **Jogos**: HTML/CSS/JS estáticos (mantidos)
- **Persistência local**: `localStorage`
- **Deploy**: GitHub Pages / qualquer host estático

---

## Estrutura de Pastas

```text
.
├── public/
│   ├── assets/
│   │   ├── css/
│   │   ├── data/
│   │   │   └── games-catalog.json
│   │   └── js/
│   ├── games/
│   │   ├── asteroids/
│   │   ├── blackjack/
│   │   └── ...
│   └── .nojekyll
├── src/
│   ├── components/
│   │   └── GameCard.vue
│   ├── composables/
│   │   └── useProfile.js
│   ├── App.vue
│   ├── main.js
│   └── styles.css
├── scripts/
│   ├── run_validation.sh
│   └── sync-games-catalog.sh
├── docs/
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

---

## Como Rodar

### 1. Instalação

```bash
npm install
```

### 2. Desenvolvimento

```bash
npm run dev
```

### 3. Build de produção

```bash
npm run build
npm run preview
```

---

## Scripts

- `npm run sync:catalog`: atualiza `public/assets/data/games-catalog.json` com base em `public/games/*`.
- `npm run validate`: valida estrutura + contratos mínimos de SEO + acessibilidade do hub/jogos e gera relatório em `docs/reports`.

---

## Qualidade de release

- Convenções de estrutura por jogo: `docs/CONVENCOES_ESTRUTURA_JOGOS.md`
- Checklist responsivo por release: `docs/CHECKLIST_RELEASE_RESPONSIVO.md`
- Guia de qualidade/SEO/a11y: `docs/QUALIDADE_SEO_ACESSIBILIDADE.md`

---

## Manutenção

### Adicionar novo jogo

1. Criar pasta em `public/games/<slug>/`.
2. Incluir arquivos mínimos:
   - `index.html`
   - `docs.html`
   - `script.js`
   - `style.css`
3. Rodar:

```bash
npm run sync:catalog
```

4. Validar:

```bash
npm run validate
```

---

## Licença

Projeto sob licença [MIT](LICENSE).
