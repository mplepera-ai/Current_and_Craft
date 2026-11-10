# Build the existing Jarvis_Hub SPA for the same-origin Current & Craft employee portal.
# This script STAGES static assets locally. It does NOT publish, deploy an API, or
# start a tunnel. It requires a separately approved HTTPS backend hostname.
[CmdletBinding()]
param(
  [string]$HubRepository = "C:\Github\Jarvis_Hub",
  [string]$ApiOrigin = "https://api.currentandcraft.net",
  [switch]$ValidateOnly,
  [switch]$ReplaceExisting
)
Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$site = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$hub = (Resolve-Path $HubRepository -ErrorAction Stop).Path
if (-not (Test-Path (Join-Path $hub "src\jarvis\auth.ts")) -or
    -not (Test-Path (Join-Path $hub "vite.config.ts"))) {
  throw "Expected the independent Jarvis_Hub source repository."
}
$api = $null
if (-not [Uri]::TryCreate($ApiOrigin, [UriKind]::Absolute, [ref]$api) -or
    $api.Scheme -ne "https" -or $api.Host -ne "api.currentandcraft.net" -or
    $api.Port -ne 443 -or $api.AbsolutePath -ne "/" -or
    $api.Query -or $api.Fragment -or $api.UserInfo) {
  throw "Production API origin must be exactly https://api.currentandcraft.net (no path or credentials)."
}

$npm = (Get-Command npm.cmd -ErrorAction Stop).Source
$original = [Environment]::GetEnvironmentVariable("VITE_JARVIS_API_BASE_URL", "Process")
try {
  # Environment variable intentionally overrides Hub's local .env.local setting.
  $env:VITE_JARVIS_API_BASE_URL = $ApiOrigin.TrimEnd("/")
  Push-Location $hub
  try {
    & $npm ci
    if ($LASTEXITCODE -ne 0) { throw "npm ci failed." }
    & $npm run typecheck
    if ($LASTEXITCODE -ne 0) { throw "Jarvis Hub typecheck failed." }
    & $npm test
    if ($LASTEXITCODE -ne 0) { throw "Jarvis Hub tests failed." }
    & $npm run build -- --base /employee/hub/
    if ($LASTEXITCODE -ne 0) { throw "Jarvis Hub production build failed." }
  } finally { Pop-Location }
} finally {
  if ($null -eq $original) { Remove-Item Env:VITE_JARVIS_API_BASE_URL -ErrorAction SilentlyContinue }
  else { $env:VITE_JARVIS_API_BASE_URL = $original }
}
$dist = Join-Path $hub "dist"
$index = Join-Path $dist "index.html"
if (-not (Test-Path $index) -or -not (Test-Path (Join-Path $dist "assets"))) {
  throw "Production build missing index.html or assets."
}
$entry = [IO.File]::ReadAllText($index)
if ($entry -notmatch '/employee/hub/assets/') {
  throw "Vite output was not built with the required /employee/hub/ base path."
}
$files = @(Get-ChildItem -LiteralPath $dist -Recurse -File)
if ($files.Count -gt 2000 -or $files.Count -lt 2) { throw "Unexpected output file count." }
# These strings are forbidden in the public frontend bundle. No private paths
# or ADC credentials can ever be copied to the site.
$forbidden = @("http://127.0.0.1:8765", "leperas.tail7965d3.ts.net",
               "C:\JarvisSecrets", "firebase-admin.json", ".jarvis-local")
foreach ($file in $files) {
  if ($file.Extension -notin @(".js",".css",".html",".json",".svg",".txt")) { continue }
  $raw = [IO.File]::ReadAllText($file.FullName)
  foreach ($needle in $forbidden) {
    if ($raw.Contains($needle)) { throw "Unsafe development or credential reference in built website files." }
  }
}
if ($ValidateOnly) {
  Write-Host "PASS: Hub bundle built and inspected. No website files changed."
  exit 0
}

$employee = Join-Path $site "employee"
$target = Join-Path $employee "hub"
if ((Test-Path $target) -and -not $ReplaceExisting) {
  throw "Existing employee/hub folder detected. Re-run with -ReplaceExisting only after reviewing the new bundle."
}
$stage = Join-Path $employee (".hub-staging-" + [guid]::NewGuid().ToString("N"))
$old = Join-Path $employee (".hub-previous-" + [guid]::NewGuid().ToString("N"))
$oldExists = $false
try {
  New-Item -ItemType Directory -Path $stage -ErrorAction Stop | Out-Null
  Copy-Item -Path (Join-Path $dist "*") -Destination $stage -Recurse -Force -ErrorAction Stop
  $marker = '{"kind":"jarvis-hub-static-frontend","base":"/employee/hub/"}'
  [IO.File]::WriteAllText((Join-Path $stage "ready.json"), $marker + "`n",
      (New-Object System.Text.UTF8Encoding($false)))
  if (Test-Path $target) {
    Move-Item -LiteralPath $target -Destination $old -ErrorAction Stop
    $oldExists = $true
  }
  Move-Item -LiteralPath $stage -Destination $target -ErrorAction Stop
  if ($oldExists) { Remove-Item -LiteralPath $old -Recurse -Force }
} catch {
  if ($oldExists -and -not (Test-Path $target)) {
    Move-Item -LiteralPath $old -Destination $target -ErrorAction SilentlyContinue
  }
  throw
} finally {
  if (Test-Path $stage) { Remove-Item -LiteralPath $stage -Recurse -Force }
}
Write-Host "Staged employee/hub/ and readiness marker locally."
Write-Host "NOT DEPLOYED: inspect git diff and review the PR before publishing."
Write-Host "The remote API is NOT configured by this build; verify HTTPS ingress, Firebase authorization and backend security separately."
