# Build SPA + assemble Laravel for upload (e.g. cPanel).
# Usage: .\scripts\publish-hosting.ps1
# Optional: $env:VITE_API_BASE_URL = "https://yoursite.com" before running

$ErrorActionPreference = "Stop"
$Root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
if (-not (Test-Path (Join-Path $Root "backend\artisan"))) {
  throw "Run this script from the repo (scripts\publish-hosting.ps1)."
}
$Dest = Join-Path $Root "publish\koon-hosting"

Write-Host "Project root: $Root"
Write-Host "Output:       $Dest"

if (-not $env:VITE_API_BASE_URL) {
  $env:VITE_API_BASE_URL = "https://koon.edu.sa"
}
Write-Host "VITE_API_BASE_URL = $($env:VITE_API_BASE_URL)"

if (Test-Path $Dest) {
  Remove-Item $Dest -Recurse -Force
}
New-Item -ItemType Directory -Path $Dest -Force | Out-Null

robocopy.exe (Join-Path $Root "backend") $Dest /E `
  /XD node_modules .git vendor `
  /XF .env .env.backup `
  /NFL /NDL /NJH /NJS /nc /ns /np | Out-Null
$rc = $LASTEXITCODE
if ($rc -ge 8) {
  throw "robocopy failed with exit $rc"
}

Push-Location $Root
npm run build
Pop-Location

Copy-Item -Path (Join-Path $Root "dist\*") -Destination (Join-Path $Dest "public") -Recurse -Force
if (Test-Path (Join-Path $Root "public")) {
  Copy-Item -Path (Join-Path $Root "public\*") -Destination (Join-Path $Dest "public") -Recurse -Force
}

# cPanel: web root (public_html) is a copy of public/; Laravel lives next to it. Use
# bootstrap paths to ~/koon-hosting — not the default index.php (that is for php artisan serve).
$cpanelIndex = Join-Path $Root "backend\public\index.cpanel.example.php"
if (-not (Test-Path $cpanelIndex)) {
  throw "Missing backend\public\index.cpanel.example.php"
}
Copy-Item $cpanelIndex (Join-Path $Dest "public\index.php") -Force
Remove-Item (Join-Path $Dest "public\index.cpanel.example.php") -ErrorAction SilentlyContinue

Push-Location $Dest
composer install --no-dev --no-interaction --optimize-autoloader
Pop-Location

$deployCopy = Join-Path $Root "scripts\DEPLOY-COPY.txt"
if (Test-Path $deployCopy) {
  Copy-Item $deployCopy (Join-Path $Dest "DEPLOY-COPY.txt") -Force
}

$hostingPath = Join-Path $Root "scripts\HOSTING.txt"
if (Test-Path $hostingPath) {
  Copy-Item $hostingPath (Join-Path $Dest "HOSTING.txt") -Force
} else {
  $help = @"
KOON hosting bundle (generated). See scripts/HOSTING.txt in repo for full WordPress steps.
VITE_API_BASE_URL used: $($env:VITE_API_BASE_URL)
"@
  Set-Content -Path (Join-Path $Dest "HOSTING.txt") -Value $help -Encoding utf8
}

Write-Host "Done. Zip `publish\koon-hosting` and upload, or sync via FTP."
