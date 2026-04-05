param(
  [Parameter(Mandatory = $false)]
  [ValidateSet(
    "install",
    "dev",
    "backend-serve",
    "backend-dev",
    "backend-setup",
    "backend-npm-install",
    "dev-all",
    "build",
    "build-backend",
    "preview",
    "lint",
    "audit",
    "clean",
    "deploy",
    "publish-sftp",
    "sftp-sync",
    "sftp-sync-full",
    "help"
  )]
  [string]$Action,

  [Parameter(Mandatory = $false)]
  [switch]$NoPause,

  [Parameter(Mandatory = $false)]
  [switch]$NewWindow
)

$ErrorActionPreference = "Stop"

function Write-Rule([string]$Title) {
  $line = ("=" * 72)
  Write-Host ""
  Write-Host $line -ForegroundColor DarkGray
  Write-Host ("  {0}" -f $Title) -ForegroundColor Cyan
  Write-Host $line -ForegroundColor DarkGray
}

function Pause-IfNeeded() {
  if (-not $NoPause) {
    Write-Host ""
    Read-Host "Press Enter to continue" | Out-Null
  }
}

function Ensure-RepoRoot() {
  if (-not $PSScriptRoot) {
    throw "Unable to determine script directory."
  }
  Set-Location -Path $PSScriptRoot
}

function Test-Command([string]$Name) {
  return [bool](Get-Command $Name -ErrorAction SilentlyContinue)
}

function Invoke-Npm([string[]]$NpmArgs) {
  if (-not (Test-Command "npm")) {
    throw "npm not found. Install Node.js (includes npm) and try again."
  }
  Write-Host ""
  Write-Host ("Running: npm {0}" -f ($NpmArgs -join " ")) -ForegroundColor Yellow
  npm @NpmArgs
}

function Invoke-Composer([string[]]$ComposerArgs) {
  if (-not (Test-Command "composer")) {
    throw "composer not found. Install Composer and try again."
  }
  Write-Host ""
  Write-Host ("Running: composer {0}" -f ($ComposerArgs -join " ")) -ForegroundColor Yellow
  composer @ComposerArgs
}

function Invoke-Php([string[]]$PhpArgs) {
  if (-not (Test-Command "php")) {
    throw "php not found. Install PHP (>= 8.2) and try again."
  }
  Write-Host ""
  Write-Host ("Running: php {0}" -f ($PhpArgs -join " ")) -ForegroundColor Yellow
  php @PhpArgs
}

function Invoke-Artisan([string[]]$ArtisanArgs) {
  $backendDir = Join-Path $PSScriptRoot "backend"
  $artisanPath = Join-Path $backendDir "artisan"
  if (-not (Test-Path $artisanPath)) {
    throw "Laravel artisan not found at: $artisanPath"
  }
  Push-Location $backendDir
  try {
    Invoke-Php (@("artisan") + $ArtisanArgs)
  } finally {
    Pop-Location
  }
}

function Get-DotEnvValue([string]$FilePath, [string]$Key) {
  if (-not (Test-Path $FilePath)) { return $null }
  $line = Get-Content -LiteralPath $FilePath -ErrorAction SilentlyContinue |
    Where-Object { $_ -match ("^\s*{0}\s*=" -f [regex]::Escape($Key)) } |
    Select-Object -First 1
  if (-not $line) { return $null }
  $value = ($line -split "=", 2)[1].Trim()
  if ($value.StartsWith('"') -and $value.EndsWith('"')) { $value = $value.Substring(1, $value.Length - 2) }
  if ($value.StartsWith("'") -and $value.EndsWith("'")) { $value = $value.Substring(1, $value.Length - 2) }
  return $value
}

function Get-BackendUrl() {
  $backendEnv = Join-Path (Join-Path $PSScriptRoot "backend") ".env"
  $appUrl = Get-DotEnvValue $backendEnv "APP_URL"
  if ($appUrl) { return $appUrl }
  return "http://127.0.0.1:8000"
}

