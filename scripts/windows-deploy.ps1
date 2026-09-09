[CmdletBinding()]
param(
  [string]$ProjectPath = "C:\CardGame"
)

$ErrorActionPreference = "Stop"

function Require-Command([string]$Name) {
  if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
    throw "$Name is not installed or is not available in PATH."
  }
}

function Invoke-Checked([string]$Label, [scriptblock]$Command) {
  Write-Host "==> $Label"
  & $Command
  if ($LASTEXITCODE -ne 0) { throw "$Label failed with exit code $LASTEXITCODE." }
}

Require-Command "node"
Require-Command "npm"
Require-Command "git"

$resolvedProject = [System.IO.Path]::GetFullPath($ProjectPath)
if (-not (Test-Path -LiteralPath (Join-Path $resolvedProject "package.json"))) {
  throw "CardGame package.json was not found at $resolvedProject."
}

Set-Location -LiteralPath $resolvedProject
Write-Host "Node: $(node --version)"
Write-Host "npm: $(npm --version)"
Write-Host "Git: $(git --version)"

Invoke-Checked "Install locked dependencies" { npm ci }
Invoke-Checked "TypeScript and client production build" { npm run build }
Invoke-Checked "Automated tests" { npm test }

$envPath = Join-Path $resolvedProject ".env"
if (-not (Test-Path -LiteralPath $envPath)) {
  Write-Warning "Build is ready, but .env is missing. Copy .env.production.example to .env and set ALLOWED_ORIGINS before npm start."
} else {
  Write-Host "Production .env exists. Run: npm start"
}
