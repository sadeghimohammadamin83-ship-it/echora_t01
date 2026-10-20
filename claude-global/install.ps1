# Installs the subagent policy and specialist agents into the user-level Claude Code config.
# - Backs up %USERPROFILE%\.claude\CLAUDE.md and the agents folder before touching them.
# - Appends the policy between markers; existing content is never removed or rewritten.
# - Copies agents that are missing; an existing agent with different content is left alone.
# Usage (PowerShell): powershell -ExecutionPolicy Bypass -File .\install.ps1 [-Update]
#   -Update  replace only the previously installed policy block and agents with this version.
param([switch]$Update)
$ErrorActionPreference = 'Stop'

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$PolicyFile = Join-Path $ScriptDir 'subagent-policy.md'
$AgentsSrc = Join-Path (Split-Path -Parent $ScriptDir) '.claude\agents'
$UserHome = if ($env:USERPROFILE) { $env:USERPROFILE } else { $HOME }
$ClaudeDir = if ($env:CLAUDE_CONFIG_DIR) { $env:CLAUDE_CONFIG_DIR } else { Join-Path $UserHome '.claude' }
$BeginMark = '<!-- BEGIN subagent-policy (managed by claude-global/install) -->'
$EndMark = '<!-- END subagent-policy -->'
$Utf8NoBom = New-Object System.Text.UTF8Encoding($false)
# Strict decoder: throws on bytes that are not valid UTF-8 instead of silently replacing them.
$Utf8Strict = New-Object System.Text.UTF8Encoding($false, $true)
$Ordinal = [System.StringComparison]::Ordinal

if (-not (Test-Path -LiteralPath $PolicyFile)) { throw "Missing $PolicyFile" }
if (-not (Test-Path -LiteralPath $AgentsSrc)) { throw "Missing $AgentsSrc" }

New-Item -ItemType Directory -Force -Path $ClaudeDir | Out-Null
# [IO.File] resolves relative paths against the process directory, so use an absolute path.
$ClaudeDir = (Resolve-Path -LiteralPath $ClaudeDir).ProviderPath
$TargetMd = Join-Path $ClaudeDir 'CLAUDE.md'
$TargetAgents = Join-Path $ClaudeDir 'agents'
New-Item -ItemType Directory -Force -Path $TargetAgents | Out-Null

# Back up everything this script may touch.
$BackupDir = Join-Path $ClaudeDir ('backups\subagent-policy-' + (Get-Date -Format 'yyyyMMdd-HHmmss') + "-$PID")
New-Item -ItemType Directory -Force -Path $BackupDir | Out-Null
if (Test-Path -LiteralPath $TargetMd) { Copy-Item -LiteralPath $TargetMd -Destination (Join-Path $BackupDir 'CLAUDE.md') }
Copy-Item -LiteralPath $TargetAgents -Destination (Join-Path $BackupDir 'agents') -Recurse -Force
Write-Host "Backup: $BackupDir"

$Policy = [System.IO.File]::ReadAllText($PolicyFile, $Utf8NoBom).Replace("`r`n", "`n").TrimEnd("`n")
$Block = "$BeginMark`n$Policy`n$EndMark`n"
$Existing = ''
if (Test-Path -LiteralPath $TargetMd) {
  # A UTF-16 file is detected by its BOM and decoded correctly; ANSI text with non-ASCII characters
  # is refused so it is never rewritten with replacement characters.
  try { $Existing = [System.IO.File]::ReadAllText($TargetMd, $Utf8Strict) }
  catch { throw "$TargetMd is not UTF-8 or UTF-16 text. Save it as UTF-8 and run the script again." }
}

$Begin = $Existing.IndexOf($BeginMark, $Ordinal)
if ($Begin -ge 0) {
  if ($Update) {
    $End = $Existing.IndexOf($EndMark, $Begin, $Ordinal)
    if ($End -lt 0) { throw "Found the begin marker but not the end marker in $TargetMd; fix it by hand." }
    $After = $Existing.Substring($End + $EndMark.Length) -replace '^\r?\n', ''
    $New = $Existing.Substring(0, $Begin) + $Block + $After
    [System.IO.File]::WriteAllText($TargetMd, $New, $Utf8NoBom)
    Write-Host "Updated policy block in $TargetMd"
  } else {
    Write-Host "Policy already present in $TargetMd (use -Update to refresh it)"
  }
} else {
  $Prefix = ''
  if ($Existing.Length -gt 0) {
    if (-not $Existing.EndsWith("`n", $Ordinal)) { $Prefix = "`n" }
    $Prefix += "`n"
  }
  # Rewrite the whole file so a UTF-16 original becomes UTF-8 instead of mixed encodings.
  [System.IO.File]::WriteAllText($TargetMd, $Existing + $Prefix + $Block, $Utf8NoBom)
  Write-Host "Appended policy to $TargetMd"
}

foreach ($Src in Get-ChildItem -LiteralPath $AgentsSrc -Filter '*.md' -File) {
  $Dest = Join-Path $TargetAgents $Src.Name
  if (-not (Test-Path -LiteralPath $Dest)) {
    Copy-Item -LiteralPath $Src.FullName -Destination $Dest
    Write-Host "Added agent: $($Src.Name)"
  } elseif ((Get-FileHash -LiteralPath $Src.FullName).Hash -eq (Get-FileHash -LiteralPath $Dest).Hash) {
    Write-Host "Agent up to date: $($Src.Name)"
  } elseif ($Update) {
    Copy-Item -LiteralPath $Src.FullName -Destination $Dest -Force
    Write-Host "Updated agent: $($Src.Name) (previous copy in backup)"
  } else {
    Write-Host "Skipped agent with local changes: $($Src.Name) (use -Update to replace it)"
  }
}

Write-Host 'Done. Restart Claude Code to load the changes.'
