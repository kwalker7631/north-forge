	 # claude_maintenance.md

**Purpose:** Ongoing maintenance workflow for a scaffold-first app that began from a JSX first brick and has since expanded into a multi-file application.

**Primary Goal:** Preserve stability while improving maintainability, correctness, documentation quality, and repository hygiene.

**Maintenance Mode:** Audit-first, scope-limited, version-strict.

---

# 1. Operating Rules

## 1.1 Core Maintenance Principles

Claude Code must follow these rules during every maintenance pass:

1. Inspect before editing.
2. Limit scope to the requested maintenance objective.
3. Do not refactor unrelated files.
4. Prefer small atomic changes over broad rewrites.
5. Preserve working behavior unless a fix is explicitly required.
6. Produce a clear before/after summary for each pass.
7. Surface errors, warnings, and unresolved risks explicitly.
8. Keep documentation, workflow files, and version markers in sync.
9. Maintain rollback clarity by grouping edits logically.
10. Never assume repository structure, Firebase config, GitHub actions, or deployment state unless provided.

## 1.2 Strict Versioning Policy

Versioning is mandatory for all meaningful maintenance work.

### Version Format

Use semantic versioning:

`MAJOR.MINOR.PATCH`

### Increment Rules

* **PATCH**: bug fixes, documentation corrections, lint cleanup, minor non-breaking maintenance, dependency patch updates, test repairs, small UI fixes with no contract change.
* **MINOR**: backward-compatible feature additions, new maintenance automation, new documentation sections, non-breaking architecture improvements, new config options.
* **MAJOR**: breaking changes, route changes, schema changes, contract changes, authentication flow changes, major file structure changes, or anything requiring migration.

### Mandatory Version Touchpoints

When a version changes, Claude Code must update all relevant locations that exist in the project, including placeholders where necessary:

* `package.json` version
* app footer/version display if present
* changelog or release notes
* `README.md`
* `CLAUDE.md` if it tracks project phase/version
* `claude_maintenance.md`
* file headers or metadata blocks where the project convention requires them
* deployment notes if version-linked

If a version cannot be safely updated because the location is unknown, Claude Code must say so explicitly and list the unresolved version touchpoints.

## 1.3 File Header / Metadata Convention

Where the codebase uses file headers, preserve and update them consistently.

Recommended header pattern:

```ts
/**
 * File: src/path/to/file.ts
 * Purpose: <short description>
 * Author: <author name>
 * Version: x.y.z
 * Last Updated: YYYY-MM-DD
 */
```

Do not add headers inconsistently across the codebase unless the maintenance task includes standardizing them.

---

# 2. Maintenance Pass Structure

Every maintenance cycle should follow this sequence.

## Phase 0 — Maintenance Intake

Before editing anything, Claude Code must summarize:

* maintenance objective
* requested scope
* known constraints
* likely impacted files
* risk level: low / medium / high
* expected version bump: patch / minor / major / unknown

If details are missing, use explicit placeholders instead of inventing facts.

Example:

* Objective: Clean stale code and align docs
* Scope: README, workflow markdown, unused helpers, version consistency
* Risk: Low
* Expected Version Bump: PATCH

## Phase 1 — Audit Current State

Inspect the provided repository structure and identify:

* duplicate code
* stale files
* dead components
* unused utilities/hooks/services
* inconsistent naming
* broken imports
* route drift
* doc drift
* outdated workflow files
* mismatched Firebase or environment references
* test gaps
* lint/type issues if visible
* version mismatches across files

Output an audit summary before editing.

## Phase 2 — Define Smallest Safe Maintenance Slice

Choose the smallest coherent maintenance slice.

Examples:

* version alignment only
* README and workflow doc refresh only
* stale component cleanup only
* Firebase config documentation alignment only
* lint/type cleanup in one folder only

Do not combine unrelated slices unless explicitly requested.

## Phase 3 — Execute Limited Changes

When editing:

* touch only directly relevant files
* preserve public contracts unless requested
* avoid opportunistic renaming
* avoid broad formatting churn
* keep import changes localized
* update version references consistently
* document assumptions inline or in summary

## Phase 4 — Validation

After edits, run or propose validation appropriate to the scope:

* typecheck
* lint
* tests
* build
* route smoke review
* auth flow review
* Firebase config sanity check
* markdown link review
* changelog consistency check

If validation cannot be executed, say exactly what should be run.

## Phase 5 — Maintenance Report

Always end with a report containing:

* scope completed
* files changed
* version change made
* validation run or recommended
* remaining risks
* suggested next safe step

---

# 3. Recurring Maintenance Categories

## 3.1 Repository Hygiene Pass

Goal: keep repository clean and navigable.

Check for:

* obsolete prototype files
* duplicate components
* dead routes
* abandoned assets
* stale test files
* old migration notes
* temporary debug code
* commented-out blocks that should be removed or ticketed

