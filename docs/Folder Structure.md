# OPTALYNX Folder Structure

## Top-Level (`ats-frontend/`)

```
ats-frontend/
├── docs/                    # Architecture and developer documentation
├── public/                  # Static assets
├── src/                     # Application source
├── jsconfig.json            # Path alias (@/ → src/)
├── vite.config.js           # Vite + @ alias configuration
└── package.json
```

## Source Layout (`src/`)

```
src/
├── App.jsx                  # Router, lazy-loaded admin modules
├── main.jsx                 # Entry: ThemeProvider, CssBaseline
│
├── components/              # Reusable UI components
│   ├── layout/              # AppHeader, AdminNavRail
│   ├── platform-config/     # Shared design system + config consoles
│   ├── workforce-planning/  # Workforce module components
│   ├── business-rules/      # Business rules module components
│   ├── hiring-control-tower/# HCT module components
│   └── Dashboard/           # Legacy dashboard widgets
│
├── pages/                   # Route-level page components
│   ├── platform-config/     # Config section pages
│   ├── workforce-planning/  # Workforce section pages
│   ├── business-rules/      # Rules section pages
│   ├── hiring-control-tower/# HCT page
│   └── …                    # Legacy ATS pages
│
├── hooks/                   # Module hooks (store adapters)
├── store/                   # Zustand enterprise store + selectors
├── repositories/            # Repository layer (data access abstraction)
├── api/                     # HTTP client, endpoints, domain API clients
│   ├── axios.jsx            # Shared JWT-aware Axios instance
│   ├── config.js            # VITE_API_MODE, base URL
│   ├── endpoints.js         # REST path constants
│   ├── httpClient.js        # Mock/live transport switch
│   └── clients/             # masterData, platformConfig, workforce, …
├── enterprise/              # Events, audit, selectors, visibility
├── utils/                   # Shared utilities (formatCurrency, cloneData)
├── data/mock/               # Development seed data (mock mode)
└── theme/                   # MUI theme configuration
```

## Naming Conventions

| Artifact | Convention | Example |
|----------|------------|---------|
| React components | PascalCase file + export | `StageInspectorPanel.jsx` |
| Pages | PascalCase + `Page` suffix | `WorkforceDashboardPage.jsx` |
| Layouts | PascalCase + `Layout` suffix | `WorkforcePlanningLayout.jsx` |
| Hooks | camelCase + `use` prefix | `useWorkforcePlanning.js` |
| Store | camelCase | `enterpriseStore.js` |
| Selectors | camelCase + `select` prefix | `selectAuditEvents` |
| Events | SCREAMING_SNAKE keys, PascalCase values | `BUDGET_APPROVED: "BudgetApproved"` |
| Utils | camelCase | `formatCurrency.js` |
| Mock data | camelCase + `.mock.js` | `workforcePlanning.mock.js` |
| Repositories | camelCase + `Repository` suffix | `masterDataRepository.js` |
| API clients | camelCase + `Client` suffix | `workforcePlanningClient.js` |

## Module Organization Pattern

Each enterprise module follows:

```
components/{module}/
  {Module}Layout.jsx       # Shell: header, nav rail, sidebar, outlet
  {Module}Sidebar.jsx      # Section navigation
  …feature components

pages/{module}/
  …section pages

hooks/
  use{Module}.js           # Thin adapter over enterprise store
```

**Exception:** Hiring Control Tower page lives in `pages/hiring-control-tower/` while layout lives in `components/hiring-control-tower/`. This matches the single-page (no nested routes) pattern.

## Import Aliases

Use `@/` for absolute imports from `src/`:

```javascript
import useEnterpriseStore from "@/store/enterpriseStore";
import { formatCurrency } from "@/utils/formatCurrency";
```

## Shared vs Module-Specific

| Shared (cross-module) | Module-specific |
|-----------------------|-----------------|
| `components/platform-config/Config*` | `components/workforce-planning/*` |
| `components/layout/*` | `components/business-rules/*` |
| `enterprise/*`, `store/*`, `utils/*` | `components/hiring-control-tower/*` |
