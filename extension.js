const vscode = require("vscode");
const fs = require("fs");
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

function getOutputDir() {
  if (process.platform !== "darwin") {
    return vscode.Uri.file(path.join(os.tmpdir(), "remote-html-to-chrome"));
  }

  return vscode.Uri.file(path.join(os.homedir(), "Downloads", "remote-html-to-chrome"));
}

async function tryExec(command, args) {
  try {
    await execFileAsync(command, args);
    return true;
  } catch {
    return false;
  }
}

async function openInChrome(localFile) {
  const filePath = localFile.fsPath;

  if (process.platform === "darwin") {
    return tryExec("open", ["-a", "Google Chrome", filePath]);
  }

  if (process.platform === "win32") {
    const windowsCandidates = [
      process.env.PROGRAMFILES && path.join(process.env.PROGRAMFILES, "Google", "Chrome", "Application", "chrome.exe"),
      process.env["PROGRAMFILES(X86)"] && path.join(process.env["PROGRAMFILES(X86)"], "Google", "Chrome", "Application", "chrome.exe"),
      process.env.LOCALAPPDATA && path.join(process.env.LOCALAPPDATA, "Google", "Chrome", "Application", "chrome.exe")
    ].filter(Boolean);

    for (const candidate of windowsCandidates) {
      if (fs.existsSync(candidate) && await tryExec(candidate, [filePath])) {
        return true;
      }
    }

    return tryExec("cmd.exe", ["/c", "start", "", "chrome", filePath]);
  }

  const linuxCandidates = [
    "google-chrome",
    "google-chrome-stable",
    "chromium",
    "chromium-browser",
    "/usr/bin/google-chrome",
    "/usr/bin/google-chrome-stable"
  ];

  for (const candidate of linuxCandidates) {
    if (!path.isAbsolute(candidate) || fs.existsSync(candidate)) {
      if (await tryExec(candidate, [filePath])) {
        return true;
      }
    }
  }

  return false;
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
  const outputDir = getOutputDir();
  await vscode.workspace.fs.createDirectory(outputDir);

  const localFile = await pickLocalTarget(outputDir, fileName);
  const localName = path.basename(localFile.fsPath);

  await vscode.workspace.fs.writeFile(localFile, bytes);

  const openedInChrome = await openInChrome(localFile);
  if (!openedInChrome) {
    await vscode.env.openExternal(localFile);
  }

  const opener = openedInChrome ? "Google Chrome" : "your default browser";
  vscode.window.showInformationMessage(`Downloaded ${localName} and opened it in ${opener}.`);
}

function activate(context) {
  context.subscriptions.push(
    vscode.commands.registerCommand("remoteHtmlToChrome.downloadAndOpen", downloadAndOpen)
  );
}

function deactivate() {}

module.exports = { activate, deactivate };
