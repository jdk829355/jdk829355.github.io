# Homepage Full Audit Problem List

## TL;DR
> **Summary**: Audit the full locally served SPA and produce a prioritized, evidence-backed problem list covering design, UX, accessibility, performance, and SEO.
> **Deliverables**:
> - Prioritized issue list with severity, evidence, and violated reference
> - Browser/runtime evidence artifacts for visual and interaction issues
> - Source-backed findings mapped to `DESIGN.md`, implementation files, and web best practices
> **Effort**: Short
> **Parallel**: YES - 2 waves
> **Critical Path**: Task 1 → Task 2/3/4/5/6 → Final Verification Wave

## Context
### Original Request
- Review the homepage and produce a problem list.

### Interview Summary
- Output format is a **problem list**, not fixes or implementation work.
- Review scope is the **entire SPA reachable from the homepage**: about / projects / thoughts and related interactions.
- Review dimensions are **design, UX, accessibility, performance, and SEO**.
- Review environment is **local only**.
- Evaluation baseline is **`DESIGN.md` + general web best practices**.

### Metis Review (gaps addressed)
- Scope ambiguity resolved by explicitly including the entire SPA, not just the landing viewport.
- Source of truth fixed to locally served runtime only.
- Guardrail added: do not add tests, linting, CI, redesigns, or fixes.
- Every issue must include severity, location, evidence, why it matters, and violated reference.
- Deduplication rule added so one root cause is not reported as multiple independent issues.

## Work Objectives
### Core Objective
Produce a decision-complete audit workflow that yields a **prioritized, deduplicated problem list** for the local homepage SPA.

### Deliverables
- A written issue list saved by the executing agent in its work output, with one entry per root problem
- Evidence files under `.sisyphus/evidence/` for screenshots, console logs, network logs, and audit notes
- Coverage across all required categories: design, UX, accessibility, performance, SEO

### Definition of Done (verifiable conditions with commands)
- Local static server runs successfully with `python3 -m http.server 4173`
- Homepage loads from `http://127.0.0.1:4173/index.html` without blocking runtime failures
- Audit covers desktop and mobile viewports, keyboard-only navigation, and content/data load states
- Final problem list contains, for every issue: ID, category, severity, location, evidence, why it matters, violated reference
- No issue proposes implementation beyond optional note-level remediation hints
- No duplicate child symptoms are listed as separate root issues

### Must Have
- Review full SPA sections and key interactions
- Use both code inspection and rendered-page inspection
- Compare against `DESIGN.md` and established best practices
- Capture binary evidence for each issue
- Prioritize findings by severity/impact

### Must NOT Have (guardrails, AI slop patterns, scope boundaries)
- Must NOT modify source files, styles, scripts, content, or config
- Must NOT introduce tests, linting, CI, build tools, or refactors
- Must NOT review deployed site or external environments
- Must NOT turn subjective preference into a defect without citing a reference or heuristic
- Must NOT output vague labels such as “SEO could improve” without concrete failing evidence
- Must NOT split one root cause into many duplicate issues

## Verification Strategy
> ZERO HUMAN INTERVENTION - all verification is agent-executed.
- Test decision: none existing; use agent-executed runtime inspection via local static serving + browser tooling
- QA policy: Every task includes executable source and runtime verification
- Evidence: `.sisyphus/evidence/task-{N}-{slug}.{ext}`

## Execution Strategy
### Parallel Execution Waves
> Target: 5-8 tasks per wave. <3 per wave (except final) = under-splitting.
> Extract shared dependencies as Wave-1 tasks for max parallelism.

Wave 1: local runtime setup and audit rubric foundation
- Task 1: serve site locally and capture baseline runtime health

Wave 2: parallel audit domains
- Task 2: design system fidelity audit
- Task 3: UX and interaction audit
- Task 4: accessibility audit
- Task 5: performance audit
- Task 6: SEO and document semantics audit
- Task 7: consolidate, deduplicate, and prioritize the problem list

