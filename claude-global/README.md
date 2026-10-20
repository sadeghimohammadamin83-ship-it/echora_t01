# Claude Code global subagent setup

Installs a standing subagent delegation policy and five specialist agents into your user-level
Claude Code config, so they apply in every project.

| File | Installed to |
| --- | --- |
| `subagent-policy.md` | appended to `~/.claude/CLAUDE.md` (Windows: `%USERPROFILE%\.claude\CLAUDE.md`) between markers |
| `../.claude/agents/*.md` | copied to `~/.claude/agents/` |

Agents: `researcher`, `architect`, `implementer`, `test-runner`, `code-reviewer`. Claude Code's
built-in `Explore`, `Plan` and `general-purpose` agents are used alongside them.

## Install

Windows (PowerShell, from the repository root):

```powershell
powershell -ExecutionPolicy Bypass -File .\claude-global\install.ps1
```

macOS / Linux:

```sh
bash claude-global/install.sh
```

Then restart Claude Code. Run `/agents` to confirm the agents are listed, and `/memory` to see the
loaded `CLAUDE.md`.

## Safety

- Before any change, the script copies `CLAUDE.md` and the `agents` folder to
  `~/.claude/backups/subagent-policy-<timestamp>/`.
- The policy is appended; existing content is never removed or rewritten. Running it again does
  nothing if the policy is already there.
- An existing agent file with the same name and different content is skipped, not overwritten.
- `--update` (`-Update` on Windows) replaces only the block and agents this script installed.

## Uninstall

Delete the block between `<!-- BEGIN subagent-policy` and `<!-- END subagent-policy -->` in
`~/.claude/CLAUDE.md`, and the five agent files from `~/.claude/agents/`, or restore the backup.
