$current = Split-Path -Parent $PSCommandPath

#Write-Host "This script will update the entire application to the latest version and refresh the data.`n"

#Write-Host "Working directory: $current`n"

#$confirmation = Read-Host "WARNING: Continuing will delete ALL files in above directory! [y/N]"

#if ($confirmation -eq 'y') {

    Write-Host "Updating application..."

    Remove-Item -Recurse -Force "$current\*"

    Invoke-WebRequest -Uri "https://github.com/braathen/qlik-hardware-configurator/archive/master.zip" -UseBasicParsing -OutFile "./master.zip"

    Add-Type -assembly "system.io.compression.filesystem"

    [io.compression.zipfile]::ExtractToDirectory($current + "/master.zip", $current)

    Move-Item "$current/qlik-hardware-configurator-master/*" -Force

    Remove-Item -Recurse -Force "$current\qlik-hardware-configurator-master"

    Remove-Item -Recurse -Force "$current\master.zip"

    &"$current\assets\refresh-data.ps1"

#}