### Dependency Matrix (full, all tasks)
- Task 1: blocks Tasks 2, 3, 4, 5, 6
- Task 2: blocked by Task 1; informs Task 7
- Task 3: blocked by Task 1; informs Task 7
- Task 4: blocked by Task 1; informs Task 7
- Task 5: blocked by Task 1; informs Task 7
- Task 6: blocked by Task 1; informs Task 7
- Task 7: blocked by Tasks 2, 3, 4, 5, 6
- Final Verification Wave: blocked by Task 7

### Agent Dispatch Summary (wave → task count → categories)
- Wave 1 → 1 task → unspecified-high
- Wave 2 → 6 tasks → visual-engineering, deep, unspecified-high
- Final Wave → 4 tasks → oracle, unspecified-high, deep

## TODOs
> Implementation + Test = ONE task. Never separate.
> EVERY task MUST have: Agent Profile + Parallelization + QA Scenarios.

- [ ] 1. Serve local site and capture runtime baseline

  **What to do**:
  - Start a local static server from repo root with `python3 -m http.server 4173`.
  - Open `http://127.0.0.1:4173/index.html` in browser automation.
  - Verify initial render for the full SPA shell.
  - Capture console messages, failed network requests, and a full-page desktop screenshot.
  - Record which local content sources are loaded at runtime, including `vault/index.json`.

  **Must NOT do**:
  - Must NOT modify files or generate new app assets.
  - Must NOT switch to deployed GitHub Pages.
  - Must NOT suppress runtime errors; only record them.

  **Recommended Agent Profile**:
  - Category: `unspecified-high` - Reason: combines local runtime setup with evidence capture across browser and shell
  - Skills: [] - no extra skill required
  - Omitted: [`frontend-design`] - not a redesign task

  **Parallelization**: Can Parallel: NO | Wave 1 | Blocks: [2, 3, 4, 5, 6] | Blocked By: []

  **References**:
  - Entry point: `index.html` - local SPA entry file to serve and load
  - Runtime: `js/app.js` - fetches data, routes sections, and powers interactions
  - Data source: `vault/index.json` - runtime content payload
  - Build/data source: `generate.py` - explains how `vault/index.json` is produced

  **Acceptance Criteria**:
  - [ ] `python3 -m http.server 4173` serves the repo root without errors
  - [ ] Browser opens `http://127.0.0.1:4173/index.html` successfully
  - [ ] Console log evidence saved to `.sisyphus/evidence/task-1-runtime-baseline-console.txt`
  - [ ] Network request evidence saved to `.sisyphus/evidence/task-1-runtime-baseline-network.txt`
  - [ ] Desktop full-page screenshot saved to `.sisyphus/evidence/task-1-runtime-baseline.png`

  **QA Scenarios**:
  ```
  Scenario: Happy path baseline load
    Tool: Playwright
    Steps: Open http://127.0.0.1:4173/index.html at 1440x900; wait for initial content; capture screenshot, console, and network activity
    Expected: Page renders main navigation and SPA shell; no blocking load failure; evidence files are created
    Evidence: .sisyphus/evidence/task-1-runtime-baseline.png

  Scenario: Failure/edge case runtime issue capture
    Tool: Playwright
    Steps: Inspect console and network logs after initial load; verify whether any request fails or any JS error appears
    Expected: Any failure is recorded exactly as observed in evidence output, with no silent omission
    Evidence: .sisyphus/evidence/task-1-runtime-baseline-console.txt
  ```

  **Commit**: NO | Message: `n/a` | Files: []

