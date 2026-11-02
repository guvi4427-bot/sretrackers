# SRE Design System & UI/UX Standards

_Brand Identity: Start · Restart · Explore · Clean, Minimalist & Focused Self-Growth_

---

## 1. Design Direction & Core Philosophy

The SRE platform avoids generic AI SaaS templates (excessive neon glows, saturated purple gradients, oversized pill cards). Instead, it adopts a **refined, high-density, utility-focused interface** inspired by modern engineering software (Linear, Notion, GitHub).

### Design Rules:
1. **Restrained Color Palettes:** A deep slate/navy foundation with purposeful semantic accents.
2. **High Readability & Typography Scale:** Strict typographic hierarchy using Geist Sans and Geist Mono.
3. **Purposeful Visual Hierarchy:** Data density where users track habits and workouts; breathing room where users reflect and plan.
4. **No Artificially Inflated Metric Cards:** Numbers reflect verified database counts and genuine progression calculations.

---

## 2. Color Tokens

### Base Theme
- **Light Background:** `#F8FAFC` (Slate 50)
- **Dark Background:** `#0B1120` (Deep Navy Slate)
- **Card Surfaces:**
  - Light: `rgba(255, 255, 255, 0.85)` with border `rgba(226, 232, 240, 0.8)`
  - Dark: `rgba(15, 23, 42, 0.80)` with border `rgba(30, 41, 59, 0.8)`

### Semantic Accents
| Token | Hex | Usage |
|---|---|---|
| `--color-blue-primary` | `#2563EB` | Primary interactive buttons, active tab indicators, links |
| `--color-gold` / `--color-xp` | `#D4A017` / `#F59E0B` | Strictly reserved for XP awards, achievement badges, and milestone unlocks |
| `--color-streak` | `#EF4444` | Active streak counts and urgent notifications |
| `--color-rank` | `#8B5CF6` | Community leaderboard rank position badges |
| `--color-success` | `#10B981` | Completed tasks, logged workouts, protein targets met |

---

## 3. Typography Hierarchy

| Level | Size | Weight | Tracking | Usage |
|---|---|---|---|---|
| **Display / Page Title** | `1.875rem` (30px) - `2.25rem` (36px) | Bold (`700`) | `-0.025em` | Top-level dashboard headers |
| **Section Heading** | `1.25rem` (20px) - `1.5rem` (24px) | Semibold (`600`) | `-0.015em` | Module section headings |
| **Card Heading** | `1.0rem` (16px) - `1.125rem` (18px) | Semibold (`600`) | `normal` | Task titles, workout exercise titles |
| **Body Text** | `0.875rem` (14px) | Normal (`400`) | `normal` | Feed updates, descriptions, inputs |
| **Captions / Meta** | `0.75rem` (12px) | Medium (`500`) | `0.025em` | Timestamps, macro numbers, tags |

---

## 4. Reusable UI Components

- **`GlassCard` (`src/components/glass-card.tsx`):** Surface component with subtle blur and crisp borders. Supports variant sizing (`default`, `sm`, `intense`, `deep`).
- **`AppShell` (`src/components/app-shell.tsx`):** Persistent navigation shell providing responsive sidebar for desktop and bottom bar for mobile.
- **`XPBar` (`src/components/xp-bar.tsx`):** Smooth progress bar displaying progress toward next level.
- **`StreakBadge` (`src/components/streak-badge.tsx`):** Visual indicator of consecutive active days.
- **`AchievementBadge` (`src/components/achievement-badge.tsx`):** Four-tier visual badges (Bronze, Silver, Gold, Platinum).
- **`MacroBar` (`src/components/macro-bar.tsx`):** Progress meter for daily protein, carbs, and fat intake vs target goals.

---

## 5. Mobile Responsiveness & Accessibility

- **Mobile Navigation:** Bottom navigation bar for core screens (Home, Feed, Trackers, AI Hub, Profile) ensures one-thumb reachability on handheld screens.
- **Touch Targets:** All clickable interactive elements (buttons, inputs, select pills) maintain minimum touch target height of 40px–44px.
- **Keyboard Navigation & ARIA:** Dialogs, dropdowns, and modals use Radix UI primitives (`@radix-ui/react-*`) ensuring focus traps, Esc key handling, and ARIA attributes out of the box.

