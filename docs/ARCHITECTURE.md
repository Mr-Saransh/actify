# Actify — Technical Architecture & System Design

This document provides an exhaustive, in-depth architectural breakdown of **Actify**, the AI Execution Operating System. It outlines the core subsystems, communication protocols, state machines, database transaction patterns, and AI pipelines.

---

## 1. High-Level System Architecture

Actify is built on modern full-stack web standards combining **Next.js 16 (App Router)** with server-side execution enforcement, deterministic AI validation via **Google Gemini**, and real-time push updates via **Server-Sent Events (SSE)**.

```mermaid
flowchart TB
    subgraph Client["Client Tier (Web Browser)"]
        UI["React 19 + Tailwind CSS v4 UI"]
        Framer["Framer Motion & GSAP Animations"]
        DnD["@dnd-kit (Milestone Reordering)"]
        SSEClient["SSE Stream Listener (Chat & Alerts)"]
    end

    subgraph Auth["Identity & Access Management"]
        Clerk["Clerk Auth Service"]
        Middleware["Next.js Edge Middleware (Auth Guard)"]
    end

    subgraph AppServer["Application Tier (Next.js 16 Server)"]
        SA["Server Actions (/app/actions/*)"]
        RH["Route Handlers (/api/*)"]
        AI_Eng["AI Execution Engine (Gemini 2.0 SDK)"]
        Enforce["Daily Enforcement Engine & Metrics"]
        QuizAuth["JWT Signing & Anti-Cheat Subsystem"]
    end

    subgraph DataStorage["Data & State Persistence"]
        Prisma["Prisma ORM Client (Accelerate/PgBouncer)"]
        Postgres[(PostgreSQL Database)]
        Cloudinary["Cloudinary CDN (Proof & Asset Storage)"]
    end

    %% Interactions
    Client -->|Session Token| Middleware
    Middleware -->|Protected Request| AppServer
    UI -->|Invoke Mutations| SA
    UI -->|Fetch Streaming| RH
    SSEClient <-->|SSE Long-Lived Stream| RH
    SA --> AI_Eng
    RH --> AI_Eng
    SA --> Enforce
    SA --> Prisma
    RH --> Prisma
    Prisma --> Postgres
    SA -->|Direct Media Upload| Cloudinary
```

---

## 2. Core Subsystems

### 2.1 AI Execution Engine & Blueprint Pipeline

The AI engine converts abstract human intentions into concrete, structured, and sequentially enforced roadmaps.

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant Web as Next.js Client
    participant Action as Server Action (mission.ts)
    participant Gemini as Google Gemini 2.0 API
    participant DB as Prisma (PostgreSQL)

    User->>Web: Inputs Goal, Deadline, Daily Time, Experience
    Web->>Action: generateMissionPlans(params)
    Action->>Action: Compute Available Hours & Validate Feasibility
    Action->>Gemini: Prompt with Structured Zod Schema
    Note over Gemini: Analyzes Scope & Generates 3 Plans:<br/>Execution Sprint, Strategic, Mastery
    Gemini-->>Action: Returns Structured JSON Blueprint
    Action-->>Web: Displays Interactive Plans & DnD Editor
    User->>Web: Reorders/Splits Milestones & Approves
    Web->>Action: approveMission(planId, milestones)
    Action->>DB: Atomically Creates Goal & Milestone Records
    Action->>Action: Trigger generateNextTask() for Day 1
    DB-->>Web: Redirects to /dashboard/mission/overview
