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

# Never bundle machine-local env (production .env lives only on the server).
robocopy.exe (Join-Path $Root "backend") $Dest /E `
  /XD node_modules .git vendor `
  /XF .env .env.backup .env.local .env.development .env.production `
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

# Avoid HTTP 500 when old WordPress/.user.ini still points at missing wordfence-waf.php (see scripts/HOSTING.txt).
$userIni = Join-Path $Dest "public\.user.ini"
$userIniBody =
  '; KOON publish bundle: neutral .user.ini for cPanel public_html.' + [Environment]::NewLine +
  '; If you had WordPress + Wordfence, remove any auto_prepend_file=...wordfence... line on the server' + [Environment]::NewLine +
  '; or upload this file to overwrite a broken .user.ini.'
$utf8 = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText($userIni, $userIniBody + [Environment]::NewLine, $utf8)

Push-Location $Dest
composer install --no-dev --no-interaction --optimize-autoloader
Pop-Location

# cPanel: replace public/index.php AFTER composer (composer can restore the default Laravel front controller).
# Match $laravelFolder to secrets/sftp.env SFTP_APP_DIR (same rules as sftp_deploy.py).
function Get-SftpAppDirForPublishIndex([string]$RepoRoot) {
  $p = Join-Path $RepoRoot "secrets\sftp.env"
  if (-not (Test-Path -LiteralPath $p)) { return $null }
  $foundKey = $false
  $value = ""
  foreach ($line in Get-Content -LiteralPath $p) {
    $t = $line.Trim()
    if ($t.StartsWith("#") -or $t -eq "") { continue }
    if ($t -match '^(SFTP_APP_DIR)\s*=\s*(.*)$') {
      $foundKey = $true
      $v = $matches[2].Trim()
      if (($v.StartsWith('"') -and $v.EndsWith('"')) -or ($v.StartsWith("'") -and $v.EndsWith("'"))) {
        $v = $v.Substring(1, $v.Length - 2)
      }
      $value = $v
      break
    }
  }
  if (-not $foundKey) {
    return "koon-hosting"
  }
  return $value
}

$cpanelIndex = Join-Path $Root "backend\public\index.cpanel.example.php"
if (-not (Test-Path $cpanelIndex)) {
  throw "Missing backend\public\index.cpanel.example.php"
}
Copy-Item $cpanelIndex (Join-Path $Dest "public\index.php") -Force
Remove-Item (Join-Path $Dest "public\index.cpanel.example.php") -ErrorAction SilentlyContinue

$idxPath = Join-Path $Dest "public\index.php"
$appDirVal = Get-SftpAppDirForPublishIndex $Root
if ($null -ne $appDirVal) {
  $idxRaw = Get-Content -LiteralPath $idxPath -Raw
  if ($appDirVal -eq "") {
    # PHP must be exactly: $laravelFolder = '';
    # [regex]::Replace treats $ as substitution — use $$ for a literal $ in the output.
    $replacement = '$$laravelFolder = ' + "''" + ';'
  }
  else {
    $esc = $appDirVal.Replace("\", "\\").Replace("'", "\'")
    $replacement = '$$laravelFolder = ''' + $esc + ''';'
  }
  $pat = '(?m)\$laravelFolder\s*=\s*''([^'']*)''\s*;'
  if (-not [regex]::IsMatch($idxRaw, $pat)) {
    Write-Host "Warning: could not patch `$laravelFolder in public\index.php (regex mismatch). Check backend\public\index.cpanel.example.php." -ForegroundColor DarkYellow
  }
  else {
    $idxPatched = [regex]::Replace($idxRaw, $pat, $replacement)
    if ($idxPatched -ne $idxRaw) {
      $utf8 = New-Object System.Text.UTF8Encoding $false
      [System.IO.File]::WriteAllText($idxPath, $idxPatched, $utf8)
      Write-Host "Patched public\index.php: `$laravelFolder for SFTP_APP_DIR=$(if ($appDirVal -eq '') { '(empty = Layout A)' } else { $appDirVal })" -ForegroundColor Green
    }
    else {
      Write-Host "public\index.php already matches SFTP_APP_DIR=$(if ($appDirVal -eq '') { '(empty = Layout A)' } else { $appDirVal }); no rewrite needed." -ForegroundColor DarkGray
    }
  }
}
else {
  Write-Host "No secrets\sftp.env - left index.php as from index.cpanel.example.php." -ForegroundColor DarkGray
}

$deployCopy = Join-Path $Root "scripts\DEPLOY-COPY.txt"
if (Test-Path $deployCopy) {
  Copy-Item $deployCopy (Join-Path $Dest "DEPLOY-COPY.txt") -Force
}

$hostingPath = Join-Path $Root "scripts\HOSTING.txt"
if (Test-Path $hostingPath) {
  Copy-Item $hostingPath (Join-Path $Dest "HOSTING.txt") -Force
} else {
  $vite = $env:VITE_API_BASE_URL
  $help = 'KOON hosting bundle (generated). See scripts/HOSTING.txt in repo for full WordPress steps.' + [Environment]::NewLine +
    'VITE_API_BASE_URL used: ' + $vite + [Environment]::NewLine
  Set-Content -LiteralPath (Join-Path $Dest 'HOSTING.txt') -Value $help -Encoding utf8
}

Write-Host 'Done. Zip publish\koon-hosting and upload, or sync via FTP.'
Write-Host 'Note: Local .env files are excluded. On the server, copy .env.production.example to .env and set APP_KEY, DB_*, etc.' -ForegroundColor DarkGray
