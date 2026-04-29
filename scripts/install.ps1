$ErrorActionPreference = "Stop"

$repo = "davies-w/vscode-remote-html-to-chrome"
$vsixUrl = "https://github.com/$repo/releases/latest/download/remote-html-to-chrome-latest.vsix"

function Find-CodeCommand {
    if ($env:CODE_COMMAND) {
        return $env:CODE_COMMAND
    }

    $candidates = @(
        "code.cmd",
        "code-insiders.cmd",
        "$env:LOCALAPPDATA\Programs\Microsoft VS Code\bin\code.cmd",
        "$env:LOCALAPPDATA\Programs\Microsoft VS Code Insiders\bin\code-insiders.cmd",
        "$env:ProgramFiles\Microsoft VS Code\bin\code.cmd",
        "${env:ProgramFiles(x86)}\Microsoft VS Code\bin\code.cmd"
    ) | Where-Object { $_ }

    foreach ($candidate in $candidates) {
        $command = Get-Command $candidate -ErrorAction SilentlyContinue
        if ($command) {
            return $command.Source
        }

        if (Test-Path $candidate) {
            return $candidate
        }
    }

    throw "Could not find the VS Code CLI. Install the 'code' command or set CODE_COMMAND."
}

$codeCommand = Find-CodeCommand
$tempDir = Join-Path ([System.IO.Path]::GetTempPath()) ("remote-html-to-chrome-" + [System.Guid]::NewGuid().ToString())
$vsixPath = Join-Path $tempDir "remote-html-to-chrome-latest.vsix"

New-Item -ItemType Directory -Path $tempDir | Out-Null

try {
    Invoke-WebRequest -Uri $vsixUrl -OutFile $vsixPath
    & $codeCommand --install-extension $vsixPath --force
    Write-Host "Installed Remote HTML to Chrome."
}
finally {
    Remove-Item -Recurse -Force $tempDir -ErrorAction SilentlyContinue
}
