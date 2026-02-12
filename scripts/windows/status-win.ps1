param(
    [string]$Distro ***REMOVED*** "Ubuntu"
)

$ErrorActionPreference ***REMOVED*** "Stop"
$script:LastWslExitCode ***REMOVED*** 0

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
    $script:LastWslExitCode ***REMOVED*** $code
    if ($output) {
        foreach ($line in $output) {
            Write-Output $line
        }
    }
    if (-not $IgnoreExitCode -and $code -ne 0) {
        throw "WSL command failed ($code): $Command"
    }
}

function Get-AutostartTaskState {
    if (-not (Get-Command cmd.exe -ErrorAction SilentlyContinue)) {
        return "unavailable"
    }

    & cmd.exe /c "schtasks /Query /TN ""AutoCompany-WSL-Start"" /FO LIST >nul 2>&1"
    $code ***REMOVED*** $LASTEXITCODE
    if ($code -eq 0) {
        return "configured"
    }
    if ($code -eq 1) {
        return "not_configured"
    }
    return "unknown"
}

Assert-WslAvailable
$paths ***REMOVED*** Get-RepoPaths
$repoWin ***REMOVED*** $paths.RepoWin
$repoWsl ***REMOVED*** $paths.RepoWsl

Write-Output "***REMOVED******REMOVED******REMOVED*** Windows Guardian ***REMOVED******REMOVED******REMOVED***"
$awakeScript ***REMOVED*** Join-Path $repoWin "scripts\\windows\\awake-guardian-win.ps1"
if (Test-Path $awakeScript) {
    & $awakeScript -Action status
    if ($LASTEXITCODE -ne 0) {
        Write-Warning "Awake guardian status command returned non-zero."
    }
} else {
    Write-Output "Awake guardian script not found."
}

Write-Output ""
Write-Output "***REMOVED******REMOVED******REMOVED*** WSL Keepalive Anchor ***REMOVED******REMOVED******REMOVED***"
$anchorScript ***REMOVED*** Join-Path $repoWin "scripts\\windows\\wsl-anchor-win.ps1"
if (Test-Path $anchorScript) {
    & $anchorScript -Action status -Distro $Distro -RepoWsl $repoWsl
    if ($LASTEXITCODE -ne 0) {
        Write-Warning "WSL anchor status command returned non-zero."
    }
} else {
    Write-Output "WSL anchor script not found."
}

Write-Output ""
Write-Output "***REMOVED******REMOVED******REMOVED*** Windows Autostart Task ***REMOVED******REMOVED******REMOVED***"
switch (Get-AutostartTaskState) {
    "configured" { Write-Output "Autostart: CONFIGURED (AutoCompany-WSL-Start)" }
    "not_configured" { Write-Output "Autostart: NOT CONFIGURED" }
    "unavailable" { Write-Output "Autostart: schtasks unavailable" }
    default { Write-Output "Autostart: UNKNOWN (query failed)" }
}

Write-Output ""
Write-Output "***REMOVED******REMOVED******REMOVED*** WSL Daemon (systemd --user) ***REMOVED******REMOVED******REMOVED***"
Invoke-WslCommand -RepoWsl $repoWsl -Command "systemctl --user cat auto-company.service >/dev/null 2>&1" -IgnoreExitCode
if ($script:LastWslExitCode -eq 0) {
    Invoke-WslCommand -RepoWsl $repoWsl -Command "systemctl --user is-active auto-company.service || true" -IgnoreExitCode
    Invoke-WslCommand -RepoWsl $repoWsl -Command "systemctl --user show auto-company.service -p MainPID -p ActiveState -p SubState --no-pager" -IgnoreExitCode
} else {
    Write-Output "auto-company.service: not installed"
}

Write-Output ""
Write-Output "***REMOVED******REMOVED******REMOVED*** Loop Status (monitor.sh) ***REMOVED******REMOVED******REMOVED***"
Invoke-WslCommand -RepoWsl $repoWsl -Command "make status" -IgnoreExitCode

exit 0
