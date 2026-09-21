# Actify — Gamification Rules & Mechanics

This document serves as the official rulebook and quantitative specification for the **Actify Execution Engine**. It details reputation scoring, user levels, failure calculations, streak preservation, and economic balancing.

---

## 1. Dual-Currency Economy

Actify separates social reputation from spendable purchasing power through a strict dual-currency design.

| Currency | Symbol | Primary Function | Transferability | Persistence |
| :--- | :---: | :--- | :---: | :---: |
| **ACT Points** | `⚡` | Reputation, Global Rank, Level Progression | Non-transferable | Immutable score (can be lost via penalties) |
| **ACT Currency** | `🪙` | Store purchases, Power-ups, Marketplace items | Fungible / Traded | Earned through milestones, bounties, and sales |

---

## 2. Progression Levels

A user's rank is determined by their execution consistency, completed tasks, and net reputation.

| Level | Title | Threshold Requirements | Privileges & Execution Profile |
| :---: | :--- | :--- | :--- |
| **L1** | **Inactive** | Default / `0–24` ACT Points | Access to basic mission generator; strict 1 task/day limit; no marketplace sales. |
| **L2** | **Active** | `25–99` ACT Points, Streak $\ge 3$ | Standard execution cap (2 tasks/day); ability to form accountability pairs. |
| **L3** | **Consistent** | `100–299` ACT Points, Streak $\ge 7$ | Dynamic task limit up to 3 tasks/day; unlocked group guild creation. |
| **L4** | **Executor** | `300–749` ACT Points, Streak $\ge 14$ | Access to mint & sell Verified Journeys in Marketplace; advanced analytics. |
| **L5** | **Operator** | `750+` ACT Points, Streak $\ge 30$ | Elite status badge; maximum daily capacity; custom protocol parameters. |

---

## 3. Reputation Point Ledger & Penalties

Reputation changes occur deterministically on task completion, review outcomes, or missed deadlines:

| Event | Point Delta | Streak Impact | Failure Counter |
| :--- | :---: | :---: | :---: |
| **Task Proof Accepted** | `+5 ACT Points` | `+1 Streak` | Unchanged |
| **Quiz Passed ($\ge 80\%$)** | `+5 ACT Points` | `+1 Streak` | Unchanged |
| **Proof Rejected (Code / Grammar)** | `-3 ACT Points` | Unchanged | `+1 Failure` |
| **Quiz Failed ($< 80\%$)** | `-3 ACT Points` | Unchanged | `+1 Failure` |
| **Anti-Cheat Violation (Tab Switched)** | `-3 ACT Points` | Unchanged | `+1 Failure` |
| **Missed Daily Deadline (Without Freeze)** | `-3 ACT Points` | **Reset to 0** | `+1 Failure` |
| **Goal Successfully Completed** | `+50 ACT Points` | Maintained | Unchanged |
| **Goal Terminated / Abandoned** | `-25 ACT Points` | Unchanged | `+1 Failure` |

---

## 4. Enforcement Metrics & Velocity Engine

Actify continuously measures real-time pacing via `lib/metrics.ts` to predict success probability and adapt execution limits.

### 4.1 Pace & Buffer Formulas

1. **Required Speed ($S_{req}$)**:
   $$S_{req} = \frac{\text{Total Tasks Remaining}}{\text{Days Remaining to Deadline}}$$

2. **Execution Speed ($S_{exec}$)**:
   $$S_{exec} = \frac{\text{Accepted Tasks}}{\text{Days Since Goal Inception}}$$

3. **Buffer Days ($B$)**:
   $$B = \frac{\text{Tasks Completed} - (S_{req} \times \text{Days Elapsed})}{S_{req}}$$
   - Positive $B$: User is running ahead of schedule.
   - Negative $B$: User is lagging behind schedule.

### 4.2 Risk Level Classification

$$\text{Probability} = \max(0, \min(100, 95 - (12 \times \text{Failures}) + (5 \times \text{Buffer Days})))$$

| Probability | Risk Level | Failure Margin | Dynamic Daily Limit |
| :---: | :---: | :---: | :---: |
| **$\ge 85\%$** | `LOW` | `SAFE` | Up to 4 tasks / day |
| **$70\% - 84\%$** | `MEDIUM` | `SAFE` or `CAUTION` | Up to 3 tasks / day |
| **$40\% - 69\%$** | `HIGH` | `CAUTION` | Up to 2 tasks / day |
| **$< 40\%$** | `CRITICAL` | `DANGER` | Strictly 1 task / day (Focus enforcement) |

---

## 5. Power-Up Mechanics & Inventory

Users can purchase operational buffers using spendable `actCurrency`:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        POWER-UP ARMORY MATRIX                          │
├───────────────────┬──────────────┬─────────────┬───────────────────────┤
│ Power-Up          │ Cost (ACT)   │ Trigger     │ Effect                │
├───────────────────┼──────────────┼─────────────┼───────────────────────┤
│ Liquid Freeze     │ 15 ACT       │ Automatic   │ Auto-consumed when a  │
│                   │              │ on missed   │ day is missed. Halts  │
│                   │              │ day check   │ penalty & preserves   │
│                   │              │             │ streak.               │
├───────────────────┼──────────────┼─────────────┼───────────────────────┤
│ Beyond ACT        │ 10 ACT       │ Automatic   │ Expands daily task    │
│                   │              │ on 4th task │ cap by +1 for the     │
│                   │              │ unlock      │ current calendar day. │
└───────────────────┴──────────────┴─────────────┴───────────────────────┘
```

### Liquid Freeze Fail-Safe Flow
1. User fails to complete any task by 23:59:59 local time.
2. Next morning, `checkDailyFailure()` runs during authentication.
3. If `freezeActCount > 0`:
   - System decrements `freezeActCount` by 1.
   - User receives notification: *"Liquid Freeze consumed! Streak preserved."*
   - Streak and points remain 100% intact.
4. If `freezeActCount == 0`:
   - System applies `-3 ACT Points` penalty.
   - Streak resets to `0`.
   - Failure count increments by 1.

---

## 6. Anti-Cheat Protocol & Integrity

To preserve leaderboard sanctity:
1. **Window Blur Detection**: Any attempt to tab out, switch applications, or inspect element while taking a quiz triggers the `isAntiCheatFail` signal.
2. **Cryptographic Answer Hashing**: Questions and answer keys are never stored in client state. Answers are signed into a tamper-proof JWT token.
3. **Session Replay Immunity**: Each quiz seed is tied to an explicit `proofId` and single-use expiration. Resubmitting an already graded quiz returns HTTP 400.
