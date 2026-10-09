# Requisitions Help Video — Timeline QA Report

Generated: 2026-10-08T05:19:13.430Z

## Creating a requisition (`req-create-basics.mp4`)

- Duration: **60.28s**
- Size: **1425687** bytes
- Raw video: 68.72s | Audio: 58.26s

| Timestamp | Narration (excerpt) | Screen | Sync | Reason |
|-----------|---------------------|--------|------|--------|
| 9.6–15.9s | Use the Talent Demand form on Requisitions to document a complete hir... | Talent Demand form | PASS | On-screen before audio; dwell 6.3s |
| 19.3–28.8s | General Information and Position Details cover title, openings, exper... | Role and skills | PASS | On-screen before audio; dwell 9.5s |
| 30.5–37.9s | Hiring Information sets hiring manager, work location, employment typ... | Hiring information | PASS | On-screen before audio; dwell 7.4s |
| 40.8–52.3s | In Approval, select an Approved Position and route. Save Draft keeps ... | Approval and actions | PASS | On-screen before audio; dwell 11.5s |
| 53.9–59.1s | Review every section on this form before you submit for approvers. | Form overview | PASS | On-screen before audio; dwell 5.2s |

**Interactions:** Scroll the Talent Demand form top-to-bottom; highlight Actions without clicking.
**Limitations:** Read-only; does not save, submit, or create. Dropdown values depend on demo data.

## Revision notes (req-create-basics)

- **Redundancy removed:** Narration no longer explains Approved Position catalogue, budget/headcount planning, or the recruitment gate (covered by `wp-approved-positions`).
- **Blank tail (v1):** Playwright webm (~`videoSeconds`) exceeded the narration timeline (`timelineEndSec`) by ~16s; mux kept full video and padded audio, yielding a silent frozen tail after ~47s.
- **Fix:** Lighter instant scrolls + post-trim to `timelineEndSec + 1.15s` in `recordRequisitionHelpVideo.mjs` (requisition producer only).