- [ ] 2. Audit design fidelity against `DESIGN.md`

  **What to do**:
  - Compare visual tokens and component behavior in the rendered page and source files against `DESIGN.md`.
  - Inspect typography, spacing rhythm, color usage, card styling, nav behavior, pill toggles, modal/lightbox presentation, and responsive consistency.
  - Report only concrete mismatches or unclear deviations with evidence.

  **Must NOT do**:
  - Must NOT report personal style preferences as issues without a design-spec mismatch or established design heuristic.
  - Must NOT propose redesign implementation.

  **Recommended Agent Profile**:
  - Category: `visual-engineering` - Reason: design-system fidelity and visual consistency review
  - Skills: [] - no implementation skill required
  - Omitted: [`frontend-design`] - audit only, not redesign

  **Parallelization**: Can Parallel: YES | Wave 2 | Blocks: [7] | Blocked By: [1]

  **References**:
  - Design baseline: `DESIGN.md` - source of token/component intent
  - Markup: `index.html` - structural components under review
  - Styles: `css/style.css` - actual design token and component implementation
  - Runtime presentation: `js/app.js` - controls modal/lightbox/carousel states affecting visual output

  **Acceptance Criteria**:
  - [ ] Design review covers desktop and mobile viewports
  - [ ] Every design issue cites either `DESIGN.md` or a named visual heuristic
  - [ ] Screenshot evidence exists for each visual issue reported
  - [ ] Findings saved to `.sisyphus/evidence/task-2-design-audit.md`

  **QA Scenarios**:
  ```
  Scenario: Happy path desktop/mobile visual audit
    Tool: Playwright
    Steps: Review the site at 1440x900 and 390x844; inspect nav, profile area, projects cards, modal, and thoughts section; capture screenshots for mismatches
    Expected: Each reported design issue includes exact location and screenshot evidence
    Evidence: .sisyphus/evidence/task-2-design-audit.md

  Scenario: Failure/edge case responsive inconsistency
    Tool: Playwright
    Steps: Switch to 390x844 and inspect overflow, clipping, cramped spacing, broken hierarchy, and modal/lightbox layout issues
    Expected: Any responsive failure is documented with viewport-specific evidence, not generalized speculation
    Evidence: .sisyphus/evidence/task-2-design-audit-mobile.png
  ```

  **Commit**: NO | Message: `n/a` | Files: []

- [ ] 3. Audit UX flows and interaction quality

  **What to do**:
  - Review navigation between about/thoughts and whoami/projects sub-tabs.
  - Exercise project card interactions, carousel controls, “더보기” modal, lightbox behavior, email copy interaction, and empty thoughts behavior.
  - Identify confusing flows, broken affordances, weak feedback, state loss, or interaction inconsistency.

  **Must NOT do**:
  - Must NOT classify purely aesthetic concerns as UX defects unless they affect usability.
  - Must NOT invent user personas or analytics claims.

  **Recommended Agent Profile**:
  - Category: `deep` - Reason: interaction analysis across multiple UI states and edge behaviors
  - Skills: [] - no extra skill required
  - Omitted: [`frontend-design`] - no redesign work

  **Parallelization**: Can Parallel: YES | Wave 2 | Blocks: [7] | Blocked By: [1]

  **References**:
  - Structure: `index.html` - interactive regions and modal/lightbox containers
  - Interaction logic: `js/app.js` - routing, tab toggles, carousel, modal, copy behavior
  - Content source: `vault/index.json` - project and thoughts data states

  **Acceptance Criteria**:
  - [ ] UX audit covers all primary interactive flows in the full SPA
  - [ ] Each UX issue includes reproduction steps and binary expected vs actual behavior
  - [ ] Empty/edge states are evaluated, including thoughts content absence if present locally
  - [ ] Findings saved to `.sisyphus/evidence/task-3-ux-audit.md`

  **QA Scenarios**:
  ```
  Scenario: Happy path primary interaction flow
    Tool: Playwright
    Steps: Navigate between about and thoughts; switch whoami/projects tabs; open and close project modal; use carousel arrows; open and close lightbox
    Expected: Every reported issue includes exact reproduction steps and observed impact
    Evidence: .sisyphus/evidence/task-3-ux-audit.md

  Scenario: Failure/edge case empty or weak-feedback behavior
    Tool: Playwright
    Steps: Inspect thoughts section when content is empty; trigger email copy action; verify whether user feedback is absent, unclear, or inconsistent; test modal/lightbox dismissal from multiple paths
    Expected: Weak or failed feedback states are documented with screenshots and step-by-step evidence
    Evidence: .sisyphus/evidence/task-3-ux-audit-edge.png
  ```

  **Commit**: NO | Message: `n/a` | Files: []