function Write-OpenUrlHint([string]$Label, [string]$Url) {
  Write-Host ""
  Write-Host ("Open {0}: " -f $Label) -NoNewline -ForegroundColor DarkGray
  Write-Host $Url -ForegroundColor Green
}

function Show-Help() {
  Write-Rule "koon.edu.sa - project scripts"
  Write-Host "Usage:" -ForegroundColor White
  Write-Host "  .\scripts.ps1" -ForegroundColor Gray
  Write-Host "  .\scripts.ps1 -Action dev" -ForegroundColor Gray
  Write-Host "  .\scripts.ps1 -Action dev-all -NewWindow" -ForegroundColor Gray
  Write-Host "  .\scripts.ps1 -Action build -NoPause" -ForegroundColor Gray
  Write-Host ""
  Write-Host "Actions:" -ForegroundColor White
  Write-Host "  install  - npm install" -ForegroundColor Gray
  Write-Host "  dev      - start Vite dev server" -ForegroundColor Gray
  Write-Host "  backend-serve - php artisan serve (./backend)" -ForegroundColor Gray
  Write-Host "  backend-dev - composer run dev (serve + queue + logs + vite)" -ForegroundColor Gray
  Write-Host "  backend-setup - composer install + key + migrate + npm build" -ForegroundColor Gray
  Write-Host "  dev-all  - start frontend + backend (artisan serve)" -ForegroundColor Gray
  Write-Host "  build    - production build" -ForegroundColor Gray
  Write-Host "  build-backend - backend build (./backend)" -ForegroundColor Gray
  Write-Host "  preview  - preview production build" -ForegroundColor Gray
  Write-Host "  lint     - eslint" -ForegroundColor Gray
  Write-Host "  audit    - npm audit (read-only)" -ForegroundColor Gray
  Write-Host "  clean    - remove dist + node_modules (asks confirmation)" -ForegroundColor Gray
  Write-Host "  deploy   - build + show next steps (safe; no git push)" -ForegroundColor Gray
  Write-Host "  publish-sftp   - publish-hosting.ps1 + SFTP incremental (needs secrets/sftp.env)" -ForegroundColor Gray
  Write-Host "  sftp-sync      - SFTP incremental only (publish/koon-hosting must exist)" -ForegroundColor Gray
  Write-Host "  sftp-sync-full - SFTP full upload (--full)" -ForegroundColor Gray
  Write-Host "  help     - show this help" -ForegroundColor Gray
}

function Confirm([string]$Prompt) {
  while ($true) {
    $answer = (Read-Host "$Prompt [y/n]").Trim().ToLowerInvariant()
    if ($answer -in @("y", "yes")) { return $true }
    if ($answer -in @("n", "no")) { return $false }
    Write-Host "Please type y or n." -ForegroundColor DarkYellow
  }
}

function Action-Install() {
  Write-Rule "Install dependencies"
  Invoke-Npm @("install")
}

function Action-Dev() {
  Write-Rule "Run dev server"
  Write-OpenUrlHint "frontend (expected)" "http://localhost:5173/"
  Write-Host "If 5173 is busy, Vite will choose the next free port and print it as 'Local:'." -ForegroundColor DarkGray

  if (Start-CommandInNewWindow "frontend (vite dev)" $PSScriptRoot "npm run dev") {
    return
  }
  Invoke-Npm @("run", "dev")
  Write-OpenUrlHint "frontend" "http://localhost:5173/"
  Write-Host ""
  Write-Host "If Vite picked a different port, use the Local URL shown above." -ForegroundColor DarkGray
}

function Action-Build() {
  Write-Rule "Build"
  Invoke-Npm @("run", "build")
}

function Action-Preview() {
  Write-Rule "Preview build"
  Invoke-Npm @("run", "preview")
}

function Action-Lint() {
  Write-Rule "Lint"
  Invoke-Npm @("run", "lint")
}

function Action-Audit() {
  Write-Rule "Audit (read-only)"
  Invoke-Npm @("audit")
}

