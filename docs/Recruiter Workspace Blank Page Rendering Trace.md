# Recruiter Workspace Blank Page — React Rendering Trace

**Route:** `/recruiter`  
**Report type:** Rendering investigation only (no fixes applied)  
**Date:** 2026-06-27

---

## Executive Finding

**The first component in the page tree that fails to complete rendering is `RecruiterWorkspacePage`.**

There is **no intentional `return null`** at the page level. The blank main content area is caused by a **render-phase exception** when the JSX expression at **line 256** evaluates `recruiterUi.selectedRowIds.length` while `selectedRowIds` is **`undefined`**.

That undefined state is introduced by **`bootstrap.js` (lines 133–142)**, which replaces the entire `recruiterUi` slice on app load with a **pre–Wave 2 shape** that omits Wave 2 fields including `selectedRowIds`.

When React throws during render, **nothing from `RecruiterWorkspacePage` commits** — including `WorkspaceHeader`, `MetricSlab`, and all downstream components in that file.

The **layout shell** (`WorkspaceLayout` → `AppHeader`, `RecruiterNavRail`) is a **sibling** of the outlet content and should still mount unless the viewport is perceived as blank because the main column is empty.

---

## 1. Router

**File:** `ats-frontend/src/App.jsx`

| Property | Value |
|----------|-------|
| Path | `/recruiter` |
| Guard | `ProtectedRoute` (requires `localStorage.token`) |
| Layout element | `<LazyRoute><RecruiterWorkspaceLayout /></LazyRoute>` |
| Index child | `<LazyRoute><RecruiterWorkspacePage /></LazyRoute>` |

```341:358:ats-frontend/src/App.jsx
<Route
  path="/recruiter"
  element={
    <ProtectedRoute>
      <LazyRoute>
        <RecruiterWorkspaceLayout />
      </LazyRoute>
    </ProtectedRoute>
  }
>
  <Route
    index
    element={
      <LazyRoute>
        <RecruiterWorkspacePage />
      </LazyRoute>
    }
  />
</Route>
```

**Mounted component tree (intended):**

```
BrowserRouter
└── ProtectedRoute
    └── Suspense (LazyRoute fallback: RouteLoader / CircularProgress)
        └── RecruiterWorkspaceLayout
            └── WorkspaceLayout
                ├── AppHeader
                ├── RecruiterNavRail
                └── main > Outlet
                    └── Suspense (inner LazyRoute)
                        └── RecruiterWorkspacePage  ← fails here
```

---

## 2. Suspense / Lazy

| Lazy import | Wrapper | Fallback |
|-------------|---------|----------|
| `RecruiterWorkspaceLayout` | `LazyRoute` → `Suspense` | `RouteLoader` (CircularProgress, minHeight 40vh) |
| `RecruiterWorkspacePage` | Nested `LazyRoute` inside `Outlet` | Same `RouteLoader` |

**`LazyRoute` definition (lines 135–142):** Always wraps children in `<Suspense fallback={<RouteLoader />}>`. Fallback is **not null** — a spinner should appear while chunks load.

**No other Suspense boundaries** exist on this route.

If the user sees **no spinner and no header**, the failure occurs **after** both lazy chunks resolve (during render, not during suspend).

---

## 3. RecruiterWorkspaceLayout

**File:** `ats-frontend/src/components/workspaces/RecruiterWorkspaceLayout.jsx`

| Question | Answer |
|----------|--------|
| Does it execute? | Yes — no early returns |
| Early returns? | **None** |
| Returns null? | **No** |

```6:21:ats-frontend/src/components/workspaces/RecruiterWorkspaceLayout.jsx
function RecruiterWorkspaceLayout() {
  const workspace = useRecruiterWorkspace();
  const { user, recruiterUi, setRecruiterUi } = workspace;

  return (
    <WorkspaceLayout
      navRail={<RecruiterNavRail loggedInUser={user} />}
      toast={{ message: recruiterUi.toastMessage, ... }}
      onToastClose={...}
    >
      <Outlet context={workspace} />
    </WorkspaceLayout>
  );
}
```

**Hook runs here** — `useRecruiterWorkspace()` does **not** throw when Wave 2 UI fields are missing (selector defaults apply).

---

## 4. WorkspaceLayout

**File:** `ats-frontend/src/components/enterprise/WorkspaceLayout.jsx`

| Question | Answer |
|----------|--------|
| Does it render? | Yes |
| Receives children? | Yes — `<Outlet context={workspace} />` |
| Renders children? | Yes — `{children}` at line 82 |
| Early returns? | **None** |
| Returns null? | **No** |

