# IdeaLens — AI-Powered Business Idea Validation Platform

IdeaLens is an evidence-driven full-stack platform that helps students and early-stage founders evaluate business ideas before investing time or money. Users submit a concept, a durable background worker conducts automated web research via Tavily Search, an LLM synthesizes structured findings using `gpt-4o-mini`, and the system generates a persistent, source-linked validation report with a deterministic **Opportunity Score**.

---

## Architecture Overview

```
                      ┌──────────────────────────────────────┐
                      │          React + Vite SPA            │
                      │  - In-Memory Access Token (No Storage)│
                      │  - Clean Blue & White Design System  │
                      └──────────────────┬───────────────────┘
                                         │ HTTPS / JSON
                                         │ (HttpOnly Refresh Cookie)
                                         ▼
                      ┌──────────────────────────────────────┐
                      │          FastAPI Backend             │
                      │  - Argon2id Password Hashing         │
                      │  - Strict Cross-User Isolation       │
                      │  - Scoped Cascade Deletions          │
                      └──────────────────┬───────────────────┘
                                         │
                 ┌───────────────────────┴───────────────────────┐
                 │                                               │
                 ▼                                               ▼
   ┌───────────────────────────┐                   ┌───────────────────────────┐
   │    Persistent MySQL DB    │                   │   Autonomous Research     │
   │ - Alembic Migrations      │◄──Atomic Claim───┤         Worker            │
   │ - Users, Tokens, Ideas    │                   │ - 6 Verifiable Stages     │
   │ - Jobs, Sources, Reports  │                   │ - Tavily Web Search       │
   └───────────────────────────┘                   │ - OpenAI Structured Output│
                                                   │ - Deterministic Scoring   │
                                                   └───────────────────────────┘
```

---

## Key Features

1. **Evidence-Linked Reports**: Every competitor, customer complaint, and pricing observation cites real web URLs retrieved during the workflow.
2. **Deterministic Opportunity Score**: A mathematical 5-dimension heuristic with fixed weights (Customer Need 25%, Differentiation 20%, Market Demand 20%, Monetization 20%, Evidence Quality 15%). If fewer than 3 credible sources are found, the score is capped at 60 and flagged as *Provisional*.
3. **Enterprise-Grade Authentication**:
   - Argon2id password hashing via maintained libraries (`argon2-cffi`, `passlib`).
   - Short-lived JWT access tokens stored exclusively in React memory (never in `localStorage`).
   - Refresh tokens stored in `HttpOnly`, `SameSite=Lax` cookies with server-side rotation and revocation records in the database.
   - Time-limited, single-use email verification and password reset tokens (only SHA-256 hashes stored).
4. **Durable Database-Backed Queue**: Research jobs are processed by a standalone Python worker using atomic SQL updates to prevent double-claiming, surviving server restarts and network timeouts.
5. **Clean Blue-and-White Design System**: Restrained color palette (`#2563EB`, `#1E293B`, `#FFFFFF`, `#F8FAFC`), accessible form controls, and responsive tabbed navigation.
6. **Development Mock Mode**: When `MOCK_RESEARCH=true` is enabled in local development, realistic fixtures exercise the persistence pipeline with a prominent banner (`DEVELOPMENT MODE — MOCK RESEARCH DATA ACTIVE`). Production strictly refuses to start with mock research enabled.

---

## Project Structure

```
├── backend/
│   ├── alembic/              # Database migration configurations & version scripts
│   ├── app/
│   │   ├── api/              # FastAPI route handlers (auth, ideas, research, reports, health)
│   │   ├── models/           # SQLAlchemy ORM models (users, tokens, ideas, jobs, sources, reports)
│   │   ├── schemas/          # Pydantic schemas for requests, responses & structured reports
│   │   ├── services/         # Business logic (auth, email, search, llm, scoring, research)
│   │   ├── config.py         # Validated settings via Pydantic BaseSettings
│   │   ├── database.py       # Engine creation, connection pooling, and get_db dependency
│   │   ├── main.py           # Application entrypoint & CORS middleware
│   │   └── worker.py         # Durable background research worker
│   ├── tests/                # Automated pytest suite (auth, scoring, ownership, pipeline)
│   ├── .env.example          # Backend environment variables template
│   └── requirements.txt      # Pinned backend dependencies
├── frontend/
│   ├── src/
│   │   ├── components/       # Navbar, ProtectedRoute, ResearchStages, ScoreGauge, etc.
│   │   ├── context/          # AuthContext with in-memory token state
│   │   ├── pages/            # Home, SignIn, SignUp, VerifyEmail, Validate, Research, MyReports, Report
│   │   ├── services/         # API fetch client with auto-refresh queue
│   │   ├── styles/           # global.css with design system tokens
│   │   ├── App.jsx           # React Router route definitions
│   │   └── main.jsx          # Root mount point
│   ├── .env.example          # Frontend environment variables template
│   └── vercel.json           # SPA rewrites configuration for direct URL navigation
└── README.md
```

---

## Local Setup & Quickstart

