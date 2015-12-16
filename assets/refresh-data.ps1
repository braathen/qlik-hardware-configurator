$config_language = "https://docs.google.com/spreadsheets/d/18GG6fMRb9AlFSY4SVesTTl8i4YR11XHcPPjksua9-Cs/pub?output=csv"
$config_data = "https://docs.google.com/spreadsheets/d/1DHz86iUMtQNFc6jAPTXspJTFjUVEK4613eNQLrCrV2c/pub?output=csv"

$current = Split-Path -Parent $PSCommandPath

Try {
    Write-Host "`nDownloading data..."
    New-Item -ItemType Directory -Force -Path "$current\data" | Out-Null

    $wc = New-Object System.Net.WebClient
    $wc.Encoding = [System.Text.Encoding]::UTF8

	# Data configuration
    $data = "var sizingData = " + ($wc.DownloadString($config_data) | ConvertFrom-Csv -Delimiter ',' | ConvertTo-Json -Compress | Out-String)
	Out-File -inputobject $data -filepath "$current/data/config_data.js"

    $lang = ($wc.DownloadString($config_language) | ConvertFrom-Csv -Delimiter ',')

    Foreach ($l in $lang)
    {
        If ($l.Url -ne "")
        {
            $a = $wc.DownloadString($l.Url + "?embedded=true")

            $a = $a -replace '(?s)^.*</style>|<div id="footer">.*$', ''

            $a = $a -replace '(?s)^.*<body.*?>|</body>.*$', ''

            $a = $a -replace '(?s)^.*</title>', ''

            # clean up c2 c3 etc - causes a conflict with variables for some reason...
            #([regex]'(?s) class=\".*?\"').Matches($a) | ForEach-Object {Write-Host $_ }

            # remove spans
            ([regex]'(?s)<span.*?>|</span>').Matches($a) | ForEach-Object { $a = $a.Replace($_,'') }

            # Download images
            $src = ([regex]'(?s)src="(.*?)"').Matches($a) | ForEach-Object { $_.Groups[1].Value}
            Foreach ($i in $src)
            {
                $new = "$current/data/" + $i.substring($i.length - 15, 15)
                $a = $a -replace $i, $new
                Invoke-WebRequest -Uri $i -UseBasicParsing -OutFile $new
            }

            $l.Text = $a
        }
        
        $base64  = [System.Text.Encoding]::Default.GetBytes($l.Text)
        $l.Text = [System.Convert]::ToBase64String($base64)
    }

    $b = $lang | ConvertTo-Json -Compress | Out-String
    $b = 'var languageData = ' + $b
    Out-File -inputobject $b -filepath "$current/data/text.js"

}
Catch [system.exception] {
	Write-Host "`nAn error occured, try again later`n"
    Write-Host "Press any key to continue ..."

    $host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") | Out-Null
    $host.UI.RawUI.Flushinputbuffer()

	Return
}

Write-Host "`nUpdate completed successfully`n"