```

#### Blueprint Generation Strategy
1. **Feasibility Analysis**: Calculates total available hours based on user's target deadline and stated daily availability:
   $$\text{Available Hours} = \left\lceil \frac{\text{Deadline} - \text{Today}}{86,400,000 \text{ ms}} \right\rceil \times \left( \frac{\text{Time Per Day}}{60} \right)$$
2. **Three Strategic Protocols**:
   - **Execution Sprint**: High velocity, compressed timeline, high intensity.
   - **Strategic Execution**: Balanced pacing with structured milestones and moderate risk buffers.
   - **Mastery Protocol**: Comprehensive depth, maximum rigor, and zero compromise on foundational prerequisites.
3. **Structured Output Enforcement**: Validated against `MultiplePlansResponseSchema` to guarantee strict JSON output conforming to typed milestone structures.

---

### 2.2 Proof-of-Work Verification Engine

Actify eliminates subjective self-reporting by validating proof through category-specific verification pipelines.

```mermaid
stateDiagram-v2
    [*] --> LOCKED : Task Scheduled
    LOCKED --> ACTIVE : Day Index Reached & Previous Task Accepted
    ACTIVE --> SUBMITTED : Proof Uploaded (Text/Link/Image)
    
    state SUBMITTED {
        [*] --> CategoryRouter
        CategoryRouter --> Learning : Category = Learning/Reading
        CategoryRouter --> Project : Category = Project
        CategoryRouter --> Writing : Category = Writing
        CategoryRouter --> Fitness : Category = Fitness
        
        Learning --> PENDING_QUIZ : Generate Anti-Cheat Quiz
        Project --> AI_CodeReview : Verify Repository / Code Details
        Writing --> AI_Grammar : Evaluate Explanation & Content
        Fitness --> MetricAudit : Check Image / Telemetry Link
    }

    PENDING_QUIZ --> ACCEPTED : Quiz Passed (Score >= 80%)
    PENDING_QUIZ --> REJECTED : Quiz Failed or Anti-Cheat Fired
    AI_CodeReview --> ACCEPTED : Pass Criteria Met
    AI_CodeReview --> REJECTED : Insufficient Details
    AI_Grammar --> ACCEPTED : Pass Criteria Met
    AI_Grammar --> REJECTED : Poor Phrasing / Low Depth
    MetricAudit --> ACCEPTED : Valid Proof Image/URL
    MetricAudit --> REJECTED : Missing Metrics

    ACCEPTED --> [*] : +5 ACT Points, +1 Streak, Unlock Next
    REJECTED --> ACTIVE : -3 ACT Points, +1 Failure, Retry Enabled
    ACTIVE --> FAILED : Daily Deadline Expired (-3 Points, Reset Streak)
    FAILED --> [*]
```

#### Verification Categories
- **`Learning` / `Reading` / `Research`**: Routes to `PENDING_QUIZ`. The system calls `/api/quiz/generate` to synthesize 5 rigorous Multiple-Choice Questions (MCQs) directly from the user's explanation and task objective. Answers are encrypted in a signed JWT token sent to the client.
- **`Project`**: Routes to automated code review heuristics checking commit evidence, architectural explanation depth, and repository URLs.
- **`Writing`**: Evaluates syntactical coherence, vocabulary depth, and structural completion against minimum length constraints.
- **`Fitness`**: Enforces verifiable telemetry (workout tracker screenshot, GPS pace graph, or wearable metric link).

---

### 2.3 Anti-Cheat Quiz Architecture

To guarantee the authenticity of user learning, Actify implements an anti-cheat quiz pipeline:

```mermaid
sequenceDiagram
    autonumber
    participant Client as User Browser
    participant GenRoute as /api/quiz/generate
    participant Gemini as Gemini AI
    participant GradeRoute as /api/quiz/grade
    participant DB as Prisma PostgreSQL

    Client->>GenRoute: POST { proofId }
    GenRoute->>DB: Fetch Task Objective & Proof Explanation
    GenRoute->>Gemini: Generate 5 MCQs based on user proof
    Gemini-->>GenRoute: 5 MCQs + Correct Answers
    GenRoute->>GenRoute: Sign Correct Answers with JWT (HS256)
    GenRoute-->>Client: Questions (without answers) + Encrypted JWT Token

    Note over Client: User takes quiz.<br/>Tab-blur or window minimize fires Anti-Cheat!

    alt Anti-Cheat Triggered (Tab Switched)
        Client->>GradeRoute: POST { proofId, isAntiCheatFail: true }
        GradeRoute->>DB: Apply Penalty (-3 ACT Points, Status: REJECTED)
        GradeRoute-->>Client: 400 Anti-Cheat Protocol Triggered
    else Legitimate Submission
        Client->>GradeRoute: POST { proofId, userAnswers, token }
        GradeRoute->>GradeRoute: Verify JWT signature & answer match
        alt Score >= 80% (4/5 correct)
            GradeRoute->>DB: Accept Task, +5 ACT Points, +1 Streak
            GradeRoute-->>Client: Passed (Score >= 80%)
        else Score < 80%
            GradeRoute->>DB: Reject Task, -3 ACT Points, +1 Failure
            GradeRoute-->>Client: Failed
        end
    end
