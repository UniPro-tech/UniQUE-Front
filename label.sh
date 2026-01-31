#!/usr/bin/env bash
set -eo pipefail   # ← -u 外す（実用優先）

USER=""
REPO=""
SOURCE_REPO=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --user) USER="$2"; shift 2 ;;
    --repo) REPO="$2"; shift 2 ;;
    --source-repo) SOURCE_REPO="$2"; shift 2 ;;
    *) echo "Unknown option: $1"; exit 1 ;;
  esac
done

[[ -z "$USER" || -z "$SOURCE_REPO" ]] && {
  echo "必須: --user と --source-repo"
  exit 1
}

echo "📥 source labels from $USER/$SOURCE_REPO"

SOURCE_LABELS=$(gh api repos/$USER/$SOURCE_REPO/labels --paginate)

process_repo () {
  local TARGET="$1"
  echo "🚀 $USER/$TARGET"

  # 既存ラベル削除
  gh api repos/$USER/$TARGET/labels --paginate --jq '.[].name' |
  while read -r label; do
    ENCODED_LABEL=$(printf '%s' "$label" | jq -sRr @uri)
    echo "🗑 delete $label"
    gh api -X DELETE \
      repos/$USER/$TARGET/labels/$ENCODED_LABEL \
      >/dev/null
  done

  # ラベル作成
  echo "$SOURCE_LABELS" |
  jq -c '.[] | {name, color, description}' |
  while read -r l; do
    gh api -X POST repos/$USER/$TARGET/labels \
      -f name="$(jq -r .name <<<"$l")" \
      -f color="$(jq -r .color <<<"$l")" \
      -f description="$(jq -r '.description // ""' <<<"$l")" \
      >/dev/null
  done
}

if [[ -n "$REPO" ]]; then
  process_repo "$REPO"
else
  gh api users/$USER/repos --paginate \
    --jq '.[] | select(.archived == false) | .name' |
  while read -r repo; do
    process_repo "$repo"
  done
fi

echo "🎉 完了"
