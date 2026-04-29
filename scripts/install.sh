#!/usr/bin/env bash
set -euo pipefail

REPO="davies-w/vscode-remote-html-to-chrome"
VSIX_URL="https://github.com/${REPO}/releases/latest/download/remote-html-to-chrome-latest.vsix"

find_code() {
  if [[ -n "${CODE_COMMAND:-}" ]]; then
    printf '%s\n' "$CODE_COMMAND"
    return 0
  fi

  local candidates=(
    "code"
    "code-insiders"
    "/Applications/Visual Studio Code.app/Contents/Resources/app/bin/code"
    "/Applications/Visual Studio Code - Insiders.app/Contents/Resources/app/bin/code"
  )

  local candidate
  for candidate in "${candidates[@]}"; do
    if command -v "$candidate" >/dev/null 2>&1; then
      command -v "$candidate"
      return 0
    fi

    if [[ -x "$candidate" ]]; then
      printf '%s\n' "$candidate"
      return 0
    fi
  done

  return 1
}

CODE_BIN="$(find_code || true)"
if [[ -z "$CODE_BIN" ]]; then
  printf '%s\n' "Could not find the VS Code CLI."
  printf '%s\n' "Install the 'code' command in PATH, or set CODE_COMMAND to your VS Code CLI path."
  exit 1
fi

TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT
VSIX_PATH="${TMP_DIR}/remote-html-to-chrome-latest.vsix"

if command -v curl >/dev/null 2>&1; then
  curl -fsSL "$VSIX_URL" -o "$VSIX_PATH"
elif command -v wget >/dev/null 2>&1; then
  wget -qO "$VSIX_PATH" "$VSIX_URL"
else
  printf '%s\n' "Need either curl or wget to download the extension."
  exit 1
fi

"$CODE_BIN" --install-extension "$VSIX_PATH" --force
printf '%s\n' "Installed Remote HTML to Chrome."