function Invoke-BackendNpm([string[]]$NpmArgs) {
  $backendDir = Join-Path $PSScriptRoot "backend"
  if (-not (Test-Path $backendDir)) {
    throw "backend folder not found at: $backendDir"
  }
  Push-Location $backendDir
  try {
    if (-not (Test-Path (Join-Path $backendDir "node_modules"))) {
      Write-Host ""
      Write-Host "backend/node_modules not found. Installing backend npm dependencies..." -ForegroundColor DarkYellow
      Invoke-Npm @("install")
    }
    Invoke-Npm $NpmArgs
  } finally {
    Pop-Location
  }
}

function Start-CommandInNewWindow([string]$Title, [string]$WorkingDir, [string]$Command) {
  if ($NewWindow) {
    Start-Process -FilePath "powershell" -WorkingDirectory $WorkingDir -ArgumentList @(
      "-NoProfile",
      "-NoExit",
      "-Command",
      "Set-Location -LiteralPath '$WorkingDir'; $Command"
    ) | Out-Null
    Write-Host ("Started in new window: {0}" -f $Title) -ForegroundColor Green
    return $true
  }
  return $false
}

function Action-BackendServe() {
  Write-Rule "Laravel: php artisan serve"
  $backendDir = Join-Path $PSScriptRoot "backend"
  if (-not (Test-Path $backendDir)) {
    throw "backend folder not found at: $backendDir"
  }

  Write-OpenUrlHint "backend" (Get-BackendUrl)

  if (Start-CommandInNewWindow "backend (artisan serve)" $backendDir "php artisan serve") {
    return
  }

  Invoke-Artisan @("serve")
}

function Action-BackendDev() {
  Write-Rule "Laravel: composer run dev"
  $backendDir = Join-Path $PSScriptRoot "backend"
  if (-not (Test-Path $backendDir)) {
    throw "backend folder not found at: $backendDir"
  }

  if (Start-CommandInNewWindow "backend (composer dev)" $backendDir "composer run dev") {
    Write-OpenUrlHint "backend" (Get-BackendUrl)
    return
  }

  Push-Location $backendDir
  try {
    if (-not (Test-Path (Join-Path $backendDir "vendor"))) {
      Write-Host ""
      Write-Host "backend/vendor not found. Running composer install..." -ForegroundColor DarkYellow
      Invoke-Composer @("install")
    }
    if (-not (Test-Path (Join-Path $backendDir "node_modules"))) {
      Write-Host ""
      Write-Host "backend/node_modules not found. Running npm install..." -ForegroundColor DarkYellow
      Invoke-Npm @("install")
    }
    Invoke-Composer @("run", "dev")
  } finally {
    Pop-Location
  }
  Write-OpenUrlHint "backend" (Get-BackendUrl)
}

function Action-BackendSetup() {
  Write-Rule "Laravel: setup"
  $backendDir = Join-Path $PSScriptRoot "backend"
  if (-not (Test-Path $backendDir)) {
    throw "backend folder not found at: $backendDir"
  }

  Push-Location $backendDir
  try {
    Invoke-Composer @("run", "setup")
  } finally {
    Pop-Location
  }
}

function Action-BackendNpmInstall() {
  Write-Rule "Backend: npm install"
  Invoke-BackendNpm @("install")
}

function Action-BuildBackend() {
  Write-Rule "Build backend"
  Invoke-BackendNpm @("run", "build")
}

