# OPTALYNX Developer Guide

## Getting Started

```bash
cd ats-frontend
npm install
npm run dev      # Development server
npm run build    # Production build
```

## Integrating a New Module with the Enterprise Store

Follow this checklist when adding a module that must participate in cross-module integration.

### 1. Define your data slice

Add state to `src/store/enterpriseStore.js`:

```javascript
myModule: structuredClone(myModuleMock),
myModuleUi: { selectedId: null, toastMessage: "" }
```

Seed from a mock file in `src/data/mock/` during development.

### 2. Add store actions

Create mutations that:

1. Update the relevant slice immutably
2. Call `publishAudit()` for every business-significant action
3. Update dependent slices if needed (e.g., approving a budget also updates `hiringProcess.linkedPositionId`)

Use event constants from `src/enterprise/events.js`:

```javascript
import ENTERPRISE_EVENTS from "@/enterprise/events";

publishAudit(set, get, ENTERPRISE_EVENTS.MY_EVENT, {
  module: "My Module",
  entity: "Entity Type",
  entityId: id,
  action: "Human-readable description",
  previousValue,
  newValue,
  metadata: { stageKey: "optional_hct_stage" }
});
```

### 3. Create a module hook

Add `src/hooks/useMyModule.js` as a thin adapter:

```javascript
import useEnterpriseStore from "@/store/enterpriseStore";
import { selectMyModule } from "@/store/storeSelectors";

function useMyModule() {
  const data = useEnterpriseStore(selectMyModule);
  const doAction = useEnterpriseStore((s) => s.myModuleAction);
  return { data, doAction };
}
```

Pages should consume the hook via `useOutletContext()` or direct import — never import mock data directly.

### 4. Add derived selectors (if cross-module)

If other modules need a computed view of your data, add a builder to `src/enterprise/selectors.js` rather than duplicating logic in components.

### 5. Wire navigation visibility

If your module maps to a platform config module key, add entries to:

- `enterprise/moduleVisibility.js` — `NAV_MODULE_MAP` / `ADMIN_NAV_MODULE_MAP`
- `AdminNavRail.jsx` — nav item with module key mapping

### 6. Consume shared audit

Use `useEnterpriseAudit("My Module")` instead of maintaining local activity lists.

### 7. Use shared utilities

| Need | Import from |
|------|-------------|
| Currency formatting | `@/utils/formatCurrency` |
| Date/time formatting | `@/utils/formatDateTime` |
| KPI slab | `@/components/platform-config/ConfigMetricSlab` |
| Page header | `@/components/platform-config/ConfigPageHeader` |
| Surface container | `@/components/platform-config/ConfigSurface` |

### 8. Route registration

Add lazy-loaded routes in `App.jsx`:

```javascript
const MyModuleLayout = lazy(() => import("./components/my-module/MyModuleLayout"));

<Route path="/my-module" element={
  <ProtectedRoute>
    <LazyRoute><MyModuleLayout /></LazyRoute>
  </ProtectedRoute>
}>
  …nested routes
</Route>
```

## Coding Standards

- **PascalCase** event type strings: `BudgetApproved`, not `"Budget Approved"`
- **Selector subscriptions** over whole-store subscriptions
- **No mock imports in components** — only hooks and store seed data
- **`@/` alias** for imports from `src/`
- **No duplicate components** — extend shared primitives before creating module-specific copies

## Backend Integration Pattern (Future)

Replace store mutations with API calls:

```javascript
approveBudgetRequest: async (id, comment) => {
  // Optimistic update
  set(/* local state */);
  publishAudit(/* … */);
  // await api.post('/budget-requests/:id/approve', { comment });
}
```

Hooks and page APIs remain unchanged.

## Testing Cross-Module Scenarios

After changes, verify:

1. Platform Config module toggle → nav updates immediately
2. Budget threshold change → HCT + Business Rules reflect new value
3. Workflow stage insert → HCT lifecycle updates
4. Budget approval → catalogue + audit + HCT linked position
5. Notification channel disable → HCT preview filters channel
6. Role visibility toggle → Home menu filters item
