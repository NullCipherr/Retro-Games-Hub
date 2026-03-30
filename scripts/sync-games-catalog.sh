#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
GAMES_DIR="$ROOT_DIR/games"
OUT_DIR="$ROOT_DIR/assets/data"
OUT_FILE="$OUT_DIR/games-catalog.json"

mkdir -p "$OUT_DIR"

infer_category() {
  local slug="$1"
  case "$slug" in
    chess|checkers|campo-minado) echo "estrategia" ;;
    blackjack) echo "cartas" ;;
    tetris) echo "arcade" ;;
    memory-match-2) echo "estrategia" ;;
    *) echo "acao" ;;
  esac
}

category_label() {
  local category="$1"
  case "$category" in
    acao) echo "Ação" ;;
    estrategia) echo "Estratégia" ;;
    cartas) echo "Cartas" ;;
    arcade) echo "Arcade" ;;
    *) echo "Outros" ;;
  esac
}

icon_for_game() {
  local slug="$1"
  case "$slug" in
    space-invaders) echo "👾" ;;
    breakout) echo "🧱" ;;
    tetris) echo "🧩" ;;
    flappy-bird) echo "🐦" ;;
    asteroids) echo "☄️" ;;
    blackjack) echo "🃏" ;;
    checkers) echo "♟️" ;;
    chess) echo "♔" ;;
    campo-minado) echo "💣" ;;
    snake-2) echo "🐍" ;;
    pong-2) echo "🏓" ;;
    memory-match-2) echo "🧠" ;;
    *) echo "🎮" ;;
  esac
}

badge_for_game() {
  local slug="$1"
  case "$slug" in
    space-invaders) echo "Popular" ;;
    tetris) echo "Clássico" ;;
    chess) echo "Estratégia" ;;
    snake-2|pong-2|memory-match-2) echo "2.0" ;;
    *) echo "Destaque" ;;
  esac
}

description_for_game() {
  local slug="$1"
  case "$slug" in
    space-invaders) echo "Defenda a Terra da invasão alienígena neste clássico arcade." ;;
    breakout) echo "Destrua blocos neon com física precisa e power-ups." ;;
    tetris) echo "Organize os blocos caindo e limpe as linhas." ;;
    flappy-bird) echo "Voe entre os canos e busque a medalha de diamante." ;;
    asteroids) echo "Navegue pelo espaço e destrua asteroides perigosos." ;;
    blackjack) echo "Desafie o dealer e tente chegar ao 21 sem estourar." ;;
    checkers) echo "Estratégia clássica de tabuleiro com visual neon." ;;
    chess) echo "O jogo dos reis com estética futurista." ;;
    campo-minado) echo "Use a lógica para desarmar o campo minado." ;;
    snake-2) echo "Snake 2.0 com aceleração progressiva e HUD moderno." ;;
    pong-2) echo "Pong 2.0 contra IA adaptativa com rally competitivo." ;;
    memory-match-2) echo "Memory Match 2.0 com métricas de tempo, jogadas e sequência." ;;
    *) echo "Jogo retrô integrado ao hub ARCGames." ;;
  esac
}

title_from_slug() {
  local slug="$1"
  local raw
  raw="${slug//-/ }"
  echo "$raw" | awk '{for (i=1;i<=NF;i++) $i=toupper(substr($i,1,1)) tolower(substr($i,2)); print}'
}

display_title_for_game() {
  local slug="$1"
  case "$slug" in
    checkers) echo "Damas" ;;
    chess) echo "Xadrez" ;;
    snake-2) echo "Snake 2.0" ;;
    pong-2) echo "Pong 2.0" ;;
    memory-match-2) echo "Memory Match 2.0" ;;
    *) title_from_slug "$slug" ;;
  esac
}

is_featured() {
  local slug="$1"
  case "$slug" in
    space-invaders|tetris|chess|snake-2|pong-2) echo "true" ;;
    *) echo "false" ;;
  esac
}

is_recommended() {
  local slug="$1"
  case "$slug" in
    breakout|memory-match-2) echo "true" ;;
    *) echo "false" ;;
  esac
}

json_escape() {
  printf '%s' "$1" | sed 's/\\/\\\\/g; s/"/\\"/g'
}

mapfile -t game_dirs < <(find "$GAMES_DIR" -mindepth 1 -maxdepth 1 -type d | sort)

{
  printf '{\n'
  printf '  "generatedAt": "%s",\n' "$(date --iso-8601=seconds)"
  printf '  "games": [\n'

  written=0

  for game_dir in "${game_dirs[@]}"; do
    slug="$(basename "$game_dir")"

    if [[ ! -f "$game_dir/index.html" ]]; then
      continue
    fi

    category="$(infer_category "$slug")"
    title="$(display_title_for_game "$slug")"
    label="$(category_label "$category")"
    icon="$(icon_for_game "$slug")"
    badge="$(badge_for_game "$slug")"
    description="$(description_for_game "$slug")"
    featured="$(is_featured "$slug")"
    recommended="$(is_recommended "$slug")"

    if [[ "$written" -eq 1 ]]; then
      printf ',\n'
    fi

    printf '    {\n'
    printf '      "slug": "%s",\n' "$(json_escape "$slug")"
    printf '      "title": "%s",\n' "$(json_escape "$title")"
    printf '      "category": "%s",\n' "$(json_escape "$category")"
    printf '      "categoryLabel": "%s",\n' "$(json_escape "$label")"
    printf '      "icon": "%s",\n' "$(json_escape "$icon")"
    printf '      "description": "%s",\n' "$(json_escape "$description")"
    printf '      "badge": "%s",\n' "$(json_escape "$badge")"
    printf '      "featured": %s,\n' "$featured"
    printf '      "recommended": %s\n' "$recommended"
    printf '    }'

    written=1
  done

  printf '\n  ]\n'
  printf '}\n'
} > "$OUT_FILE"

echo "[OK] Catálogo atualizado em $OUT_FILE"
