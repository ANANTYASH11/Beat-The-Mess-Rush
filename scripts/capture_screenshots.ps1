param(
    [string]$OutDir = "C:\Users\Administrator\.gemini\antigravity-ide\brain\fe77cb46-55c3-491a-b67f-2da18880f2ac"
)

$chrome = "C:\Program Files\Google\Chrome\Application\chrome.exe"

function Capture([string]$name, [int]$w, [int]$h, [string]$targetUrl) {
    $outPath = Join-Path $OutDir "$name.png"
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
    Start-Sleep -Milliseconds 400
    
    if (Test-Path $outPath) {
        $size = (Get-Item $outPath).Length
        Write-Host "Success: $name captured ($size bytes)"
    } else {
        Write-Host "Failed to capture $name"
    }
    
    Remove-Item -Recurse -Force $tempDir -ErrorAction SilentlyContinue
}

# 1. LIGHT MODE (Default) - Home Hero & Thali Lab
Capture "home_1440_light" 1440 900 "http://localhost:3000"
Capture "home_1024_light" 1024 768 "http://localhost:3000"
Capture "home_375_light" 375 812 "http://localhost:3000"
Capture "thalilab_1440_light" 1440 900 "http://localhost:3000/thali-lab"

# 2. DARK MODE - Home Hero & Thali Lab
Capture "home_1440_dark" 1440 900 "http://localhost:3000/?theme=dark"
Capture "home_1024_dark" 1024 768 "http://localhost:3000/?theme=dark"
Capture "home_375_dark" 375 812 "http://localhost:3000/?theme=dark"
Capture "thalilab_1440_dark" 1440 900 "http://localhost:3000/thali-lab?theme=dark"
