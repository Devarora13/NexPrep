# VERITUS — AI-Powered Career Intelligence & Placement Readiness Platform

> **"From Potential to Placement"**  
> A unified platform consolidating career profile assessment, ATS-grade resume extraction, AI skill-gap diagnosis, personalized preparation roadmaps, adaptive real-time AI voice mock interviews, and continuous readiness scoring.

---

## Core Capabilities & Architecture

VERITUS replaces fragmented preparation tools (isolated mock interviews, disconnected resume builders, generic practice sheets) with an integrated, data-driven journey:

### 1. Resume Ingestion & Extraction Engine
- **Endpoint:** `/api/resume-extract` (Node.js runtime)
- Extracts text directly from `.pdf`, `.docx`, and `.txt` files (up to 5 MB) using binary stream parsing (`pdf-parse` and `mammoth`).
- Available on both the **Career Profile** page (`/dashboard/career-profile`) and the **Interview Creation** form (`/dashboard/create-interview`).
- Raw files are not retained; extracted text is sanitized and presented for candidate review.

### 2. AI Skill-Gap Analyzer & Personalized Roadmap
- **Endpoint:** `/api/career-analysis`
- Evaluates the candidate's extracted profile against their target job role and description.
- Powered by LLM orchestration via **OpenRouter**, paired with a deterministic local fallback (`lib/career-readiness.js`) to guarantee uninterrupted operation.
- Produces:
  - **Verified & Matched Skills**
  - **Priority Skill Gaps**
  - **Candidate Strengths**
  - **Actionable 3-Step Preparation Roadmap** (High/Medium/Low priorities)
- Persisted in Supabase `CareerProfiles` table with Row-Level Security (RLS).

### 3. Adaptive AI Voice Mock Interview (Vapi AI)
- **Routes:** `/interview/[interview_id]` and `/interview/[interview_id]/start`
- **Voice Orchestration:** Vapi Web SDK (`@vapi-ai/web`), 11Labs voice (`Paula`), and Deepgram speech-to-text (`nova-2`).
- **Dynamic Questioning:** Instead of asking static pre-scripted questions, the system prompt actively injects the candidate's verified skills, priority skill gaps, and roadmap focus from their `CareerProfiles`.
- Generates adaptive follow-ups, probes weak answers, and escalates question complexity dynamically.

### 4. Automated AI Feedback & Rubric Scoring
- **Endpoint:** `/api/ai-feedback`
- Evaluates the completed interview transcript turn-by-turn against a structured rubric:
  - Technical Accuracy, Communication, Problem Solving, Experience, and Confidence (each /10).
  - Overall Interview Score (/100).
  - Qualitative strengths, weaknesses, areas to improve, and hiring recommendations.
- Stored permanently in the `PostInterview` table in Supabase.

### 5. Composite Career Readiness Score (0–100)
- Dynamically blends performance across all preparation stages:
  $$\text{Readiness Score} = 20\%\,\text{Resume} + 25\%\,\text{Skill Match} + 30\%\,\text{Interview} + 25\%\,\text{Assessment}$$
- Completing a mock interview or technical assessment automatically updates the candidate's profile and dashboard score ring.

### 6. Technical Readiness Assessment Module
- **Route:** `/dashboard/assessment`
- Interactive quiz testing fundamental CS and development competencies (frontend state, REST APIs, database joins, hash table complexity, Git workflows).
- Records attempts in `AssessmentAttempts` and folds results back into the overall readiness score.

### 7. Curated Practice Vault
- **Route:** `/dashboard/practice`
- Direct access to role-based DSA sheets, behavioral frameworks, and career guides directly from the sidebar.

---

## Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend Framework** | Next.js 15 (App Router), React 18 |
| **Styling & UI** | Tailwind CSS 4, Shadcn/ui, Radix UI primitives, Lucide React icons, Sonner toasts |
| **Backend / API** | Next.js Serverless API routes (Node.js runtime) |
| **Database & Auth** | Supabase PostgreSQL, Supabase Auth, Row Level Security (RLS) |
| **Voice AI & STT** | Vapi Web SDK, Deepgram (`nova-2`), ElevenLabs (`Paula`) |
| **AI / LLM Orchestration** | OpenRouter Chat Completions (`gpt-4o-mini`, `nvidia/nemotron`) with local fallback |
| **Document Processing** | `pdf-parse`, `mammoth` (DOCX extraction) |

