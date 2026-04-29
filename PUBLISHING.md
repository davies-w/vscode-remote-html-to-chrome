# Publishing

This repository is wired so GitHub Actions can package and publish the extension once Marketplace credentials are in place.

## One-time setup

1. Create a Visual Studio Marketplace publisher at:
   `https://marketplace.visualstudio.com/manage/publishers/`
2. Make sure the publisher ID matches the `publisher` field in `package.json`.
   Current value: `davies-w`
3. Create an Azure DevOps Personal Access Token with the `Marketplace > Manage` scope.
4. In GitHub, add that token as the repository secret `VSCE_PAT`.

## Release flow

1. Bump `version` in `package.json`.
2. Update `CHANGELOG.md`.
3. Create a GitHub Release.
4. The workflow packages the extension as a `.vsix`.
5. The workflow uploads both the versioned `.vsix` and `remote-html-to-chrome-latest.vsix` to the GitHub Release.
6. If `VSCE_PAT` is configured, it publishes the current version to the VS Code Marketplace.

## Local fallback

If you want to publish from your own machine instead of GitHub Actions:

```bash
npm install
npx @vscode/vsce login davies-w
npx @vscode/vsce publish
```

If `davies-w` is not available as a Marketplace publisher ID, update `package.json` before the first publish.
