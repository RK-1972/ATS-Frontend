# Wave 1 Design Review — Screenshot Checklist

Capture these screens at **1920×1080** after starting the backend with seeds and frontend in live mode.

## Setup

```bash
# Terminal 1
cd ats-backend
npm start

# Terminal 2
cd ats-frontend
# .env: VITE_API_MODE=live, VITE_API_BASE_URL=http://localhost:5000
npm run dev
```

Log in as a Recruiter user.

## Screens to Capture

| # | Screen | URL | Filename |
|---|--------|-----|----------|
| 1 | Recruiter Workspace — Requisitions | `/recruiter` | `01-recruiter-requisitions.png` |
| 2 | Recruiter Workspace — Pipeline tab | `/recruiter` (toggle Pipeline) | `02-recruiter-pipeline.png` |
| 3 | Inspector Drawer — Requisition | Click a requisition row | `03-recruiter-inspector-requisition.png` |
| 4 | Inspector Drawer — Candidate | Pipeline tab, click row | `04-recruiter-inspector-candidate.png` |
| 5 | Task Summary panel | `/recruiter` (right pane) | `05-recruiter-tasks.png` |
| 6 | Activity Timeline | `/recruiter` (bottom section) | `06-recruiter-activity.png` |
| 7 | Workspace Picker | `/workspace` (dual-role user) | `07-workspace-picker.png` |
| 8 | Navigation Rail | `/recruiter` (left rail visible) | `08-recruiter-nav-rail.png` |

Save files to this directory: `docs/wave1-screenshots/`

## Review Criteria

- Dense MD3 layout (no oversized cards or whitespace)
- Consistent typography and spacing from design tokens
- KPI slab and command bar visible without scrolling on 1080p
- Inspector drawer opens from grid selection
- Enterprise Store data visible (not legacy axios dashboard)
