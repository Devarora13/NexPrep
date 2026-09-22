# Veritus — AI-Powered Interview Preparation

Veritus is a Next.js application for creating and reviewing AI-assisted mock interview sessions. It combines Supabase for authentication and persistence, Vapi for browser-based voice conversations, and OpenRouter for post-interview feedback.


## What the application provides

### Account and dashboard

- Email/password sign-up and login through Supabase Auth.
- A `Users` profile record is created for a newly authenticated user, with one initial credit.
- Dashboard navigation for interview creation, interview history, billing, settings, practice resources, and sign-out.
- Recent interviews and a full interview-history view backed by Supabase.

### Interview setup

The creation form captures:

- Job position and job description
- Interview type: `Technical`, `Behavioral`, `HR`, or `System Design`
- Experience level: entry, mid, senior, or expert
- Duration: 5, 15, 30, 45, or 60 minutes
- Difficulty: Easy, Medium, or Hard

Creating a session writes its metadata to `InterviewDetails`, generates a UUID interview identifier, and deducts one credit from the current user's `Users` record.

### Voice-interview configuration

The live interview page configures Vapi with Deepgram transcription, an ElevenLabs voice, and a `gpt-4o-mini` interviewer model. The interviewer system prompt is designed to:

- Generate questions dynamically rather than use a fixed list
- Listen to the candidate's prior response and ask relevant follow-ups
- Clarify vague answers and increase difficulty after strong answers
- Challenge weak reasoning while keeping the interview conversational
- Tailor subject matter to Technical, Behavioral, HR, or System Design interviews

While a call is active, the page gathers message and transcript events in browser state. On manual completion, it posts the captured conversation to the feedback API and stores the returned review in Supabase.

### Feedback and interview history

The feedback route evaluates the captured transcript and returns:

- Overall score out of 100
- Ratings out of 10 for technical skills, communication, problem solving, experience, and confidence
- Strengths, weaknesses, and areas to improve
- A summary and hiring recommendation

The feedback page and interview-history pages read this review from the `postinterview` table. A static practice-resources page and a billing UI are also included.

## Technology stack

| Area | Implementation |
| --- | --- |
| Framework | Next.js `15.3.8` with the App Router |
| UI | React 18, Tailwind CSS 4, Radix/shadcn-style components, Lucide icons |
| Authentication and data | Supabase Auth and Postgres via `@supabase/supabase-js` |
| Voice interview | Vapi Web SDK, Deepgram transcription, ElevenLabs voice |
| Interviewer model | OpenAI `gpt-4o-mini` configured through Vapi |
| Feedback model | OpenRouter Chat Completions API |
| Package manager | npm |

## Project structure

```text
app/
  (main)/
    dashboard/                       Dashboard, create-interview, practice
    all-interviews/                  Interview history
    billing/                         Credit purchase UI (simulated)
    settings/ and logout/            Account screens
  api/ai-feedback/                   Server-side OpenRouter feedback endpoint
  auth/                              Email/password authentication
  interview/[interview_id]/
    page.jsx                         Pre-interview session page
    start/page.jsx                   Vapi interview interface and transcript capture
    feedback/page.jsx                Detailed feedback presentation
    view/page.jsx                    Stored interview and review details
components/                          Shared UI primitives and error boundary
context/                             User and interview context definitions
lib/                                 App constants, helpers, validation
services/                            Supabase client and sidebar constants
public/                              Static images and demo media
```

## Prerequisites

- Node.js 18 or newer
- npm
- A Supabase project
- An OpenRouter API key for feedback generation
- A Vapi public API key for browser voice calls

## Local setup

1. Clone the repository and install dependencies:

   ```bash
   git clone https://github.com/Devarora13/Veritus.git
   cd Veritus
   npm install
   ```

