# OPTALYNX Enterprise Design Guidelines

Phase 2 · Wave 1 — Enterprise Product Experience Program

---

## Philosophy

OPTALYNX is an **Enterprise Talent Operations Platform**, not a traditional ATS. The experience should feel comparable to Microsoft Azure Portal, Dynamics 365, Workday, and ServiceNow: dense, productive, and decision-oriented.

Transform from **module-centric** to **workspace-centric**. Users work inside role-based workspaces that answer one primary business question.

---

## Design Tokens

Centralized in `src/theme/tokens.js` and applied through `src/theme/theme.jsx`.

| Token category | Usage |
|----------------|-------|
| Typography | Display 28, Page Title 22, Section 18, Body 14, Secondary 13, Caption 12 |
| Spacing | 8dp grid via `theme.spacing(n)` |
| Layout | Max content width 1600px, header 56px, nav rail 72px, inspector 360px |
| Radius | xs 4, sm 6, md 8, lg 12 |
| Elevation & shadows | Low/mid/high enterprise shadows |
| Status colors | Draft, pending, approved, released, etc. |
| Priority colors | Critical, high, normal, low |
| SLA colors | Overdue, at risk, on track |

**Rule:** No hardcoded spacing, colors, or typography in new workspace code. Use `theme.tokens` or MUI theme values.

---

## Material Design 3 — Dense Enterprise

- MUI as component foundation
- Compact density: 36px grid rows, 32px buttons, 22px chips
- Avoid large cards, oversized buttons, tall dashboard tiles, excessive whitespace
- Target: primary work area fits one screen at 1920×1080 where practical

---

## Navigation Model

Every workspace follows:

```
Navigation Rail → Workspace → Entity → Inspector → Timeline → Actions
```

Shell structure (`WorkspaceLayout`):

1. App Header
2. Navigation Rail
3. Workspace Header
4. Executive KPI Slab (`MetricSlab`)
5. Command Bar
6. Primary Content (split pane + grid)
7. Inspector Drawer
8. Timeline / Activity
9. Context Actions

---

## Component Library

Location: `src/components/enterprise/`

| Component | Purpose |
|-----------|---------|
| `WorkspaceLayout` | Standard workspace shell |
| `WorkspaceHeader` | Page title, breadcrumbs, actions |
| `EntityHeader` | Entity detail header with meta |
| `MetricSlab` / `MetricCell` | Compact KPI strip |
| `CommandBar` | Filters, tabs, search row |
| `SearchBar` | Standard search input |
| `EnterpriseToolbar` | Inline toolbar for grids |
| `EnterpriseDataGrid` | Virtualized compact DataGrid |
| `SplitView` | Primary + secondary panes |
| `InspectorDrawer` | Entity inspection panel |
| `EntityDrawer` | Full entity edit/view drawer |
| `ActivityTimeline` | Audit and activity feed |
| `TaskSummary` | Pending task list |
| `StatusChip` / `PriorityChip` / `SLAChip` | Semantic chips |
| `EmptyState` / `LoadingState` / `ErrorState` | Standard states |
| `AIInsightCard` | AI insight placeholder |
| `EnterpriseSurface` | Bordered content container |

Legacy `platform-config/*` components re-export from `enterprise/*` for backward compatibility.

---

## Workspace Philosophy

| Workspace | Primary question |
|-----------|------------------|
| Recruiter | What work requires my attention today? |
| Hiring Manager | What positions require my approval? |
| TA Leader | What hiring activities are blocked? |
| Interviewer | What interviews must I conduct today? |
| Finance | What offers require financial approval? |
| Leadership | What decisions require executive action? |
| Administrator | How do I configure the platform? |

---

## Wave 1 — Recruiter Workspace

- Route: `/recruiter` (default landing for Recruiter role)
- Data: Enterprise Store (`recruitment`, `taskInbox`, `interviews`, `auditEvents`)
- No mock data; live mode via `VITE_API_MODE=live`
- Dual-role Recruiter + Interviewer: `/workspace` picker

---

## Interaction Patterns

- **Grids:** Row click opens Inspector Drawer
- **Tasks:** Complete inline from TaskSummary
- **Search:** Filters requisitions and pipeline in Command Bar
- **Refresh:** Re-fetches recruitment bundle from repository
- **Toasts:** Workspace-level via `recruiterUi.toastMessage`

---

## Accessibility

- Keyboard navigation on nav rail (ARIA labels on icon buttons)
- Visible focus states via MUI defaults
- Target viewports: 1920, 1600, 1440, 1366, 1280
- Responsive split panes stack on smaller screens

---

## Performance

- Lazy-loaded workspace routes
- Memoized selectors in `recruiterSelectors.js`
- Compact DataGrid with pagination
- Code splitting via React.lazy

---

## Screenshots (Design Review)

Capture at 1920×1080 with `VITE_API_MODE=live` and seeded backend:

1. **Recruiter Workspace — Overview** — KPI slab, pipeline metrics, requisitions grid
2. **Recruiter Workspace — Pipeline tab** — Candidate pipeline grid
3. **Recruiter Workspace — Inspector** — Requisition detail drawer open
4. **Recruiter Workspace — Tasks** — Task summary with pending items
5. **Workspace Picker** — Dual-role user landing at `/workspace`

Save to `docs/wave1-screenshots/` for design review.

---

## Do Not Change (Backend Frozen)

- Database schema, API contracts, repository layer
- Workflow Engine, Business Rules Engine
- Enterprise Store domain slices and repository signatures
- Authentication and routing for legacy ATS pages
