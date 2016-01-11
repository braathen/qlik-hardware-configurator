$current = Split-Path -Parent $PSCommandPath

if ($PSVersionTable.PSVersion.Major -lt 3) {
    Write-Host "`nPlease upgrade PowerShell to latest version...`n"
    Write-Host "https://www.microsoft.com/en-us/download/details.aspx?id=50395`n"
    return
}

$wc = New-Object System.Net.WebClient
$wc.Encoding = [System.Text.Encoding]::UTF8

Write-Host "Updating application..."

If (Test-Path "$current\assets") {
    Remove-Item -Recurse -Force "$current\assets" | Out-Null
}
If (Test-Path "$current\index.html") {
    Remove-Item -Recurse -Force "$current\index.html" | Out-Null
}
If (Test-Path "$current\update.ps1") {
    Remove-Item -Recurse -Force "$current\update.ps1" | Out-Null
}

$wc.DownloadFile("https://bit.ly/qhc-update", "$current\master.zip")

Add-Type -assembly "system.io.compression.filesystem"

[io.compression.zipfile]::ExtractToDirectory($current + "/master.zip", $current)

Move-Item "$current/qlik-hardware-configurator-master/*" -Force

If (Test-Path "$current\.gitignore") {
    Remove-Item -Recurse -Force "$current\.gitignore"
}

Remove-Item -Recurse -Force "$current\qlik-hardware-configurator-master"

Remove-Item -Recurse -Force "$current\master.zip"

&"$current\assets\refresh-data.ps1"