function Action-DevAll() {
  Write-Rule "Run frontend + backend"

  $frontendDir = $PSScriptRoot
  $backendDir = Join-Path $PSScriptRoot "backend"
  if (-not (Test-Path $backendDir)) {
    throw "backend folder not found at: $backendDir"
  }

  Write-OpenUrlHint "backend" (Get-BackendUrl)
  Write-OpenUrlHint "frontend (expected)" "http://localhost:5173/"

  if ($NewWindow) {
    Write-Host "Starting backend (artisan serve) in a new window..." -ForegroundColor Gray
    Start-CommandInNewWindow "backend (artisan serve)" $backendDir "php artisan serve" | Out-Null

    Write-Host "Starting frontend in this terminal..." -ForegroundColor Gray
    Push-Location $frontendDir
    try {
      Invoke-Npm @("run", "dev")
    } finally {
      Pop-Location
    }
    return
  }

  Write-Host "Running backend first in this terminal (it will keep running)..." -ForegroundColor Gray
  Write-Host "Use -NewWindow if you want both at the same time." -ForegroundColor DarkGray
  Action-BackendServe
}

function Action-Clean() {
  Write-Rule "Clean"
  Write-Host "This will delete:" -ForegroundColor White
  Write-Host "  - .\dist" -ForegroundColor Gray
  Write-Host "  - .\node_modules" -ForegroundColor Gray
  Write-Host ""
  if (-not (Confirm "Continue?")) {
    Write-Host "Cancelled." -ForegroundColor DarkYellow
    return
  }

  $paths = @("dist", "node_modules")
  foreach ($p in $paths) {
    if (Test-Path $p) {
      Write-Host ("Deleting .\{0}" -f $p) -ForegroundColor Yellow
      Remove-Item -Recurse -Force -Path $p
    } else {
      Write-Host ("Skip (not found): .\{0}" -f $p) -ForegroundColor DarkGray
    }
  }
  Write-Host "Done." -ForegroundColor Green
}

function Action-Deploy() {
  Write-Rule "Deploy (safe)"
  Write-Host "This runs a production build, then prints next steps." -ForegroundColor Gray
  Action-Build

  Write-Host ""
  Write-Host "Next steps (depends on your hosting):" -ForegroundColor White
  Write-Host "  - Upload the contents of .\dist" -ForegroundColor Gray
  Write-Host "  - Or run: .\scripts.ps1 -Action preview" -ForegroundColor Gray
  Write-Host ""
  Write-Host "Git actions are intentionally not automated here." -ForegroundColor DarkGray
}

function Test-PythonParamiko() {
  python -c "import paramiko" 2>$null
  return ($LASTEXITCODE -eq 0)
}

function Ensure-Paramiko() {
  if (-not (Test-Command "python")) {
    throw "python not found. Install Python 3 and try again."
  }
  if (-not (Test-PythonParamiko)) {
    Write-Host "Installing paramiko (pip)…" -ForegroundColor Yellow
    python -m pip install paramiko
  }
}

function Invoke-SftpDeploy {
  param(
    [switch]$Full,
    [switch]$DryRun,
    [switch]$NoBaseline
  )
  Ensure-RepoRoot
  Ensure-Paramiko
  $pyScript = Join-Path $PSScriptRoot "scripts\sftp_deploy.py"
  if (-not (Test-Path $pyScript)) {
    throw "Missing: $pyScript"
  }
  $argList = @($pyScript)
  if ($Full) { $argList += "--full" }
  if ($DryRun) { $argList += "--dry-run" }
  if ($NoBaseline) { $argList += "--no-baseline" }
  Write-Host ""
  Write-Host ("Running: python -u {0}" -f ($argList -join " ")) -ForegroundColor Yellow
  # -u: unbuffered stdout/stderr so SFTP progress shows live in PowerShell / IDE terminals
  & python -u @argList
}

function Action-PublishSftp() {
  Write-Rule "Publish hosting + SFTP (incremental)"
  $pub = Join-Path $PSScriptRoot "scripts\publish-hosting.ps1"
  if (-not (Test-Path $pub)) {
    throw "Missing: $pub"
  }
  & powershell -NoProfile -ExecutionPolicy Bypass -File $pub
  Invoke-SftpDeploy
}

function Action-SftpSync() {
  Write-Rule "SFTP sync (incremental)"
  Invoke-SftpDeploy
}

function Action-SftpSyncFull() {
  Write-Rule "SFTP sync (full)"
  Invoke-SftpDeploy -Full
}

