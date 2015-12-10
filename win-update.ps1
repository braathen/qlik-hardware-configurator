$config_language = "https://docs.google.com/spreadsheets/d/18GG6fMRb9AlFSY4SVesTTl8i4YR11XHcPPjksua9-Cs/pub?output=csv"
$config_data = "https://docs.google.com/spreadsheets/d/1DHz86iUMtQNFc6jAPTXspJTFjUVEK4613eNQLrCrV2c/pub?output=csv"
$prod = 0

#Try {

    $wc = New-Object System.Net.WebClient
    $wc.Encoding = [System.Text.Encoding]::UTF8

	# Data configuration
    $data = "var sizingData = " + ($wc.DownloadString($config_data) | ConvertFrom-Csv -Delimiter ',' | ConvertTo-Json -Compress | Out-String)
	Out-File -inputobject $data -filepath "assets/data/config_data.js"

    # Language configuration
#    $lang = (Invoke-WebRequest -Uri $config_language -UseBasicParsing | ConvertFrom-Csv -Delimiter ',')
#    $lang = (Read-HtmlPage $config_language | ConvertFrom-Csv -Delimiter ',')
    $lang = ($wc.DownloadString($config_language) | ConvertFrom-Csv -Delimiter ',')

    Foreach ($l in $lang)
    {
        If ($l.Url -ne "")
        {
#            $a = Invoke-WebRequest -Uri $l.Url -UseBasicParsing
#            $a = Invoke-WebRequest -Uri $l.Url -UseBasicParsing -ContentType "text/html; charset=utf-8"
#            $a = Read-HtmlPage $l.Url $l.Url
            $a = $wc.DownloadString($l.Url + "?embedded=true")  

            $a = $a -replace '(?s)^.*</style>|<div id="footer">.*$', ''

            $a = $a -replace '(?s)^.*<body.*?>|</body>.*$', ''


#           Out-File -inputobject $a -filepath "assets/data/tmpdirty.html"

#&assets/data/tidy.exe -utf8 -omit -gdoc -m assets/data/tmpdirty.html 2>&1 | Out-Null
#            $a = Get-Content -Path assets/data/tmpdirty.html | Out-String

            $a = $a -replace '(?s)^.*</title>', ''

            $regex = '(?s)src="(.*?)"'
            $src = ([regex]$regex).Matches($a) | ForEach-Object { $_.Groups[1].Value}

            # Download images
            Foreach ($i in $src)
            {
                $new = "assets/data/" + $i.substring($i.length - 15, 15)
                $a = $a -replace $i, $new
                Invoke-WebRequest -Uri $i -UseBasicParsing -OutFile $new
            }

            #$a = $a -replace '(?s)"', '\"'
            $l.Text = $a
#            $base64  = [System.Text.Encoding]::UTF8.GetBytes($a)
#            $l.Text = [System.Convert]::ToBase64String($base64)
        }
#        Write-Host $l.Text
        
        $base64  = [System.Text.Encoding]::Default.GetBytes($l.Text)
        $l.Text = [System.Convert]::ToBase64String($base64)
    }

    #Remove-Item "assets/data/tmpdirty.html" -recurse
    $b = $lang | ConvertTo-Json -Compress | Out-String
    $b = 'var languageData = ' + $b
    Out-File -inputobject $b -filepath "assets/data/text.js"

#}
#Catch [system.exception] {
#	"An error occured, try again later"
#	Return
#}
Write-Host "Update completed successfully"

Write-Host "Press any key to continue ..."

$host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") | Out-Null
$host.UI.RawUI.Flushinputbuffer()





