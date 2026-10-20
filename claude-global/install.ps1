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
$ClaudeDir = if ($env:CLAUDE_CONFIG_DIR) { $env:CLAUDE_CONFIG_DIR } else { Join-Path $env:USERPROFILE '.claude' }
$TargetMd = Join-Path $ClaudeDir 'CLAUDE.md'
$TargetAgents = Join-Path $ClaudeDir 'agents'
$BeginMark = '<!-- BEGIN subagent-policy (managed by claude-global/install) -->'
$EndMark = '<!-- END subagent-policy -->'
$Utf8NoBom = New-Object System.Text.UTF8Encoding($false)

if (-not (Test-Path -LiteralPath $PolicyFile)) { throw "Missing $PolicyFile" }
if (-not (Test-Path -LiteralPath $AgentsSrc)) { throw "Missing $AgentsSrc" }

New-Item -ItemType Directory -Force -Path $ClaudeDir, $TargetAgents | Out-Null

# Back up everything this script may touch.
$BackupDir = Join-Path $ClaudeDir ('backups\subagent-policy-' + (Get-Date -Format 'yyyyMMdd-HHmmss') + "-$PID")
New-Item -ItemType Directory -Force -Path $BackupDir | Out-Null
if (Test-Path -LiteralPath $TargetMd) { Copy-Item -LiteralPath $TargetMd -Destination (Join-Path $BackupDir 'CLAUDE.md') }
Copy-Item -LiteralPath $TargetAgents -Destination (Join-Path $BackupDir 'agents') -Recurse
Write-Host "Backup: $BackupDir"

$Policy = [System.IO.File]::ReadAllText($PolicyFile, $Utf8NoBom).TrimEnd("`r", "`n")
$Block = "$BeginMark`n$Policy`n$EndMark`n"
$Existing = if (Test-Path -LiteralPath $TargetMd) { [System.IO.File]::ReadAllText($TargetMd, $Utf8NoBom) } else { '' }

$Begin = $Existing.IndexOf($BeginMark)
if ($Begin -ge 0) {
  if ($Update) {
    $End = $Existing.IndexOf($EndMark, $Begin)
    if ($End -lt 0) { throw "Found the begin marker but not the end marker in $TargetMd; fix it by hand." }
    $After = $Existing.Substring($End + $EndMark.Length).TrimStart("`r", "`n")
    $New = $Existing.Substring(0, $Begin) + $Block + $After
    [System.IO.File]::WriteAllText($TargetMd, $New, $Utf8NoBom)
    Write-Host "Updated policy block in $TargetMd"
  } else {
    Write-Host "Policy already present in $TargetMd (use -Update to refresh it)"
  }
} else {
  $Prefix = ''
  if ($Existing.Length -gt 0) {
    if (-not $Existing.EndsWith("`n")) { $Prefix = "`n" }
    $Prefix += "`n"
  }
  [System.IO.File]::AppendAllText($TargetMd, $Prefix + $Block, $Utf8NoBom)
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
