# Testing & Quality Assurance Strategy — SRE Platform

_QA Framework: Node.js 20+ Built-in `node:test` · CI: GitHub Actions · Coverage Scope: Core Logic, Security, APIs_

---

## 1. Testing Philosophy

The testing strategy prioritizes high-confidence, rapid verification of critical user journeys, financial/progression calculations, authentication rules, and API contracts.

```
       ▲
      / \     E2E / Workflow Verification (Critical signup, onboarding, tracking flows)
     /───\
    /     \   API Contract & Security Tests (Auth guards, cron validation, rate limits)
   /───────\
  /         \ Unit Tests (XP math, Level thresholds, Nutrition estimation, Database helpers)
 ─────────────
```

---

## 2. Test Execution Commands

```bash
# Run the automated test suite
npm test

# Run TypeScript type check (strict, zero errors)
npm run typecheck

# Run ESLint analysis
npm run lint

# Validate Prisma schema consistency
npx prisma validate
```

---

## 3. Test Suite Inventory

| Test File | Domain | Key Behaviors Verified |
|---|---|---|
| `tests/gamification.test.mjs` | Gamification & XP | Tiered level progression curve (Level 1-5 @ 300 XP, 6-10 @ 600 XP, 11-20 @ 1000 XP, 21+ @ 2000 XP), edge cases (0 XP, negative XP), Achievement unlock criteria matching. |
| `tests/nutrition.test.mjs` | Fitness & Nutrition | FSSAI milk variant nutrition integrity (Full Cream, Standardized, Toned, Double Toned, Skimmed), protein ratio thresholds, mathematical serving size scaling. |
| `tests/security-auth.test.mjs` | Security & RBAC | Guest mode rejection (`x-guest: true` returns 401), pass-through for authenticated calls, exact CRON_SECRET verification (rejection of empty/mismatched tokens). |
| `tests/api-config.test.mjs` | Deployment Architecture | Centralized API resolver behavior in unified edge proxy mode (relative URL) vs independent backend mode (custom origin prefixing). |

---

## 4. Continuous Integration Pipeline (GitHub Actions)

Every pull request and push to `main` executes `.github/workflows/ci.yml`. The job validates:
1. `npm ci` — Clean reproducible dependency tree.
2. `npx prisma validate` — Schema syntax and foreign key integrity.
3. `npx prisma generate` — Client generation without type errors.
4. `npm run lint` — ESLint rules.
5. `npm run typecheck` — Strict TypeScript checking without ignoring errors.
6. `npm test` — Automated test suite.
7. `npm run build` — Optimized production bundle build.

Pipelines are configured to fail if any step fails. Tests cannot be bypassed or marked with `continue-on-error`.

