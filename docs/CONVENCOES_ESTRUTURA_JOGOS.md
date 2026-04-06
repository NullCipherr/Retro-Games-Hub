# Convenções de Estrutura de Jogos

## Objetivo

Definir um contrato único para criação e manutenção de jogos em `public/games/<slug>/`, reduzindo divergência entre páginas, regressões de SEO e inconsistências de acessibilidade.

## Estrutura mínima obrigatória

Cada jogo deve conter:

- `index.html`: landing/entrada do jogo;
- `docs.html`: guia com regras e controles;
- `script.js`: lógica principal;
- `style.css`: estilos específicos do jogo.

## Estrutura recomendada

Itens não obrigatórios, mas fortemente recomendados:

- `game.html`: tela dedicada de gameplay quando o fluxo não é direto no `index.html`;
- `README.md`: documentação técnica curta do jogo (objetivo, controles, limitações e manutenção).

## Contrato de SEO mínimo (todas as páginas HTML do jogo)

Cada arquivo `.html` em `public/games/<slug>/` deve conter:

- `<meta name="description" ...>`;
- `<meta property="og:title" ...>`;
- `<meta property="og:description" ...>`;
- `<meta property="og:type" content="website">`;
- `<meta name="twitter:card" content="summary">`.

## Contrato de acessibilidade mínima (todas as páginas HTML do jogo)

Cada arquivo `.html` em `public/games/<slug>/` deve conter:

- skip-link para conteúdo principal: `class="skip-link"`;
- landmark principal: `<main id="main-content" tabindex="-1">`;
- quando houver `<nav>`, incluir `aria-label` descritivo.

## Convenção de nomenclatura

- Diretório do jogo em `kebab-case` (`space-invaders`, `snake-2`);
- IDs e classes semânticos e coerentes com o domínio do jogo;
- evitar nomes genéricos sem contexto como `container2`, `box-final`.

## Fluxo recomendado ao adicionar/alterar jogo

1. Criar/ajustar arquivos obrigatórios no diretório do jogo.
2. Aplicar o template de UI compartilhado quando aplicável (`docs/templates/game-ui-index-template.html`).
3. Sincronizar catálogo:

```bash
npm run sync:catalog
```

4. Validar contratos estruturais, SEO e acessibilidade:

```bash
npm run validate
```

