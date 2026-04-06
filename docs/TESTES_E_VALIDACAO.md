# Testes e Validação

## Estratégia atual

O projeto ainda não possui suíte automatizada de testes de gameplay.

Atualmente, a verificação está organizada em duas camadas:

- **Validação automatizada de estrutura + SEO mínimo + acessibilidade básica** por script shell;
- **Validação funcional manual** com roteiro de smoke test.

## Script de validação estrutural

```bash
./scripts/sync-games-catalog.sh
./scripts/run_validation.sh
```

Saídas geradas:

- `docs/reports/latest_validacao_report.md`
- `docs/reports/latest_validacao_report.raw.log`

## Smoke test manual sugerido

1. Abrir hub em `http://localhost:3000`.
2. Confirmar render da home e da sidebar.
3. Validar busca por nome (ex.: `tetris`).
4. Alternar filtros por categoria.
5. Abrir cada jogo e confirmar carregamento da tela inicial.
6. Iniciar gameplay em pelo menos 3 jogos com mecânicas diferentes.
7. Validar persistência local de perfil/high score.

## Próximos passos de qualidade

- incorporar Playwright para smoke tests de navegação;
- adicionar checklist automatizado de links quebrados;
- incluir auditoria Lighthouse para rotas críticas.