2. Create a `.env.local` file in the repository root:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_VAPI_KEY=your_vapi_public_key
   OPENROUTER_API_KEY=your_openrouter_api_key
   ```

   `NEXT_PUBLIC_VAPI_KEY` is intentionally available to the browser because it is Vapi's public key. `OPENROUTER_API_KEY` is used only by the server route; do not prefix it with `NEXT_PUBLIC_` or commit it to source control.

3. Configure Supabase email/password authentication, then create the application tables described below. This repository does not include SQL migrations.

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Visit [http://localhost:3000](http://localhost:3000).

## Supabase data model

The client currently references these tables and fields:

| Table | Fields used by the application |
| --- | --- |
| `Users` | `Name`, `email`, `pfp`, `credits` |
| `InterviewDetails` | `interview_id`, `job_position`, `job_description`, `experience_level`, `interview_type`, `interview_time`, `user_email`, `created_at`; `interview_questions` is read when present |
| `postinterview` | `interview_id`, `interview_review` |

`interview_review` is stored as a JSON-compatible object (or a JSON string that the client parses). Configure Row Level Security policies so users can only read and modify their own records. The repository does not include the database schema, constraints, policies, or migrations, so they must be created in Supabase for a deployment.

## Intended interview flow

1. A user signs up or logs in at `/auth`.
2. The root provider loads the authenticated user and ensures a `Users` row exists.
3. The user creates a session at `/dashboard/create-interview`.
4. Session metadata is inserted into `InterviewDetails`, and one credit is deducted.
5. The user opens `/interview/[interview_id]`, enters a name, and proceeds to `/interview/[interview_id]/start`.
6. Vapi runs the configured interactive voice interview and emits transcript events.
7. On manual end, the browser posts the conversation to `/api/ai-feedback`.
8. The returned JSON review is inserted into `postinterview` and displayed at `/interview/[interview_id]/feedback`.

Steps 5–8 describe the intended behavior. The current context-hydration issue prevents this end-to-end flow from working through the standard route.

## Feedback API

### Request

```http
POST /api/ai-feedback
Content-Type: application/json
```

```json
{
  "conversation": [
    { "role": "assistant", "content": "Tell me about your experience." },
    { "role": "user", "content": "I have built user-facing React applications." }
  ]
}
```

`conversation` may be a string or an array of transcript-like objects. The server converts array entries into labelled speaker turns using `role`/`speaker` and `content`/`text`/`transcript` fields. Empty transcripts are rejected with HTTP 400.

### Response

The route sends the transcript to OpenRouter in a delimited source-material block, requests JSON only, removes Markdown fences if present, and validates the response before returning it. A successful response has this shape:

```json
{
  "feedback": {
    "overallScore": 0,
    "rating": {
      "technicalSkills": 0,
      "communication": 0,
      "problemSolving": 0,
      "experience": 0,
      "confidence": 0
    },
    "strengths": [""],
    "weaknesses": [""],
    "areasToImprove": [""],
    "summary": "",
    "recommendation": "",
    "recommendationMsg": ""
  }
}
```

Scores outside their allowed ranges, missing rating keys, missing list fields, or non-string summary/recommendation fields are rejected with HTTP 502. The route returns 500 when the OpenRouter configuration or upstream call fails.

## Commands

```bash
npm run dev      # Run the development server
npm run build    # Create a production build
npm start        # Run the production server after building
```

## Deployment

The project can be deployed to Vercel or another Next.js-compatible host. Add the same environment variables in the host configuration. Ensure that the Supabase redirect URL, allowed origin, database policies, Vapi public key settings, and OpenRouter key are configured for the deployed domain.

## Known limitations

- **Live interview routing is incomplete.** The pre-interview page fetches `InterviewDetails`, but the code that writes it to `InterviewDetailsContext` is commented out. The `/start` page depends on that context and renders `Interview Data Not Found` when it is empty.
- **Natural call completion does not reliably produce feedback.** The normal Vapi `call-end` listener only updates the call state. Feedback generation is invoked after the user manually confirms ending the call, and in one error-event path.
- **Transcript data is transient.** Captured messages are held in browser state. Refreshing or leaving the page before feedback is saved loses the transcript.
- **Interview difficulty is not persisted or passed to the Vapi interviewer prompt.** It is collected in the creation form but is not included in the `InterviewDetails` insert or the interviewer configuration.
- **No question-generation endpoint is present.** Interview setup stores metadata; `interview_questions` is only displayed when data already exists in the database.
- **Billing is simulated.** The billing page waits briefly and shows a success alert; it does not charge a customer or add credits.
- **No automated tests or database migrations are included.** The `test` script intentionally exits with an error.
- **Some practice-resource links are placeholders.** Entries using `#` do not navigate to external content.

## License

No `LICENSE` file is currently included. Add one before presenting the project as MIT-licensed or under any other license.
