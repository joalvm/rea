#!/usr/bin/env bash
# Wrapper para `maestro test` que:
#   1. Borra captures anteriores (gitignored, pero ocupan disco).
#   2. Crea una carpeta nueva con timestamp para esta corrida.
#   3. Pasa --debug-output ahi y reenvora el resto de argumentos al flow.
#
# Uso (desde la raiz del repo):
#   bash maestro/run.sh maestro/flows/diario/02-diario-detalle.yaml
#   npm run e2e:flow -- maestro/flows/diario/02-diario-detalle.yaml
#
# Las capturas NUNCA se suben a git (ver .gitignore: maestro/screenshots/*).

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SCREENSHOTS_DIR="$REPO_ROOT/maestro/screenshots"

# Limpia captures anteriores.
rm -rf "$SCREENSHOTS_DIR"/captures_* 2>/dev/null || true

# Carpeta nueva con timestamp DD_MM_YY_HH_MM_SS.
STAMP="$(date +%d_%m_%y_%H_%M_%S)"
OUTPUT_DIR="$SCREENSHOTS_DIR/captures_$STAMP"

# Reenvora todos los argumentos al flow.
exec maestro test "$@" --debug-output "$OUTPUT_DIR"
