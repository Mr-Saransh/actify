# Actify — API & Server Actions Reference

This document provides a comprehensive technical reference for all **Server Actions** and **HTTP Route Handlers** in Actify.

---

## 1. HTTP Route Handlers

### 1.1 `POST /api/quiz/generate`
Generates a dynamic 5-question multiple choice quiz using Google Gemini based on the submitted proof and objective.

- **Authentication**: Requires authenticated session.
- **Request Body**:
  ```json
  {
    "proofId": "string (UUID)"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "questions": [
      {
        "id": 0,
        "question": "What is the primary role of React useEffect?",
        "options": ["Manage side effects", "Render JSX", "Style components", "Compile TypeScript"]
      }
    ],
    "token": "string (JWT signed answer payload)"
  }
  ```
- **Security**: The correct answer key is hashed and signed into an HTTP-only verifiable JWT token. Answers are never returned unencrypted to the client.

---

### 1.2 `POST /api/quiz/grade`
Grades user quiz answers against the encrypted JWT token payload, verifying score thresholds and anti-cheat compliance.

- **Authentication**: Requires authenticated session.
- **Request Body**:
  ```json
  {
    "proofId": "string (UUID)",
    "userAnswers": [
      { "id": 0, "answer": "Manage side effects" }
    ],
    "token": "string (JWT token)",
    "isAntiCheatFail": false
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "passed": true,
    "score": 100,
    "message": "⚡ Quiz Passed! Score: 100%. +5 ACT Points."
  }
  ```
- **Grading Logic**:
  - Minimum passing grade is **80%** (4 out of 5 questions correct).
  - Passing yields `+5 actPoints` and marks proof/task as `ACCEPTED`.
  - Failure yields `-3 actPoints`, `+1 failure`, and resets task to `REJECTED`.
  - `isAntiCheatFail: true` immediately terminates quiz, applies `-3 actPoints` penalty, and logs an anti-cheat violation.

---

### 1.3 `GET /api/chat/stream`
Long-lived Server-Sent Events (SSE) route delivering real-time direct messages and guild channel messages.

- **Authentication**: Verified via Clerk `getAuth(request)`.
- **Response Headers**:
  - `Content-Type: text/event-stream`
  - `Cache-Control: no-cache, no-transform`
  - `Connection: keep-alive`
- **Stream Events**:
  - `connected`: Initial handshake containing `userId`.
  - `message`: Incoming direct message matching `receiverId`.
  - `groupMessage`: Incoming guild message matching joined `groupId`.

---

## 2. Server Actions Reference

Actify leverages Next.js Server Actions under `app/actions/*` for type-safe, RPC-like client-to-server data mutations.

### 2.1 Mission & Goal Actions (`app/actions/mission.ts` & `goal.ts`)

#### `generateMissionPlans(statement, category, deadline, timePerDay, experienceLevel, description)`
- **Purpose**: Feasibility calculation and Gemini 2.0 generation of three customized execution blueprints.
- **Parameters**:
  - `statement`: Goal title/objective string.
  - `category`: Domain tag (`Coding`, `Music`, `Language`, `Fitness`, `Writing`, `General`).
  - `deadline`: ISO string representation of target finish date.
  - `timePerDay`: Allocated daily focus minutes (e.g. 30, 60, 120).
  - `experienceLevel`: Current baseline (`Beginner`, `Intermediate`, `Advanced`).
  - `description`: Optional long-form context.
- **Returns**: `{ analysis: MissionAnalysis, plans: MissionPlan[] }`

#### `suggestMilestoneSplit(title, description, duration)`
- **Purpose**: AI helper to partition large milestones into discrete sub-milestones with reduced scope and hour estimates.
- **Returns**: `{ success: boolean, milestones?: MilestonePlan[], message?: string }`

#### `approveMission(goalData, selectedPlan)`
- **Purpose**: Commits the chosen mission plan, initializes the goal in PostgreSQL, creates all milestones, and unlocks the Day 1 task.
- **Returns**: `{ success: boolean, goalId?: string, message?: string }`

#### `terminateGoal(goalId)`
- **Purpose**: Emergency user bailout to archive or abandon an active goal.
- **Side Effect**: Calculates failure metrics and revalidates `/dashboard`.

---

### 2.2 Task & Proof Actions (`app/actions/task.ts` & `proof.ts`)

