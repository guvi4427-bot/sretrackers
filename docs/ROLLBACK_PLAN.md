# Production Rollback & Incident Recovery Plan

_Emergency Operational Procedures for SRE Platform Deployments_

---

## 1. Rollback Strategy Matrix

| Failure Scenario | Target Component | Rollback Method | Estimated Recovery Time |
|---|---|---|---|
| **Bad Frontend Build / Runtime Exception** | Vercel Frontend | **Instant Instant Rollback** via Vercel Dashboard (1-click to promote previous working deployment). | < 30 seconds |
| **Backend API Crash / Container Failure** | Hostless Backend | **Revert Git Commit** or select previous release commit in Hostless deployment history. | 1 - 2 minutes |
| **Database Schema Incompatibility** | Neon PostgreSQL | Restore database state from latest pre-deployment backup via `scripts/restore-db.sh` or Neon Point-In-Time Restore (PITR). | 3 - 5 minutes |
| **Invalid Secret Configuration** | Vercel / Hostless | Update environment variable key in respective dashboard and trigger instant redeploy without rebuild. | < 1 minute |

---

## 2. Step-by-Step Rollback Procedures

### A. Vercel Frontend Rollback
1. Open [Vercel Dashboard](https://vercel.com) → Navigate to project `sre-platform`.
2. Go to **Deployments** tab.
3. Locate the last known good deployment (marked with green status).
4. Click the three dots `...` → Select **Instant Rollback**.
5. Traffic is immediately redirected to the previous immutable deployment artifact at the edge.

### B. Hostless Backend Rollback
1. Open [Hostless Dashboard](https://hostless.cloud) → Select your App resource.
2. In the **Deployments** history, identify the prior healthy deployment hash.
3. Click **Redeploy** or roll back to previous deployment.
4. Verify `/api/health` returns status `ok`.

### C. Neon Database Point-in-Time Recovery (PITR)
Neon automatically records WAL logs for point-in-time recovery:
1. In the Neon Console, select your database branch.
2. Click **Reset / Restore** → Choose timestamp right before the failed migration was run.
3. Alternatively, restore from an existing `.dump` file:
   ```bash
   ./scripts/restore-db.sh backups/sre_backup_PRE_DEPLOY.dump
   ```

---

## 3. Post-Incident Review Protocol
Following any production rollback:
1. File an incident entry in `docs/BUG_TRACKER.md`.
2. Reproduce the failure in a staging environment.
3. Add a dedicated regression test in `tests/` before attempting redeployment.

