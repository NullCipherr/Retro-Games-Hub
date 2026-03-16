<div align="center">
  <h1>🎮 Retro Games Hub</h1>
  <p><i>Um hub interativo com jogos clássicos em HTML, CSS e JavaScript com estética neon futurista</i></p>

  <p>
    <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white" alt="HTML5" />
    <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white" alt="CSS3" />
    <img src="https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript" />
    <img src="https://img.shields.io/badge/GitHub%20Pages-Ready-222222?style=for-the-badge&logo=github" alt="GitHub Pages" />
  </p>
</div>

---

## ⚡ Visão Geral

O **Retro Games Hub** (ARCGames) centraliza uma coleção de jogos retrô em uma interface única, com navegação por categorias, busca rápida e visual arcade moderno.

O projeto foi estruturado em páginas estáticas para facilitar execução local, manutenção e publicação em hosts como **GitHub Pages**.

## ✨ Principais Recursos

- **Hub central com navegação inteligente**:
  - Home com destaques, recomendação do dia e acesso rápido por categoria.
  - Sidebar com busca por nome, filtros e alternância de visualização.
- **Coleção de jogos clássicos**:
  - Space Invaders, Tetris, Xadrez, Breakout, Flappy Bird, Asteroids, Blackjack, Damas e Campo Minado.
- **Experiência visual temática**:
  - Identidade neon/arcade com animações de fundo em canvas.
  - Interface responsiva e organizada para diferentes tamanhos de tela.
- **Arquitetura simples e modular**:
  - Cada jogo possui pasta própria com arquivos independentes (`index`, `game`, `docs`, `script`, `style`).

## 🛠️ Stack Tecnológica

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Animações/Canvas**: API Canvas 2D (intro do hub e telas dos jogos)
- **Deploy**: GitHub Pages (estrutura já compatível)

## 📂 Estrutura do Projeto

```text
.
├── index.html                # Hub principal (ARCGames)
├── assets/
│   ├── css/
│   │   ├── global.css        # Estilos globais
│   │   └── hub.css           # Estilos específicos do hub
│   └── js/
│       └── hub-intro.js      # Animação de fundo da home
└── games/
    ├── asteroids/
    ├── blackjack/
    ├── breakout/
    ├── campo-minado/
    ├── checkers/
    ├── chess/
    ├── flappy-bird/
    ├── space-invaders/
    └── tetris/
```

## 🚀 Como Rodar Localmente

### Pré-requisitos

- Navegador moderno (Chrome, Edge, Firefox, etc.)

### Execução

1. Clone o repositório:
   ```bash
   git clone https://github.com/NullCipherr/Retro-Games-Hub.git
   cd Retro-Games-Hub
   ```

2. Abra o hub:
   - Abrindo diretamente o arquivo `index.html`, ou
   - Servindo com um servidor local simples (recomendado):
   ```bash
   python3 -m http.server 3000
   ```

3. Acesse no navegador:
   - `http://localhost:3000`

## 🕹️ Jogos Disponíveis

- [Space Invaders](./games/space-invaders/index.html)
- [Tetris](./games/tetris/index.html)
- [Xadrez](./games/chess/index.html)
- [Breakout](./games/breakout/index.html)
- [Flappy Bird](./games/flappy-bird/index.html)
- [Asteroids](./games/asteroids/index.html)
- [Blackjack](./games/blackjack/index.html)
- [Damas](./games/checkers/index.html)
- [Campo Minado](./games/campo-minado/index.html)

## ☁️ Deploy

O projeto está pronto para publicação estática em **GitHub Pages**:

- Branch de deploy: `main` (ou a branch configurada no repositório)
- Diretório publicado: raiz do projeto
- Arquivo `.nojekyll` incluído para compatibilidade

---

<div align="center">
  <p>Desenvolvido por <a href="https://github.com/NullCipherr">NullCipherr</a></p>
</div>
