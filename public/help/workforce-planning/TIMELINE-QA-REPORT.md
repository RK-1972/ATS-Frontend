# Workforce Planning Help Video — Timeline QA Report

Generated: 2026-10-04T12:31:31.598Z

For the dedicated QA report on **Approved Positions** (`wp-approved-positions.mp4`), see [TIMELINE-QA-APPROVED-POSITIONS.md](./TIMELINE-QA-APPROVED-POSITIONS.md).

## Workforce Planning Overview (`wp-overview.mp4`)

- Duration: **50.36s**
- Size: **2006663** bytes
- Raw video: 50.36s | Audio: 49.70s

| Timestamp | Narration (excerpt) | Screen | Sync | Reason |
|-----------|---------------------|--------|------|--------|
| 4.0–10.3s | Workforce Planning in Optalynx governs manpower and budget before rec... | Workforce Dashboard | PASS | On-screen before audio; dwell 6.3s |
| 14.1–21.1s | Manpower demand enters the process as budget requests—position, headc... | Budget requests | PASS | On-screen before audio; dwell 7.0s |
| 25.0–30.6s | Submitted requests move into the approval workspace for governed revi... | Approval Workspace | PASS | On-screen before audio; dwell 5.6s |
| 34.5–40.8s | Approved positions become the controlled gate from planning into recr... | Approved Positions | PASS | On-screen before audio; dwell 6.3s |
| 43.7–50.4s | Leadership monitors outcomes on the dashboard and in workforce analyt... | Analytics close | PASS | On-screen before audio; dwell 6.7s |

**Interactions:** Lifecycle tour; approval queue card select; catalogue scroll.
**Limitations:** Shallow map only; 2 catalogue cards in live demo.

## Budget Requests & Budget Exceptions (`wp-budget-requests-exceptions.mp4`)

- Duration: **66.60s**
- Size: **2928792** bytes
- Raw video: 66.60s | Audio: 65.86s

| Timestamp | Narration (excerpt) | Screen | Sync | Reason |
|-----------|---------------------|--------|------|--------|
| 4.1–10.8s | Budget Requests are where hiring managers document workforce demand b... | Budget requests | PASS | On-screen before audio; dwell 6.7s |
| 12.5–20.6s | Use New request to capture department, position, grade, headcount, pr... | New request dialog | PASS | On-screen before audio; dwell 8.1s |
| 22.5–29.3s | These fields give approvers a consistent view of business need, cost,... | Fields and purpose | PASS | On-screen before audio; dwell 6.8s |
| 31.3–39.1s | Status shows where each request sits in workflow, while justification... | Status and justification | PASS | On-screen before audio; dwell 7.8s |
| 42.1–49.6s | Budget Exceptions are separate: they track candidate offers that exce... | Budget Exceptions | PASS | On-screen before audio; dwell 7.5s |
| 51.2–58.6s | Pending, approved, and rejected exception rows show financial governa... | Exception statuses | PASS | On-screen before audio; dwell 7.4s |
| 59.2–66.4s | Exception governance protects approved budget while still allowing co... | Close | PASS | On-screen before audio; dwell 7.2s |

**Interactions:** Open New request dialog; table toggle; scroll exceptions.
**Limitations:** Large request list in demo DB; exceptions table 3 rows.

## Approval → Approved Position → Requisition (`wp-approval-position-requisition.mp4`)

- Duration: **75.36s**
- Size: **2582532** bytes
- Raw video: 75.36s | Audio: 74.14s

| Timestamp | Narration (excerpt) | Screen | Sync | Reason |
|-----------|---------------------|--------|------|--------|
| 3.8–9.4s | The Approval Workspace is where budget requests are reviewed after su... | Approval Workspace | PASS | On-screen before audio; dwell 5.6s |
| 10.4–16.6s | Approvers select a request from the queue to open details, timeline, ... | Select request | PASS | On-screen before audio; dwell 6.2s |
| 18.1–27.1s | Timeline and history document each decision—supporting approve, rejec... | Timeline and history | PASS | On-screen before audio; dwell 8.9s |
| 27.7–33.8s | Governed approval ensures only vetted manpower budget becomes recruit... | Governed approval | PASS | On-screen before audio; dwell 6.1s |
| 37.5–43.6s | Approved Positions in the catalogue show remaining budget and headcou... | Approved Positions | PASS | On-screen before audio; dwell 6.1s |
| 45.2–53.1s | Create Requisition is enabled when budget remains; disabled when head... | Create Requisition states | PASS | On-screen before audio; dwell 7.9s |
| 53.7–61.3s | When enabled, Create Requisition opens the Talent Demand Request work... | Create path | PASS | On-screen before audio; dwell 7.6s |
| 65.8–75.0s | On Talent Demand Request, recruiters manage workforce demand linked t... | Talent Demand Request | PASS | On-screen before audio; dwell 9.1s |

**Interactions:** Select queue item; compare Create requisition states; navigate to /requisitions.
**Limitations:** Does not submit approvals or create requisition API; 2 catalogue cards.

## Dashboard & Analytics (`wp-dashboard-analytics.mp4`)

- Duration: **78.00s**
- Size: **2148053** bytes
- Raw video: 78.00s | Audio: 77.37s

| Timestamp | Narration (excerpt) | Screen | Sync | Reason |
|-----------|---------------------|--------|------|--------|
| 3.4–9.4s | The Workforce Dashboard gives managers a real-time view of headcount ... | Workforce Dashboard | PASS | On-screen before audio; dwell 6.0s |
| 10.0–18.2s | Approved headcount, filled positions, and vacant roles show how much ... | KPIs | PASS | On-screen before audio; dwell 8.1s |
| 19.7–26.3s | Budget utilization compares consumed spend to total approved budget a... | Budget utilization | PASS | On-screen before audio; dwell 6.6s |
| 26.9–33.6s | The budget exception summary highlights offers that need financial re... | Exception summary | PASS | On-screen before audio; dwell 6.7s |
| 35.2–42.1s | Upcoming hiring lists near-term roles, departments, and targets align... | Upcoming hiring | PASS | On-screen before audio; dwell 6.9s |
| 45.2–53.6s | Workforce analytics adds decision support with budget versus actual, ... | Workforce analytics | PASS | On-screen before audio; dwell 8.4s |
| 54.3–60.2s | The budget trend chart shows monthly planned versus actual spend acro... | Budget trend | PASS | On-screen before audio; dwell 5.9s |
| 61.8–68.7s | Forecast and overspend risk panels flag whether the organization is t... | Forecast and overspend | PASS | On-screen before audio; dwell 6.9s |
| 70.3–78.1s | Department-wise utilization compares approved and consumed budget by ... | Department utilization | PASS | On-screen before audio; dwell 7.8s |

**Interactions:** Dashboard scroll sections; analytics chart scroll.
**Limitations:** Exception summary depends on dashboard bundle.