---

## Project Structure

```text
app/
  (main)/
    dashboard/
      page.jsx                       # Main dashboard with CareerReadinessCard
      career-profile/page.jsx        # Resume upload, skill-gap analysis & roadmap
      assessment/page.jsx            # Technical readiness quiz & score tracking
      create-interview/page.jsx      # Interview configuration with profile auto-fill
      practice/page.jsx              # VERITUS curated resource vault
    all-interviews/page.jsx          # Historical mock interviews & status
    billing/page.jsx                 # Credit package management
    settings/ & logout/              # Profile settings & authentication cleanup
  api/
    ai-feedback/route.jsx            # Authenticated interview evaluation API
    career-analysis/route.jsx        # AI skill-gap & roadmap analysis API
    resume-extract/route.jsx         # Server-side PDF/DOCX/TXT text extraction
  interview/[interview_id]/
    page.jsx                         # Session lobby & context hydration
    start/page.jsx                   # Live bidirectional voice interview (Vapi)
    feedback/page.jsx                # Detailed post-interview review & scores
    view/page.jsx                    # Completed interview inspector
context/                             # UserDetail & InterviewDetails React contexts
lib/
  assessment.js                      # Assessment question banks
  career-readiness.js                # Composite scoring logic & local fallback
  constants.js                       # App configurations & AI models
services/
  supabaseClient.js                  # Browser Supabase client
  Constant.jsx                       # Navigation & sidebar definitions
supabase/
  migrations/
    20261101_veritus_career_profiles.sql      # CareerProfiles table & RLS
    20261102_veritus_assessment_attempts.sql  # AssessmentAttempts table & RLS
```

---

## Local Setup & Installation

### 1. Prerequisites
- Node.js 18+ (tested on Node v20/v24)
- npm
- Supabase account & project
- Vapi AI account & public key
- OpenRouter API key

### 2. Clone & Install
```bash
git clone https://github.com/Devarora13/NexPrep.git veritus
cd veritus
npm install
```

### 3. Configure Environment Variables
Create a `.env` or `.env.local` file in the root directory:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Voice AI (Vapi)
NEXT_PUBLIC_VAPI_KEY=your_vapi_public_key
VAPI_API_KEY=your_vapi_public_key

# AI LLM (OpenRouter)
OPENROUTER_API_KEY=your_openrouter_api_key
```

### 4. Database Migrations
Run the SQL migration scripts located in `supabase/migrations/` inside your **Supabase Dashboard → SQL Editor**:
1. [`supabase/migrations/20261101_veritus_career_profiles.sql`](supabase/migrations/20261101_veritus_career_profiles.sql)
2. [`supabase/migrations/20261102_veritus_assessment_attempts.sql`](supabase/migrations/20261102_veritus_assessment_attempts.sql)

### 5. Run the Application
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Standard Demo Flow for Evaluations

1. **Sign In:** Authenticate at `/auth` using Supabase email/password.
2. **Career Profile Analysis:**
   - Navigate to **Career Profile** (`/dashboard/career-profile`).
   - Upload a sample PDF or DOCX resume, enter the target role (e.g. *Frontend Engineer*), and click **Generate VERITUS analysis**.
   - Review detected skills, identified gaps, and the 3-step actionable roadmap.
3. **Practice & Assessment:**
   - Open **Assessment** (`/dashboard/assessment`).
   - Answer the technical questions and submit to see real-time score updates.
4. **Tailored AI Voice Interview:**
   - Go to **Create Interview** (`/dashboard/create-interview`).
   - Click **Auto-fill from Profile** to inherit your target role.
   - Start the session $\rightarrow$ speak with the AI interviewer over microphone.
   - The AI interviewer dynamically steers the conversation to test the specific skill gaps identified in your profile.
5. **Evaluation & Dynamic Loop:**
   - End the call and inspect your rubric score on the Feedback page.
   - Return to the **Dashboard** to see the updated composite readiness score ring.