Acceptance criteria:

* no obviously stale files left unreviewed in touched areas
* no unexplained duplicate implementations
* no temporary debug artifacts in maintained scope

Version guidance:

* usually PATCH

## 3.2 Documentation Alignment Pass

Goal: align docs with actual implementation.

Check and update:

* `README.md`
* setup instructions
* environment variable documentation
* route map
* architecture overview
* Firebase setup notes
* deployment steps
* maintenance workflow files
* changelog/release notes

Acceptance criteria:

* docs reflect current known structure
* placeholders clearly marked where unknown
* no claims about systems not verified from user-provided code

Version guidance:

* PATCH if only documentation
* MINOR if new documented workflows are introduced

## 3.3 Architecture Drift Pass

Goal: detect mismatch between original structure and current implementation.

Check for:

* screen logic embedded in layout files
* oversized components
* hooks containing UI concerns
* service modules containing presentation logic
* route definitions scattered inconsistently
* auth logic duplicated across pages
* data access patterns mixed across files

Acceptance criteria:

* drift is identified and categorized
* risky refactors are separated into future tasks
* only the smallest safe architecture correction is made in one pass

Version guidance:

* PATCH for tiny internal cleanup
* MINOR for non-breaking structural improvement
* MAJOR for breaking reorganizations

## 3.4 Dependency and Tooling Pass

Goal: keep dependencies safe and understandable.

Check for:

* outdated packages
* duplicate libraries serving same purpose
* deprecated APIs
* mismatched config versions
* unnecessary dependencies
* build tooling drift

Rules:

* do not bulk-update dependencies blindly
* group updates by risk
* prefer patch-level upgrades first
* document potential breaking changes before major updates

Acceptance criteria:

* dependency changes justified clearly
* version bumps aligned with change risk
* validation steps listed or run

Version guidance:

* PATCH for safe patch upgrades
* MINOR for new tooling features
* MAJOR if dependency changes force breaking behavior

## 3.5 Firebase / Backend Maintenance Pass

Goal: keep backend-connected systems coherent and safe.

Check for:

* auth flow documentation drift
* stale environment variable names
* mismatch between frontend assumptions and Firebase usage
* unclear Firestore collection naming
* duplicated backend access helpers
* missing loading/error states around backend calls
* outdated hosting/deployment notes

Safety rules:

* never invent security rules
* never claim production config is correct without evidence
* never assume billing, hosting targets, or OAuth settings
* use placeholders for unknown project IDs, domains, client IDs, collections, and rules

Acceptance criteria:

* frontend/backend assumptions are documented clearly
* unverified backend details are labeled
* risky operational changes are separated from documentation cleanup

Version guidance:

* PATCH for docs/alignment
* MINOR for non-breaking integration hardening
* MAJOR for schema/auth/contract changes

## 3.6 Testing and Quality Pass

Goal: improve confidence without destabilizing the app.

Check for:

* missing tests in critical logic
* broken test setup
* stale snapshots
* missing error handling
* missing loading states
* console errors or noisy logs
* weak failure visibility

Acceptance criteria:

* critical paths identified
* at least one small confidence-improving action taken per pass where appropriate
* failing areas surfaced explicitly rather than hidden

Version guidance:

* PATCH in most cases

---

# 4. Strict Change Log Discipline

## 4.1 Change Log Requirement

Every meaningful maintenance pass must append or prepare a changelog entry.

Recommended format:

```md
## [x.y.z] - YYYY-MM-DD
### Changed
- ...

### Fixed
- ...

### Docs
- ...

### Notes
- Risks, assumptions, follow-up tasks
```

## 4.2 Required Change Summary

Claude Code must summarize:

* why changes were made
* what files were touched
* whether behavior changed
* whether any assumptions were made
* what still needs verification

## 4.3 Version Lockstep Rule

If a maintenance pass updates a version number in one official version-bearing file, Claude Code must check and update the other version-bearing files in scope. If not possible, it must list exactly which files remain out of sync.

---

# 5. Safe Maintenance Prompting Pattern

Use this execution pattern during maintenance tasks:

1. Inspect current files relevant to the task.
2. Summarize current state and drift.
3. Propose the smallest safe maintenance slice.
4. State expected version bump and why.
5. Make only scoped changes.
6. Validate or list exact validation commands.
7. Produce a maintenance report with changed files and risks.

Recommended instruction block:

```md
Work in maintenance mode.
Inspect before editing.
Do not refactor unrelated files.
Choose the smallest safe maintenance slice.
Apply strict semantic versioning.
Update all in-scope version references consistently.
Preserve authorship metadata.
Document assumptions explicitly.
Surface all lint, build, type, test, runtime, and config errors clearly.
Finish with a maintenance report listing files changed, version bump, validations, and next safe step.
```

---

# 6. Maintenance Templates

## 6.1 Standard Maintenance Pass Template