### Prerequisites

- Python 3.11+
- Node.js 18+ & npm
- (Optional) MySQL 8.0+ or default SQLite fallback for instant local testing

### 1. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Note: By default, DATABASE_URL uses SQLite for local running out of the box:
# DATABASE_URL=sqlite:///./idealens_dev.db
# For MySQL: mysql+pymysql://<user>:<password>@localhost:3306/idealens

# Run database migrations
alembic upgrade head

# Start FastAPI server
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

The API will be available at `http://localhost:8000`. You can inspect the OpenAPI documentation at `http://localhost:8000/docs`.

### 2. Run the Background Research Worker

In a separate terminal (with virtual environment activated):

```bash
cd backend
python -m app.worker
```

The worker continuously polls for queued research jobs, claims them atomically, runs the 6 research stages, and recovers stale jobs if any process is interrupted.

### 3. Frontend Setup

In a third terminal:

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env

# Start Vite dev server
npm run dev
```

Visit `http://localhost:5173` in your browser.

---

## Automated Test Suite

Run the comprehensive pytest suite covering authentication, token rotation, password reset, deterministic scoring, cross-user isolation, and pipeline execution:

```bash
cd backend
.\venv\Scripts\pytest -v
```

All 15 automated test cases run with an isolated test database and zero network dependencies.

---

## Deterministic Opportunity Score Methodology

The score is calculated in `app/services/scoring_service.py` using fixed weights:

| Dimension | Weight | Criteria |
|---|---|---|
| **Customer Need Evidence** | 25% | Direct customer pain points and complaints from real discussions. |
| **Competitive Landscape & Differentiation** | 20% | Direct and indirect substitutes, incumbent weaknesses, and product gaps. |
| **Market Demand Signals** | 20% | Qualitative demand indicators, adoption trends, and industry research. |
| **Monetization Feasibility** | 20% | Verified competitor pricing tiers and willingness-to-pay signals. |
| **Evidence Quality** | 15% | Breadth, authority, and diversity of retrieved source URLs. |

**Calculation**:
$$\text{Opportunity Score} = \text{round}\left(\frac{\sum (\text{dimension\_score} \times \text{dimension\_weight})}{100}\right)$$

- **Provisional Status**: If fewer than 3 credible, relevant sources are available, the score is marked as `provisional` and capped at 60.
- **Unavailable Status**: If evidence is too deficient to assess dimensions, the score status is set to `unavailable`.

---

## Production Deployment Guide

### 1. Hosted MySQL Database (e.g. PlanetScale, AWS RDS, Aiven)

1. Provision a MySQL 8.0+ instance.
2. Create the database `idealens`.
3. Set your production `DATABASE_URL`:
   ```env
   DATABASE_URL=mysql+pymysql://<user>:<password>@<host>:3306/idealens?ssl_ca=/etc/ssl/certs/ca-certificates.crt
   ```
4. Run migrations from your deployment pipeline:
   ```bash
   alembic upgrade head
   ```

### 2. Backend API Deployment (e.g. Render / Railway)

1. Build Command: `pip install -r requirements.txt && alembic upgrade head`
2. Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
3. Configure Environment Variables:
   - `ENVIRONMENT=production`
   - `MOCK_RESEARCH=false`
   - `DATABASE_URL=<your_mysql_connection_url>`
   - `JWT_SECRET=<strong_random_secret_at_least_32_characters>`
   - `TAVILY_API_KEY=<tvly-...>`
   - `OPENAI_API_KEY=<sk-...>`
   - `RESEND_API_KEY=<re_...>`
   - `FRONTEND_URL=https://your-app.vercel.app`
   - `ALLOWED_ORIGINS=https://your-app.vercel.app`

### 3. Persistent Worker Deployment (e.g. Render Background Worker)

1. Start Command: `python -m app.worker`
2. Configure the same `DATABASE_URL`, `TAVILY_API_KEY`, `OPENAI_API_KEY`, and `ENVIRONMENT=production`.

### 4. Frontend Deployment (Vercel)

1. Root Directory: `frontend`
2. Framework Preset: `Vite`
3. Build Command: `npm run build`
4. Output Directory: `dist`
5. Environment Variables:
   - `VITE_API_BASE_URL=https://your-backend.onrender.com`
6. `vercel.json` included in `frontend/` handles SPA rewrites so direct navigation to `/reports/:id` and `/research/:jobId` works seamlessly.

---

## Security Highlights

- **No Plaintext Passwords**: Argon2id with unique salts per user.
- **No Insecure Storage**: Access tokens are held exclusively in React memory, mitigating XSS token harvesting.
- **HttpOnly Refresh Cookies**: Refresh cookies are isolated from client-side JavaScript with `SameSite=Lax` and `Secure` in production.
- **Strict Data Ownership**: Every idea, research job, and report query is strictly scoped through `Idea.user_id == current_user.id`. Changing an ID in the URL yields `403 Forbidden`.
- **Zero Prompt Injections from Search**: Web search snippets are strictly treated as untrusted data chunks and isolated from system directives.