- [ ] 4. Audit accessibility and keyboard usability

  **What to do**:
  - Inspect document landmarks, heading hierarchy, button/link semantics, image alt treatment, focus visibility, focus order, modal focus handling, keyboard escape/dismiss behavior, and text contrast.
  - Use browser accessibility snapshot and keyboard-only navigation to identify concrete accessibility failures.
  - Classify issues against WCAG-level heuristics where applicable.

  **Must NOT do**:
  - Must NOT make unverifiable accessibility claims without observed DOM/runtime evidence.
  - Must NOT limit review to automated signals; include keyboard interaction evidence.

  **Recommended Agent Profile**:
  - Category: `unspecified-high` - Reason: mixed semantic inspection plus runtime keyboard validation
  - Skills: [] - no extra skill required
  - Omitted: [`frontend-design`] - accessibility audit, not styling work

  **Parallelization**: Can Parallel: YES | Wave 2 | Blocks: [7] | Blocked By: [1]

  **References**:
  - Markup: `index.html` - landmarks, headings, roles, interactive semantics
  - Styles: `css/style.css` - focus visibility, contrast-relevant styles
  - Runtime behavior: `js/app.js` - modal/lightbox focus and keyboard handling
  - Standard baseline: `https://www.w3.org/WAI/WCAG21/quickref/` - WCAG reference for concrete issues only

  **Acceptance Criteria**:
  - [ ] Accessibility audit includes keyboard-only traversal of all key interactive elements
  - [ ] Accessibility snapshot evidence saved to `.sisyphus/evidence/task-4-a11y-snapshot.md`
  - [ ] Every accessibility issue cites DOM/runtime evidence and a concrete heuristic or WCAG reference
  - [ ] Findings saved to `.sisyphus/evidence/task-4-a11y-audit.md`

  **QA Scenarios**:
  ```
  Scenario: Happy path keyboard navigation audit
    Tool: Playwright
    Steps: Use Tab/Shift+Tab/Enter/Escape to navigate nav, tabs, cards, modal, and lightbox; capture focus order and dismissal behavior
    Expected: Accessible flows pass silently; failures are documented with exact steps and focus-state evidence
    Evidence: .sisyphus/evidence/task-4-a11y-audit.md

  Scenario: Failure/edge case modal or focus trap problem
    Tool: Playwright
    Steps: Open project modal and lightbox; test focus entry, containment, escape close, and return focus to trigger
    Expected: Any missing focus management or inaccessible dismissal path is captured as a concrete defect
    Evidence: .sisyphus/evidence/task-4-a11y-modal.png
  ```

  **Commit**: NO | Message: `n/a` | Files: []

