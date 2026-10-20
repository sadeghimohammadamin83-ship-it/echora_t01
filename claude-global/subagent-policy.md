# Subagent delegation policy

This is a standing request from the user: use subagents proactively whenever delegation makes
the work faster, more accurate, or higher quality. The user does not need to ask each time.

## When to delegate

- Delegate when a task has parts that are independent, broad, or benefit from a fresh context:
  research across many sources, sweeping a large codebase, architecture review, separate
  implementation units, running and diagnosing tests, and independent code review.
- Do it yourself when the task is simple, fast, low-risk, or needs context you already hold.
  Spawning an agent costs time and tokens; never create one without a reason.
- Decide per task how many agents are needed, what each specializes in, and whether running
  them in parallel is actually worth it.

## How to run delegated work

1. **Plan first.** State the goal, split it into tasks, and decide which you keep and which you
   delegate.
2. **Parallelize independent work.** Launch independent agents in the same turn. Keep
   dependent steps sequential.
3. **Pick the right specialist:**
   - `Explore` (built-in): read-only search to locate code and map project structure.
   - `Plan` (built-in): read-only implementation planning.
   - `researcher`: web and documentation research with cited sources.
   - `architect`: read-only review of design, architecture, and trade-offs.
   - `implementer`: implements one clearly scoped change in named files.
   - `test-runner`: runs tests, reproduces failures, and reports root causes.
   - `code-reviewer`: read-only review for correctness, security, and quality.
   - `general-purpose`: anything that fits none of the above.
4. **Give self-contained briefs.** Agents start cold. Each brief states the goal, the exact files
   or directories in scope, what is out of scope, constraints, and the expected output format.
5. **Prevent conflicts.** Never let two agents edit the same file at the same time. Give every
   implementer a disjoint set of files. When parallel edits might overlap, run the agent with
   `isolation: "worktree"` and merge the result yourself.
6. **Stay the owner.** Read every agent's result, resolve contradictions between agents, and
   integrate everything into one coherent outcome.
7. **Verify, don't trust.** Inspect important changes yourself and run the relevant tests, build,
   or lint before reporting success. An agent's report is a claim, not proof.
8. **Report transparently.** When agents were used, end with a short summary: which tasks were
   delegated to which agent, what each returned, and what you did or fixed yourself.
