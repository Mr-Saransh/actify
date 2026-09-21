<div align="center">

# ACTIFY

### The World's First AI Execution Operating System

<p align="center">
  <strong>Turn any ambition into an AI-engineered mission. Enforce daily discipline with cryptographic proof-of-work, anti-cheat validation, and a dual-currency reputation economy.</strong>
</p>

[![Live Demo](https://img.shields.io/badge/Live_Demo-actify--one.vercel.app-FF7A00?style=for-the-badge&logo=vercel&logoColor=white)](https://actify-one.vercel.app/)
[![Next.js](https://img.shields.io/badge/Next.js-16.1.4-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-6.19-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-2.0_GenAI-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![Clerk Auth](https://img.shields.io/badge/Clerk-Authentication-6C47FF?style=for-the-badge&logo=clerk&logoColor=white)](https://clerk.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

[🌐 Explore Live Application](https://actify-one.vercel.app/) • [📖 Architecture Guide](docs/ARCHITECTURE.md) • [⚡ API Reference](docs/API_AND_ACTIONS.md) • [🎮 Gamification Rules](docs/GAMIFICATION_RULES.md)

</div>

---

## 📑 Table of Contents

- [The Philosophy](#-the-philosophy)
- [Key Innovations](#-key-innovations)
- [System Architecture](#-system-architecture)
- [Execution Lifecycle & State Machine](#-execution-lifecycle--state-machine)
- [Core Feature Matrix](#-core-feature-matrix)
- [Tech Stack & Dependencies](#-tech-stack--dependencies)
- [Database Domain Model](#-database-domain-model)
- [Getting Started & Local Development](#-getting-started--local-development)
- [Environment Configuration](#-environment-configuration)
- [Directory Structure](#-directory-structure)
- [Security & Anti-Cheat Protocol](#-security--anti-cheat-protocol)
- [Documentation Index](#-documentation-index)
- [Contributing](#-contributing)
- [License](#-license)

---

## 💡 The Philosophy

> **"Over 92% of ambitious goals fail not from lack of desire, but from lack of enforced daily execution."**

Traditional goal apps and habit trackers suffer from two fatal flaws:
1. **Passive Tracking**: They act as passive digital to-do lists that politely watch you procrastinate.
2. **Subjective Honor Systems**: Users check off tasks without providing verifiable evidence, degrading commitment into hollow self-deception.

**Actify is not a habit tracker — it is an Execution Operating System.**

Actify replaces passive checklists with **deterministic proof-of-work**, **AI-synthesized blueprints**, **anti-cheat quiz verifications**, **strict rolling deadlines**, and **economic penalties**. If you don't execute, you lose points, drop ranks on the global leaderboard, and face automatic streak destruction.

---

## 🚀 Key Innovations

### 1. 🧠 AI Mission Blueprinting
Enter any goal (e.g., *"Learn Rust and build a distributed key-value store in 30 days"*). Actify's Gemini 2.0 pipeline calculates total available focus hours, assesses domain feasibility, and synthesizes three distinct execution tiers:
- **Execution Sprint**: High intensity, compressed timeline.
- **Strategic Execution**: Balanced milestones with structured safety buffers.
- **Mastery Protocol**: In-depth prerequisite coverage with rigorous depth.

Users can visually rearrange, split, or refine milestones with `@dnd-kit` drag-and-drop before locking into the mission protocol.

### 2. 🛡️ Multi-Modal Proof-of-Work Verification
Tasks cannot simply be "checked off." Users must submit proof routed through specialized validation pipelines:
- **Code & Projects**: Repositories and commits evaluated via automated code analysis heuristics.
- **Learning & Research**: Google Gemini dynamically synthesizes a **5-question Multiple Choice Quiz (MCQ)** generated directly from your proof text.
- **Writing & Documentation**: Syntactical integrity, readability, and depth analysis.
- **Physical Conditioning & Fitness**: Telemetry link or workout verification with visual attachment.

### 3. 🚨 Cryptographic Anti-Cheat Safeguards
To protect leaderboard integrity, quizzes are signed with server-side **JSON Web Tokens (JWT)**:
- Correct answers never exist in browser memory.
- Leaving the tab, switching windows, or opening developer tools triggers **Window Blur Detection**, immediately failing the quiz, terminating the attempt, and applying a `-3 ACT Point` penalty.
- A strict **80% passing threshold** (4/5 questions) is required to unlock subsequent tasks.

### 4. 💎 Dual-Currency Reputation Economy
- **`actPoints` (⚡ Reputation)**: Non-transferable merit earned exclusively through accepted task proofs. Dictates global leaderboard standing and user level (L1–L5).
- **`actCurrency` (🪙 Liquid Capital)**: Spendable currency earned by hitting milestone milestones. Used to purchase tactical power-ups or trade community assets in the Marketplace.

### 5. 🧊 The Tactical Armory (Power-Ups)
- **Liquid Freeze**: Automatic fail-safe. If an unavoidable emergency causes a missed day, a Liquid Freeze is automatically consumed to halt penalties and protect your streak.
- **Beyond ACT**: Overclock daily limits. Expands your daily capacity to execute extra tasks beyond the standard daily cap.

### 6. 🌐 Real-Time Execution Chat & Guilds
A high-performance **Server-Sent Events (SSE)** streaming engine provides live direct messaging, collective goal guilds, shared code snippet repositories, and instant feedback broadcasts.

### 7. 🛒 Marketplace of Verified Journeys
When a user completes a 100% verified mission, their blueprint, milestones, and execution logs can be minted as a **Verified Journey**. Other operators can study, purchase, or clone these battle-tested paths using `actCurrency`.

---

## 🏗 System Architecture

Actify is engineered on **Next.js 16 (App Router)**, **React 19**, **Prisma ORM**, and **Google Gemini 2.0**.

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

## 🔄 Execution Lifecycle & State Machine

Every task adheres to an immutable, finite state machine enforcing strict temporal boundaries:

```mermaid
stateDiagram-v2
    [*] --> LOCKED : Task Generated from Milestone
    LOCKED --> ACTIVE : Day Index Reached & Predecessor Accepted
    ACTIVE --> SUBMITTED : Proof Submitted (URL / Image / Text)
    
    state SUBMITTED {
        [*] --> CategoryRouting
        CategoryRouting --> QUIZ_PIPELINE : Learning / Reading
        CategoryRouting --> CODE_PIPELINE : Project / Repository
        CategoryRouting --> GRAMMAR_PIPELINE : Writing
        CategoryRouting --> METRICS_PIPELINE : Fitness / Telemetry
        
        QUIZ_PIPELINE --> PENDING_QUIZ : AI Synthesizes 5 Questions
        CODE_PIPELINE --> AUTO_REVIEW : Run Heuristic Checks
        GRAMMAR_PIPELINE --> AUTO_REVIEW
        METRICS_PIPELINE --> AUTO_REVIEW
    }

    PENDING_QUIZ --> ACCEPTED : Score >= 80%
    PENDING_QUIZ --> REJECTED : Score < 80% or Tab-Blur Anti-Cheat
    AUTO_REVIEW --> ACCEPTED : Criteria Satisfied
    AUTO_REVIEW --> REJECTED : Insufficient Proof Evidence

    ACCEPTED --> LOCKED_NEXT : +5 ACT Points, +1 Streak, Unlock Next Day
    REJECTED --> ACTIVE : -3 ACT Points, +1 Failure, Allows Retry
    ACTIVE --> FAILED : 24h Deadline Missed (-3 Points, Reset Streak)
    FAILED --> [*]
```

---

## ⚡ Core Feature Matrix

| Feature | Description | Key Tech Stack |
| :--- | :--- | :--- |
| **AI Mission Generation** | Generates 3 tiered roadmaps with feasibility checks, duration estimates, and risk analysis. | `@google/genai`, Zod, `app/actions/mission.ts` |
| **Interactive Milestone Editor** | Reorder, delete, and AI-split milestones with fluid keyboard and pointer interactions. | `@dnd-kit/core`, `@dnd-kit/sortable` |
| **Anti-Cheat Quiz Engine** | Deterministic 5-question test generated from user proof with JWT-signed answer validation. | `jsonwebtoken`, `/api/quiz/*`, `components/quiz-engine.tsx` |
| **Enforcement Engine** | Calculates 7-day velocity, required pace, buffer days, and failure margin (`SAFE`/`CAUTION`/`DANGER`). | `lib/metrics.ts`, `app/actions/daily-check.ts` |
| **Dual-Currency Ledger** | Atomically manages non-transferable reputation points vs spendable marketplace tokens. | Prisma Transactions, PostgreSQL, `lib/prisma.ts` |
| **Real-Time Execution Chat** | Long-lived SSE stream powering direct and guild messaging with code syntax & markdown. | Server-Sent Events, `/api/chat/stream` |
| **Marketplace & Journeys** | Trade battle-tested goal roadmaps, verified proof logs, and developer asset packs. | Cloudinary CDN, `app/actions/marketplace.ts` |
| **Global Leaderboard** | Real-time global podium ranking users by net merit and verified execution streaks. | `app/dashboard/leaderboard/page.tsx` |

---

## 🛠 Tech Stack & Dependencies

```
Actify Architecture Stack
├── Core Framework: Next.js 16.1.4 (App Router, Server Actions, Dynamic Routing)
├── Runtime Environment: Node.js 20+ / Edge Middleware
├── Language: TypeScript 5.x (Strict Type Safety)
├── UI & Styling: React 19.2.3, Tailwind CSS v4, Lucide React Icons
├── Component Primitives: Radix UI (Dialog, Dropdown, Avatar, Select, Toast)
├── Animation Suite: Framer Motion 12, GSAP 3.15
├── Data Visualization: Recharts 3.9
├── Drag & Drop Engine: @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities
├── AI & Machine Learning: Google Gemini 2.0 SDK (@google/genai)
├── Database & ORM: PostgreSQL, Prisma Client 6.19.2, Prisma Accelerate
├── Authentication: Clerk (@clerk/nextjs 6.36)
├── Media Storage: Cloudinary v2 SDK
└── Cryptography: JSON Web Tokens (jsonwebtoken 9.0)
```

---

## 🗄 Database Domain Model

```mermaid
erDiagram
    User ||--o{ Goal : creates
    User ||--o{ MarketplaceListing : sells
    User ||--o{ Message : sends
    User ||--o{ GroupMember : joins
    User ||--o{ FriendRequest : initiates
    User ||--o{ Notification : receives
    
    Goal ||--o{ Milestone : contains
    Goal ||--o{ Task : schedules
    Milestone ||--o{ Task : groups
    Task ||--o| Proof : verifies
    
    MarketplaceListing ||--o{ Review : receives
    Group ||--o{ GroupMember : includes
    Group ||--o{ GroupMessage : streams
    Group ||--o{ SharedResource : hosts

    User {
        string id PK
        string clerkId UK
        string email UK
        int level
        int streak
        int actPoints
        int actCurrency
        int freezeActCount
        int beyondActCount
        datetime lastCompletionDate
        datetime lastFailureCheck
    }

    Goal {
        string id PK
        string userId FK
        string title
        string category
        enum type
        int timePerDay
        datetime deadline
        int estimatedHours
        enum status
    }

    Task {
        string id PK
        string goalId FK
        string milestoneId FK
        string title
        string objective
        int dayIndex
        enum state
        datetime deadline
    }

    Proof {
        string id PK
        string taskId FK
        string content
        string imageUrl
        string explanation
        string validationType
        enum reviewStatus
        string aiFeedback
    }
```

---

## 💻 Getting Started & Local Development

### Prerequisites

- **Node.js**: `v20.x` or higher
- **Package Manager**: `npm` (v10+), `pnpm`, or `bun`
- **PostgreSQL**: Local instance or managed provider (Neon, Supabase, Vercel Postgres)
- **API Keys**:
  - [Google AI Studio](https://aistudio.google.com/) (Gemini API Key)
  - [Clerk Dashboard](https://dashboard.clerk.com/) (Publishable & Secret Keys)
  - [Cloudinary](https://cloudinary.com/) (Optional: for media asset storage)

### Step-by-Step Installation

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/Mr-Saransh/actify.git
   cd actify_project
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   ```bash
   cp .env.example .env.local
   ```
   Fill in your PostgreSQL URLs, Clerk credentials, and Gemini API Key (see [Environment Configuration](#-environment-configuration) below).

4. **Initialize Database & Prisma Client**:
   ```bash
   # Generate Prisma Client types
   npx prisma generate

   # Push schema to PostgreSQL database
   npx prisma db push
   ```

5. **Run the Development Server**:
   ```bash
   npm run dev
   ```

6. **Launch in Browser**:
   Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 🔐 Environment Configuration

Create a `.env.local` file in the root directory with the following configuration:

```ini
# ==========================================
# CLERK AUTHENTICATION
# ==========================================
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding

# ==========================================
# POSTGRESQL DATABASE & PRISMA
# ==========================================
# Pooled connection string (Session pooling via PgBouncer)
DATABASE_URL="postgres://user:password@host:port/database?pgbouncer=true&connect_timeout=15"

# Direct non-pooling connection string (Required for Prisma migrations)
DIRECT_URL="postgres://user:password@host:port/database"

# ==========================================
# GOOGLE GEMINI AI
# ==========================================
GEMINI_API_KEY=AIzaSy...

# ==========================================
# SECURITY & ANTI-CHEAT TOKENS
# ==========================================
JWT_SECRET=your_super_secret_cryptographic_key_here

# ==========================================
# CLOUDINARY (MEDIA STORAGE)
# ==========================================
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

## 📂 Directory Structure

```
actify_project/
├── app/                             # Next.js 16 App Router
│   ├── actions/                     # Server Actions (RPC mutation layer)
│   │   ├── ai-task.ts               # Daily AI task generator
│   │   ├── chat.ts                  # Real-time message dispatch
│   │   ├── daily-check.ts           # 24h deadline & failure enforcement
│   │   ├── enforcement.ts           # Failure detection & penalty triggers
│   │   ├── goal.ts                  # Goal CRUD & curriculum fallback
│   │   ├── marketplace.ts           # Listing & verified journey trading
│   │   ├── mission.ts               # Gemini blueprint generation & approval
│   │   ├── network.ts               # Friendship & peer accountability
│   │   ├── powerups.ts              # Liquid Freeze & Beyond ACT usage
│   │   ├── proof.ts                 # Proof-of-work submission & routing
│   │   └── user.ts                  # Clerk-to-Prisma user sync
│   ├── api/                         # Next.js Route Handlers
│   │   ├── chat/stream/route.ts     # SSE stream endpoint for real-time chat
│   │   └── quiz/                    # Anti-cheat quiz generation & grading
│   ├── dashboard/                   # Authenticated Operator Hub
│   │   ├── analytics/               # Execution pacing & risk analysis
│   │   ├── chat/                    # Real-time 1-on-1 & guild chat
│   │   ├── history/                 # Immutable execution audit log
│   │   ├── leaderboard/             # Global reputation podium
│   │   ├── marketplace/             # Asset & journey exchange
│   │   ├── mission/overview/        # Milestone breakdown & blueprint
│   │   ├── network/                 # Peer connections & friend requests
│   │   ├── overview/                # Primary metric analytics
│   │   ├── quiz/[proofId]/          # Anti-cheat quiz environment
│   │   ├── settings/                # User configuration
│   │   ├── store/                   # Tactical power-up armory
│   │   ├── layout.tsx               # Sidebar & navigation wrapper
│   │   └── page.tsx                 # Core mission execution dashboard
│   ├── globals.css                  # Tailwind CSS v4 design tokens
│   ├── layout.tsx                   # Root HTML & theme provider
│   └── page.tsx                     # Landing page showcase
├── components/                      # Reusable UI Component Library
│   ├── chat/                        # Chat interface & SSE streaming components
│   ├── landing/                     # High-conversion marketing sections
│   ├── ui/                          # Radix UI styled primitives
│   ├── mission-planner.tsx          # Drag-and-drop blueprint organizer
│   ├── quiz-engine.tsx              # Anti-cheat quiz interface with blur detector
│   ├── risk-forecast.tsx            # Pacing & failure margin visualizer
│   └── task-view.tsx                # Active task execution card
├── docs/                            # Deep Technical Guides
│   ├── ARCHITECTURE.md              # System design & SSE streaming details
│   ├── API_AND_ACTIONS.md           # Exhaustive server actions reference
│   └── GAMIFICATION_RULES.md        # Mathematical scoring & penalty rules
├── lib/                             # Shared Utilities & Business Logic
│   ├── goal-validator.ts            # Feasibility rules & keyword detection
│   ├── metrics.ts                   # Buffer days & risk level algorithms
│   ├── prisma.ts                    # Prisma Client singleton
│   └── store-data.ts                # Catalog of power-ups & merch
├── prisma/                          # Database Schema & Migrations
│   └── schema.prisma                # Complete PostgreSQL entity model
└── public/                          # Static Brand & Media Assets
```

---

## 🛡 Security & Anti-Cheat Protocol

Actify is engineered to ensure that rank on the global leaderboard represents authentic human execution.

### Cryptographic Quiz Security
- **Dynamic Question Synthesis**: Quizzes are generated on the fly by Gemini based on the actual text and references provided in the user's proof. Pre-computation or answer memorization is mathematically impossible.
- **Signed Tokens**: The grading route validates answers against an encrypted JWT token signed with `JWT_SECRET`. The correct answers are never revealed to client JavaScript.

### Client-Side Blur Detection
The `QuizEngine` attaches browser lifecycle listeners to detect tab-switching or developer tool inspect actions:
```typescript
useEffect(() => {
    const handleVisibilityChange = () => {
        if (document.hidden && !hasSubmitted) {
            triggerAntiCheatViolation();
        }
    };
    window.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleVisibilityChange);
    return () => {
        window.removeEventListener("visibilitychange", handleVisibilityChange);
        window.removeEventListener("blur", handleVisibilityChange);
    };
}, [hasSubmitted]);
```
Any violation aborts the attempt, flags the user's submission as fraudulent, deducts `3 ACT Points`, and records an enforcement violation.

---

## 📚 Documentation Index

For in-depth engineering guides, consult our specialized documentation:

| Document | Description |
| :--- | :--- |
| [Architecture & System Design](docs/ARCHITECTURE.md) | Exhaustive breakdown of SSE streaming, AI pipeline, and database transaction atomicity. |
| [API & Server Actions Reference](docs/API_AND_ACTIONS.md) | Full signatures, request payloads, and response interfaces for all 15 server actions and API routes. |
| [Gamification & Enforcement Rules](docs/GAMIFICATION_RULES.md) | Progression levels (L1–L5), reputation formulas, rolling pace calculations, and power-up mechanics. |

---

## 🤝 Contributing

Contributions from ambitious developers, researchers, and creators are welcome!

1. Fork the repository (`git checkout -b feature/amazing-feature`)
2. Commit your changes (`git commit -m 'feat: implement amazing feature'`)
3. Push to the branch (`git push origin feature/amazing-feature`)
4. Open a Pull Request

Please adhere to our standard TypeScript conventions, strict typing rules, and ensure all Prisma migrations are tested.

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

<div align="center">

**Stop Planning. Start Executing.**

Built with ❤️ by [Saransh](https://github.com/Mr-Saransh) • Hosted on [Vercel](https://actify-one.vercel.app/)

</div>