```md
Task: Perform a maintenance pass on the provided codebase.

Requirements:
- Audit first before editing.
- Summarize architecture drift, stale code, doc drift, and version mismatches.
- Select the smallest safe maintenance slice.
- Do not refactor unrelated files.
- Apply strict semantic versioning and state the expected bump before editing.
- Update all in-scope version references.
- Preserve author/version/date metadata conventions already in use.
- Surface any unresolved assumptions explicitly.
- End with:
  - files changed
  - version changed from/to
  - validation run or recommended
  - remaining risks
  - next safe maintenance step
```

## 6.2 Version Alignment Pass Template

```md
Task: Perform a version alignment maintenance pass.

Requirements:
- Inspect all version-bearing files first.
- Identify mismatches across package metadata, README, changelog, workflow markdown, UI version display, and file headers if present.
- Recommend the correct semantic version bump with justification.
- Make only version-consistency and directly related documentation changes.
- Do not refactor code unrelated to version alignment.
- Report any version locations that could not be verified.
```

## 6.3 Documentation Refresh Pass Template

```md
Task: Refresh project documentation without changing implementation behavior.

Requirements:
- Audit README, setup docs, Firebase notes, environment variable docs, and workflow markdown.
- Remove stale claims.
- Mark unknown details as placeholders instead of inventing values.
- Apply PATCH version bump unless a new workflow/documentation system justifies MINOR.
- Update changelog and maintenance docs accordingly.
```

## 6.4 Repo Cleanup Pass Template

```md
Task: Perform a low-risk repository cleanup pass.

Requirements:
- Identify stale, duplicate, or dead files in the provided scope.
- Confirm each candidate before removal.
- Avoid deleting anything not supported by evidence.
- Prefer one small cleanup slice per pass.
- Apply PATCH version bump if changes are non-breaking.
- End with explicit rollback notes.
```

---

# 7. Maintenance Cadence

Recommended recurring cadence:

## Every Session

* inspect touched area before edits
* verify current version markers
* update change notes for meaningful maintenance work

## Weekly

* doc drift review
* stale file review
* version consistency check
* lint/type/build review

## Monthly

* architecture drift review
* dependency review
* Firebase/backend alignment review
* testing gap review

## Before Release

* full version audit
* changelog audit
* README/setup audit
* route and auth smoke check
* build/test verification
* rollback readiness review

---

# 8. Decision Rules for Version Bumps

Use these rules when uncertain.

### PATCH

Choose PATCH when the maintenance work is limited to:

* typo/doc corrections
* version alignment
* changelog updates
* bug fixes with no contract changes
* non-breaking cleanup
* lint/type/test maintenance
* safe dependency patch updates

### MINOR

Choose MINOR when maintenance introduces:

* new non-breaking tooling workflow
* new docs system section with operational impact
* new internal module that adds capability without breaking contracts
* meaningful architecture improvement that remains backward-compatible

### MAJOR

Choose MAJOR when maintenance includes:

* breaking route changes
* schema changes
* auth contract changes
* API contract changes
* destructive file structure changes requiring migration
* removals that break documented behavior

When uncertain between PATCH and MINOR, prefer PATCH unless the project surface area clearly expanded.
When uncertain between MINOR and MAJOR, stop and mark as high risk pending explicit confirmation.

---

# 9. Required Maintenance Report Format

At the end of every maintenance task, Claude Code must return:

```md
## Maintenance Report
- Objective:
- Scope completed:
- Risk level:
- Version bump: x.y.z -> x.y.z
- Files changed:
- Validation run:
- Validation still recommended:
- Assumptions made:
- Remaining risks:
- Next safe step:
```

---

# 10. Non-Negotiable Safeguards

Claude Code must not:

* invent repository files or directories
* invent Firebase project settings or security rules
* invent GitHub workflow state
* claim tests passed unless they actually ran or were provided by the user
* make unrelated refactors during maintenance
* perform broad renames without explicit need
* hide warnings or unresolved risks
* update only one version marker when others in scope exist
* remove authorship metadata

Claude Code must always:

* preserve authorship
* preserve traceability
* keep changes auditable
* keep versions synchronized
* clearly separate verified facts from assumptions

---

# 11. Suggested Companion Files

Maintain these alongside this file where applicable:

* `CLAUDE.md` — build and expansion workflow
* `CHANGELOG.md` — versioned change history
* `README.md` — user/developer onboarding
* `docs/architecture.md` — architecture map
* `docs/firebase.md` — Firebase integration notes
* `docs/release-checklist.md` — release validation checklist

If these files do not exist, reference them as recommended additions rather than assumed project facts.

---

# 12. Final Instruction to Claude Code

When asked to maintain this project, act like a conservative senior engineer protecting stability.

Audit first.
Change little.
Version everything correctly.
Document what changed.
Expose every risk.
Leave the codebase clearer than you found it.
