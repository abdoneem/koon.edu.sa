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
    "ssh-diagnose",
    "sftp-fetch-log",
    "sftp-clear-cache",
    "sftp-deploy-db-one-shot",
    "sftp-admin-password-reset",
    "sftp-set-admin-password-file",
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

function Get-LaravelDevServerUrl() {
  <#
    URL where `php artisan serve` listens (default 127.0.0.1:8000).
    APP_URL alone is often http://localhost without a port - not the dev server.
    Optional overrides in backend/.env:
      ARTISAN_SERVE_HOST=127.0.0.1
      ARTISAN_SERVE_PORT=8000
    If APP_URL includes an explicit non-default port, that URL is used.
  #>
  $backendEnv = Join-Path (Join-Path $PSScriptRoot "backend") ".env"
  $hostOverride = Get-DotEnvValue $backendEnv "ARTISAN_SERVE_HOST"
  $portOverride = Get-DotEnvValue $backendEnv "ARTISAN_SERVE_PORT"
  if ($hostOverride -or $portOverride) {
    $h = if ($hostOverride) { $hostOverride.Trim() } else { "127.0.0.1" }
    $p = if ($portOverride) { ($portOverride.Trim() -replace '^:', '') } else { "8000" }
    return "http://${h}:${p}"
  }

  $appUrl = Get-DotEnvValue $backendEnv "APP_URL"
  if ($appUrl) {
    try {
      $u = [Uri]$appUrl.Trim()
      if ($u.IsAbsoluteUri) {
        $port = $u.Port
        if ($port -ne 80 -and $port -ne 443) {
          return $u.GetLeftPart([UriPartial]::Authority)
        }
      }
    }
    catch {
      # fall through to default
    }
  }

  return "http://127.0.0.1:8000"
}

function Get-ViteDevUrl() {
  return "http://localhost:5173/"
}

function Write-OpenUrlHint([string]$Label, [string]$Url) {
  Write-Host ""
  Write-Host ("{0,-18} " -f $Label) -NoNewline -ForegroundColor DarkGray
  Write-Host $Url -ForegroundColor Green
}

function Write-LocalDevUrlsSummary() {
  $backendUrl = Get-LaravelDevServerUrl
  $frontendUrl = Get-ViteDevUrl
  $labelW = 22
  Write-Host ""
  Write-Host ("{0,-$labelW} {1}" -f "Backend (API)", $backendUrl) -ForegroundColor Green
  Write-Host ("{0,-$labelW} {1}" -f "Frontend (Vite)", $frontendUrl) -ForegroundColor Green
  Write-Host ""
  Write-Host "SPA API base URL - set in repo root .env.local:" -ForegroundColor DarkGray
  Write-Host ("  VITE_API_BASE_URL={0}" -f $backendUrl) -ForegroundColor Gray
  Write-Host ""
  Write-Host "If Vite prints a different Local: port, use that for the frontend URL." -ForegroundColor DarkGray
}

function Write-ViteProgressHint() {
  Write-Host ""
  Write-Host "Vite live output (below):" -ForegroundColor White
  Write-Host "  - Startup: Local / Network URL and ready in ... ms" -ForegroundColor DarkGray
  Write-Host "  - After saving a file: rebuild lines and HMR (hmr update / page reload)" -ForegroundColor DarkGray
  Write-Host "  - vite.config.ts uses clearScreen: false so logs stay visible" -ForegroundColor DarkGray
  Write-Host "  - Ctrl+C stops the dev server" -ForegroundColor DarkGray
  Write-Host ("{0}" -f ("-" * 72)) -ForegroundColor DarkGray
}

function Write-SeparatorLine() {
  Write-Host ("{0}" -f ("-" * 72)) -ForegroundColor DarkGray
}

function Write-NpmInstallHint() {
  Write-Host ""
  Write-Host "npm install progress (below):" -ForegroundColor White
  Write-Host "  - Resolving / fetching packages, then a summary tree (may take a few minutes)" -ForegroundColor DarkGray
  Write-Host "  - Use npm install -v for more verbose logging if needed" -ForegroundColor DarkGray
  Write-SeparatorLine
}

