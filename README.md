# Remote HTML to Chrome

`Remote HTML to Chrome` adds a single Explorer action for Remote SSH, WSL, Dev Container, and Codespaces sessions:

- Right-click an `.html` or `.htm` file
- Click `Download and Open in Chrome`
- VS Code reads the remote file, writes it to your local machine, and opens it in Google Chrome

## Why this exists

VS Code already lets you download remote files manually. This extension removes the extra step when you just want to open a remote HTML artifact in your local browser.

## Installation

Install the extension from the VS Code Marketplace once it is published.

Until then, install it from the latest GitHub Release.

### One-command install

macOS and Linux:

```bash
curl -fsSL https://raw.githubusercontent.com/davies-w/vscode-remote-html-to-chrome/main/scripts/install.sh | bash
```

Windows PowerShell:

```powershell
irm https://raw.githubusercontent.com/davies-w/vscode-remote-html-to-chrome/main/scripts/install.ps1 | iex
```

### Manual install

1. Download `remote-html-to-chrome-latest.vsix` from the latest GitHub Release.
2. In VS Code, run `Extensions: Install from VSIX...`
3. Select the downloaded file

### Notes for installers

- The scripts install the latest GitHub Release, not the live `main` branch.
- The scripts need the VS Code CLI. If `code` is not on your path, set `CODE_COMMAND` to the CLI path.

## How it works

- The extension runs as a local `ui` extension
- It uses `vscode.workspace.fs` to read the selected remote file
- It writes the file to `~/Downloads/remote-html-to-chrome` on macOS
- It writes the file to a temp directory on Windows and Linux
- It preserves the original filename, adding `-2`, `-3`, and so on only when needed to avoid overwriting an existing file
- It tries to launch Google Chrome on macOS, Windows, and Linux

If Chrome is not available, it falls back to the default external opener for the platform.

## Usage

1. Open a remote workspace in VS Code.
2. In the Explorer, right-click an `.html` or `.htm` file.
3. Select `Download and Open in Chrome`.

You can also run the command from the Command Palette.

## Limitations

- The extension copies the HTML file only.
- If the page depends on adjacent assets through relative paths, those assets are not downloaded automatically.

## Development

This section is only for maintainers working on the extension source.

```bash
npm install
npm run package
```

Then install the generated `.vsix` in VS Code with `Extensions: Install from VSIX...`.

## Publishing

Marketplace publishing is documented in [PUBLISHING.md](PUBLISHING.md).

GitHub Releases also attach a `.vsix` asset so people can install the extension before it is on the Marketplace.

## License

MIT