function Run-Action([string]$A) {
  switch ($A) {
    "install" { Action-Install }
    "dev" { Action-Dev }
    "backend-serve" { Action-BackendServe }
    "backend-dev" { Action-BackendDev }
    "backend-setup" { Action-BackendSetup }
    "backend-npm-install" { Action-BackendNpmInstall }
    "dev-all" { Action-DevAll }
    "build" { Action-Build }
    "build-backend" { Action-BuildBackend }
    "preview" { Action-Preview }
    "lint" { Action-Lint }
    "audit" { Action-Audit }
    "clean" { Action-Clean }
    "deploy" { Action-Deploy }
    "publish-sftp" { Action-PublishSftp }
    "sftp-sync" { Action-SftpSync }
    "sftp-sync-full" { Action-SftpSyncFull }
    "help" { Show-Help }
    default { throw "Unknown action: $A" }
  }
}

function Show-Menu() {
  Write-Rule "koon.edu.sa"

  Write-Host "Choose an action:" -ForegroundColor White
  Write-Host ""
  Write-Host "  1) Install (npm install)" -ForegroundColor Cyan
  Write-Host "  2) Dev (npm run dev)" -ForegroundColor Cyan
  Write-Host "  3) Backend: serve (php artisan serve)" -ForegroundColor Cyan
  Write-Host "  4) Backend: dev (composer run dev)" -ForegroundColor Cyan
  Write-Host "  5) Backend: npm install" -ForegroundColor Cyan
  Write-Host "  6) Dev (frontend + backend serve) (use -NewWindow)" -ForegroundColor Cyan
  Write-Host "  7) Build (npm run build)" -ForegroundColor Cyan
  Write-Host "  8) Build (backend assets) (cd backend; npm run build)" -ForegroundColor Cyan
  Write-Host "  9) Backend: setup (composer run setup)" -ForegroundColor Cyan
  Write-Host "  10) Preview (npm run preview)" -ForegroundColor Cyan
  Write-Host "  11) Lint (npm run lint)" -ForegroundColor Cyan
  Write-Host "  12) Audit (npm audit)" -ForegroundColor Cyan
  Write-Host "  13) Clean (delete dist + node_modules)" -ForegroundColor Cyan
  Write-Host "  14) Deploy (build + instructions)" -ForegroundColor Cyan
  Write-Host "  15) Publish hosting + SFTP incremental (publish-hosting + upload)" -ForegroundColor Cyan
  Write-Host "  16) SFTP incremental only (needs publish\koon-hosting)" -ForegroundColor Cyan
  Write-Host "  17) SFTP full upload" -ForegroundColor Cyan
  Write-Host ""
  Write-Host "  0) Exit" -ForegroundColor DarkGray
  Write-Host ""

  $choice = (Read-Host "Enter 0-17").Trim()
  switch ($choice) {
    "1" { Run-Action "install" }
    "2" { Run-Action "dev" }
    "3" { Run-Action "backend-serve" }
    "4" { Run-Action "backend-dev" }
    "5" { Run-Action "backend-npm-install" }
    "6" { Run-Action "dev-all" }
    "7" { Run-Action "build" }
    "8" { Run-Action "build-backend" }
    "9" { Run-Action "backend-setup" }
    "10" { Run-Action "preview" }
    "11" { Run-Action "lint" }
    "12" { Run-Action "audit" }
    "13" { Run-Action "clean" }
    "14" { Run-Action "deploy" }
    "15" { Run-Action "publish-sftp" }
    "16" { Run-Action "sftp-sync" }
    "17" { Run-Action "sftp-sync-full" }
    "0" { return $false }
    default {
      Write-Host "Invalid choice." -ForegroundColor DarkYellow
    }
  }
  return $true
}

Ensure-RepoRoot

if ($Action) {
  Run-Action $Action
  exit 0
}

while ($true) {
  $keepGoing = Show-Menu
  if (-not $keepGoing) { break }
  Pause-IfNeeded
}

