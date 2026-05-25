#!/usr/bin/env bash
set -euo pipefail

PROJECT="${CLAUDE_PROJECT_DIR:-/Users/goda/PhpstormProjects/team-07}"
INPUT=$(cat)
TOOL=$(printf '%s' "$INPUT" | jq -r '.tool_name')

deny() {
  jq -nc --arg r "$1" '{hookSpecificOutput:{hookEventName:"PreToolUse",permissionDecision:"deny",permissionDecisionReason:$r}}'
  exit 0
}

allow() {
  printf '{}\n'
  exit 0
}

is_inside() {
  local path="$1"
  [[ "$path" == "$PROJECT" || "$path" == "$PROJECT"/* ]]
}

case "$TOOL" in
  Read|Edit|Write|NotebookEdit|MultiEdit)
    FILE=$(printf '%s' "$INPUT" | jq -r '.tool_input.file_path // .tool_input.notebook_path // empty')
    if [ -z "$FILE" ]; then allow; fi
    if is_inside "$FILE"; then allow; fi
    deny "Path '$FILE' is outside the project directory '$PROJECT'. Operations outside the project are blocked."
    ;;
  Glob|Grep)
    P=$(printf '%s' "$INPUT" | jq -r '.tool_input.path // empty')
    if [ -z "$P" ]; then allow; fi
    if is_inside "$P"; then allow; fi
    deny "Search path '$P' is outside the project directory '$PROJECT'."
    ;;
  Bash)
    CMD=$(printf '%s' "$INPUT" | jq -r '.tool_input.command')
    # Block absolute paths that are not inside the project
    while IFS= read -r tok; do
      case "$tok" in
        "$PROJECT"|"$PROJECT"/*) : ;;
        /Users/*|/private/*|/etc/*|/var/*|/usr/*|/opt/*|/System/*|/Library/*|/tmp/*|/bin/*|/sbin/*|/dev/*|/root/*|/home/*|/mnt/*|/srv/*)
          deny "Bash command references '$tok' which is outside the project directory '$PROJECT'."
          ;;
      esac
    done < <(printf '%s\n' "$CMD" | grep -oE '(/[A-Za-z][A-Za-z0-9._-]*)+' || true)
    # Block cd / pushd to outside paths (incl. relative escapes via ..)
    if printf '%s' "$CMD" | grep -qE '(^|[;&|`$( ])(cd|pushd)([[:space:]]+)(/|~|\.\.)' ; then
      if ! printf '%s' "$CMD" | grep -qE "(^|[;&|\`\$( ])(cd|pushd)[[:space:]]+(\"?)$PROJECT" ; then
        deny "Bash 'cd' / 'pushd' to a path outside the project directory '$PROJECT' is blocked."
      fi
    fi
    # Block ~ expansion outside the project
    if printf '%s' "$CMD" | grep -qE '(^|[^a-zA-Z0-9_])~(/|[a-zA-Z0-9_-])'; then
      deny "Bash command uses '~' (home directory) expansion which resolves outside the project directory '$PROJECT'."
    fi
    allow
    ;;
  *)
    allow
    ;;
esac
