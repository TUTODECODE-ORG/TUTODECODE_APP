New-Item -ItemType Directory -Force -Path "backend" | Out-Null
Set-Location "backend"
Write-Host "Downloading PocketBase 0.25.3..."
Invoke-WebRequest -Uri "https://github.com/pocketbase/pocketbase/releases/download/v0.25.3/pocketbase_0.25.3_windows_amd64.zip" -OutFile "pocketbase.zip"
Write-Host "Extracting PocketBase..."
Expand-Archive -Path "pocketbase.zip" -DestinationPath "." -Force
Remove-Item "pocketbase.zip"
Write-Host "PocketBase installed successfully in ./backend"
