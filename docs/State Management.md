# OPTALYNX State Management

## Technology: Zustand

Zustand was chosen because:

- **Single global singleton** — all four admin modules share state without provider nesting
- **Minimal boilerplate** — no actions/reducers/dispatch ceremony
- **Selective subscriptions** — components subscribe to slices, reducing re-renders
- **Works outside React** — audit and selector logic can run without hooks when needed
- **Preserves existing hook APIs** — module hooks remain the public interface for pages

## Store Location

`src/store/enterpriseStore.js`

Store actions delegate data mutations to **repositories** in `src/repositories/`. Repositories encapsulate pure state transformations and call API clients for transport. Components and hooks never import repositories directly.

```
Component → Hook → Store action → Repository → API Client → REST API
```

## State Domains

| Slice | Type | Description |
|-------|------|-------------|
| `platformConfig` | Data | Master configuration (modules, workflows, budget, notifications, AI, roles) |
| `platformConfigBaseline` | Data | Snapshot for discard |
| `platformConfigDirty` | UI | Unsaved changes flag |
| `businessRules` | Data | Rule library, approval matrix, KPIs, version history |
| `businessRulesBaseline` | Data | Snapshot for discard |
| `businessRulesDirty` | UI | Unsaved changes flag |
| `workforce` | Data | Dashboard, requests, queue, catalogue, exceptions, analytics |
| `hiringProcess` | Data | HCT stage statuses, timeline, linked position/requisition |
| `auditEvents` | Data | Unified enterprise audit log |
| `workforceUi` | UI | Selected request, toast |
| `hiringTowerUi` | UI | Selected stage, clarification form, toast |
| `businessRulesUi` | UI | Draft rule, simulation input/result |
| `masterData` | Data | Enterprise master data records by entity type |
| `masterDataUi` | UI | Drawer, filters, import preview, draft |

## Repository Layer

| Repository | Store slice(s) |
|------------|----------------|
| `masterDataRepository` | `masterData` |
| `platformConfigRepository` | `platformConfig` |
| `businessRulesRepository` | `businessRules` |
| `workflowConfigurationRepository` | `platformConfig.workflows` |
| `workforcePlanningRepository` | `workforce`, cross-updates `hiringProcess` |
| `hiringControlTowerRepository` | `hiringProcess` |
| `notificationsRepository` | `platformConfig.notification_*` |
| `auditRepository` | `auditEvents` |

## Selectors

`src/enterprise/selectors.js` builds derived views:

- `buildHiringControlTowerData(state)` — merges platform config, rules, workforce, and hiring process into the HCT view model
- `buildIntegrationChain()` — live integration pipeline labels
- `filterStageNotifications()` — respects enabled notification channels
- `mergeCandidateWorkflowStages()` — injects workflow stages from platform config

`src/store/storeSelectors.js` exports stable selector functions for hook subscriptions:

```javascript
import { selectPlatformConfig, selectAuditEvents } from "@/store/storeSelectors";
const config = useEnterpriseStore(selectPlatformConfig);
```

## Module Hooks

| Hook | Store slices consumed |
|------|----------------------|
| `usePlatformConfig` | `platformConfig`, `platformConfigDirty` + config actions |
| `useWorkforcePlanning` | `workforce`, `workforceUi` + workforce actions |
| `useBusinessRules` | `businessRules`, `businessRulesUi`, `platformConfig.budget` (simulator) |
| `useHiringControlTower` | Derived via `buildHiringControlTowerData` + `hiringTowerUi` |
| `useEnterpriseAudit` | `auditEvents` (optional module filter) |
| `useMasterData` | `masterData`, `masterDataUi`, filtered `auditEvents` |

Hooks remain thin adapters over the store. `useBusinessRules` reads designer defaults via `businessRulesRepository` instead of mock imports.

## Audit Pattern

Every significant store action calls `publishAudit(set, get, eventType, payload)`, which delegates record creation to `auditRepository.create()`:

```javascript
publishAudit(set, get, ENTERPRISE_EVENTS.BUDGET_APPROVED, {
  module: "Workforce Planning",
  entity: "Budget Request",
  entityId: id,
  action: `Budget approved for ${request.position}`,
  previousValue: request.status,
  newValue: "Approved",
  correlationId,
  metadata: { comment, stageKey: "position_budget_approval" }
});
```

Timeline deduplication: `buildHiringControlTowerData` merges `hiringProcess.timeline` and `auditEvents` by event ID.

## Re-render Guidelines

- Subscribe to **selectors**, not the entire store
- Derived HCT data is computed in `useMemo` inside `useHiringControlTower`
- UI-only slices (`*Ui`) are separate from data slices to limit propagation

## Dirty / Save Pattern

Platform Config and Business Rules use baseline snapshots:

- Mutations set `*Dirty = true`
- `save*()` commits baseline and clears dirty flag + publishes audit
- `discard*()` restores from baseline
