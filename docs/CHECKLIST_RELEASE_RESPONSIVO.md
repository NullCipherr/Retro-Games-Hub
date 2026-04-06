# Checklist de Revisão Visual Responsiva por Release

## Objetivo

Padronizar a revisão visual antes de publicação para evitar regressões de layout, usabilidade e legibilidade entre hub e jogos.

## Escopo mínimo

Validar no mínimo:

- Hub principal (`/`);
- Página `index.html` de cada jogo;
- Página `docs.html` de cada jogo;
- Página `game.html` quando existir.

## Breakpoints de revisão

- Mobile: 360x800;
- Tablet: 768x1024;
- Desktop: 1366x768;
- Desktop amplo: 1920x1080.

## Checklist de UI e UX

- Layout não quebra horizontalmente sem intenção;
- texto não vaza/recorta em botões, cards e títulos;
- controles clicáveis mantêm área de toque confortável;
- overlays/modais mantêm leitura e foco visual;
- painéis laterais não ocultam informação essencial;
- canvas e elementos de jogo preservam proporção esperada;
- elementos críticos continuam acessíveis por teclado;
- skip-link aparece ao foco e navega para o conteúdo principal;
- foco visível está claro em links, botões, inputs e selects.

## Checklist de qualidade visual

- contraste suficiente entre texto e fundo;
- consistência tipográfica entre páginas do mesmo jogo;
- espaçamento e hierarquia visual coerentes;
- estados `hover`, `focus` e `active` perceptíveis;
- ausência de tremulação/overflow em animações de entrada.

## Evidência da revisão

Registrar no PR/release:

- data da revisão;
- responsável;
- telas validadas;
- principais ajustes feitos;
- riscos residuais aceitos.

## Gate de publicação

Antes do deploy:

1. Rodar `npm run validate`;
2. Confirmar checklist responsivo completo;
3. Atualizar documentação se houver mudança estrutural.

