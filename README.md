# Remote HTML to Chrome

`Remote HTML to Chrome` adds a single Explorer action for Remote SSH, WSL, Dev Container, and Codespaces sessions:

- Right-click an `.html` or `.htm` file
- Click `Download and Open in Chrome`
- VS Code reads the remote file, writes it to your local machine, and opens it in Google Chrome

## Why this exists

VS Code already lets you download remote files manually. This extension removes the extra step when you just want to open a remote HTML artifact in your local browser.

## Installation

Install the extension from the VS Code Marketplace once it is published.

Until then, install the packaged `.vsix` from GitHub Actions or a GitHub Release:

1. Download the `.vsix` file
2. In VS Code, run `Extensions: Install from VSIX...`
3. Select the downloaded file

## How it works

- The extension runs as a local `ui` extension
- It uses `vscode.workspace.fs` to read the selected remote file
- It writes the file to `~/Downloads/buzz-html`
- On macOS, it launches `open -a "Google Chrome"` for the downloaded file

On non-macOS platforms, it falls back to the default external opener.

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

## License

MIT
