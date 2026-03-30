# Catálogo de Jogos

O catálogo do hub é alimentado automaticamente por `assets/data/games-catalog.json`, gerado pelo script `./scripts/sync-games-catalog.sh`.

## Jogos Disponíveis

| Jogo | Categoria | Link |
| --- | --- | --- |
| Asteroids | Ação | `games/asteroids/index.html` |
| Blackjack | Cartas | `games/blackjack/index.html` |
| Breakout | Ação | `games/breakout/index.html` |
| Campo Minado | Estratégia | `games/campo-minado/index.html` |
| Damas | Estratégia | `games/checkers/index.html` |
| Xadrez | Estratégia | `games/chess/index.html` |
| Flappy Bird | Ação | `games/flappy-bird/index.html` |
| Memory Match 2.0 | Estratégia | `games/memory-match-2/index.html` |
| Pong 2.0 | Ação | `games/pong-2/index.html` |
| Snake 2.0 | Ação | `games/snake-2/index.html` |
| Space Invaders | Ação | `games/space-invaders/index.html` |
| Tetris | Arcade | `games/tetris/index.html` |

## Persistência Local por Jogo

- `spaceInvadersHighScore`
- `flappyBirdBestScore`
- `asteroidsHighScore`
- `snake2_best`
- `pong2_best_streak`
- `memory2_best_time`
- `tetris_difficulty`
- `tetris_ghost`
- `tetris_particles`

## Controles Gerais (resumo)

- Jogos de ação/arcade: setas, `Space` e `P` (quando aplicável).
- Jogos de tabuleiro/cartas: interação por clique em botões/tabuleiro.
- Perfis e preferências do hub: interface gráfica com gravação local.

## Referência detalhada

Cada jogo possui documentação específica em `games/<slug>/docs.html` e, em alguns casos, `games/<slug>/README.md`.
