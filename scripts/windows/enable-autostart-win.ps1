param(
    [string]$Distro ***REMOVED*** "Ubuntu",
    [string]$TaskName ***REMOVED*** "AutoCompany-WSL-Start"
)

$ErrorActionPreference ***REMOVED*** "Stop"

if (-not (Get-Command schtasks.exe -ErrorAction SilentlyContinue)) {
    throw "schtasks.exe not found."
}

$repoWin ***REMOVED*** (Resolve-Path (Join-Path $PSScriptRoot "..\\..")).Path
$startScript ***REMOVED*** Join-Path $repoWin "scripts\\windows\\start-win.ps1"
if (-not (Test-Path $startScript)) {
    throw "scripts/windows/start-win.ps1 not found: $startScript"
}

$taskAction ***REMOVED*** "powershell.exe -NoProfile -ExecutionPolicy Bypass -File ""$startScript"" -Distro ""$Distro"""
$createOutput ***REMOVED*** & schtasks.exe /Create /TN $TaskName /SC ONLOGON /TR $taskAction /RL LIMITED /F 2>&1
if ($createOutput) {
    foreach ($line in $createOutput) {
        Write-Host $line
    }
}

if ($LASTEXITCODE -ne 0) {
    if (($createOutput -join "`n") -match "Access is denied") {
        throw "Failed to create task due to permission error. Run PowerShell as Administrator and retry."
    }
    throw "Failed to create/update scheduled task: $TaskName"
}

Write-Host "Autostart enabled: $TaskName"
Write-Host "Action: $taskAction"
