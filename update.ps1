$current = Split-Path -Parent $PSCommandPath

Write-Host "This script will update the entire applciation to the latest version.`n"

Write-Host "Working directory: $current`n"

$confirmation = Read-Host "WARNING: Continuing will delete ALL files in above directory! [y/N]"

if ($confirmation -eq 'y') {

    Remove-Item -Recurse -Force "$current\*"

    Invoke-WebRequest -Uri "https://github.com/braathen/qlik-hardware-configurator/archive/master.zip" -UseBasicParsing -OutFile "./master.zip"

    Add-Type -assembly "system.io.compression.filesystem"

    [io.compression.zipfile]::ExtractToDirectory($current + "/master.zip", $current)

    Move-Item "$current/qlik-hardware-configurator-master/*" -Force

    Remove-Item -Recurse -Force "$current\qlik-hardware-configurator-master"

    Remove-Item -Recurse -Force "$current\master.zip"

    Invoke-Expression "$current\refresh-data.ps1"
}