#### `submitProof(taskId, formData)`
- **Purpose**: Primary proof-of-work submission handler.
- **Form Data Fields**:
  - `explanation`: Detailed textual overview of work completed (minimum 10 characters).
  - `content`: Link to live demo, repository, pull request, or written deliverable.
  - `image`: Optional file upload (max 2MB, converted to base64 or stored).
- **Validation Routing**:
  - Category `Learning` / `Reading` -> sets `PENDING_QUIZ`.
  - Category `Project` -> invokes automated code heuristics.
  - Category `Writing` -> runs grammar & length checks.
  - Category `Fitness` -> validates telemetry attachment.
- **Returns**: `{ success: boolean, message: string, requiresQuiz?: boolean, proofId?: string }`

#### `getCurrentLevelTask(goalId)`
- **Purpose**: Retrieves the currently active task for the specified goal, verifying unlock order and date constraints.

#### `proceedToNextTask(taskId)`
- **Purpose**: Progresses the goal pointer to the next sequential task upon successful acceptance of the previous day's submission.

#### `generateNextTask(goalId)`
- **Purpose**: AI-powered dynamic task generator that generates subsequent daily tasks contextualized by recent performance and milestone order.

---

### 2.3 Daily Enforcement Actions (`app/actions/daily-check.ts` & `enforcement.ts`)

#### `checkDailyFailure()`
- **Purpose**: Executed on dashboard render to evaluate if the user missed yesterday's execution commitment.
- **Logic**:
  1. Checks if `lastCompletionDate` occurred before yesterday.
  2. If missed and user owns `freezeActCount > 0`, auto-consumes 1 Liquid Freeze to preserve streak.
  3. If missed without Freeze, decrements `actPoints` by 3, increments `failures` by 1, and resets `streak` to 0.

#### `checkDailyDeadlines(userId)`
- **Purpose**: Scans for active tasks whose `deadline` timestamp has elapsed without a submitted proof. Flags expired tasks as `FAILED`.

#### `checkAndEnforceFailures(userId)`
- **Purpose**: Computes aggregate failure count and updates user level if failure thresholds exceed acceptable boundaries.

---

### 2.4 Power-Ups & Economy Actions (`app/actions/powerups.ts` & `store.ts`)

#### `useBeyondAct()`
- **Purpose**: Validates ownership of Beyond ACT power-up and authorizes expansion of the daily task cap from standard limit to +1 extra task for the day.
- **Returns**: `{ success: boolean, message: string }`

#### `getPowerUpCounts()`
- **Purpose**: Returns the user's active inventory of Liquid Freezes and Beyond ACT power-ups.
- **Returns**: `{ freezeCount: number, beyondCount: number }`

#### `purchaseStoreItem(itemId)`
- **Purpose**: Atomically debits user's `actCurrency` balance and increments inventory count (`freezeActCount` or `beyondActCount`).

---

### 2.5 Marketplace Actions (`app/actions/marketplace.ts`)

#### `createListing(formData)`
- **Purpose**: Lists a new template, resource, or verified journey on the community exchange.
- **Fields**: `title`, `description`, `price` (in ACT Currency), `category`, `imageFile`.
- **Returns**: `{ success: boolean, listing?: MarketplaceListing, message?: string }`

#### `purchaseListing(listingId)`
- **Purpose**: Transfers `actCurrency` from buyer to seller, granting immediate access to journey snapshots or downloadable resources.

#### `publishJourney(goalId, price, title, description)`
- **Purpose**: Packages a 100% completed goal, including all accepted milestones and verified task proofs, into a mintable Journey template.

---

### 2.6 Chat & Social Network Actions (`app/actions/chat.ts` & `network.ts`)

#### `sendMessage(receiverId, content, type, metadata)`
- **Purpose**: Dispatches direct message to a peer; triggers notification and SSE stream event.

#### `sendGroupMessage(groupId, content, type, metadata)`
- **Purpose**: Broadcasts message to all members in a collaborative execution guild.

#### `sendFriendRequest(targetEmailOrId)`
- **Purpose**: Initiates bilateral accountability relationship.

#### `respondFriendRequest(requestId, action: 'ACCEPTED' | 'REJECTED')`
- **Purpose**: Finalizes friend request and instantiates mutual connection.
