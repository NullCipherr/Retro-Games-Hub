# Qualidade, SEO e Acessibilidade

## Estado Atual

### Pontos positivos

- estrutura estática simples e de baixo atrito para deploy;
- uso de `lang="pt-BR"` no documento principal;
- interface responsiva com foco em experiência visual consistente;
- separação entre estilos globais e estilos específicos do hub/jogos.

### Pontos de atenção

- metadados SEO ainda básicos (faltam Open Graph/Twitter cards);
- ausência de landmarks e labels em algumas telas/jogos;
- baixa cobertura de navegação por teclado em partes da UI;
- falta de automação de auditoria (Lighthouse/axe) no pipeline.

## Checklist de Qualidade

- validar contraste de texto em elementos neon;
- garantir foco visível em controles interativos;
- adicionar `meta description` específica por página estratégica;
- mapear heading hierarchy (`h1` a `h3`) sem saltos semânticos;
- revisar `alt` em imagens/ícones relevantes.

## SEO Técnico (prioridades)

1. Padronizar `title` e `meta description` para hub e páginas de jogo.
2. Incluir metadados Open Graph no hub principal.
3. Definir canonical para URL de produção.
4. Criar `sitemap.xml` e `robots.txt`.

## Performance (prioridades)

1. Controlar custo de renderização em loops Canvas.
2. Reduzir repaints desnecessários em animações de fundo.
3. Avaliar compressão de assets em ambiente de hospedagem.
