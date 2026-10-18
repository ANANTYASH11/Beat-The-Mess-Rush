$chrome = "C:\Program Files\Google\Chrome\Application\chrome.exe"
$outDir = "C:\Users\Administrator\.gemini\antigravity-ide\brain\20f245a3-f14e-4412-b778-d3e21ff38eb6"

function Capture([string]$name, [int]$w, [int]$h, [string]$targetUrl) {
    $outPath = Join-Path $outDir "$name.png"
    $profId = [System.Guid]::NewGuid().ToString().Substring(0, 8)
    $tempDir = Join-Path $env:TEMP "chrome_prof_$profId"
    
    Write-Host "Capturing $name ($w x $h) from $targetUrl..."
    
    $args = @(
        "--headless=new",
        "--enable-webgl",
        "--use-gl=angle",
        "--no-sandbox",
        "--user-data-dir=$tempDir",
        "--window-size=$w,$h",
        "--hide-scrollbars",
        "--screenshot=$outPath",
        $targetUrl
    )
    
    $proc = Start-Process -FilePath $chrome -ArgumentList $args -PassThru -Wait -WindowStyle Hidden
    Start-Sleep -Milliseconds 600
    
    if (Test-Path $outPath) {
        $size = (Get-Item $outPath).Length
        Write-Host "Success: $name captured ($size bytes)"
    } else {
        Write-Host "Failed to capture $name"
    }
    
    Remove-Item -Recurse -Force $tempDir -ErrorAction SilentlyContinue
}

Capture "kitchen_forecast_1440" 1440 900 "http://localhost:3000/kitchen"
Capture "kitchen_forecast_375" 375 812 "http://localhost:3000/kitchen"
