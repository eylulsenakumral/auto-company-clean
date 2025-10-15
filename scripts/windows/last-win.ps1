param(
    [string]$Distro ***REMOVED*** "Ubuntu"
)

$ErrorActionPreference ***REMOVED*** "Stop"

function Assert-WslAvailable {
    if (-not (Get-Command wsl.exe -ErrorAction SilentlyContinue)) {
        throw "wsl.exe not found. Enable WSL first."
    }
}

Assert-WslAvailable

$repoWin ***REMOVED*** (Resolve-Path (Join-Path $PSScriptRoot "..\\..")).Path
$repoWinForWsl ***REMOVED*** $repoWin -replace "\\", "/"
$repoWslRaw ***REMOVED*** & wsl.exe wslpath -a "$repoWinForWsl"
if (-not $repoWslRaw) {
    throw "Failed to convert repository path to WSL path."
}
$repoWsl ***REMOVED*** $repoWslRaw.Trim()
if (-not $repoWsl) {
    throw "Failed to convert repository path to WSL path."
}

& wsl.exe -d $Distro --cd $repoWsl bash -lc "make last"
exit $LASTEXITCODE
