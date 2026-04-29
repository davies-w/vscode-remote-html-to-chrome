const vscode = require("vscode");
const os = require("os");
const path = require("path");
const { execFile } = require("child_process");
const { promisify } = require("util");

const execFileAsync = promisify(execFile);

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

  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const host = (target.authority || "local").replace(/[^\w.-]+/g, "_");
  const localName = `${host}-${stamp}-${fileName || "index.html"}`;
  const localFile = vscode.Uri.joinPath(outputDir, localName);

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