Always renders: outer `Box`, `AppHeader`, flex row with `navRail`, `main` with `{children}`.

Conditional blocks (non-blocking):
- `{sidebar}` — not passed for recruiter route
- `{timeline}` — not passed
- `{inspector}` — not passed
- `{toast?.message && <Snackbar ...>}` — only when toast message set

---

## 5. useRecruiterWorkspace

**File:** `ats-frontend/src/hooks/useRecruiterWorkspace.js`

### Store subscriptions

| Field | Source |
|-------|--------|
| `recruitment` | `state.recruitment` |
| `taskInbox` | `state.taskInbox` |
| `interviews` | `state.interviews` |
| `auditEvents` | `state.auditEvents` |
| `recruiterUi` | `state.recruiterUi` |

### Initial `recruiterUi` in store (enterpriseStore.js lines 119–134)

```javascript
{
  selectedRequisitionCode: null,
  selectedCandidateMapId: null,
  inspectorOpen: false,
  inspectorTab: "details",
  searchQuery: "",
  activeTab: "requisitions",
  statusFilter: "all",
  stageFilter: "all",
  kpiFilter: null,
  selectedRowIds: [],      // ← present in store definition
  savedViewId: null,
  toastMessage: "",
  toastSeverity: "success",
  initialLoadComplete: false
}
```

### After `bootstrapEnterpriseData()` (bootstrap.js lines 133–142)

```javascript
recruiterUi: {
  selectedRequisitionCode: null,
  selectedCandidateMapId: null,
  inspectorOpen: false,
  searchQuery: "",
  activeTab: "requisitions",
  toastMessage: "",
  toastSeverity: "success",
  initialLoadComplete: Boolean(workspaceBundle)
}
// MISSING: inspectorTab, statusFilter, stageFilter, kpiFilter,
//          selectedRowIds, savedViewId
```

**Bootstrap runs in `main.jsx` line 13 before first paint**, replacing Wave 2 fields.

### Loading state

```javascript
isLoading:
  recruitment?.requisitions?.length === 0
  && recruitment?.pipeline?.length === 0
  && !recruiterUi.initialLoadComplete
```

Not an early return — passed to page as prop.

### Returned object

Always returns a plain object (no null). Includes `recruiterUi` from store (possibly stripped by bootstrap).

**Undefined values after bootstrap:**

| Field | Value after bootstrap |
|-------|----------------------|
| `selectedRowIds` | **`undefined`** |
| `statusFilter` | **`undefined`** |
| `stageFilter` | **`undefined`** |
| `kpiFilter` | **`undefined`** |
| `inspectorTab` | **`undefined`** |
| `savedViewId` | **`undefined`** |

---

## 6. RecruiterWorkspacePage

**File:** `ats-frontend/src/pages/workspaces/recruiter/RecruiterWorkspacePage.jsx`

| Question | Answer |
|----------|--------|
| Does the component execute? | Yes — until render throw |
| Function-level early returns? | **None** |
| `return null`? | **No** |
| `return <></>`? | **No** |

### Context source

```javascript
const workspace = useOutletContext();
const { recruiterUi, ... } = workspace;
```

If `workspace` were **undefined**, destructuring at line 120 would throw **before** the `return` statement.

With a normal layout mount, `workspace` is the object from `useRecruiterWorkspace()` — destructuring succeeds.

### useMemo (lines 150–162)

Accesses `recruiterUi.activeTab` — safe when `activeTab` is `"requisitions"` (bootstrap preserves this).

### Render order inside `return (<>...</>)`

| Order | Component / expression | Mounts? |
|-------|------------------------|---------|
| 1 | `WorkspaceHeader` | **No** — render aborts before commit |
| 2 | Executive `MetricSlab` | **No** |
| 3 | Pipeline label + `MetricSlab` | **No** |
| 4 | `RecruiterContextToolbar` | **No** |
| 5 | **`recruiterUi.selectedRowIds.length > 0 && (...)`** | **THROWS HERE (line 256)** |
| 6 | `SplitView` / `EnterpriseDataGrid` | Never reached |
| 7 | Activity `EnterpriseSurface` | Never reached |
| 8 | `RecruiterInspector` | Never reached |

---

## 7. Every conditional render / early exit

### RecruiterWorkspacePage.jsx

