# Enterprise UX Transformation Program — Wave 2

**Status:** In progress  
**Architecture:** Frozen — consume enterprise stack only  
**Reference implementation:** Recruiter Workspace

---

## Program Objective

Transform OPTALYNX from operational CRUD pages into a world-class enterprise SaaS platform using Material Design 3 (Dense Enterprise), workspace-first patterns, and consistent interaction models — **without changing business logic, APIs, repositories, services, workflows, or database schema**.

---

## Frozen Architecture (Non-Negotiable)

```
React Component → Hook → Enterprise Store → Repository → API Client
  → Express API → Service Layer → Workflow Engine → Business Rules → PostgreSQL
```

No component may bypass this stack.

---

## UX Standard Checklist (Every Operational Workspace)

| Element | Required |
|---------|----------|
| Workspace Header | ✅ |
| Context Toolbar | ✅ |
| KPI Summary | ✅ |
| Enterprise Grid | ✅ |
| Search | ✅ |
| Filters | ✅ |
| Saved Views | ✅ |
| Bulk Actions | ✅ |
| Inspector Drawer | ✅ |
| Activity Timeline | ✅ |
| Related Tasks | ✅ |
| Audit History | ✅ |
| AI Insights | ✅ (placeholder or rules-based) |

No CRUD popup dialogs unless justified by business process.

---

## Delivery Priority

| Wave | Workspace | Status |
|------|-----------|--------|
| 2.1 | **Recruiter Workspace** | **Phase 1 delivered** (see below) |
| 2.2 | Hiring Manager Workspace | Not started |
| 2.3 | Interviewer Workspace | Legacy `InterviewerHome` — migrate |
| 2.4 | HR Workspace | Not started |
| 2.5 | TA Lead Workspace | Partial (`RequisitionPage` enterprise; needs workspace shell) |
| 2.6 | Executive Command Center | Not started |

---

## Wave 2.1 — Recruiter Workspace (Delivered)

### New / updated components

| File | Purpose |
|------|---------|
| `components/workspaces/recruiter/RecruiterContextToolbar.jsx` | Tab toggle, status/stage filters, saved views, search |
| `components/workspaces/recruiter/RecruiterInspector.jsx` | Tabbed inspector: Details, Tasks, Activity, Audit |
| `pages/workspaces/recruiter/RecruiterWorkspacePage.jsx` | Full workspace layout refactor |
| `hooks/useRecruiterWorkspace.js` | Entity-scoped data, KPI drill-down, stage actions |
| `enterprise/recruiterSelectors.js` | Filters, AI insights, entity tasks/audit, saved views |

### Capabilities added

- **Context toolbar** with status filter (requisitions), stage filter (pipeline), saved views (localStorage), clear filters
- **KPI drill-down** — click executive/pipeline metrics to filter grid
- **Tabbed inspector** with `EntityHeader`, stage advance, related tasks, entity audit
- **Bulk selection** + CSV export
- **AI insights** — rules-based (overdue tasks, interviews today, pipeline backlog)
- **Stage update** from inspector via existing `updateRecruitmentStage` store action
- **MetricSlab** interactive cells (keyboard accessible)

### Still on Recruiter backlog (Wave 2.1B)

- Persist grid sort/column state
- Server-side saved views (when API available)
- DB-backed audit in inspector (currently session `auditEvents`)
- Schedule interview from inspector (store action exists, not wired)
- Replace legacy nav links (`/candidates`, `/interview-schedule`) with in-workspace flows

---

## Legacy UI Deprecation Register

| Route | Page | Replacement target |
|-------|------|---------------------|
| `/recruiter` | Recruiter Workspace | ✅ Reference workspace |
| `/candidates` | CandidatePage | Recruiter Workspace pipeline tab |
| `/requisitions` | RequisitionPage | TA Lead Workspace (Wave 2.5) |
| `/interview-schedule` | InterviewSchedulePage | Recruiter / Interviewer workspace |
| `/interviewer` | InterviewerHome | Interviewer Workspace (Wave 2.3) |
| `/ui-test` | RecruiterDashboard | Remove |

---

## Quality Gates

A workspace is **complete** when:

- All business actions work through enterprise store
- All data is live from repositories (no direct axios)
- No legacy UI components on that workspace
- Design tokens applied consistently
- Dense MD3 standards followed
- Interaction patterns match across modules

---

## Design System Reference

- Tokens: `src/theme/tokens.js`
- Theme: `src/theme/theme.jsx`
- Components: `src/components/enterprise/`
- Guidelines: `docs/Enterprise Design Guidelines.md`

---

## Next Steps

1. **Wave 2.1B** — Complete Recruiter backlog items above
2. **Wave 2.2** — Hiring Manager Workspace (requisition approval, pipeline visibility)
3. **Wave 2.3** — Interviewer Workspace (replace `InterviewerHome`)
4. **Wave 2.5** — TA Lead Workspace (migrate `RequisitionPage` into enterprise shell)
