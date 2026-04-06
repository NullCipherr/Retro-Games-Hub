#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
REPORT_DIR="$ROOT_DIR/docs/reports"
REPORT_MD="$REPORT_DIR/latest_validacao_report.md"
REPORT_LOG="$REPORT_DIR/latest_validacao_report.raw.log"

mkdir -p "$REPORT_DIR"

exec > >(tee "$REPORT_LOG")
exec 2>&1

run_date="$(date '+%Y-%m-%d')"
run_iso="$(date --iso-8601=seconds)"

required_root=(
  "index.html"
  "src/main.js"
  "src/App.vue"
  "public/assets/css/global.css"
  "public/assets/css/game-ui.css"
  "public/assets/data/games-catalog.json"
  "scripts/sync-games-catalog.sh"
)

required_game=(
  "index.html"
  "docs.html"
  "script.js"
  "style.css"
)

recommended_game=(
  "game.html"
  "README.md"
)

ok=0
warn=0
fail=0

seo_checked=0
a11y_checked=0

echo "[INFO] Iniciando validacao estrutural/seo/a11y em $run_iso"

check_file() {
  local rel="$1"
  if [[ -f "$ROOT_DIR/$rel" ]]; then
    echo "[OK] $rel"
    ok=$((ok + 1))
  else
    echo "[ERRO] Ausente: $rel"
    fail=$((fail + 1))
  fi
}

check_file_warn() {
  local rel="$1"
  if [[ -f "$ROOT_DIR/$rel" ]]; then
    echo "[OK] $rel (recomendado)"
    ok=$((ok + 1))
  else
    echo "[WARN] Recomendado ausente: $rel"
    warn=$((warn + 1))
  fi
}

check_pattern() {
  local rel="$1"
  local pattern="$2"
  local label="$3"

  if rg -q --pcre2 "$pattern" "$ROOT_DIR/$rel"; then
    echo "[OK] $label ($rel)"
    ok=$((ok + 1))
  else
    echo "[ERRO] $label ausente/em desacordo ($rel)"
    fail=$((fail + 1))
  fi
}

validate_html_contracts() {
  local rel="$1"

  seo_checked=$((seo_checked + 1))
  a11y_checked=$((a11y_checked + 1))

  check_pattern "$rel" '<meta[[:space:]]+name="description"[[:space:]]+content="[^"]+"' "Meta description"
  check_pattern "$rel" '<meta[[:space:]]+property="og:title"[[:space:]]+content="[^"]+"' "Open Graph title"
  check_pattern "$rel" '<meta[[:space:]]+property="og:description"[[:space:]]+content="[^"]+"' "Open Graph description"
  check_pattern "$rel" '<meta[[:space:]]+property="og:type"[[:space:]]+content="website"' "Open Graph type"
  check_pattern "$rel" '<meta[[:space:]]+name="twitter:card"[[:space:]]+content="summary"' "Twitter card"

  check_pattern "$rel" '<main[[:space:]]+id="main-content"[[:space:]]+tabindex="-1"' "Landmark main com id/tabindex"
  check_pattern "$rel" 'class="skip-link"' "Skip link"

  if rg -q '<nav[[:space:]][^>]*class="(links|main-nav|sidebar-nav)"' "$ROOT_DIR/$rel"; then
    check_pattern "$rel" '<nav[^>]*aria-label="[^"]+"' "Nav com aria-label"
  fi
}

for f in "${required_root[@]}"; do
  check_file "$f"
done

mapfile -t games < <(find "$ROOT_DIR/public/games" -mindepth 1 -maxdepth 1 -type d | sort)

echo "[INFO] Jogos encontrados: ${#games[@]}"

for game_dir in "${games[@]}"; do
  game_name="$(basename "$game_dir")"
  echo "[INFO] Validando game: $game_name"

  for f in "${required_game[@]}"; do
    rel="public/games/$game_name/$f"
    check_file "$rel"
  done

  for f in "${recommended_game[@]}"; do
    rel="public/games/$game_name/$f"
    check_file_warn "$rel"
  done

done

check_pattern "src/App.vue" '<main[[:space:]]+id="main-content"[[:space:]]+tabindex="-1"' "Hub com main acessivel"
check_pattern "src/App.vue" 'class="skip-link"' "Hub com skip link"
check_pattern "index.html" '<meta[[:space:]]+name="twitter:card"[[:space:]]+content="summary"' "Hub com Twitter card"

mapfile -t game_html_files < <(find "$ROOT_DIR/public/games" -type f -name '*.html' | sort)

for html_file in "${game_html_files[@]}"; do
  rel="${html_file#$ROOT_DIR/}"
  validate_html_contracts "$rel"
done

status="ok"
if [[ "$fail" -gt 0 ]]; then
  status="erro"
fi

if [[ "$status" == "ok" ]]; then
  result_msg="Validação estrutural, SEO mínimo e acessibilidade básica concluída sem falhas críticas."
else
  result_msg="Foram encontradas inconsistências. Consulte o log bruto em \`docs/reports/latest_validacao_report.raw.log\`."
fi

cat > "$REPORT_MD" <<MD
# Relatorio de Validacao Estrutural

- Data: \`$run_date\`
- Execucao: \`$run_iso\`
- Script: \`./scripts/run_validation.sh\`
- Status final: \`$status\`

| Item | Valor |
| --- | ---: |
| Jogos mapeados | ${#games[@]} |
| HTML de jogos validados (SEO/A11y) | ${#game_html_files[@]} |
| Validacoes com sucesso | $ok |
| Alertas (itens recomendados) | $warn |
| Validacoes com falha | $fail |
| Contratos SEO validados | $seo_checked |
| Contratos A11y validados | $a11y_checked |

## Resultado

$result_msg
MD

if [[ "$status" != "ok" ]]; then
  exit 1
fi

echo "[INFO] Relatorio markdown: $REPORT_MD"
echo "[INFO] Log bruto: $REPORT_LOG"