- [ ] 5. Audit performance risks and runtime efficiency

  **What to do**:
  - Review asset loading behavior, image handling, lazy loading effectiveness, render-blocking dependencies, console/network warnings, and obvious heavy/unused payloads.
  - Inspect whether current implementation causes unnecessary load or interaction latency risks.
  - Report only observable or source-supported issues; if exact metric tooling is unavailable, classify as “observable risk” with evidence.

  **Must NOT do**:
  - Must NOT invent Lighthouse scores or unsupported numeric claims.
  - Must NOT recommend toolchain changes as part of the issue list.

  **Recommended Agent Profile**:
  - Category: `deep` - Reason: combines runtime observation with implementation analysis
  - Skills: [] - no extra skill required
  - Omitted: [`frontend-design`] - non-visual audit

  **Parallelization**: Can Parallel: YES | Wave 2 | Blocks: [7] | Blocked By: [1]

  **References**:
  - Runtime logic: `js/app.js` - fetches data, lazy loading, image/carousel behavior
  - Styles: `css/style.css` - animation/transition and responsive rendering cost sources
  - Content payload: `vault/index.json` - loaded content size and structure
  - Assets: `vault/images/` - image-heavy project media set

  **Acceptance Criteria**:
  - [ ] Performance audit includes network request review and asset inspection
  - [ ] Any performance issue is backed by direct runtime evidence or source-backed rationale
  - [ ] Findings saved to `.sisyphus/evidence/task-5-performance-audit.md`
  - [ ] Supporting logs/screenshots saved for any slow/heavy/failing asset behavior

  **QA Scenarios**:
  ```
  Scenario: Happy path baseline performance inspection
    Tool: Playwright
    Steps: Load the page fresh; review network requests, image loads, and interaction responsiveness while navigating core sections
    Expected: Observable performance risks are recorded with concrete request or asset evidence
    Evidence: .sisyphus/evidence/task-5-performance-audit.md

  Scenario: Failure/edge case content-heavy interaction risk
    Tool: Playwright
    Steps: Navigate project cards and image-heavy areas; inspect whether large images, carousels, or modal/lightbox behavior produce visible delay or excessive requests
    Expected: Any reproducible lag or wasteful loading pattern is documented without fabricated metrics
    Evidence: .sisyphus/evidence/task-5-performance-network.txt
  ```

  **Commit**: NO | Message: `n/a` | Files: []

- [ ] 6. Audit SEO basics and document semantics

  **What to do**:
  - Inspect title, meta description, heading structure, canonical/basic metadata presence, language declaration, semantic structure, image discoverability basics, and content indexability risks of the SPA.
  - Review whether core content is meaningfully represented in source DOM and whether obvious SEO pitfalls exist.
  - Separate true defects from enhancement opportunities; only include concrete issues in the problem list.

  **Must NOT do**:
  - Must NOT make claims about search rankings or external crawl outcomes.
  - Must NOT recommend content strategy rewrite beyond issue notation.

  **Recommended Agent Profile**:
  - Category: `unspecified-high` - Reason: semantic/source inspection plus lightweight runtime validation
  - Skills: [] - no extra skill required
  - Omitted: [`frontend-design`] - not a design task

  **Parallelization**: Can Parallel: YES | Wave 2 | Blocks: [7] | Blocked By: [1]

  **References**:
  - Document shell: `index.html` - title, metadata, lang, headings, semantics
  - Runtime content insertion: `js/app.js` - how meaningful content is injected client-side
  - Content source: `vault/about.md`, `vault/projects/*.md`, `vault/index.json` - primary indexable content
  - Manifest/assets: `public/site.webmanifest` - supporting metadata asset

  **Acceptance Criteria**:
  - [ ] SEO audit checks title, description, headings, lang, and semantic structure
  - [ ] Every SEO issue includes exact source location or runtime evidence
  - [ ] Findings saved to `.sisyphus/evidence/task-6-seo-audit.md`
  - [ ] No ranking speculation appears in findings

  **QA Scenarios**:
  ```
  Scenario: Happy path document metadata audit
    Tool: Playwright
    Steps: Load the page; inspect document title, meta tags, heading hierarchy, and semantic landmarks from DOM/source
    Expected: Missing or weak SEO basics are documented with direct DOM/source evidence
    Evidence: .sisyphus/evidence/task-6-seo-audit.md

  Scenario: Failure/edge case SPA indexability risk
    Tool: Playwright
    Steps: Compare initial source-visible content to client-rendered content; identify if meaningful sections depend entirely on JS without fallback structure
    Expected: Any concrete SPA indexability risk is documented precisely, without overclaiming crawler behavior
    Evidence: .sisyphus/evidence/task-6-seo-source.txt
  ```

  **Commit**: NO | Message: `n/a` | Files: []