| Line | Pattern | Effect |
|------|---------|--------|
| 151 | `if (recruiterUi.activeTab === "pipeline")` | useMemo branch only — no return |
| 165–172 | `if (recruiterUi.activeTab === "pipeline")` + `return` | Event handler early return — not render |
| 256 | `{recruiterUi.selectedRowIds.length > 0 && (...)}` | **Render throw when `selectedRowIds` is undefined** |
| 286–313 | `isLoading ? ... : gridRows.length === 0 ? ... : ...` | Ternary inside SplitView — never evaluated |

### RecruiterContextToolbar.jsx

No `return null`. All branches render `CommandBar`.

### RecruiterInspector.jsx

| Line | Pattern | Effect |
|------|---------|--------|
| 24 | `if (active !== value) return null` | TabPanel only — inactive tabs |
| 177–214 | `{entityTasks.length === 0 ? EmptyState : TaskSummary}` | Normal ternary |

### MetricSlab.jsx

| Line | Pattern | Effect |
|------|---------|--------|
| 9–11 | `if (!metrics.length) return null` | **Not triggered** — selector always returns 4 executive + 7 pipeline metrics |

### ProtectedRoute.jsx

| Line | Pattern | Effect |
|------|---------|--------|
| 13–16 | `if (!token) return <Navigate to="/login" />` | Not triggered when logged in |

### InspectorDrawer.jsx

No early return. Drawer with `open={false}` still renders children in DOM (MUI) — not the blank-page cause.

---

## 8. Mount verification chain (requested hierarchy)

| Component | Reaches render? | Notes |
|-----------|-----------------|-------|
| **WorkspaceLayout** | **Yes** | Shell mounts |
| **WorkspaceHeader** | **No** | Inside failing page — render aborted |
| **ContextToolbar** (`RecruiterContextToolbar`) | **No** | Same |
| **MetricSlab** | **No** | Same |
| **EnterpriseGrid** (`EnterpriseDataGrid`) | **No** | Never reached (line 298) |
| **InspectorDrawer** (`RecruiterInspector`) | **No** | Never reached (line 342) |

**Stop trace at:** `RecruiterWorkspacePage` **line 256**

---

## 9. Root cause chain

```
main.jsx
  bootstrapEnterpriseData()          ← overwrites recruiterUi without selectedRowIds
    ↓
RecruiterWorkspaceLayout mounts
  useRecruiterWorkspace()            ← hook OK (selector defaults)
  <Outlet context={workspace} />
    ↓
RecruiterWorkspacePage mounts
  recruiterUi.selectedRowIds         ← undefined
  line 256: .selectedRowIds.length   ← TypeError during render
    ↓
Entire page subtree fails to commit → blank main column
```

### Expected exception (typically silent in production overlay)

```
TypeError: Cannot read properties of undefined (reading 'length')
    at RecruiterWorkspacePage (RecruiterWorkspacePage.jsx:256)
```

**Note:** User reported no console errors. Possible explanations (investigation only):
- Production build without dev overlay; error may be easy to miss in a noisy console
- Error filtered by browser devtools level
- "Blank" refers only to main content while header/nav render (partial shell visible)

Secondary latent throw if line 256 were fixed:

| Line | Expression | When |
|------|------------|------|
| 307 | `rowSelectionModel={recruiterUi.selectedRowIds}` | DataGrid receives undefined |
| 308–310 | `model.map(String)` | If selection callback fires |

---

## 10. Summary table

| Layer | Executes? | Renders visible output? | Blocking issue |
|-------|-----------|-------------------------|----------------|
| Router `/recruiter` | Yes | Yes | — |
| Suspense / Lazy | Yes | Spinner during load | — |
| ProtectedRoute | Yes | Yes | — |
| RecruiterWorkspaceLayout | Yes | Yes | — |
| WorkspaceLayout | Yes | AppHeader + NavRail | — |
| useRecruiterWorkspace | Yes | — | — |
| **RecruiterWorkspacePage** | **Partial** | **No** | **Line 256: `selectedRowIds.length`** |
| WorkspaceHeader | No | No | Parent render aborted |
| MetricSlab | No | No | Parent render aborted |
| RecruiterContextToolbar | No | No | Parent render aborted |
| EnterpriseDataGrid | No | No | Never reached |
| RecruiterInspector | No | No | Never reached |

---

## 11. Conformance to investigation constraints

- No code modified
- No fixes proposed
- Trace stops at first non-rendering component: **`RecruiterWorkspacePage:256`**
- Failure mode: **unhandled render exception**, not an intentional `return null`
