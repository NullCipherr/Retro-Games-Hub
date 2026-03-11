# 🐦 Neon Flappy Bird

Um jogo clássico de Flappy Bird reimaginado com visual neon moderno e premium.

## 🎮 Características

### Gameplay
- **Mecânica Clássica**: Um botão para controlar - simples mas desafiador
- **Física Realista**: Gravidade e impulso precisos para gameplay autêntico
- **Obstáculos Infinitos**: Canos gerados proceduralmente com alturas variadas
- **Sistema de Medalhas**: Conquiste medalhas de Bronze, Prata, Ouro e Diamante
- **Best Score**: Sistema de pontuação máxima salvo localmente
- **Rotação Dinâmica**: Pássaro rotaciona baseado na velocidade

### Visual
- **Estética Neon**: Design cyberpunk com efeitos de brilho neon
- **Efeitos de Partículas**: Rastro ao voar e explosão ao colidir
- **Glassmorphism**: Painéis com efeito de vidro fosco
- **Animações Suaves**: Movimento fluido do pássaro e obstáculos
- **Background Dinâmico**: Céu estrelado com nuvens e pássaros voando

### Recursos Técnicos
- **100% Front-end**: HTML5, CSS3 e JavaScript puro
- **Canvas API**: Renderização otimizada 60 FPS
- **Responsive**: Adaptável para diferentes tamanhos de tela
- **LocalStorage**: Salvamento de best score
- **Controles Múltiplos**: Space, Click ou Touch

## 🕹️ Controles

| Controle | Ação |
|----------|------|
| `Space` | Dar Impulso (Voar) |
| `Click` | Dar Impulso (Voar) |
| `Touch` | Dar Impulso (Voar) |
| `P` | Pausar/Despausar |

## 🏅 Sistema de Medalhas

| Medalha | Pontuação Necessária |
|---------|---------------------|
| 🥉 Bronze | 10+ pontos |
| 🥈 Prata | 20+ pontos |
| 🥇 Ouro | 30+ pontos |
| 💎 Diamante | 50+ pontos |

## 📁 Estrutura de Arquivos

```
Flappy Bird/
├── index.html      # Página inicial com animação
├── game.html       # Página do jogo
├── docs.html       # Documentação completa
├── style.css       # Estilos neon premium
├── script.js       # Lógica principal do jogo
└── intro.js        # Animação da tela inicial
```

## 🎨 Paleta de Cores

- **Primary Cyan**: `#00f3ff` - Pássaro, UI principal
- **Magenta**: `#bc13fe` - Canos (gradiente início)
- **Pink**: `#ff006e` - Canos (gradiente fim)
- **Yellow**: `#ffd000` - Bico do pássaro
- **White**: `#ffffff` - Asa, detalhes

## 🚀 Como Jogar

1. Abra `index.html` no navegador
2. Clique em "COMEÇAR A VOAR"
3. Clique, pressione Space ou toque na tela para fazer o pássaro voar
4. Passe pelos canos sem colidir
5. Cada cano passado = 1 ponto
6. Tente alcançar o high score!

## 🎯 Dicas e Estratégias

1. **Ritmo Constante**: Mantenha cliques regulares, não apresse
2. **Voe no Meio**: Fique no centro da tela para ter mais tempo de reação
3. **Movimentos Suaves**: Evite impulsos bruscos
4. **Foco na Abertura**: Olhe para o espaço entre os canos, não nos canos
5. **Pratique o Timing**: Cada clique deve ser preciso
6. **Mantenha a Calma**: Pânico leva a erros

## 🎮 Mecânicas do Jogo

### Física
- **Gravidade**: 0.5 pixels/frame²
- **Impulso**: -8 pixels/frame
- **Velocidade dos Canos**: 3 pixels/frame
- **Espaçamento**: 180 pixels entre canos
- **Intervalo de Spawn**: 90 frames (~1.5 segundos)

### Colisão
- Detecção precisa de colisão circular
- Game over ao tocar em canos ou chão
- Teto invisível impede voar muito alto

### Pontuação
- +1 ponto ao passar completamente por um par de canos
- Best score salvo automaticamente
- Medalhas desbloqueadas por marcos de pontuação

## ✨ Recursos Especiais

- 🎨 **Pássaro Animado**: Rotação baseada em física
- ✨ **Partículas de Voo**: Rastro luminoso ao voar
- 💥 **Explosão**: Efeito de partículas ao colidir
- 🌟 **Background Animado**: Nuvens, estrelas e pássaros
- 🏅 **Medalha Flutuante**: Animação suave da medalha atual
- 📊 **Stats em Tempo Real**: Score e best score sempre visíveis

## 🔧 Tecnologias Utilizadas

- HTML5 Canvas
- CSS3 (Animations, Glassmorphism, Neon Effects)
- JavaScript ES6+
- LocalStorage API
- Google Fonts (Outfit)

## 📊 Níveis de Dificuldade

| Nível | Score | Descrição |
|-------|-------|-----------|
| **Iniciante** | 0-9 | Aprendendo os controles |
| **Intermediário** | 10-19 | Medalha de Bronze |
| **Avançado** | 20-29 | Medalha de Prata |
| **Expert** | 30-49 | Medalha de Ouro |
| **Mestre** | 50+ | Medalha de Diamante |

## 🎨 Elementos Visuais

### Pássaro
- Corpo circular com brilho neon cyan
- Asa branca animada
- Olho com reflexo
- Bico amarelo
- Rotação dinâmica baseada em velocidade

### Canos
- Gradiente magenta → pink
- Brilho neon
- Caps (tampas) nas extremidades
- Altura aleatória

### Background
- Gradiente escuro (navy → dark purple)
- 100 estrelas estáticas
- Nuvens flutuantes (intro)
- Pássaros voando (intro)

## 🏆 Desafios

- 🥉 **Bronze**: Alcance 10 pontos
- 🥈 **Prata**: Alcance 20 pontos
- 🥇 **Ouro**: Alcance 30 pontos
- 💎 **Diamante**: Alcance 50 pontos
- 👑 **Lendário**: Alcance 100 pontos!

## 📝 Notas de Desenvolvimento

Este jogo foi desenvolvido como parte da coleção "Neon Games", mantendo consistência visual com outros jogos da série (Neon Tetris, Neon Breakout, Neon Space Invaders). O código é limpo, modular e bem comentado.

### Otimizações
- Renderização eficiente com Canvas
- Garbage collection otimizada (remoção de partículas)
- RequestAnimationFrame para 60 FPS suaves
- Detecção de colisão otimizada

## 🎮 Próximas Funcionalidades (Roadmap)

- [ ] Power-ups (escudo, slow motion)
- [ ] Sons e música de fundo
- [ ] Diferentes temas visuais
- [ ] Modo dia/noite
- [ ] Leaderboard online
- [ ] Achievements/Conquistas
- [ ] Modo multiplayer competitivo

## 🐛 Troubleshooting

**O pássaro não responde aos cliques:**
- Certifique-se de que o jogo está iniciado (clique em "Começar a Voar")
- Verifique se o jogo não está pausado

**Score não está salvando:**
- Verifique se o navegador permite LocalStorage
- Limpe o cache se necessário

**Performance ruim:**
- Feche outras abas do navegador
- Use um navegador moderno (Chrome, Firefox, Edge)

---

**Desenvolvido com 💙 usando tecnologias web modernas**

*Boa sorte e bons voos! 🐦✨*
