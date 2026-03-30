# Arquitetura

## Visão de Alto Nível

O projeto é uma aplicação estática com um hub principal (`index.html`) e múltiplos jogos independentes em `games/*`.

### Componentes principais

- **Hub principal**: navegação, busca, filtros e acesso aos jogos.
- **Camada visual compartilhada**: `assets/css/global.css` e `assets/css/hub.css`.
- **Componentes reutilizáveis de UI de jogo**: `assets/css/game-ui.css`.
- **Animação global de fundo**: `assets/js/hub-intro.js`.
- **Módulos de jogo**: cada pasta em `games/` possui assets e lógica isolados.

## Fluxo da Aplicação

1. Usuário carrega `index.html`.
2. O hub alterna views (home, catálogo, perfil, configurações) com JavaScript da própria página.
3. Busca, filtro por categoria e ordenação atuam sobre cards em memória no DOM.
4. Navegação para jogos ocorre via links estáticos (`games/<slug>/index.html`).
5. O jogo selecionado renderiza UI e loop principal localmente (Canvas/DOM).
6. Perfil e recordes são persistidos via `localStorage` quando suportado.

## Organização por Jogo

Estrutura padrão observada (com pequenas variações):

- `index.html`: tela de entrada/menu do jogo.
- `game.html` ou variação equivalente: sessão principal de gameplay.
- `docs.html`: regras e guia do jogo.
- `script.js`: lógica do jogo.
- `style.css`: estilos específicos.
- `game.html`: sessão principal de gameplay (quando o jogo separa entrada e execução).

## Padrão de Interface dos Jogos (Game UI)

- A camada `assets/css/game-ui.css` centraliza os componentes visuais de entrada e painel dos jogos.
- Jogos devem reutilizar classes padrão (`topbar`, `layout`, `game-shell`, `panel`, `controls`, `status`, `game-ui-btn`) e evitar duplicação estrutural em `style.css`.
- Cada jogo mantém customização por tokens (`--game-ui-*`) e regras locais de gameplay (canvas/cartas/peças).
- Template oficial para novos jogos: `docs/templates/game-ui-index-template.html`.
- Guia de uso e extensão: `docs/GUIA_GAME_UI_COMPONENTES.md`.

## Acoplamento e Fronteiras

- Não há dependência de build ou bundler.
- Cada jogo pode evoluir sem impactar o runtime dos demais.
- O hub atua como orquestrador de navegação e descoberta, sem centralizar lógica interna dos jogos.

## Decisões Técnicas Relevantes

- escolha por arquitetura estática para simplificar deploy e distribuição;
- separação de estilos globais e específicos para reduzir conflitos visuais;
- persistência local para evitar backend obrigatório em cenários de hobby/portfólio.
