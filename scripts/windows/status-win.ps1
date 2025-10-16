param(
    [string]$Distro ***REMOVED*** "Ubuntu"
)

$ErrorActionPreference ***REMOVED*** "Stop"

function Assert-WslAvailable {
    if (-not (Get-Command wsl.exe -ErrorAction SilentlyContinue)) {
        throw "wsl.exe not found. Enable WSL first."
    }
}

function Get-RepoPaths {
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
    return @{
        RepoWin ***REMOVED*** $repoWin
        RepoWsl ***REMOVED*** $repoWsl
    }
}

function Invoke-WslCommand {
    param(
        [Parameter(Mandatory ***REMOVED*** $true)][string]$RepoWsl,
        [Parameter(Mandatory ***REMOVED*** $true)][string]$Command,
        [switch]$IgnoreExitCode
    )

    $output ***REMOVED*** & wsl.exe -d $Distro --cd $RepoWsl bash -lc $Command 2>&1
    $code ***REMOVED*** $LASTEXITCODE
    if ($output) {
        foreach ($line in $output) {
            Write-Host $line
        }
    }
    if (-not $IgnoreExitCode -and $code -ne 0) {
        throw "WSL command failed ($code): $Command"
    }
    return $code
}

Assert-WslAvailable
$paths ***REMOVED*** Get-RepoPaths
$repoWin ***REMOVED*** $paths.RepoWin
$repoWsl ***REMOVED*** $paths.RepoWsl

Write-Host "***REMOVED******REMOVED******REMOVED*** Windows Guardian ***REMOVED******REMOVED******REMOVED***"
$awakeScript ***REMOVED*** Join-Path $repoWin "scripts\\windows\\awake-guardian-win.ps1"
if (Test-Path $awakeScript) {
    & $awakeScript -Action status
    if ($LASTEXITCODE -ne 0) {
        Write-Warning "Awake guardian status command returned non-zero."
    }
} else {
    Write-Host "Awake guardian script not found."
}

Write-Host ""
Write-Host "***REMOVED******REMOVED******REMOVED*** Windows Autostart Task ***REMOVED******REMOVED******REMOVED***"
if (Get-Command schtasks.exe -ErrorAction SilentlyContinue) {
    & schtasks.exe /Query /TN "AutoCompany-WSL-Start" /FO LIST 2>$null | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Autostart: CONFIGURED (AutoCompany-WSL-Start)"
    } else {
        Write-Host "Autostart: NOT CONFIGURED"
    }
} else {
    Write-Host "Autostart: schtasks.exe unavailable"
}

Write-Host ""
Write-Host "***REMOVED******REMOVED******REMOVED*** WSL Daemon (systemd --user) ***REMOVED******REMOVED******REMOVED***"
$installedCode ***REMOVED*** Invoke-WslCommand -RepoWsl $repoWsl -Command "systemctl --user cat auto-company.service >/dev/null 2>&1" -IgnoreExitCode
if ($installedCode -eq 0) {
    $null ***REMOVED*** Invoke-WslCommand -RepoWsl $repoWsl -Command "systemctl --user is-active auto-company.service || true" -IgnoreExitCode
    $null ***REMOVED*** Invoke-WslCommand -RepoWsl $repoWsl -Command "systemctl --user show auto-company.service -p MainPID -p ActiveState -p SubState --no-pager" -IgnoreExitCode
} else {
    Write-Host "auto-company.service: not installed"
}

Write-Host ""
Write-Host "***REMOVED******REMOVED******REMOVED*** Loop Status (monitor.sh) ***REMOVED******REMOVED******REMOVED***"
$null ***REMOVED*** Invoke-WslCommand -RepoWsl $repoWsl -Command "make status" -IgnoreExitCode

exit 0
