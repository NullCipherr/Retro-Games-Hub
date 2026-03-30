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
  "assets/css/global.css"
  "assets/css/hub.css"
  "assets/js/hub-intro.js"
  "assets/data/games-catalog.json"
  "scripts/sync-games-catalog.sh"
)

required_game=(
  "index.html"
  "docs.html"
  "script.js"
  "style.css"
)

ok=0
fail=0

echo "[INFO] Iniciando validacao estrutural em $run_iso"

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

for f in "${required_root[@]}"; do
  check_file "$f"
done

mapfile -t games < <(find "$ROOT_DIR/games" -mindepth 1 -maxdepth 1 -type d | sort)

echo "[INFO] Jogos encontrados: ${#games[@]}"

for game_dir in "${games[@]}"; do
  game_name="$(basename "$game_dir")"
  echo "[INFO] Validando game: $game_name"

  for f in "${required_game[@]}"; do
    rel="games/$game_name/$f"
    check_file "$rel"
  done
done

status="ok"
if [[ "$fail" -gt 0 ]]; then
  status="erro"
fi

if [[ "$status" == "ok" ]]; then
  result_msg="Validacao estrutural concluida sem falhas."
else
  result_msg="Foram encontradas inconsistencias estruturais. Consulte o log bruto em \`docs/reports/latest_validacao_report.raw.log\`."
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
| Validacoes com sucesso | $ok |
| Validacoes com falha | $fail |

## Resultado

$result_msg
MD

if [[ "$status" != "ok" ]]; then
  exit 1
fi

echo "[INFO] Relatorio markdown: $REPORT_MD"
echo "[INFO] Log bruto: $REPORT_LOG"
