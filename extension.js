const vscode = require("vscode");
const os = require("os");
const path = require("path");
const { execFile } = require("child_process");
const { promisify } = require("util");

const execFileAsync = promisify(execFile);

async function pickLocalTarget(outputDir, fileName) {
  const parsed = path.parse(fileName || "index.html");

  for (let attempt = 0; attempt < 1000; attempt += 1) {
    const suffix = attempt === 0 ? "" : `-${attempt + 1}`;
    const candidate = vscode.Uri.joinPath(
      outputDir,
      `${parsed.name || "index"}${suffix}${parsed.ext || ".html"}`
    );

    try {
      await vscode.workspace.fs.stat(candidate);
    } catch {
      return candidate;
    }
  }

  throw new Error("Could not find an available local filename.");
}

async function downloadAndOpen(resource) {
  const target = resource || vscode.window.activeTextEditor?.document?.uri;
  if (!target) {
    vscode.window.showErrorMessage("No HTML file selected.");
    return;
  }

  const fileName = path.basename(target.path || "");
  if (!/\.(html?|HTML?)$/.test(fileName)) {
    vscode.window.showErrorMessage("This command only works for .html and .htm files.");
    return;
  }

  const bytes = await vscode.workspace.fs.readFile(target);
  const outputDir = vscode.Uri.file(path.join(os.homedir(), "Downloads", "remote-html-to-chrome"));
  await vscode.workspace.fs.createDirectory(outputDir);

  const localFile = await pickLocalTarget(outputDir, fileName);
  const localName = path.basename(localFile.fsPath);

  await vscode.workspace.fs.writeFile(localFile, bytes);

  try {
    if (process.platform === "darwin") {
      await execFileAsync("open", ["-a", "Google Chrome", localFile.fsPath]);
    } else {
      await vscode.env.openExternal(localFile);
    }
  } catch {
    await vscode.env.openExternal(localFile);
  }

  vscode.window.showInformationMessage(`Downloaded and opened ${localName}.`);
}

function activate(context) {
  context.subscriptions.push(
    vscode.commands.registerCommand("remoteHtmlToChrome.downloadAndOpen", downloadAndOpen)
  );
}

function deactivate() {}

module.exports = { activate, deactivate };