function Write-NpmBuildHint() {
  Write-Host ""
  Write-Host "Build progress (below):" -ForegroundColor White
  Write-Host "  - tsc -b then vite build; output goes to .\dist\" -ForegroundColor DarkGray
  Write-SeparatorLine
}

function Write-VitePreviewHint() {
  Write-Host ""
  Write-Host "Preview server (below):" -ForegroundColor White
  Write-Host "  - Requires a prior build (npm run build). Default URL is often http://localhost:4173/" -ForegroundColor DarkGray
  Write-Host "  - Use the Local: line Vite prints if the port differs; Ctrl+C stops preview" -ForegroundColor DarkGray
  Write-SeparatorLine
}

function Write-EslintHint() {
  Write-Host ""
  Write-Host "ESLint output (below):" -ForegroundColor White
  Write-Host "  - Lists file:line:column and rule id for each issue; exit code 1 if problems found" -ForegroundColor DarkGray
  Write-SeparatorLine
}

function Write-NpmAuditHint() {
  Write-Host ""
  Write-Host "npm audit (below):" -ForegroundColor White
  Write-Host "  - Advisory list and suggested fixes; this action does not change package.json" -ForegroundColor DarkGray
  Write-SeparatorLine
}

function Write-LaravelServeProgressHint() {
  Write-Host ""
  Write-Host "Laravel artisan serve (below):" -ForegroundColor White
  Write-Host "  - Startup shows Development server : http://..." -ForegroundColor DarkGray
  Write-Host "  - Each browser/API hit logs a line; Ctrl+C stops the server" -ForegroundColor DarkGray
  Write-SeparatorLine
}

function Write-ComposerDevProgressHint() {
  Write-Host ""
  Write-Host "composer run dev (below):" -ForegroundColor White
  Write-Host "  - Runs multiple processes (e.g. php server, queue, logs, Vite) via concurrently" -ForegroundColor DarkGray
  Write-Host "  - Prefixes show which process logged each line; Ctrl+C stops all" -ForegroundColor DarkGray
  Write-SeparatorLine
}

function Write-BackendSetupHint() {
  Write-Host ""
  Write-Host "composer run setup (below):" -ForegroundColor White
  Write-Host "  - Can take several minutes: composer install, key, migrate, npm install, npm run build" -ForegroundColor DarkGray
  Write-Host "  - Watch for errors before using php artisan serve or npm run dev" -ForegroundColor DarkGray
  Write-SeparatorLine
}

function Write-BackendNpmBuildHint() {
  Write-Host ""
  Write-Host "Backend npm build (below):" -ForegroundColor White
  Write-Host "  - Runs in .\backend (Filament/Vite assets if configured); check backend/package.json" -ForegroundColor DarkGray
  Write-SeparatorLine
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
  Write-Host "  sftp-sync      - SFTP incremental only (menu 16; needs publish\koon-hosting + secrets\sftp.env)" -ForegroundColor Gray
  Write-Host "  sftp-sync-full - SFTP full upload (menu 17; same bundle + --full)" -ForegroundColor Gray
  Write-Host "  ssh-diagnose   - SSH using secrets/sftp.env; print artisan about + laravel.log tail" -ForegroundColor Gray
  Write-Host "  sftp-fetch-log - SFTP tail of storage/logs/laravel.log (no SSH shell required)" -ForegroundColor Gray
  Write-Host "  sftp-clear-cache - SFTP clear Laravel file cache (fixes admin Too Many Attempts when CACHE_STORE=file)" -ForegroundColor Gray
  Write-Host "  sftp-deploy-db-one-shot - Upload one-shot PHP, run koon:deploy-database via HTTPS, delete script" -ForegroundColor Gray
  Write-Host "  sftp-admin-password-reset - One-shot AdminUserSeeder (server .env DEFAULT_ADMIN_PASSWORD)" -ForegroundColor Gray
  Write-Host "  sftp-set-admin-password-file - One-shot POST password from secrets\\admin_password_reset.txt" -ForegroundColor Gray
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
  Write-NpmInstallHint
  Invoke-Npm @("install")
}