```

---

### 2.4 Real-Time SSE Streaming Infrastructure

Rather than utilizing heavyweight WebSocket daemons, Actify implements **HTTP Server-Sent Events (SSE)** via Next.js Route Handlers (`/api/chat/stream`).

#### Key Characteristics
1. **Clerk Token Verification**: Authenticates connection using `getAuth(request)`.
2. **Native `ReadableStream`**: Emits events to browser clients with low latency and automatic backpressure management.
3. **Multi-Channel Dispatch**: Interleaves direct peer-to-peer messages (`Message`) and collaborative guild messages (`GroupMessage`).
4. **Heartbeat & Reconnection**: Periodic polling check against high-watermark timestamps (`lastCheck`).

---

### 2.5 Dual-Currency Economic Subsystem

```mermaid
graph LR
    subgraph Execution["Execution Performance"]
        TaskWin["Task Accepted (+5)"]
        TaskFail["Task Failed/Rejected (-3)"]
        DailyComp["Daily Streak (+1)"]
    end

    subgraph Currencies["Dual-Currency Ledger"]
        Reputation["actPoints (Reputation & Rank)<br/>• Non-transferable<br/>• Dictates Level (L1 to L5)<br/>• Powers Global Leaderboard"]
        Currency["actCurrency (Liquid Capital)<br/>• Spendable in Store & Marketplace<br/>• Earned via Milestones & Trades<br/>• Used for Power-Ups & Merch"]
    end

    subgraph Sinks["Capital Outlets"]
        Store["Protocol Store<br/>• Liquid Freeze (15 ACT)<br/>• Beyond ACT (10 ACT)"]
        Market["Marketplace<br/>• Buy Verified Journeys<br/>• Developer Templates"]
    end

    TaskWin --> Reputation
    TaskWin --> Currency
    TaskFail -.->|Penalty Deductions| Reputation
    Currency --> Store
    Currency --> Market
```

---

## 3. Database Transaction & Concurrency Model

All operations altering user points, streaks, or task states execute inside atomic **Prisma transactions** (`prisma.$transaction`).

```typescript
// Pattern: Atomic Proof Verification and Level/Currency Settlement
await prisma.$transaction(async (tx) => {
    // 1. Update Proof Record
    await tx.proof.upsert({
        where: { taskId },
        create: { taskId, content, explanation, reviewStatus: "ACCEPTED" },
        update: { content, explanation, reviewStatus: "ACCEPTED" }
    });

    // 2. Transition Task State
    await tx.task.update({
        where: { id: taskId },
        data: { state: "ACCEPTED" }
    });

    // 3. Increment User Progression & Points Atomically
    await tx.user.update({
        where: { id: userId },
        data: {
            streak: { increment: 1 },
            actPoints: { increment: 5 },
            tasksCompleted: { increment: 1 },
            lastCompletionDate: new Date(),
            dailyTaskCompleted: true
        }
    });
});
```

This guarantees:
- **Zero Drift**: Points and completion counts never fall out of sync with task states.
- **Race Resistance**: Multiple submissions or concurrent webhooks cannot duplicate rewards or double-consume power-ups.
- **Audit Consistency**: Daily deadline enforcement (`checkDailyFailure`) seamlessly falls back on `lastCompletionDate` timestamps.

---

## 4. Performance & Deployment Architecture

- **Static Generation & Dynamic Edge Routing**: Static landing pages with dynamic, session-authenticated dashboard routes.
- **Font & Asset Optimization**: Vercel `@next/font` with Geist Sans and Geist Mono font sub-setting.
- **Image Pipeline**: Cloudinary CDN dynamic resizing and caching with base64 image optimization.
- **Database Connection Pooling**: PostgreSQL session pooling via PgBouncer (`POSTGRES_PRISMA_URL`) alongside direct migration connections (`POSTGRES_URL_NON_POOLING`).