- [ ] 7. Consolidate, deduplicate, and prioritize the final problem list

  **What to do**:
  - Merge findings from Tasks 2-6 into one final problem list.
  - Deduplicate by root cause: if one markup or state-management flaw creates multiple symptoms, report one parent issue with noted manifestations.
  - Assign severity using `critical`, `high`, `medium`, `low` based on user impact, breadth, and recoverability.
  - Format every issue exactly as:
    - ID
    - Category
    - Severity
    - Location
    - Evidence
    - Why it matters
    - Reference violated
  - Ensure coverage includes all requested categories even if some categories yield “no significant issues found”.

  **Must NOT do**:
  - Must NOT introduce new unsupported findings.
  - Must NOT include fix plans, code changes, or speculative ranking/performance numbers.
  - Must NOT leave raw notes unstructured.

  **Recommended Agent Profile**:
  - Category: `writing` - Reason: structured synthesis into a final audit artifact
  - Skills: [] - no extra skill required
  - Omitted: [`frontend-design`] - synthesis only

  **Parallelization**: Can Parallel: NO | Wave 2 | Blocks: [Final Verification Wave] | Blocked By: [2, 3, 4, 5, 6]

  **References**:
  - Design findings: `.sisyphus/evidence/task-2-design-audit.md`
  - UX findings: `.sisyphus/evidence/task-3-ux-audit.md`
  - Accessibility findings: `.sisyphus/evidence/task-4-a11y-audit.md`
  - Performance findings: `.sisyphus/evidence/task-5-performance-audit.md`
  - SEO findings: `.sisyphus/evidence/task-6-seo-audit.md`
  - Baseline/runtime evidence: `.sisyphus/evidence/task-1-runtime-baseline-console.txt`, `.sisyphus/evidence/task-1-runtime-baseline-network.txt`

  **Acceptance Criteria**:
  - [ ] Final problem list is complete, deduplicated, and prioritized
  - [ ] Every issue follows the exact required field structure
  - [ ] Every issue points to at least one evidence artifact
  - [ ] Final audit artifact saved to `.sisyphus/evidence/task-7-homepage-problem-list.md`

  **QA Scenarios**:
  ```
  Scenario: Happy path final synthesis
    Tool: Bash
    Steps: Assemble all task evidence into one markdown report using the required field structure and severity ordering
    Expected: A single deduplicated problem list exists with evidence-linked issues across all required categories
    Evidence: .sisyphus/evidence/task-7-homepage-problem-list.md

  Scenario: Failure/edge case duplicate-root-cause cleanup
    Tool: Bash
    Steps: Review merged findings for repeated symptoms caused by the same root issue; collapse duplicates while preserving supporting evidence
    Expected: Final report avoids duplicated issue entries and notes grouped manifestations where needed
    Evidence: .sisyphus/evidence/task-7-homepage-problem-list.md
  ```

  **Commit**: NO | Message: `n/a` | Files: []

## Final Verification Wave (MANDATORY — after ALL implementation tasks)
> 4 review agents run in PARALLEL. ALL must APPROVE. Present consolidated results to user and get explicit "okay" before completing.
> **Do NOT auto-proceed after verification. Wait for user's explicit approval before marking work complete.**
> **Never mark F1-F4 as checked before getting user's okay.** Rejection or user feedback -> fix -> re-run -> present again -> wait for okay.
- [ ] F1. Plan Compliance Audit — oracle
- [ ] F2. Code Quality Review — unspecified-high
- [ ] F3. Real Manual QA — unspecified-high (+ playwright if UI)
- [ ] F4. Scope Fidelity Check — deep

## Commit Strategy
- No commit required for audit-only execution unless the user explicitly requests report persistence in version control.

## Success Criteria
- The execution agent can perform the audit without additional judgment calls.
- The final deliverable is a prioritized problem list, not an implementation plan.
- Every reported issue is evidence-backed, scoped to the local SPA, and grounded in `DESIGN.md` and/or established best practices.
- The audit clearly distinguishes design, UX, accessibility, performance, and SEO findings.