function Action-Dev() {
  Write-Rule "Run dev server"
  Write-Host "Expected local URLs:" -ForegroundColor White
  Write-LocalDevUrlsSummary
  Write-ViteProgressHint

  if (Start-CommandInNewWindow "frontend (vite dev)" $PSScriptRoot "npm run dev") {
    Write-Host ""
    Write-Host "Watch the new PowerShell window for Vite startup and HMR output." -ForegroundColor DarkGray
    return
  }
  Invoke-Npm @("run", "dev")
  Write-Host ""
  Write-Host "If Vite picked a different port, use the Local URL it printed." -ForegroundColor DarkGray
}

function Action-Build() {
  Write-Rule "Build"
  Write-NpmBuildHint
  Invoke-Npm @("run", "build")
}

function Action-Preview() {
  Write-Rule "Preview build"
  Write-VitePreviewHint
  Invoke-Npm @("run", "preview")
}

function Action-Lint() {
  Write-Rule "Lint"
  Write-EslintHint
  Invoke-Npm @("run", "lint")
}

function Action-Audit() {
  Write-Rule "Audit (read-only)"
  Write-NpmAuditHint
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

  Write-Host "Open the API in your browser:" -ForegroundColor White
  Write-OpenUrlHint "Backend (API)" (Get-LaravelDevServerUrl)
  Write-Host "Customize host/port: set ARTISAN_SERVE_HOST / ARTISAN_SERVE_PORT in backend\.env" -ForegroundColor DarkGray

  if (Start-CommandInNewWindow "backend (artisan serve)" $backendDir "php artisan serve") {
    Write-Host ""
    Write-Host "Watch the new PowerShell window for Laravel startup and request logs." -ForegroundColor DarkGray
    return
  }

  Write-LaravelServeProgressHint
  Invoke-Artisan @("serve")
}

function Action-BackendDev() {
  Write-Rule "Laravel: composer run dev"
  $backendDir = Join-Path $PSScriptRoot "backend"
  if (-not (Test-Path $backendDir)) {
    throw "backend folder not found at: $backendDir"
  }

  if (Start-CommandInNewWindow "backend (composer dev)" $backendDir "composer run dev") {
    Write-Host "Typical Laravel dev server:" -ForegroundColor White
    Write-OpenUrlHint "Backend (API)" (Get-LaravelDevServerUrl)
    Write-Host ""
    Write-Host "Watch the new window for interleaved output from all composer dev processes." -ForegroundColor DarkGray
    return
  }

  Write-Host "Expected local URLs (Vite may use a different port - see composer output):" -ForegroundColor White
  Write-LocalDevUrlsSummary
  Write-ComposerDevProgressHint
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
  Write-Host "Typical Laravel dev server:" -ForegroundColor White
  Write-OpenUrlHint "Backend (API)" (Get-LaravelDevServerUrl)
}

function Action-BackendSetup() {
  Write-Rule "Laravel: setup"
  $backendDir = Join-Path $PSScriptRoot "backend"
  if (-not (Test-Path $backendDir)) {
    throw "backend folder not found at: $backendDir"
  }

  Write-BackendSetupHint
  Push-Location $backendDir
  try {
    Invoke-Composer @("run", "setup")
  } finally {
    Pop-Location
  }
}

function Action-BackendNpmInstall() {
  Write-Rule "Backend: npm install"
  Write-NpmInstallHint
  Invoke-BackendNpm @("install")
}

function Action-BuildBackend() {
  Write-Rule "Build backend"
  Write-BackendNpmBuildHint
  Invoke-BackendNpm @("run", "build")
}

function Action-DevAll() {
  Write-Rule "Run frontend + backend"

  $frontendDir = $PSScriptRoot
  $backendDir = Join-Path $PSScriptRoot "backend"
  if (-not (Test-Path $backendDir)) {
    throw "backend folder not found at: $backendDir"
  }

  Write-Host "Open these in your browser:" -ForegroundColor White
  Write-LocalDevUrlsSummary

  if ($NewWindow) {
    Write-Host "Starting backend (artisan serve) in a new window..." -ForegroundColor Gray
    Write-Host "Watch that window for Laravel request logs." -ForegroundColor DarkGray
    Start-CommandInNewWindow "backend (artisan serve)" $backendDir "php artisan serve" | Out-Null

    Write-Host "Starting frontend in this terminal..." -ForegroundColor Gray
    Write-ViteProgressHint
    Push-Location $frontendDir
    try {
      Invoke-Npm @("run", "dev")
    } finally {
      Pop-Location
    }
    return
  }

  Write-Host "This terminal will run the backend only (it keeps running)." -ForegroundColor Gray
  Write-Host "Start the frontend in another terminal: .\scripts.ps1 -Action dev" -ForegroundColor DarkGray
  Write-Host "Or run both at once: .\scripts.ps1 -Action dev-all -NewWindow" -ForegroundColor DarkGray
  Write-Host ""
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
    Write-Host "Installing paramiko (pip)..." -ForegroundColor Yellow
    python -m pip install paramiko
  }
}

