param(
    [string]$TaskName ***REMOVED*** "AutoCompany-WSL-Start"
)

$ErrorActionPreference ***REMOVED*** "Stop"

if (-not (Get-Command schtasks.exe -ErrorAction SilentlyContinue)) {
    throw "schtasks.exe not found."
}

$queryOutput ***REMOVED*** & schtasks.exe /Query /TN $TaskName /V /FO LIST 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Autostart: NOT CONFIGURED ($TaskName)"
    exit 0
}

foreach ($line in $queryOutput) {
    Write-Host $line
}
Write-Host "Autostart: CONFIGURED ($TaskName)"
