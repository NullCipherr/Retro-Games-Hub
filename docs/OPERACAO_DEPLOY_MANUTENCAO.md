# Operação, Deploy e Manutenção

## Operação Local

### Execução rápida

```bash
python3 -m http.server 3000
```

Acesso: `http://localhost:3000`

### Execução alternativa

- Abrir `index.html` diretamente no navegador (funciona, mas servidor local é recomendado).

## Deploy

### GitHub Pages

1. Garantir que a branch principal esteja atualizada.
2. Configurar Pages para publicar a raiz do repositório.
3. Manter `.nojekyll` presente para evitar transformação de arquivos.

### Outras plataformas estáticas

- Netlify
- Vercel (modo static)
- Cloudflare Pages

## Rotina de manutenção

- após adicionar/remover jogos, executar `./scripts/sync-games-catalog.sh`;
- revisar links do hub para cada jogo após mudanças de pasta/arquivo;
- validar funcionamento do script principal de cada jogo (`script.js`);
- verificar quebradas visuais em desktop e mobile;
- revisar persistência de dados no `localStorage`.

## Checklist pré-publicação

- `index.html` abre e navega para todos os jogos;
- busca e filtros do hub funcionam;
- sem erros críticos no console em fluxo principal;
- catálogo sincronizado (`./scripts/sync-games-catalog.sh`);
- validação estrutural executada com sucesso (`./scripts/run_validation.sh`).
