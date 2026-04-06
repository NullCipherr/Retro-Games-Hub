# Guia de Componentes da Game UI

## Objetivo

Padronizar a interface de entrada e painel de jogos com o mesmo design do Snake 2.0, reduzindo tempo de implementação e inconsistências visuais.

## Arquivo Base Compartilhado

- `assets/css/game-ui.css`

Esse arquivo centraliza os componentes de layout e estilo reutilizáveis.

## Componentes Disponíveis

- `game-ui-body`: corpo da página com fundo, tipografia e comportamento horizontal.
- `topbar`, `brand`, `links`: cabeçalho padrão de jogo.
- `layout`: grid principal (`área de jogo` + `painel`).
- `game-shell`: contêiner visual para canvas/preview.
- `board-shell`: variação para jogos de grade (ex.: memória).
- `overlay`: camada de CTA/mensagem sobre área do jogo.
- `overlay-static`: versão estática para páginas de entrada.
- `panel`: painel lateral de status e contexto.
- `controls`: bloco de lista de controles.
- `status`: bloco de dica/estado.
- `panel-actions`: agrupador de botões de ação.
- `game-ui-btn` + `secondary`: botões padrão primário/secundário.

## Como Criar um Novo Jogo

1. Copie `docs/templates/game-ui-index-template.html` para `games/<slug>/index.html`.
2. Preencha placeholders (nome, descrição, controles, cores e links).
3. Mantenha o link para `../../assets/css/game-ui.css`.
4. Crie `style.css` local apenas para regras específicas do jogo (canvas, cartas, peças etc.).
5. Garanta contrato mínimo de SEO e acessibilidade em todas as páginas HTML do jogo:
- `meta description`, `og:title`, `og:description`, `og:type`, `twitter:card`;
- `skip-link` + `<main id="main-content" tabindex="-1">`;
- `aria-label` em cada `<nav>` relevante.
6. Atualize catálogo com:

```bash
./scripts/sync-games-catalog.sh
```

## Boas Práticas de Extensão

- Não duplicar `topbar/layout/panel` em `style.css` do jogo.
- Sobrescrever apenas tokens CSS (`--game-ui-*`) quando precisar personalização visual.
- Concentrar regras específicas no escopo do jogo (`#canvas-id`, `.card`, `.piece`, etc.).
- Manter `docs.html` com regras e controles do jogo.

## Exemplo de Personalização Mínima no Jogo

```css
:root {
  --game-ui-cyan: #22e8ff;
  --game-ui-pink: #ff6c8f;
}

#meuCanvas {
  aspect-ratio: 16 / 9;
}
```