function Assert-SftpSecretsPresent() {
  $envFile = Join-Path $PSScriptRoot "secrets\sftp.env"
  if (-not (Test-Path -LiteralPath $envFile -PathType Leaf)) {
    throw (
      "Missing SFTP config: $envFile`n" +
      "Copy secrets\sftp.env.example to secrets\sftp.env and set SFTP_HOST, SFTP_USER, SFTP_PASS (see secrets\README.txt)."
    )
  }
}

function Assert-PublishKoonHostingBundle() {
  $bundle = Join-Path $PSScriptRoot "publish\koon-hosting"
  $pub = Join-Path $bundle "public"
  if (-not (Test-Path -LiteralPath $bundle -PathType Container)) {
    throw (
      "Missing hosting bundle: $bundle`n" +
      "Run option 15 (publish + SFTP), or from repo root: .\scripts\publish-hosting.ps1`n" +
      "Then retry SFTP (options 16 or 17)."
    )
  }
  if (-not (Test-Path -LiteralPath $pub -PathType Container)) {
    throw (
      "Incomplete bundle (no public\): $pub`n" +
      "Re-run: .\scripts\publish-hosting.ps1"
    )
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
  Assert-SftpSecretsPresent
  Assert-PublishKoonHostingBundle
  $pyScript = Join-Path $PSScriptRoot "scripts\sftp_deploy.py"
  if (-not (Test-Path $pyScript)) {
    throw "Missing: $pyScript"
  }
  $argList = @($pyScript)
  if ($Full) { $argList += "--full" }
  if ($DryRun) { $argList += "--dry-run" }
  if ($NoBaseline) { $argList += "--no-baseline" }
  Write-Host ""
  Write-Host "SFTP deploy (below):" -ForegroundColor White
  Write-Host "  - python -u: unbuffered output (lines appear as they are printed)" -ForegroundColor DarkGray
  Write-Host "  - First lines appear immediately; then paramiko/cryptography may load 10-60s on Windows" -ForegroundColor DarkGray
  Write-Host "  - Local rglob over publish\koon-hosting can take 30-90s before the first [app] PUT line" -ForegroundColor DarkGray
  Write-Host "  - Each phase: file counts, then PUT lines every 10 files + current path + elapsed time" -ForegroundColor DarkGray
  Write-Host "  - Every 300 paths: heartbeat while scanning/skipping (so it never looks stuck)" -ForegroundColor DarkGray
  Write-Host "  - Optional: python ... --verbose  (log every single uploaded file)" -ForegroundColor DarkGray
  if ($Full) {
    Write-Host "  - Full sync (--full): uploads all eligible files; ignores publish\last baseline" -ForegroundColor DarkGray
  }
  else {
    Write-Host "  - Incremental: uploads files that differ from .\publish\last\koon-hosting (or all if no baseline)" -ForegroundColor DarkGray
  }
  Write-SeparatorLine
  Write-Host ""
  Write-Host ("Running: python -u {0}" -f ($argList -join " ")) -ForegroundColor Yellow
  # -u: unbuffered stdout/stderr so SFTP progress shows live in PowerShell / IDE terminals
  & python -u @argList
}

function Action-SshDiagnose() {
  Write-Rule "SSH diagnose (production server)"
  Write-Host "Uses secrets/sftp.env (same host/user/pass as SFTP). Requires SSH enabled on the host." -ForegroundColor DarkGray
  Ensure-RepoRoot
  Ensure-Paramiko
  Assert-SftpSecretsPresent
  $py = Join-Path $PSScriptRoot "scripts\ssh_diagnose_server.py"
  if (-not (Test-Path -LiteralPath $py)) {
    throw "Missing: $py"
  }
  Write-Host ""
  Write-Host "Running: python -u $py" -ForegroundColor Yellow
  & python -u $py
}

function Action-SftpFetchLog() {
  Write-Rule "SFTP fetch laravel.log (tail)"
  Write-Host "Uses secrets\sftp.env - no SSH shell required (SFTP read only)." -ForegroundColor DarkGray
  Ensure-RepoRoot
  Ensure-Paramiko
  Assert-SftpSecretsPresent
  $py = Join-Path $PSScriptRoot "scripts\sftp_fetch_laravel_log.py"
  if (-not (Test-Path -LiteralPath $py)) {
    throw "Missing: $py"
  }
  Write-Host ""
  Write-Host "Running: python -u $py" -ForegroundColor Yellow
  & python -u $py
}

function Action-SftpClearCache() {
  Write-Rule "SFTP clear Laravel framework file cache"
  Write-Host "Resets HTTP rate limits (e.g. Too Many Attempts on /api/auth/login) when CACHE_STORE=file." -ForegroundColor DarkGray
  Ensure-RepoRoot
  Ensure-Paramiko
  Assert-SftpSecretsPresent
  $py = Join-Path $PSScriptRoot "scripts\sftp_clear_framework_cache.py"
  if (-not (Test-Path -LiteralPath $py)) {
    throw "Missing: $py"
  }
  Write-Host ""
  Write-Host "Running: python -u $py" -ForegroundColor Yellow
  & python -u $py
}

function Action-SftpDeployDbOneShot() {
  Write-Rule "One-shot: migrate + seed on server (upload PHP, HTTPS POST, delete)"
  Write-Host "Uses secrets\sftp.env. Optional: ONE_SHOT_PUBLIC_URL= or python ... --public-url https://yoursite" -ForegroundColor DarkGray
  Ensure-RepoRoot
  Ensure-Paramiko
  Assert-SftpSecretsPresent
  $py = Join-Path $PSScriptRoot "scripts\sftp_one_shot_deploy_database.py"
  if (-not (Test-Path -LiteralPath $py)) {
    throw "Missing: $py"
  }
  Write-Host ""
  Write-Host "Running: python -u $py" -ForegroundColor Yellow
  & python -u $py
}

function Action-SftpAdminPasswordReset() {
  Write-Rule "One-shot: AdminUserSeeder on server (DEFAULT_ADMIN_PASSWORD in server .env)"
  Write-Host "Upload server .env with DEFAULT_ADMIN_EMAIL and DEFAULT_ADMIN_PASSWORD first (cPanel or SFTP)." -ForegroundColor DarkGray
  Ensure-RepoRoot
  Ensure-Paramiko
  Assert-SftpSecretsPresent
  $py = Join-Path $PSScriptRoot "scripts\sftp_one_shot_deploy_database.py"
  if (-not (Test-Path -LiteralPath $py)) {
    throw "Missing: $py"
  }
  Write-Host ""
  Write-Host "Running: python -u $py --admin-password-reset" -ForegroundColor Yellow
  & python -u $py --admin-password-reset
}

function Action-SftpSetAdminPasswordFile() {
  Write-Rule "One-shot: set admin password from secrets\\admin_password_reset.txt"
  Write-Host "Put ONE line (plaintext password) in that file, save, run this, then delete the file." -ForegroundColor DarkGray
  Write-Host "Bypasses .env: passwords with `$ are mangled by Dotenv when using DEFAULT_ADMIN_PASSWORD=..." -ForegroundColor DarkGray
  Ensure-RepoRoot
  Ensure-Paramiko
  Assert-SftpSecretsPresent
  $pwf = Join-Path $PSScriptRoot "secrets\admin_password_reset.txt"
  if (-not (Test-Path -LiteralPath $pwf)) {
    throw "Create $pwf with one line: your new password (file is gitignored)."
  }
  $py = Join-Path $PSScriptRoot "scripts\sftp_one_shot_set_admin_password.py"
  if (-not (Test-Path -LiteralPath $py)) {
    throw "Missing: $py"
  }
  Write-Host ""
  Write-Host "Running: python -u $py --password-file ..." -ForegroundColor Yellow
  & python -u $py --password-file $pwf --email admin@koon.edu.sa
}

function Action-PublishSftp() {
  Write-Rule "Publish hosting + SFTP (incremental)"
  $pub = Join-Path $PSScriptRoot "scripts\publish-hosting.ps1"
  if (-not (Test-Path $pub)) {
    throw "Missing: $pub"
  }
  Write-Host ""
  Write-Host "Step 1/2: publish-hosting.ps1 (staging files) - output follows." -ForegroundColor DarkGray
  Write-SeparatorLine
  & powershell -NoProfile -ExecutionPolicy Bypass -File $pub
  Write-Host ""
  Write-Host "Step 2/2: SFTP upload" -ForegroundColor DarkGray
  Invoke-SftpDeploy
}

function Action-SftpSync() {
  Write-Rule "SFTP sync (incremental) - menu 16"
  Write-Host ""
  Write-Host "Uploads only files that changed vs .\publish\last\koon-hosting (size/mtime)." -ForegroundColor Gray
  Write-Host "First time (no baseline): uploads all eligible files, then saves the baseline." -ForegroundColor DarkGray
  Write-Host "Uses secrets\sftp.env and python -u scripts\sftp_deploy.py (progress in the console)." -ForegroundColor DarkGray
  Write-SeparatorLine
  Invoke-SftpDeploy
}

function Action-SftpSyncFull() {
  Write-Rule "SFTP sync (full) - menu 17"
  Write-Host ""
  Write-Host "Uploads every eligible file under publish\koon-hosting (ignores publish\last baseline)." -ForegroundColor Gray
  Write-Host "Slower but safest after hosting moves, baseline corruption, or vendor changes." -ForegroundColor DarkGray
  Write-Host "Uses secrets\sftp.env and python -u scripts\sftp_deploy.py --full" -ForegroundColor DarkGray
  Write-SeparatorLine
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
    "ssh-diagnose" { Action-SshDiagnose }
    "sftp-fetch-log" { Action-SftpFetchLog }
    "sftp-clear-cache" { Action-SftpClearCache }
    "sftp-deploy-db-one-shot" { Action-SftpDeployDbOneShot }
    "sftp-admin-password-reset" { Action-SftpAdminPasswordReset }
    "sftp-set-admin-password-file" { Action-SftpSetAdminPasswordFile }
    "help" { Show-Help }
    default { throw "Unknown action: $A" }
  }
}

