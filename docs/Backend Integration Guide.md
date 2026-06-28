# Backend Integration Guide

This guide describes how to connect OPTALYNX enterprise modules to PostgreSQL-backed Express REST APIs without changing React components or page layouts.

## Architecture

```
React Component
      ↓
   Hook (usePlatformConfig, useMasterData, …)
      ↓
Enterprise Store (Zustand — UI state + orchestration)
      ↓
Repository Layer (src/repositories/)
      ↓
API Client Layer (src/api/clients/)
      ↓
HTTP Client (src/api/httpClient.js → axios)
      ↓
Express REST API
      ↓
PostgreSQL
```

Components and hooks **never** call Axios directly for enterprise modules. The store delegates all data mutations to repositories; repositories delegate transport to API clients.

## API Mode

Set the Vite environment variable to control transport:

| Variable | Values | Default |
|----------|--------|---------|
| `VITE_API_MODE` | `mock` \| `live` | `mock` |
| `VITE_API_BASE_URL` | Express server URL | `http://localhost:5000` |

In **mock** mode, API clients resolve immediately with seed data from `src/data/mock/`. In **live** mode, clients use `GET` / `POST` / `PUT` / `DELETE` via the shared Axios instance.

## Repository Modules

| Repository | API Client | Store slice | REST prefix |
|------------|------------|-------------|-------------|
| `masterDataRepository` | `masterDataClient` | `masterData` | `/api/v1/master` |
| `platformConfigRepository` | `platformConfigClient` | `platformConfig` | `/api/v1/platform-config` |
| `businessRulesRepository` | `businessRulesClient` | `businessRules` | `/api/v1/business-rules` |
| `workflowConfigurationRepository` | `workflowConfigurationClient` | `platformConfig.workflows` | `/api/v1/workflows` |
| `workforcePlanningRepository` | `workforcePlanningClient` | `workforce` | `/api/v1/workforce` |
| `hiringControlTowerRepository` | `hiringControlTowerClient` | `hiringProcess` | `/api/v1/hiring-control-tower` |
| `notificationsRepository` | `notificationsClient` | `platformConfig.notification_*` | `/api/v1/notifications` |
| `auditRepository` | `auditClient` | `auditEvents` | `/api/v1/audit` |

Each repository exposes a consistent contract:

- `getAll()`
- `getById()`
- `create()`
- `update()`
- `publish()`
- `archive()`
- `delete()`

Domain-specific helpers (e.g. `approveBudgetRequest`, `saveMasterRecord`) live alongside these methods and are called by store actions today.

## Migration Steps (per domain)

### 1. Implement Express routes + PostgreSQL tables

Map frontend shapes to database tables. Master Data entity paths are pre-defined in `src/enterprise/masterDataConstants.js` (`ENTITY_API_MAP`).

### 2. Wire the API client

In `src/api/clients/<domain>Client.js`, the live branch already calls `httpGet` / `httpPost` / `httpPut` / `httpDelete`. Verify request/response DTOs match the backend.

Example — Master Data create:

```javascript
// Already structured in masterDataClient.js
create(entityType, record) {
  return httpPost(
    masterEntityEndpoint(entityType),
    record,
    () => cloneData(record)   // mock handler — remove dependency once live is stable
  );
}
```

### 3. Keep repositories as the mapping layer

If backend DTOs differ from store shapes, transform in the repository — not in components:

```javascript
async function getAll() {
  const dto = await masterDataClient.getAll();
  return mapMasterDataDtoToStore(dto);
}
```

### 4. Optional — async store hydration

Store actions are synchronous today. When loading from the network on app boot:

```javascript
// Future pattern in enterpriseStore or a bootstrap module
const masterData = await masterDataRepository.getAll();
useEnterpriseStore.setState({ masterData });
```

Hooks continue reading from the store unchanged.

### 5. Audit persistence

`auditRepository.create()` currently appends to in-memory `auditEvents`. In live mode, `auditClient.create()` will POST to `/api/v1/audit`; the store still receives the returned record for immediate UI display.

## File Locations

```
src/
├── api/
│   ├── axios.jsx              # Shared JWT-aware Axios instance
│   ├── config.js              # VITE_API_MODE, base URL
│   ├── endpoints.js           # REST path constants
│   ├── httpClient.js          # mock/live switch
│   └── clients/               # One client per domain
├── repositories/              # Data access + pure mutations
├── store/
│   └── enterpriseStore.js     # Orchestration + audit publishing
├── hooks/                     # Component-facing adapters
└── data/mock/                 # Seed data (mock mode only)
```

## Testing the Switch

1. Start Express backend on port 5000.
2. Set `VITE_API_MODE=live` in `.env.local`.
3. Run `npm run dev` — enterprise modules will call REST endpoints.
4. Components and hooks require **no changes**.

## Legacy ATS Pages

Candidate, Requisition, User Management, and other legacy pages still import `src/api/axios.jsx` directly. They can be migrated to domain clients incrementally using the same pattern.

## Related Documentation

- [Enterprise Architecture](./Enterprise%20Architecture.md) — layer diagram and module overview
- [State Management](./State%20Management.md) — store slices and hook patterns
- [Folder Structure](./Folder%20Structure.md) — directory reference
