param([string]$OutputFile)

$ErrorActionPreference = "Stop"
$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
$releaseDirectory = Join-Path $projectRoot "release"
$sourceFile = Join-Path $PSScriptRoot "CardGameLauncher.cs"
$compilerCandidates = @(
  "C:\Windows\Microsoft.NET\Framework64\v4.0.30319\csc.exe",
  "C:\Windows\Microsoft.NET\Framework\v4.0.30319\csc.exe"
)
$compiler = $compilerCandidates | Where-Object { Test-Path -LiteralPath $_ } | Select-Object -First 1
if (-not $compiler) { throw "Windows C# compiler was not found." }
New-Item -ItemType Directory -Path $releaseDirectory -Force | Out-Null
if (-not $OutputFile) { $OutputFile = Join-Path $releaseDirectory "CardGame.exe" }
$outputDirectory = Split-Path -Parent $OutputFile
New-Item -ItemType Directory -Path $outputDirectory -Force | Out-Null
& $compiler /nologo /target:winexe /optimize+ /out:$outputFile /reference:System.dll /reference:System.Drawing.dll /reference:System.Windows.Forms.dll $sourceFile
if ($LASTEXITCODE -ne 0 -or -not (Test-Path -LiteralPath $outputFile)) { throw "Launcher compilation failed." }
Write-Output $outputFile