function Show-Menu() {
  Write-Rule "koon.edu.sa"

  Write-Host "Choose an action:" -ForegroundColor White
  Write-Host ""
  Write-Host "  1) Install (npm install)" -ForegroundColor Cyan
  Write-Host "  2) Dev (npm run dev) - optional: .\scripts.ps1 -Action dev -NewWindow" -ForegroundColor Cyan
  Write-Host "  3) Backend: serve - optional: -Action backend-serve -NewWindow" -ForegroundColor Cyan
  Write-Host "  4) Backend: dev (composer: server+queue+logs+Vite together)" -ForegroundColor Cyan
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
  Write-Host "  16) SFTP only - incremental (needs publish\koon-hosting + secrets\sftp.env)" -ForegroundColor Cyan
  Write-Host "  17) SFTP only - full upload (--full; same requirements as 16)" -ForegroundColor Cyan
  Write-Host "  18) SFTP clear Laravel file cache (admin login Too Many Attempts)" -ForegroundColor Cyan
  Write-Host "  19) SFTP one-shot: migrate + seed on server (upload script, HTTPS, delete)" -ForegroundColor Cyan
  Write-Host "  20) SFTP one-shot: reset admin password (AdminUserSeeder; server .env DEFAULT_ADMIN_*)" -ForegroundColor Cyan
  Write-Host "  21) SFTP one-shot: set admin password from secrets\\admin_password_reset.txt (fixes `$ in .env)" -ForegroundColor Cyan
  Write-Host ""
  Write-Host "  0) Exit" -ForegroundColor DarkGray
  Write-Host ""

  $choice = (Read-Host "Enter 0-21").Trim()
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
    "18" { Run-Action "sftp-clear-cache" }
    "19" { Run-Action "sftp-deploy-db-one-shot" }
    "20" { Run-Action "sftp-admin-password-reset" }
    "21" { Run-Action "sftp-set-admin-password-file" }
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

