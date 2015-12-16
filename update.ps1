$current = Split-Path -Parent $PSCommandPath

Write-Host "Updating application..."

Remove-Item -Recurse -Force "$current\assets" | Out-Null
Remove-Item -Recurse -Force "$current\index.html" | Out-Null
Remove-Item -Recurse -Force "$current\update.ps1" | Out-Null

Invoke-WebRequest -Uri "https://github.com/braathen/qlik-hardware-configurator/archive/master.zip" -UseBasicParsing -OutFile "./master.zip"

Add-Type -assembly "system.io.compression.filesystem"

[io.compression.zipfile]::ExtractToDirectory($current + "/master.zip", $current)

Move-Item "$current/qlik-hardware-configurator-master/*" -Force

Remove-Item -Recurse -Force "$current\qlik-hardware-configurator-master"

Remove-Item -Recurse -Force "$current\master.zip"

&"$current\assets\refresh-data.ps1"
